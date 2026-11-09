# Daily Grain

A wood-themed daily calendar puzzle. Eight wooden pieces, one board, and a new puzzle every day: fit all the pieces on the board so that only **today's month** and **today's day** stay uncovered.

The pieces never change. They were picked so that every date of the year, Feb 29 included, can be solved.

## Play

Open `index.html` in a browser. Nothing to install.

| Action | Mouse | Key |
|---|---|---|
| Move a piece | Drag | |
| Rotate | Right-click or scroll | R |
| Flip | Double-click | F |
| Undo | Undo button | Ctrl/Cmd+Z |

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

## How the piece set was chosen

`tools/search.js` is a one-time search. It samples random sets of 7 pentominoes plus 1 hexomino, skips the plain rectangles, and checks each set with a backtracking solver against all 366 dates. A set survives only if every date has a solution. Survivors are ranked so that the hardest day still has a few solutions, while the typical day has as few as possible.

The chosen set is in `tools/pieces.json`. The hardest days have 5 solutions, a typical day has about 28, and the easiest has 91.

```bash
node tools/search.js 1500
```

This takes a few minutes and writes the top 5 sets to `tools/candidates.json`.
