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
  return jwt.sign({ id: user.id, username: user.username, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
}

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Unauthorized' });
  const token = auth.split(' ')[1];
  try {
    const data = jwt.verify(token, JWT_SECRET);
    // fetch freshest role from DB
    db.get('SELECT id, username, role FROM users WHERE id = ?', [data.id], (err, row) => {
      if (err || !row) return res.status(401).json({ error: 'Invalid token' });
      req.user = row;
      next();
    });
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  const hash = await bcrypt.hash(password, 10);
  const role = 'user';
  db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hash, role], function (err) {
    if (err) return res.status(400).json({ error: 'User exists or invalid' });
    const user = { id: this.lastID, username, role };
    const token = generateToken(user);
    res.json({ token, user });
  });
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'username and password required' });
  db.get('SELECT id, username, password, role FROM users WHERE username = ?', [username], async (err, row) => {
    if (err || !row) return res.status(400).json({ error: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, row.password);
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });
    const user = { id: row.id, username: row.username, role: row.role };
    const token = generateToken(user);
    res.json({ token, user });
  });
});

// Owner setup endpoint: create the initial owner account. Requires OWNER_KEY from .env to match request.
app.post('/api/setup/owner', async (req, res) => {
  const { username, password, ownerKey } = req.body;
  if (!username || !password || !ownerKey) return res.status(400).json({ error: 'username, password and ownerKey required' });
  if (!process.env.OWNER_KEY || ownerKey !== process.env.OWNER_KEY) return res.status(403).json({ error: 'Invalid owner key' });
  db.get('SELECT * FROM users WHERE role = ?', ['owner'], async (err, row) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    if (row) return res.status(400).json({ error: 'Owner already exists' });
    const hash = await bcrypt.hash(password, 10);
    db.run('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hash, 'owner'], function (e) {
      if (e) return res.status(400).json({ error: 'Unable to create owner' });
      const user = { id: this.lastID, username, role: 'owner' };
      const token = generateToken(user);
      res.json({ token, user });
    });
  });
});

// Admin routes (owner-only)
app.get('/api/admin/users', authMiddleware, (req, res) => {
  if (req.user.role !== 'owner') return res.status(403).json({ error: 'Forbidden' });
  db.all('SELECT id, username, role FROM users', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json(rows);
  });
});

app.get('/api/admin/todos', authMiddleware, (req, res) => {
  if (req.user.role !== 'owner') return res.status(403).json({ error: 'Forbidden' });
  db.all('SELECT * FROM todos ORDER BY created_at DESC', [], (err, rows) => {
    if (err) return res.status(500).json({ error: 'DB error' });
    res.json(rows);
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

const os = require('os');
const HOST = process.env.HOST || '0.0.0.0';

function logNetworkAddresses(port){
  const nets = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(nets)){
    for (const net of nets[name]){
      // skip internal and non-ip
      if (net.internal) continue;
      addresses.push({ iface: name, address: net.address, family: net.family });
    }
  }
  console.log(`Server running on port ${port} and bound to ${HOST}. Accessible addresses:`);
  if(addresses.length === 0) console.log(` - http://${HOST}:${port}`);
  addresses.forEach(a => console.log(` - http://${a.address}:${port} (${a.family})`));
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, HOST, () => logNetworkAddresses(PORT));
