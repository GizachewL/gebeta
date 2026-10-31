/**
 * Gebeta (ገበጣ) Backend API
 * Traditional Ethiopian strategy game – server for game history
 * Software conversion by Gizachew Hatau
 */
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'games.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Load or init DB
function loadDB() {
  try {
    if (fs.existsSync(DB_FILE)) {
      return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    }
  } catch (e) {
    console.warn('Could not load DB, starting fresh:', e.message);
  }
  return { games: [] };
}

function saveDB(db) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
  } catch (e) {
    console.error('Failed to save DB:', e.message);
  }
}

let db = loadDB();

app.use(cors());
app.use(express.json({ limit: '100kb' }));

// Serve frontend
app.use(express.static(path.join(__dirname, 'public')));

// Health
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    game: 'Gebeta',
    author: 'Gizachew Hatau',
    gamesStored: db.games.length
  });
});

// List games (optional query: playerId, limit)
app.get('/api/games', (req, res) => {
  let list = [...db.games];
  const playerId = req.query.playerId;
  if (playerId) {
    list = list.filter(g => g.playerId === playerId);
  }
  const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
  list = list
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, limit);
  res.json({ games: list, total: list.length });
});

// Stats for a player (or global if no playerId)
app.get('/api/stats', (req, res) => {
  const playerId = req.query.playerId;
  let list = db.games;
  if (playerId) {
    list = list.filter(g => g.playerId === playerId);
  }
  let wins = 0, losses = 0, draws = 0;
  list.forEach(g => {
    if (g.winner === 'A') wins++;
    else if (g.winner === 'B') losses++;
    else draws++;
  });
  res.json({
    played: list.length,
    wins,
    losses,
    draws
  });
});

// Record a finished game
app.post('/api/games', (req, res) => {
  const body = req.body || {};
  const entry = {
    id: uuidv4(),
    date: new Date().toISOString(),
    playerId: typeof body.playerId === 'string' ? body.playerId.slice(0, 64) : 'anonymous',
    mode: body.mode === 'vs AI' ? 'vs AI' : '2 Players',
    scoreA: Number.isFinite(body.scoreA) ? Math.max(0, Math.min(48, body.scoreA)) : 0,
    scoreB: Number.isFinite(body.scoreB) ? Math.max(0, Math.min(48, body.scoreB)) : 0,
    winner: ['A', 'B', 'draw'].includes(body.winner) ? body.winner : 'draw',
    durationSec: Number.isFinite(body.durationSec) ? Math.max(0, Math.round(body.durationSec)) : null
  };

  db.games.unshift(entry);
  // Keep last 5000 games to avoid unbounded growth
  if (db.games.length > 5000) {
    db.games = db.games.slice(0, 5000);
  }
  saveDB(db);

  res.status(201).json({ ok: true, game: entry });
});

// Delete all games for a player (optional cleanup)
app.delete('/api/games', (req, res) => {
  const playerId = req.query.playerId || (req.body && req.body.playerId);
  if (!playerId) {
    return res.status(400).json({ error: 'playerId required' });
  }
  const before = db.games.length;
  db.games = db.games.filter(g => g.playerId !== playerId);
  saveDB(db);
  res.json({ ok: true, removed: before - db.games.length });
});

// SPA fallback
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Gebeta server running at http://localhost:${PORT}`);
  console.log(`API: GET/POST /api/games  |  GET /api/stats  |  GET /api/health`);
  console.log(`Software by Gizachew Hatau`);
});
