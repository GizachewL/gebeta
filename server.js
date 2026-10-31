/**
 * Gebeta (ገበጣ) – Full backend
 * Accounts · Skill matchmaking · Online multiplayer · History
 * Software by Gizachew Hatau
 */
const express = require('express');
const http = require('http');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const GAMES_FILE = path.join(DATA_DIR, 'games.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

function loadJSON(file, fallback) {
  try {
    if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch (e) {
    console.warn('Load failed', file, e.message);
  }
  return fallback;
}
function saveJSON(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error('Save failed', file, e.message);
  }
}

let users = loadJSON(USERS_FILE, { list: [] });
let gameHistory = loadJSON(GAMES_FILE, { games: [] });

const sessions = new Map();
const queue = [];
const rooms = new Map();

function publicUser(u) {
  return {
    id: u.id,
    username: u.username,
    rating: u.rating,
    level: ratingToLevel(u.rating),
    wins: u.wins || 0,
    losses: u.losses || 0,
    draws: u.draws || 0,
    gamesPlayed: u.gamesPlayed || 0
  };
}

function ratingToLevel(r) {
  if (r < 900) return 'Beginner';
  if (r < 1100) return 'Intermediate';
  if (r < 1300) return 'Advanced';
  if (r < 1500) return 'Expert';
  return 'Master';
}

function findUserByUsername(name) {
  return users.list.find(u => u.username.toLowerCase() === String(name).toLowerCase());
}
function findUserById(id) {
  return users.list.find(u => u.id === id);
}
function authUser(req) {
  const h = req.headers.authorization || '';
  const token = h.startsWith('Bearer ') ? h.slice(7) : null;
  if (!token || !sessions.has(token)) return null;
  return findUserById(sessions.get(token));
}

function updateRatings(winnerId, loserId, draw) {
  const K = 32;
  const w = findUserById(winnerId);
  const l = findUserById(loserId);
  if (!w || !l) return;
  if (draw) {
    const ew = 1 / (1 + Math.pow(10, (l.rating - w.rating) / 400));
    const el = 1 - ew;
    w.rating = Math.round(w.rating + K * (0.5 - ew));
    l.rating = Math.round(l.rating + K * (0.5 - el));
    w.draws = (w.draws || 0) + 1;
    l.draws = (l.draws || 0) + 1;
  } else {
    const expectedW = 1 / (1 + Math.pow(10, (l.rating - w.rating) / 400));
    const expectedL = 1 - expectedW;
    w.rating = Math.round(w.rating + K * (1 - expectedW));
    l.rating = Math.round(l.rating + K * (0 - expectedL));
    w.wins = (w.wins || 0) + 1;
    l.losses = (l.losses || 0) + 1;
  }
  w.gamesPlayed = (w.gamesPlayed || 0) + 1;
  l.gamesPlayed = (l.gamesPlayed || 0) + 1;
  w.rating = Math.max(400, Math.min(2400, w.rating));
  l.rating = Math.max(400, Math.min(2400, l.rating));
  saveJSON(USERS_FILE, users);
}

app.use(cors());
app.use(express.json({ limit: '100kb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(__dirname));

app.post('/api/register', async (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password || String(username).length < 3 || String(password).length < 4) {
    return res.status(400).json({ error: 'Username (min 3) and password (min 4) required' });
  }
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
    return res.status(400).json({ error: 'Username: 3–20 letters, numbers, underscore only' });
  }
  if (findUserByUsername(username)) {
    return res.status(409).json({ error: 'Username already taken' });
  }
  const hash = await bcrypt.hash(String(password), 10);
  const user = {
    id: uuidv4(),
    username: String(username),
    passwordHash: hash,
    rating: 1000,
    wins: 0, losses: 0, draws: 0, gamesPlayed: 0,
    createdAt: new Date().toISOString()
  };
  users.list.push(user);
  saveJSON(USERS_FILE, users);
  const token = uuidv4();
  sessions.set(token, user.id);
  res.status(201).json({ token, user: publicUser(user) });
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body || {};
  const user = findUserByUsername(username || '');
  if (!user || !(await bcrypt.compare(String(password || ''), user.passwordHash))) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }
  const token = uuidv4();
  sessions.set(token, user.id);
  res.json({ token, user: publicUser(user) });
});

app.get('/api/me', (req, res) => {
  const user = authUser(req);
  if (!user) return res.status(401).json({ error: 'Not logged in' });
  res.json({ user: publicUser(user) });
});

app.get('/api/leaderboard', (req, res) => {
  const top = [...users.list].sort((a, b) => b.rating - a.rating).slice(0, 20).map(publicUser);
  res.json({ leaderboard: top });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok', game: 'Gebeta', author: 'Gizachew Hatau',
    users: users.list.length, onlineQueue: queue.length, activeRooms: rooms.size
  });
});

