# Daily Grain

A wood-themed daily calendar puzzle. Eight wooden pieces, one board, and a new puzzle every day: fit all the pieces on the board so that only **today's month** and **today's day** stay uncovered.

Each difficulty has its own fixed set of pieces, picked so that every date of the year, Feb 29 included, can be solved.

## Download and play

### **[⬇ Download Daily Grain (ZIP)](https://github.com/Distractodog/daily-grain/archive/refs/heads/main.zip)**

Nothing to install, and no internet needed once it's downloaded.

**On a Mac**
1. Click the download link above.
2. Open your **Downloads** folder and double-click `daily-grain-main.zip` to unzip it. (Safari often unzips it for you.)
3. Open the `daily-grain-main` folder.
4. Double-click **`index.html`**. The game opens in your web browser.

**On Windows**
1. Click the download link above.
2. Open your **Downloads** folder, right-click `daily-grain-main.zip` and choose **Extract All…**, then **Extract**.
3. Open the extracted `daily-grain-main` folder.
4. Double-click **`index.html`**. The game opens in your web browser.

If `index.html` opens in a text editor instead, right-click it, choose **Open with**, and pick a browser (Chrome, Safari, Edge or Firefox).

**Tips**
- Move the `daily-grain-main` folder somewhere you'll keep it, like Documents, and bookmark the page once it's open.
- Keep the whole folder together. The game needs the `fonts` folder next to `index.html`.
- Your solved days are saved in the browser you play in. Play in the same browser each time, or use the save code in **Settings** to move them.
- The music starts after your first click. You can turn it off in **Settings**.

## How to play

Drag all the pieces onto the board so only today's month and day are left showing. Every day is a new puzzle with the same pieces.

| Action | Mouse | Key |
|---|---|---|
| Move a piece | Drag | |
| Rotate | Right-click | R |
| Flip | Double-click | F |
| Undo | Undo button | Ctrl/Cmd+Z |
| Hint (number depends on difficulty) | Hint button | H |
| Play a past day | Calendar button | C |
| Difficulty, sound, music, save code | Settings button | |

## Difficulty

| Mode | Solutions on a typical day | Hardest day | Hints per puzzle |
|---|---|---|---|
| Easy | ~134 | 40 | 3 |
| Normal | ~28 | 5 | 2 |
| Hard | ~17 | 2 | 1 |
| Expert | ~13 | 1 | 0 |

Hints used are saved per date and per mode, so Reset and reloading don't refill them.

## Saving and music

Solved days, hints and settings are saved in the browser (localStorage). There's no server. To move your history to another browser, copy the save code from Settings and load it there.

The music is a marimba tune generated live by the browser, with no audio files: one steady flowing arpeggio over a slow four-chord loop. It starts after your first click.

The font is Libre Baskerville, stored in `fonts/` (SIL Open Font License, see `fonts/OFL.txt`), so the game needs no internet connection.

## The board

```
Jan Feb Mar Apr May Jun
Jul Aug Sep Oct Nov Dec
 1   2   3   4   5   6   7
 8   9  10  11  12  13  14
15  16  17  18  19  20  21
22  23  24  25  26  27  28
29  30  31
```

43 cells. The 8 pieces (7 five-cell pieces and 1 six-cell piece) cover 41 of them.

## How the piece sets were chosen

`tools/search.js` is a one-time search. It samples random sets of 7 pentominoes plus 1 hexomino, skips the plain rectangles, and checks each set with a backtracking solver against all 366 dates. A set survives only if every date has a solution. Survivors are ranked so that the hardest day still has a few solutions, while the typical day has as few as possible.

The four sets the game uses are in `tools/difficulties.json`; every set that solved all dates is in `tools/survivors-7p1h.json`, sorted by how hard it is. Easy is the set with the most solutions per day, Expert the one with the fewest.

```bash
node tools/search.js 2500
MIX=1,6 node tools/search.js 2500
```

Each run takes a few minutes. `MIX` sets how many pentominoes and hexominoes go in a set. A chunky mix of 1 pentomino and 6 hexominoes was tried for harder modes, but none of about 2,500 such sets could solve every date.
