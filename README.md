# Odd Tile Sprint

Odd Tile Sprint is a tiny daily browser game: scan a generated grid and click the one tile that quietly breaks the pattern before the timer drains.

## What it can do

- Creates a deterministic daily sprint from the Asia/Shanghai day.
- Runs six rounds with 4x4, 5x5, and 6x6 visual boards.
- Lets you study the first board before the timer starts on your first tap.
- Scores fast correct hits, streaks, and deeper rounds.
- Gives immediate miss, timeout, and completion feedback.
- Works as a static site with no account, backend, build step, or API key.

## Why it is useful

It is a quick visual warm-up. You can play a whole run in under two minutes, compare scores, or use it as a small attention reset between bigger tasks.

## Why it is fun

The odd tile is not always louder. Sometimes it is a shifted dot, sometimes a rotated stripe, sometimes a chunkier ring. The board stays fair because every round is generated with exactly one odd tile, but the pattern language changes enough to keep the scan interesting.

## Core loop

1. Open the page.
2. Study the board; the timer starts on your first tap.
3. Find and tap the one tile that breaks the pattern.
4. Chain fast hits for a better score.
5. Finish six rounds or lose after three misses.
6. Copy the result text if you want to share the run.

## How to run

```bash
npm test
npm run check
python3 -m http.server 5186 --bind localhost
```

Then open `http://localhost:5186/index.html`.

## Inspiration

This project borrows only the broad idea of short, shareable web puzzles from public inspiration sources such as Show HN browser game posts, daily word/visual puzzle discussions, and Product Hunt-style lightweight web game launches. The code, visuals, generation rules, text, and interaction design here are original.

Reference starting points:

- Show HN / Hacker News browser-game discussions: https://news.ycombinator.com/show
- GitHub topic browsing for small browser games: https://github.com/topics/browser-game
- Product Hunt games category: https://www.producthunt.com/categories/games

## Verification

- `npm test` checks deterministic generation, one odd tile per board, scoring, and result text.
- `npm run check` checks required files and static app wiring.
- Local browser verification covered a desktop run path, first-tap timer start, and a 390x844 mobile viewport without horizontal overflow.

## Future ideas

- Add a daily streak stored locally.
- Add a colorblind high-contrast mode.
- Add a replay card image generator.
- Add seed sharing for custom challenge links.
