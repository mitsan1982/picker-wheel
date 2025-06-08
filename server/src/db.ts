import sqlite3 from 'sqlite3';
import { open, Database } from 'sqlite';
import path from 'path';

// Open a database connection
export async function getDb(): Promise<Database> {
  const db = await open({
    filename: process.env.SQLITE_PATH || path.join(__dirname, '../data/picklewheel.sqlite'),
    driver: sqlite3.Database
  });

  // Create the wheels table if it doesn't exist
  await db.exec(`
    CREATE TABLE IF NOT EXISTS wheels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId TEXT NOT NULL,
      name TEXT NOT NULL,
      options TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      spins INTEGER DEFAULT 0,
      isPublic INTEGER DEFAULT 0,
      lastUsed TEXT,
      FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT,
      name TEXT,
      createdAt TEXT
    );
  `);

  return db;
} 