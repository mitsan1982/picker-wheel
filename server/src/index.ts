console.log("Starting Picker Wheel server...");

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection:', reason);
});

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getDb } from './db';

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Picker Wheel API is running!');
});

// Get all wheels
app.get('/api/wheels', async (req, res) => {
  const db = await getDb();
  const wheels: any[] = await db.all('SELECT * FROM wheels');
  wheels.forEach(w => {
    w.options = JSON.parse(w.options);
    w.isPublic = !!w.isPublic;
    if (!w.lastUsed) w.lastUsed = w.createdAt;
  });
  res.json(wheels);
});

// Create a new wheel
app.post('/api/wheels', async (req, res) => {
  const { userId, name, options, isPublic = false } = req.body;
  if (!userId || !name || !Array.isArray(options) || options.length === 0) {
    return res.status(400).json({ error: 'userId, name, and options are required.' });
  }
  const db = await getDb();
  // Check for duplicate name for this user
  const exists = await db.get('SELECT 1 FROM wheels WHERE userId = ? AND name = ?', userId, name);
  if (exists) {
    return res.status(409).json({ error: 'Wheel name must be unique for this user.' });
  }
  const createdAt = new Date().toISOString();
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
});

// Get a single wheel by ID
app.get('/api/wheels/:id', async (req, res) => {
  const db = await getDb();
  const wheel = await db.get('SELECT * FROM wheels WHERE id = ?', req.params.id);
  if (!wheel) return res.status(404).json({ error: 'Wheel not found.' });
  wheel.options = JSON.parse(wheel.options);
  wheel.isPublic = !!wheel.isPublic;
  if (!wheel.lastUsed) wheel.lastUsed = wheel.createdAt;
  res.json(wheel);
});

// Update a wheel by ID
app.put('/api/wheels/:id', async (req, res) => {
  const db = await getDb();
  const { name, options, isPublic } = req.body;
  const wheel = await db.get('SELECT * FROM wheels WHERE id = ?', req.params.id);
  if (!wheel) return res.status(404).json({ error: 'Wheel not found.' });
  // Check for duplicate name for this user (excluding this wheel)
  if (name) {
    const duplicate = await db.get('SELECT 1 FROM wheels WHERE userId = ? AND name = ? AND id != ?', wheel.userId, name, req.params.id);
    if (duplicate) {
      return res.status(409).json({ error: 'Wheel name must be unique for this user.' });
    }
  }
  await db.run(
    'UPDATE wheels SET name = ?, options = ?, isPublic = ? WHERE id = ?',
    name ?? wheel.name,
    options ? JSON.stringify(options) : wheel.options,
    typeof isPublic === 'boolean' ? (isPublic ? 1 : 0) : wheel.isPublic,
    req.params.id
  );
  const updated = await db.get('SELECT * FROM wheels WHERE id = ?', req.params.id);
  updated.options = JSON.parse(updated.options);
  updated.isPublic = !!updated.isPublic;
  res.json(updated);
});

// Delete a wheel by ID
app.delete('/api/wheels/:id', async (req, res) => {
  const db = await getDb();
  const wheel = await db.get('SELECT * FROM wheels WHERE id = ?', req.params.id);
  if (!wheel) return res.status(404).json({ error: 'Wheel not found.' });
  await db.run('DELETE FROM wheels WHERE id = ?', req.params.id);
  res.json({ success: true });
});

// Spin a wheel (update lastUsed)
app.post('/api/wheels/:id/spin', async (req, res) => {
  const db = await getDb();
  const wheel = await db.get('SELECT * FROM wheels WHERE id = ?', req.params.id);
  if (!wheel) return res.status(404).json({ error: 'Wheel not found.' });
  // Update lastUsed
  const now = new Date().toISOString();
  await db.run('UPDATE wheels SET lastUsed = ? WHERE id = ?', now, req.params.id);
  // Optionally, increment spins
  await db.run('UPDATE wheels SET spins = spins + 1 WHERE id = ?', req.params.id);
  // Return the updated wheel
  const updated = await db.get('SELECT * FROM wheels WHERE id = ?', req.params.id);
  updated.options = JSON.parse(updated.options);
  updated.isPublic = !!updated.isPublic;
  if (!updated.lastUsed) updated.lastUsed = updated.createdAt;
  res.json(updated);
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 