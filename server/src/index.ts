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

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

// Mocked data
interface Wheel {
  id: string;
  userId?: string;
  name: string;
  options: string[];
  createdAt?: string;
  spins?: number;
  isPublic?: boolean;
}

let wheels: Wheel[] = [
  {
    id: '1',
    name: 'Sample Wheel',
    options: ['Option 1', 'Option 2', 'Option 3']
  }
];

app.get('/', (req, res) => {
  res.send('Picker Wheel API is running!');
});

// Get all wheels
app.get('/api/wheels', (req, res) => {
  // Map each wheel to the expected frontend shape
  const mappedWheels = wheels.map((w, idx) => ({
    id: w.id,
    userId: w.userId || 'mock-user',
    name: w.name,
    options: w.options,
    createdAt: w.createdAt || new Date(Date.now() - idx * 86400000).toISOString(),
    spins: w.spins ?? 0,
    isPublic: w.isPublic ?? false
  }));
  res.json(mappedWheels);
});

// Create a new wheel
app.post('/api/wheels', (req, res) => {
  const { name, options } = req.body;
  if (!name || !Array.isArray(options) || options.length === 0) {
    return res.status(400).json({ error: 'Name and options are required.' });
  }
  const newWheel = {
    id: (Date.now() + Math.random()).toString(),
    name,
    options
  };
  wheels.push(newWheel);
  res.status(201).json(newWheel);
});

// Get a single wheel by ID
app.get('/api/wheels/:id', (req, res) => {
  const wheel = wheels.find(w => w.id === req.params.id);
  if (!wheel) return res.status(404).json({ error: 'Wheel not found.' });
  res.json(wheel);
});

// Spin a wheel (return a random option)
app.post('/api/wheels/:id/spin', (req, res) => {
  const wheel = wheels.find(w => w.id === req.params.id);
  if (!wheel) return res.status(404).json({ error: 'Wheel not found.' });
  const randomIndex = Math.floor(Math.random() * wheel.options.length);
  const result = wheel.options[randomIndex];
  res.json({ result });
});

// Delete a wheel
app.delete('/api/wheels/:id', (req, res) => {
  const index = wheels.findIndex(w => w.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Wheel not found.' });
  wheels.splice(index, 1);
  res.status(204).send();
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 