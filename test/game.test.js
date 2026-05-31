import test from "node:test";
import assert from "node:assert/strict";
import {
  MISS_LIMIT,
  TOTAL_ROUNDS,
  createRound,
  createSprint,
  resultText,
  scoreHit
} from "../src/game.js";

test("daily sprint contains six deterministic rounds", () => {
  const first = createSprint("2026-05-26");
  const second = createSprint("2026-05-26");
  assert.equal(first.length, TOTAL_ROUNDS);
  assert.deepEqual(first, second);
});

test("each generated board has exactly one odd tile", () => {
  for (let index = 0; index < TOTAL_ROUNDS; index += 1) {
    const round = createRound("2026-05-26", index);
    assert.equal(round.tiles.length, round.size * round.size);
    assert.equal(round.tiles.filter((tile) => tile.odd).length, 1);
    assert.equal(round.tiles[round.oddIndex].odd, true);
    assert.ok(round.size >= 4 && round.size <= 6);
  }
});

test("score rewards speed, round depth, and streak", () => {
  const low = scoreHit({ secondsLeft: 1.2, roundIndex: 0, streak: 1 });
  const high = scoreHit({ secondsLeft: 12.5, roundIndex: 3, streak: 4 });
  assert.ok(high > low);
});

test("result text summarizes final state", () => {
  const text = resultText({
    seedKey: "2026-05-26",
    score: 940,
    roundsCleared: 6,
    misses: 1,
    completed: true
  });
  assert.match(text, /Odd Tile Sprint 2026-05-26/);
  assert.match(text, /cleared 6\/6/);
  assert.match(text, new RegExp(`1/${MISS_LIMIT}`));
});

test("result text can include high contrast assist state", () => {
  const text = resultText({
    seedKey: "2026-05-26",
    score: 360,
    roundsCleared: 2,
    misses: 0,
    completed: false,
    highContrast: true
  });

  assert.match(text, /High-contrast mode on/);
});

test("result text reports only cleared rounds", () => {
  const text = resultText({
    seedKey: "2026-05-26",
    score: 120,
    roundsCleared: 1,
    misses: 1,
    completed: false
  });

  assert.match(text, /stopped 1\/6/);
  assert.doesNotMatch(text, /stopped 2\/6/);
});
