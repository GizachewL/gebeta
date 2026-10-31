# Gebeta (ገበጣ) – Traditional Ethiopian Strategy Game

**Software conversion & digital preservation by Gizachew Hatau**

Complete playable web app of the classic Ethiopian mancala game **Gebeta**, with optional Node.js backend for server-side game history.

**Repository:** https://github.com/GizachewL/gebeta

## Features

- Authentic Ethiopian 2×6 educational rules (multi-lap sowing, capture of fours)
- Animated seed sowing
- Local 2-player mode + AI opponent
- **Personal game history**
  - Browser `localStorage` (works offline / static hosting)
  - Optional **backend API** to store history on the server
- Export history as JSON
- Full culture & rules panels
- Responsive, zero frontend build step

## Quick start – static (no server)

Open `index.html` (or `public/index.html`) in any browser. History is saved in the browser only.

```bash
git clone https://github.com/GizachewL/gebeta.git
cd gebeta
# double-click index.html or:
python3 -m http.server 8080   # then open http://localhost:8080
```

## Quick start – with backend

Requires Node.js 18+.

```bash
git clone https://github.com/GizachewL/gebeta.git
cd gebeta
npm install
npm start
```

Open **http://localhost:3000**

The server serves the frontend and provides the history API. Finished games are saved both in the browser and on the server (`data/games.json`).

### API endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/games?playerId=&limit=` | List games |
| `GET` | `/api/stats?playerId=` | Win / loss / draw counts |
| `POST` | `/api/games` | Record a finished game |
| `DELETE` | `/api/games?playerId=` | Clear a player’s server history |

Example body for `POST /api/games`:

```json
{
  "playerId": "optional-client-id",
  "mode": "vs AI",
  "scoreA": 28,
  "scoreB": 20,
  "winner": "A",
  "durationSec": 95
}
```

## Project structure

```
gebeta/
├── public/
│   └── index.html      # Frontend (game + UI)
├── server.js           # Express backend
├── package.json
├── data/               # Created at runtime (games.json) – gitignored
├── index.html          # Same frontend (for static / GitHub Pages)
├── README.md
├── LICENSE
└── .gitignore
```

## Rules (summary)

- 2×6 board, 4 seeds per pit  
- Sow anti-clockwise; multi-lap when last seed lands in an occupied pit  
- Capture groups of exactly 4  
- Three consecutive passes ends the game; highest captured total wins  

## History of Gebeta

Archaeological evidence from Yeha, Axum and Matara places Gebeta in the Aksumite period (6th–7th centuries AD). It remains a living tradition in Ethiopia and Eritrea and is used in education for culturally responsive mathematics.

## Credits

- Traditional game: generations of Ethiopian and Eritrean players  
- Software conversion, design, implementation & digital preservation: **Gizachew Hatau**

## License

MIT License
