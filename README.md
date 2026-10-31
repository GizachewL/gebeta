# Gebeta (ገበጣ) – Online Ethiopian Strategy Game

**Software by Gizachew Hatau**

Play the traditional Ethiopian board game **Gebeta** locally or **online against remote players** matched by skill level.

**Repo:** https://github.com/GizachewL/gebeta

## Features

- Authentic 2×6 Gebeta rules (multi-lap sowing, capture of fours)
- **User accounts** (register / log in)
- **Skill rating** (starts at 1000) and levels: Beginner → Intermediate → Advanced → Expert → Master
- **Online matchmaking** – paired with players near your rating (±200, relaxes after wait)
- **Real-time multiplayer** via WebSockets (Socket.IO)
- Local 2-player and vs AI modes
- Leaderboard
- Game history API
- Rating updates after online games (Elo-style)

## Run with backend (required for online play)

```bash
git clone https://github.com/GizachewL/gebeta.git
cd gebeta
npm install
npm start
```

Open **http://localhost:3000**

1. Register an account  
2. Click **Play Online**  
3. Wait to be matched with someone at a similar level  
4. Play in real time  

## Static / offline

Open `index.html` in a browser for local and AI play only (no accounts/online).

## API overview

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/register` | Create account `{ username, password }` |
| POST | `/api/login` | Log in → `{ token, user }` |
| GET | `/api/me` | Current user (Bearer token) |
| GET | `/api/leaderboard` | Top ratings |
| GET/POST | `/api/games` | History |
| Socket | `find_match` / `make_move` | Online play |

## Project layout

```
gebeta/
├── public/index.html   # Frontend
├── server.js           # Express + Socket.IO + auth + matchmaking
├── package.json
├── data/               # users.json, games.json (runtime, gitignored)
└── README.md
```

## Credits

Traditional game: Ethiopian & Eritrean players across generations.  
Software conversion, online multiplayer & skill system: **Gizachew Hatau**.

## License

MIT