app.get('/api/games', (req, res) => {
  let list = [...gameHistory.games];
  if (req.query.playerId) list = list.filter(g => g.playerId === req.query.playerId || g.opponentId === req.query.playerId);
  const limit = Math.min(parseInt(req.query.limit, 10) || 50, 200);
  list = list.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, limit);
  res.json({ games: list, total: list.length });
});

app.post('/api/games', (req, res) => {
  const body = req.body || {};
  const entry = {
    id: uuidv4(), date: new Date().toISOString(),
    playerId: typeof body.playerId === 'string' ? body.playerId.slice(0, 64) : 'anonymous',
    mode: body.mode || 'local',
    scoreA: Number.isFinite(body.scoreA) ? body.scoreA : 0,
    scoreB: Number.isFinite(body.scoreB) ? body.scoreB : 0,
    winner: ['A', 'B', 'draw'].includes(body.winner) ? body.winner : 'draw',
    durationSec: body.durationSec ?? null
  };
  gameHistory.games.unshift(entry);
  if (gameHistory.games.length > 5000) gameHistory.games = gameHistory.games.slice(0, 5000);
  saveJSON(GAMES_FILE, gameHistory);
  res.status(201).json({ ok: true, game: entry });
});

app.get('*', (req, res) => {
  const pub = path.join(__dirname, 'public', 'index.html');
  const root = path.join(__dirname, 'index.html');
  res.sendFile(fs.existsSync(pub) && fs.statSync(pub).size > 100 ? pub : root);
});

io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (token && sessions.has(token)) {
    socket.userId = sessions.get(token);
    socket.user = findUserById(socket.userId);
  }
  next();
});

function removeFromQueue(userId) {
  const i = queue.findIndex(q => q.userId === userId);
  if (i >= 0) queue.splice(i, 1);
}

function tryMatch() {
  queue.sort((a, b) => a.rating - b.rating);
  for (let i = 0; i < queue.length - 1; i++) {
    const a = queue[i], b = queue[i + 1];
    if (Math.abs(a.rating - b.rating) <= 200) {
      queue.splice(i, 2);
      createRoom(a, b);
      return tryMatch();
    }
  }
  if (queue.length >= 2) {
    const oldest = queue.reduce((o, q) => (q.joinedAt < o.joinedAt ? q : o), queue[0]);
    if (Date.now() - oldest.joinedAt > 15000) {
      const a = queue.shift(), b = queue.shift();
      if (a && b) createRoom(a, b);
    }
  }
}

function createRoom(qa, qb) {
  const roomId = uuidv4();
  const firstIsA = Math.random() < 0.5;
  const pA = firstIsA ? qa : qb;
  const pB = firstIsA ? qb : qa;
  const room = {
    id: roomId,
    players: {
      A: { userId: pA.userId, username: pA.username, rating: pA.rating, socketId: pA.socketId },
      B: { userId: pB.userId, username: pB.username, rating: pB.rating, socketId: pB.socketId }
    },
    board: Array(12).fill(4), storeA: 0, storeB: 0, turn: 'A', status: 'playing',
    passA: 0, passB: 0, startedAt: Date.now()
  };
  rooms.set(roomId, room);
  const sa = io.sockets.sockets.get(pA.socketId);
  const sb = io.sockets.sockets.get(pB.socketId);
  if (sa) {
    sa.join(roomId); sa.roomId = roomId;
    sa.emit('match_found', {
      roomId, yourColor: firstIsA ? 'A' : 'B',
      opponent: { username: pB.username, rating: pB.rating, level: ratingToLevel(pB.rating) },
      you: { username: pA.username, rating: pA.rating, level: ratingToLevel(pA.rating) }
    });
  }
  if (sb) {
    sb.join(roomId); sb.roomId = roomId;
    sb.emit('match_found', {
      roomId, yourColor: firstIsA ? 'B' : 'A',
      opponent: { username: pA.username, rating: pA.rating, level: ratingToLevel(pA.rating) },
      you: { username: pB.username, rating: pB.rating, level: ratingToLevel(pB.rating) }
    });
  }
  io.to(roomId).emit('game_state', publicRoomState(room));
}

function publicRoomState(room) {
  return {
    roomId: room.id, board: room.board, storeA: room.storeA, storeB: room.storeB,
    turn: room.turn, status: room.status,
    players: {
      A: { username: room.players.A.username, rating: room.players.A.rating },
      B: { username: room.players.B.username, rating: room.players.B.rating }
    }
  };
}

