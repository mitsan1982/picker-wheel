import dotenv from 'dotenv';
dotenv.config();

console.log("Starting Picker Wheel server...");

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

import express from 'express';
import cors from 'cors';
import { getDb } from './db';
import { verifyFrontendSecret, adminOnly, upsertUserInfo } from './middleware';
import { oauth2Client } from './auth';
import os from 'os';

const app = express();
const PORT = process.env.PORT || 5001;

const isProduction = process.env.NODE_ENV === 'production';

const allowedOrigins = isProduction
  ? [
      'https://www.picklewheel.com',
      'https://picklewheel.com'
    ]
  : [
      'http://localhost:5173',
      'http://localhost:5174',
      'http://localhost:3000',
      'http://127.0.0.1:5173',
      'http://127.0.0.1:5174',
      'http://127.0.0.1:3000'
    ];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // allow non-browser requests
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true
}));
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Picker Wheel API is running!');
});

// Apply frontend secret verification to all API routes
app.use('/api', verifyFrontendSecret);
app.use('/api', upsertUserInfo);

// Helper function to verify Google token and get user ID
async function verifyToken(req: express.Request): Promise<string> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('No token provided');
  }

  const token = authHeader.split(' ')[1];
  const ticket = await oauth2Client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID
  });
  const payload = ticket.getPayload();
  if (!payload || !payload.sub) {
    throw new Error('Invalid token');
  }
  return payload.sub;
}

