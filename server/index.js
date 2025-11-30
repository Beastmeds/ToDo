require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const fetch = require('node-fetch');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'devsecret';

function generateToken(user) {
  return jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
}

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });
  const token = auth.split(' ')[1];
  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.user = data;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  const hash = await bcrypt.hash(password, 10);
  db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hash], function (err) {
    if (err) return res.status(400).json({ error: 'User exists or invalid' });
    const user = { id: this.lastID, username };
    const token = generateToken(user);
    res.json({ token, user });
  });
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  db.get('SELECT * FROM users WHERE username = ?', [username], async (err, row) => {
    if (err || !row) return res.status(400).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, row.password);
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });
    const user = { id: row.id, username: row.username };
    const token = generateToken(user);
    res.json({ token, user });
  });
});

app.get('/api/todos', authMiddleware, (req, res) => {
  db.all('SELECT * FROM todos WHERE user_id = ? ORDER BY created_at DESC', [req.user.id], (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json(rows);
  });
});

app.post('/api/todos', authMiddleware, (req, res) => {
  const { title } = req.body;
  db.run('INSERT INTO todos (user_id, title, done) VALUES (?, ?, 0)', [req.user.id, title], function (err) {
    if (err) return res.status(500).json({ error: 'DB error' });
    db.get('SELECT * FROM todos WHERE id = ?', [this.lastID], (e, row) => res.json(row));
  });
});

app.put('/api/todos/:id', authMiddleware, (req, res) => {
  const id = req.params.id;
  const { title, done } = req.body;
  db.run('UPDATE todos SET title = COALESCE(?, title), done = COALESCE(?, done) WHERE id = ? AND user_id = ?', [title, done, id, req.user.id], function (err) {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json({ success: true });
  });
});

app.delete('/api/todos/:id', authMiddleware, (req, res) => {
  const id = req.params.id;
  db.run('DELETE FROM todos WHERE id = ? AND user_id = ?', [id, req.user.id], function (err) {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json({ success: true });
  });
});

app.post('/api/chat', authMiddleware, async (req, res) => {
  const { message } = req.body;
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    // Fallback simple assistant behavior
    return res.json({ reply: `Assistenz (offline): Ich habe deine Nachricht erhalten: "${message}"` });
  }

  try {
    const resp = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
      body: JSON.stringify({ model: 'gpt-3.5-turbo', messages: [{ role: 'user', content: message }], max_tokens: 300 })
    });
    const data = await resp.json();
    const reply = data?.choices?.[0]?.message?.content || JSON.stringify(data);
    res.json({ reply });
  } catch (err) {
    res.status(500).json({ error: 'Chat error', detail: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
