# Gebeta (ገበጣ) – Online Ethiopian Strategy Game

**Software by Gizachew Hatau**

Play **Gebeta** locally or **online** against remote players matched by skill level.  
Persistent data is stored in **MongoDB**.

**Repository:** https://github.com/GizachewL/gebeta

## Features

- Authentic 2×6 Gebeta rules (multi-lap sowing, capture of fours)
- User accounts (register / log in)
- Skill rating & levels (Beginner → Master)
- Online matchmaking by rating
- Real-time multiplayer (Socket.IO)
- Game history & leaderboard in MongoDB
- Local 2-player and vs AI modes

## Deploy (Render – free)

1. Create a free [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster  
2. Network Access → **Allow Access from Anywhere** (`0.0.0.0/0`)  
3. Database Access → create a user  
4. Connect → Drivers → copy URI and add `/gebeta` before `?`  
5. Go to [https://render.com](https://render.com) → **New → Web Service**  
6. Connect GitHub repo **GizachewL/gebeta**  
7. Settings:
   - **Build Command:** `npm install`
   - **Start Command:** `node server.js`
8. Environment variables:
   - `MONGODB_URI` = your Atlas connection string  
9. Deploy → open the `https://gebeta-xxxx.onrender.com` URL  

## Run locally

```bash
git clone https://github.com/GizachewL/gebeta.git
cd gebeta
npm install
export MONGODB_URI="mongodb+srv://USER:PASS@cluster.mongodb.net/gebeta"
npm start
```

Open http://localhost:3000

## How to play online

1. Register an account  
2. Click **Play Online**  
3. Wait to be matched with a player near your rating  
4. Play in real time  

## Credits

Traditional game: Ethiopian & Eritrean players.  
Software conversion, online multiplayer, MongoDB backend: **Gizachew Hatau**.

## License

MIT