// Get all wheels
app.get('/api/wheels', async (req, res) => {
  try {
    const userId = await verifyToken(req);
    const db = await getDb();
    const wheels: any[] = await db.all('SELECT * FROM wheels WHERE userId = ?', userId);
    wheels.forEach(w => {
      w.options = JSON.parse(w.options);
      w.isPublic = !!w.isPublic;
      if (!w.lastUsed) w.lastUsed = w.createdAt;
    });
    res.json(wheels);
  } catch (error) {
    console.error('Token verification failed:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Create a new wheel
app.post('/api/wheels', async (req, res) => {
  try {
    // Get user info from token
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    const ticket = await oauth2Client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.sub) {
      return res.status(401).json({ error: 'Invalid token' });
    }
    const userId = payload.sub;
    const email = payload.email || null;
    const name = payload.name || null;
    const createdAt = new Date().toISOString();
    const db = await getDb();
    // Upsert user info
    await db.run(
      `INSERT OR IGNORE INTO users (id, email, name, createdAt) VALUES (?, ?, ?, ?)`,
      userId, email, name, createdAt
    );
    const { options, isPublic = false } = req.body;
    if (!name || !Array.isArray(options) || options.length === 0) {
      return res.status(400).json({ error: 'name and options are required.' });
    }
    // Check for duplicate name for this user
    const exists = await db.get('SELECT 1 FROM wheels WHERE userId = ? AND name = ?', userId, name);
    if (exists) {
      return res.status(409).json({ error: 'Wheel name must be unique for this user.' });
    }
    const spins = 0;
    const lastUsed = createdAt;
    const result = await db.run(
      'INSERT INTO wheels (userId, name, options, createdAt, spins, isPublic, lastUsed) VALUES (?, ?, ?, ?, ?, ?, ?)',
      userId, name, JSON.stringify(options), createdAt, spins, isPublic ? 1 : 0, lastUsed
    );
    const wheel = await db.get('SELECT * FROM wheels WHERE id = ?', result.lastID);
    wheel.options = JSON.parse(wheel.options);
    wheel.isPublic = !!wheel.isPublic;
    if (!wheel.lastUsed) wheel.lastUsed = wheel.createdAt;
    res.status(201).json(wheel);
  } catch (error) {
    console.error('Token verification failed:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Get a single wheel by ID
app.get('/api/wheels/:id', async (req, res) => {
  try {
    const userId = await verifyToken(req);
    const db = await getDb();
    const wheel = await db.get('SELECT * FROM wheels WHERE id = ? AND userId = ?', req.params.id, userId);
    if (!wheel) return res.status(404).json({ error: 'Wheel not found.' });
    wheel.options = JSON.parse(wheel.options);
    wheel.isPublic = !!wheel.isPublic;
    if (!wheel.lastUsed) wheel.lastUsed = wheel.createdAt;
    res.json(wheel);
  } catch (error) {
    console.error('Token verification failed:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Update a wheel by ID
app.put('/api/wheels/:id', async (req, res) => {
  try {
    const userId = await verifyToken(req);
    const db = await getDb();
    const { name, options, isPublic } = req.body;
    const wheel = await db.get('SELECT * FROM wheels WHERE id = ? AND userId = ?', req.params.id, userId);
    if (!wheel) return res.status(404).json({ error: 'Wheel not found.' });
    // Check for duplicate name for this user (excluding this wheel)
    if (name) {
      const duplicate = await db.get('SELECT 1 FROM wheels WHERE userId = ? AND name = ? AND id != ?', userId, name, req.params.id);
      if (duplicate) {
        return res.status(409).json({ error: 'Wheel name must be unique for this user.' });
      }
    }
    await db.run(
      'UPDATE wheels SET name = ?, options = ?, isPublic = ? WHERE id = ? AND userId = ?',
      name ?? wheel.name,
      options ? JSON.stringify(options) : wheel.options,
      typeof isPublic === 'boolean' ? (isPublic ? 1 : 0) : wheel.isPublic,
      req.params.id,
      userId
    );
    const updated = await db.get('SELECT * FROM wheels WHERE id = ?', req.params.id);
    updated.options = JSON.parse(updated.options);
    updated.isPublic = !!updated.isPublic;
    res.json(updated);
  } catch (error) {
    console.error('Token verification failed:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Delete a wheel by ID
app.delete('/api/wheels/:id', async (req, res) => {
  try {
    const userId = await verifyToken(req);
    const db = await getDb();
    const wheel = await db.get('SELECT * FROM wheels WHERE id = ? AND userId = ?', req.params.id, userId);
    if (!wheel) return res.status(404).json({ error: 'Wheel not found.' });
    await db.run('DELETE FROM wheels WHERE id = ? AND userId = ?', req.params.id, userId);
    res.json({ success: true });
  } catch (error) {
    console.error('Token verification failed:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Spin a wheel (update lastUsed)
app.post('/api/wheels/:id/spin', async (req, res) => {
  try {
    const userId = await verifyToken(req);
    const db = await getDb();
    const wheel = await db.get('SELECT * FROM wheels WHERE id = ? AND userId = ?', req.params.id, userId);
    if (!wheel) return res.status(404).json({ error: 'Wheel not found.' });
    // Update lastUsed
    const now = new Date().toISOString();
    await db.run('UPDATE wheels SET lastUsed = ? WHERE id = ? AND userId = ?', now, req.params.id, userId);
    // Optionally, increment spins
    await db.run('UPDATE wheels SET spins = spins + 1 WHERE id = ? AND userId = ?', req.params.id, userId);
    // Return the updated wheel
    const updated = await db.get('SELECT * FROM wheels WHERE id = ?', req.params.id);
    updated.options = JSON.parse(updated.options);
    updated.isPublic = !!updated.isPublic;
    if (!updated.lastUsed) updated.lastUsed = updated.createdAt;
    res.json(updated);
  } catch (error) {
    console.error('Token verification failed:', error);
    res.status(401).json({ error: 'Invalid token' });
  }
});

// Admin metrics endpoint
app.get('/api/admin/metrics', adminOnly, async (req, res) => {
  try {
    const db = await getDb();
    // Users: join wheels and users table to get email and name
    const usersRaw = await db.all('SELECT DISTINCT userId FROM wheels');
    const users = [];
    for (const u of usersRaw) {
      const userInfo = await db.get('SELECT email, name FROM users WHERE id = ?', u.userId);
      users.push({
        email: userInfo && userInfo.email ? userInfo.email : u.userId,
        name: userInfo && userInfo.name ? userInfo.name : null,
        role: 'user'
      });
    }
    // Wheels count
    const wheels = await db.all('SELECT id FROM wheels');
    // Visits and registration attempts (stubbed for now)
    // You can implement real tracking later
    const visits = 0;
    const registrationAttempts = 0;
    // Instance metrics
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    const uptime = process.uptime();
    const loadAvg = os.loadavg();
    const freeMem = os.freemem();
    const totalMem = os.totalmem();
    res.json({
      usersCount: users.length,
      wheelsCount: wheels.length,
      visits,
      registrationAttempts,
      instance: {
        memoryUsage,
        cpuUsage,
        uptime,
        loadAvg,
        freeMem,
        totalMem
      },
      users
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 