# Gebeta (ገበጣ) – Traditional Ethiopian Strategy Game

**Software conversion & digital preservation by Gizachew Hatau**

A complete, culturally authentic, playable web implementation of the classic Ethiopian mancala game **Gebeta** (also spelled Gabata / Gebet’a).

**Live / Play:** Open `index.html` in any modern browser (works fully offline).

## Features

- Accurate Ethiopian 2×6 educational rules (multi-lap sowing, capture of fours)
- Animated seed sowing
- Local 2-player mode + AI opponent
- **Personal game history** stored in the browser (wins, losses, scores, duration) — private to your device
- Export history as JSON
- Full history & culture panel + clear rules
- Responsive design (desktop & mobile)
- Single-file, zero-dependency, reliable

## Quick Start

```bash
# Clone
git clone https://github.com/GizachewL/gebeta.git
cd gebeta

# Open in browser
open index.html   # or double-click index.html
```

Or simply download `index.html` and open it.

## Game History Storage

Game results are saved automatically using the browser’s `localStorage` (same pattern used by many classic online board-game sites). Your history stays on your device — no account or server required. You can clear it or export it as JSON from the **My History** tab.

## Rules (summary)

- 2×6 board, 4 seeds per pit
- Sow anti-clockwise; multi-lap when last seed lands in an occupied pit
- Capture groups of exactly 4 (owner of the pit, or sower if it is the final seed)
- Pass when no seeds remain on your side; three consecutive passes ends the game
- Highest captured total wins

See the in-app **How to Play** panel for full details.

## History of Gebeta

Archaeological evidence from Yeha, Axum and Matara places Gebeta in the Aksumite period (6th–7th centuries AD). It is mentioned in a 14th-century Ge’ez text. The game remains a living tradition across Ethiopia and Eritrea and is valued in modern education for culturally responsive mathematics.

## Credits

- **Traditional game**: Generations of Ethiopian and Eritrean players  
- **Software conversion, design, implementation & digital preservation**: **Gizachew Hatau**

## License

MIT License — free for educational and non-commercial use with attribution.

---

ገበጣ – Ethiopia’s timeless strategy game.  
Play, learn, and pass it on.
