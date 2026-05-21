import express from 'express';
import cors from 'cors';
import { initDb, query, get, run } from './db';

const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

// Initialize the database on startup
initDb().catch(console.error);

// Subjects API
app.get('/subjects', async (req, res) => {
  try {
    const subjects = await query('SELECT * FROM subjects');
    res.json(subjects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to retrieve subjects' });
  }
});

app.post('/subjects', async (req, res) => {
  const { name, color } = req.body;
  if (!name || name.trim() === '') return res.status(400).json({ error: 'Subject name is required' });
  
  try {
    const defaultColor = color || 'bg-gray-500';
    const result = await run('INSERT INTO subjects (name, color) VALUES (?, ?)', [name.trim(), defaultColor]);
    res.status(201).json({ id: result.lastID, name: name.trim(), color: defaultColor });
  } catch (error: any) {
    if (error.message && error.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'Subject already exists' });
    }
    res.status(500).json({ error: 'Failed to create subject' });
  }
});

app.delete('/subjects/:id', async (req, res) => {
  // Edge Case Handling: cannot delete predefined subjects?
  // Let's implement that we can only delete custom subjects, or just delete anything but if referenced by flashcards, restrict? 
  // Let's protect IDs 1, 2, 3, 4 (our seeded defaults).
  const id = parseInt(req.params.id);
  if ([1, 2, 3, 4].includes(id)) {
    return res.status(403).json({ error: 'Cannot delete predefined subjects' });
  }

  try {
    await run('DELETE FROM subjects WHERE id = ?', [id]);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete subject' });
  }
});

// Topics API
app.get('/topics', async (req, res) => {
  const subjectId = req.query.subjectId;
  try {
    let sql = 'SELECT * FROM topics';
    let params: any[] = [];
    if (subjectId) {
      sql += ' WHERE subjectId = ?';
      params.push(subjectId);
    }
    const topics = await query(sql, params);
    res.json(topics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch topics' });
  }
});

app.post('/topics', async (req, res) => {
  const { subjectId, name } = req.body;
  if (!subjectId || !name || name.trim() === '') {
    return res.status(400).json({ error: 'Missing subjectId or topic name' });
  }

  try {
    const result = await run('INSERT INTO topics (subjectId, name) VALUES (?, ?)', [subjectId, name.trim()]);
    res.status(201).json({ id: result.lastID, subjectId, name: name.trim() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create topic' });
  }
});

app.delete('/topics/:id', async (req, res) => {
  try {
    await run('DELETE FROM topics WHERE id = ?', [req.params.id]);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete topic' });
  }
});

app.put('/topics/:id', async (req, res) => {
  const { name } = req.body;
  if (!name || name.trim() === '') return res.status(400).json({ error: 'Name is required' });

  try {
    await run('UPDATE topics SET name = ? WHERE id = ?', [name.trim(), req.params.id]);
    res.json({ id: req.params.id, name: name.trim() });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update topic' });
  }
});

// Flashcards API
app.get('/flashcards', async (req, res) => {
  const subjectId = req.query.subjectId;
  const topicId = req.query.topicId;

  try {
    let sql = 'SELECT * FROM flashcards WHERE 1=1';
    let params: any[] = [];
    if (subjectId) {
      sql += ' AND subjectId = ?';
      params.push(subjectId);
    }
    if (topicId) {
      sql += ' AND topicId = ?';
      params.push(topicId);
    }
    const flashcards = await query(sql, params);
    res.json(flashcards);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch flashcards' });
  }
});

app.post('/flashcards', async (req, res) => {
  const { subjectId, topicId, question, answer } = req.body;
  if (!subjectId || !question || question.trim() === '' || !answer || answer.trim() === '') {
    return res.status(400).json({ error: 'subjectId, question, and answer are required' });
  }

  try {
    const result = await run(
      'INSERT INTO flashcards (subjectId, topicId, question, answer, difficulty) VALUES (?, ?, ?, ?, ?)',
      [subjectId, topicId || null, question.trim(), answer.trim(), 'Medium']
    );
    res.status(201).json({ id: result.lastID, subjectId, topicId, question, answer, difficulty: 'Medium' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create flashcard' });
  }
});

app.put('/flashcards/:id', async (req, res) => {
  const { question, answer, difficulty, topicId } = req.body;
  
  const updates: string[] = [];
  const params: any[] = [];
  
  if (question && question.trim() !== '') {
    updates.push('question = ?');
    params.push(question.trim());
  }
  if (answer && answer.trim() !== '') {
    updates.push('answer = ?');
    params.push(answer.trim());
  }
  if (difficulty) {
    updates.push('difficulty = ?');
    params.push(difficulty);
  }
  if (topicId !== undefined) {
    updates.push('topicId = ?');
    params.push(topicId);
  }
  
  if (updates.length === 0) return res.status(400).json({ error: 'No fields to update' });

  updates.push('updatedAt = CURRENT_TIMESTAMP');
  params.push(req.params.id);

  try {
    await run(`UPDATE flashcards SET ${updates.join(', ')} WHERE id = ?`, params);
    res.json({ message: 'Updated successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update flashcard' });
  }
});

app.delete('/flashcards/:id', async (req, res) => {
  try {
    await run('DELETE FROM flashcards WHERE id = ?', [req.params.id]);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete flashcard' });
  }
});

app.listen(port, () => {
  console.log(`Backend server running on http://localhost:${port}`);
});