function applyMove(room, color, startIndex) {
  if (room.status !== 'playing' || room.turn !== color) return { ok: false, error: 'Not your turn' };
  const isA = color === 'A';
  if (isA && (startIndex < 0 || startIndex > 5)) return { ok: false, error: 'Invalid pit' };
  if (!isA && (startIndex < 6 || startIndex > 11)) return { ok: false, error: 'Invalid pit' };
  if (room.board[startIndex] === 0) return { ok: false, error: 'Empty pit' };
  let pos = startIndex, hand = room.board[pos];
  room.board[pos] = 0;
  const next = i => (i + 1) % 12;
  const owner = i => (i <= 5 ? 'A' : 'B');
  while (true) {
    while (hand > 0) {
      pos = next(pos); room.board[pos]++; hand--;
      if (room.board[pos] === 4 && hand > 0) {
        const o = owner(pos);
        if (o === 'A') room.storeA += 4; else room.storeB += 4;
        room.board[pos] = 0;
      }
    }
    if (room.board[pos] === 4) {
      if (color === 'A') room.storeA += 4; else room.storeB += 4;
      room.board[pos] = 0; break;
    }
    if (room.board[pos] === 1) break;
    hand = room.board[pos]; room.board[pos] = 0;
  }
  room.turn = color === 'A' ? 'B' : 'A';
  const hasMoves = (c) => {
    const [from, to] = c === 'A' ? [0, 5] : [6, 11];
    for (let i = from; i <= to; i++) if (room.board[i] > 0) return true;
    return false;
  };
  if (!hasMoves(room.turn)) {
    if (room.turn === 'A') room.passA++; else room.passB++;
    if ((room.turn === 'A' && room.passA >= 3) || (room.turn === 'B' && room.passB >= 3)) {
      endOnlineGame(room); return { ok: true, ended: true };
    }
    const prev = room.turn; room.turn = color;
    if (!hasMoves(room.turn)) { endOnlineGame(room); return { ok: true, ended: true }; }
  } else {
    if (room.turn === 'A') room.passA = 0; else room.passB = 0;
  }
  return { ok: true };
}

function endOnlineGame(room) {
  for (let i = 0; i < 6; i++) { room.storeA += room.board[i]; room.board[i] = 0; }
  for (let i = 6; i < 12; i++) { room.storeB += room.board[i]; room.board[i] = 0; }
  room.status = 'finished';
  let winner = 'draw';
  if (room.storeA > room.storeB) winner = 'A';
  else if (room.storeB > room.storeA) winner = 'B';
  const idA = room.players.A.userId, idB = room.players.B.userId;
  if (winner === 'draw') updateRatings(idA, idB, true);
  else if (winner === 'A') updateRatings(idA, idB, false);
  else updateRatings(idB, idA, false);
  io.to(room.id).emit('game_over', { winner, storeA: room.storeA, storeB: room.storeB, players: room.players });
  io.to(room.id).emit('game_state', publicRoomState(room));
  gameHistory.games.unshift({
    id: uuidv4(), date: new Date().toISOString(), mode: 'online',
    scoreA: room.storeA, scoreB: room.storeB, winner,
    playerA: room.players.A.username, playerB: room.players.B.username,
    durationSec: Math.round((Date.now() - room.startedAt) / 1000)
  });
  saveJSON(GAMES_FILE, gameHistory);
  setTimeout(() => rooms.delete(room.id), 60000);
}

io.on('connection', (socket) => {
  socket.on('find_match', () => {
    if (!socket.user) return socket.emit('error_msg', 'Please log in to play online');
    removeFromQueue(socket.userId);
    if (socket.roomId) { socket.leave(socket.roomId); socket.roomId = null; }
    queue.push({
      userId: socket.userId, username: socket.user.username,
      rating: socket.user.rating || 1000, socketId: socket.id, joinedAt: Date.now()
    });
    socket.emit('queue_status', { inQueue: true, position: queue.length, rating: socket.user.rating });
    tryMatch();
  });
  socket.on('cancel_match', () => {
    removeFromQueue(socket.userId);
    socket.emit('queue_status', { inQueue: false });
  });
  socket.on('make_move', (data) => {
    const roomId = socket.roomId || data?.roomId;
    const room = rooms.get(roomId);
    if (!room || !socket.userId) return;
    let color = null;
    if (room.players.A.userId === socket.userId) color = 'A';
    if (room.players.B.userId === socket.userId) color = 'B';
    if (!color) return;
    const result = applyMove(room, color, data.index);
    if (!result.ok) return socket.emit('error_msg', result.error);
    io.to(roomId).emit('game_state', publicRoomState(room));
  });
  socket.on('disconnect', () => {
    removeFromQueue(socket.userId);
    if (socket.roomId) {
      const room = rooms.get(socket.roomId);
      if (room && room.status === 'playing') {
        const color = room.players.A.userId === socket.userId ? 'A' : 'B';
        if (color === 'A') { room.storeB += 48; room.storeA = 0; }
        else { room.storeA += 48; room.storeB = 0; }
        for (let i = 0; i < 12; i++) room.board[i] = 0;
        endOnlineGame(room);
      }
    }
  });
});

setInterval(tryMatch, 5000);

server.listen(PORT, () => {
  console.log(`Gebeta server http://localhost:${PORT}`);
  console.log('Accounts · Online matchmaking · Multiplayer · History');
  console.log('Software by Gizachew Hatau');
});
