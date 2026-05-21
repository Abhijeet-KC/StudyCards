import sqlite3 from 'sqlite3';
import { promisify } from 'util';

// Open a database connection (creates file if not exists)
const db = new sqlite3.Database('./database.sqlite', (err) => {
  if (err) {
    console.error('Error opening database', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Promisify the sqlite3 methods so we can use async/await
export const query = (sql: string, params: any[] = []) => {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
};

export const get = (sql: string, params: any[] = []) => {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
};

export const run = (sql: string, params: any[] = []): Promise<{ lastID: number, changes: number }> => {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function (err) {
            if (err) reject(err);
            else resolve({ lastID: this.lastID, changes: this.changes });
        });
    });
};

export const initDb = async () => {
  console.log('Initializing database schema...');

  // Create Subjects table
  await run(`
    CREATE TABLE IF NOT EXISTS subjects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      color TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Create Topics table
  await run(`
    CREATE TABLE IF NOT EXISTS topics (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subjectId INTEGER NOT NULL,
      name TEXT NOT NULL,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (subjectId) REFERENCES subjects(id) ON DELETE CASCADE
    )
  `);

  // Create Flashcards table
  await run(`
    CREATE TABLE IF NOT EXISTS flashcards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subjectId INTEGER NOT NULL,
      topicId INTEGER,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      difficulty TEXT DEFAULT 'Medium',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (subjectId) REFERENCES subjects(id) ON DELETE CASCADE,
      FOREIGN KEY (topicId) REFERENCES topics(id) ON DELETE CASCADE
    )
  `);

  // Enable foreign keys
  await run('PRAGMA foreign_keys = ON');

  // Seed default subjects if empty
  const subjects: any = await query('SELECT count(*) as count FROM subjects');
  if (subjects[0].count === 0) {
    console.log('Seeding default subjects...');
    await run("INSERT INTO subjects (name, color) VALUES ('Math', 'bg-blue-500')");
    await run("INSERT INTO subjects (name, color) VALUES ('Physics', 'bg-purple-500')");
    await run("INSERT INTO subjects (name, color) VALUES ('DBMS', 'bg-orange-500')");
    await run("INSERT INTO subjects (name, color) VALUES ('OS', 'bg-green-500')");
  } else {
    console.log('Database already seeded.');
  }

  console.log('Database initialization complete.');
};
