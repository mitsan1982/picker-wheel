import { Router } from 'express';
import { getDb } from '../db';
import { googleAuthMiddleware, GoogleUser } from '../middleware/auth';

const router = Router();

// Use Google OAuth middleware for all routes
router.use(googleAuthMiddleware);

// Create a new wheel
router.post('/', async (req, res) => {
  const db = await getDb();
  const { name, options, isPublic = false } = req.body;
  const user = (req as any).user as GoogleUser;
  if (!name || !options) return res.status(400).json({ error: 'Missing name or options' });
  const createdAt = new Date().toISOString();
  const spins = 0;
  const result = await db.run(
    'INSERT INTO wheels (userId, name, options, createdAt, spins, isPublic) VALUES (?, ?, ?, ?, ?, ?)',
    user.sub, name, JSON.stringify(options), createdAt, spins, isPublic ? 1 : 0
  );
  const wheel = await db.get('SELECT * FROM wheels WHERE id = ?', result.lastID);
  wheel.options = JSON.parse(wheel.options);
  wheel.isPublic = !!wheel.isPublic;
  res.status(201).json(wheel);
});

// Get all wheels for the user
router.get('/', async (req, res) => {
  const db = await getDb();
  const user = (req as any).user as GoogleUser;
  const wheels = await db.all('SELECT * FROM wheels WHERE userId = ?', user.sub);
  wheels.forEach(w => { w.options = JSON.parse(w.options); w.isPublic = !!w.isPublic; });
  res.json(wheels);
});

// Get a single wheel (only if owned by user)
router.get('/:id', async (req, res) => {
  const db = await getDb();
  const user = (req as any).user as GoogleUser;
  const wheel = await db.get('SELECT * FROM wheels WHERE id = ? AND userId = ?', req.params.id, user.sub);
  if (!wheel) return res.status(404).json({ error: 'Wheel not found' });
  wheel.options = JSON.parse(wheel.options);
  wheel.isPublic = !!wheel.isPublic;
  res.json(wheel);
});

// Update a wheel (only if owned by user)
router.put('/:id', async (req, res) => {
  const db = await getDb();
  const user = (req as any).user as GoogleUser;
  const { name, options, isPublic } = req.body;
  const wheel = await db.get('SELECT * FROM wheels WHERE id = ? AND userId = ?', req.params.id, user.sub);
  if (!wheel) return res.status(404).json({ error: 'Wheel not found' });
  await db.run(
    'UPDATE wheels SET name = ?, options = ?, isPublic = ? WHERE id = ? AND userId = ?',
    name ?? wheel.name,
    options ? JSON.stringify(options) : wheel.options,
    typeof isPublic === 'boolean' ? (isPublic ? 1 : 0) : wheel.isPublic,
    req.params.id,
    user.sub
  );
  const updated = await db.get('SELECT * FROM wheels WHERE id = ?', req.params.id);
  updated.options = JSON.parse(updated.options);
  updated.isPublic = !!updated.isPublic;
  res.json(updated);
});

// Delete a wheel (only if owned by user)
router.delete('/:id', async (req, res) => {
  const db = await getDb();
  const user = (req as any).user as GoogleUser;
  const wheel = await db.get('SELECT * FROM wheels WHERE id = ? AND userId = ?', req.params.id, user.sub);
  if (!wheel) return res.status(404).json({ error: 'Wheel not found' });
  await db.run('DELETE FROM wheels WHERE id = ? AND userId = ?', req.params.id, user.sub);
  res.json({ success: true });
});

export default router; 