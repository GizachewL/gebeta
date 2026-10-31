# Gebeta (ገበጣ) – Online Ethiopian Strategy Game

**Software by Gizachew Hatau**

Play **Gebeta** locally or **online** against remote players matched by skill level.  
**All persistent data is stored in MongoDB.**

**Repo:** https://github.com/GizachewL/gebeta

## Features

- Authentic 2×6 Gebeta rules
- **User accounts** (register / log in) — stored in MongoDB
- **Skill rating** + levels (Beginner → Master)
- **Online matchmaking** by rating
- **Real-time multiplayer** (Socket.IO)
- **Game history** in MongoDB
- Leaderboard
- Local 2-player & vs AI

## Requirements

- Node.js 18+
- **MongoDB** (local or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) free cluster)

## Setup

```bash
git clone https://github.com/GizachewL/gebeta.git
cd gebeta
npm install
```

### MongoDB

**Option A – local MongoDB**

```bash
# Install & start MongoDB, then:
export MONGODB_URI=mongodb://127.0.0.1:27017/gebeta
```

**Option B – MongoDB Atlas (cloud)**

1. Create a free cluster at mongodb.com  
2. Get the connection string  
3. Set it:

```bash
export MONGODB_URI="mongodb+srv://USER:PASSWORD@cluster.mongodb.net/gebeta"
```

Or copy `.env.example` to `.env` and edit.

### Run

```bash
npm start
```

Open **http://localhost:3000**

1. Register an account  
2. Click **Play Online**  
3. Match with players near your level  

## Data in MongoDB

| Collection | Contents |
|------------|----------|
| `users` | username, password hash, rating, wins/losses/draws |
| `games` | finished games (local & online), scores, winner |

Live matchmaking queues and active rooms stay in memory.

## API

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/register` | Create account |
| POST | `/api/login` | Log in |
| GET | `/api/me` | Current user |
| GET | `/api/leaderboard` | Top ratings |
| GET/POST | `/api/games` | History |
| GET | `/api/health` | Status + MongoDB connection |

## Credits

Traditional game: Ethiopian & Eritrean players.  
Software (including MongoDB backend & online play): **Gizachew Hatau**.

## License

MIT
