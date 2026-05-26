const TOTAL_ROUNDS = 6;
const ROUND_SECONDS = 18;
const MISS_LIMIT = 3;

const oddKinds = ["hue", "angle", "dot", "ring", "chip", "stripe"];

function hashString(input) {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function mulberry32(seed) {
  let value = seed >>> 0;
  return function next() {
    value += 0x6d2b79f5;
    let mixed = value;
    mixed = Math.imul(mixed ^ (mixed >>> 15), mixed | 1);
    mixed ^= mixed + Math.imul(mixed ^ (mixed >>> 7), mixed | 61);
    return ((mixed ^ (mixed >>> 14)) >>> 0) / 4294967296;
  };
}

function choose(random, list) {
  return list[Math.floor(random() * list.length)];
}

function todayKey(date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
  return formatter.format(date);
}

function cloneTile(tile) {
  return { ...tile };
}

function makeBaseTile(random, roundIndex) {
  const hue = Math.floor(24 + random() * 292);
  const accentHue = (hue + 118 + Math.floor(random() * 70)) % 360;
  return {
    hue,
    accentHue,
    turn: choose(random, [28, 45, 62, 112, 135]),
    tilt: choose(random, [-3, 0, 3, 6]),
    dotX: choose(random, [38, 44, 50, 56, 62]),
    dotY: choose(random, [36, 44, 50, 58, 64]),
    ringInset: choose(random, [17, 20, 23]),
    ringWidth: choose(random, [5, 6, 7]),
    innerRadius: choose(random, [30, 42, 50]),
    innerTurn: choose(random, [0, 20, 45]),
    chip: choose(random, [14, 17, 20]),
    odd: false,
    roundIndex
  };
}

function mutateOddTile(tile, oddKind, random) {
  const odd = cloneTile(tile);
  odd.odd = true;
  if (oddKind === "hue") {
    odd.hue = (odd.hue + 22 + Math.floor(random() * 16)) % 360;
  }
  if (oddKind === "angle") {
    odd.turn = (odd.turn + choose(random, [34, 46, 58])) % 180;
    odd.tilt += choose(random, [7, -7, 10]);
  }
  if (oddKind === "dot") {
    odd.dotX = odd.dotX <= 50 ? odd.dotX + 20 : odd.dotX - 20;
    odd.dotY = odd.dotY <= 50 ? odd.dotY + 14 : odd.dotY - 14;
  }
  if (oddKind === "ring") {
    odd.ringInset = Math.max(10, odd.ringInset - 8);
    odd.ringWidth += 4;
    odd.innerRadius = odd.innerRadius === 50 ? 28 : 50;
  }
  if (oddKind === "chip") {
    odd.chip += 12;
    odd.accentHue = (odd.accentHue + 38) % 360;
  }
  if (oddKind === "stripe") {
    odd.turn = (odd.turn + 90) % 180;
    odd.innerTurn = (odd.innerTurn + 45) % 180;
  }
  return odd;
}

function createRound(seedKey, roundIndex) {
  const seed = hashString(`${seedKey}:odd-tile:${roundIndex}`);
  const random = mulberry32(seed);
  const size = Math.min(6, 4 + Math.floor(roundIndex / 2));
  const oddIndex = Math.floor(random() * size * size);
  const oddKind = oddKinds[roundIndex % oddKinds.length];
  const base = makeBaseTile(random, roundIndex);
  const tiles = Array.from({ length: size * size }, (_, index) => {
    return index === oddIndex ? mutateOddTile(base, oddKind, random) : cloneTile(base);
  });

  return {
    seedKey,
    roundIndex,
    roundNumber: roundIndex + 1,
    totalRounds: TOTAL_ROUNDS,
    seconds: Math.max(10, ROUND_SECONDS - roundIndex),
    size,
    oddIndex,
    oddKind,
    tiles
  };
}

function createSprint(seedKey = todayKey()) {
  return Array.from({ length: TOTAL_ROUNDS }, (_, index) => createRound(seedKey, index));
}

function scoreHit({ secondsLeft, roundIndex, streak }) {
  const speed = Math.max(0, Math.ceil(secondsLeft * 7));
  const roundBonus = (roundIndex + 1) * 30;
  const streakBonus = Math.max(0, streak - 1) * 20;
  return 120 + speed + roundBonus + streakBonus;
}

function resultText({ seedKey, score, roundsCleared, misses, completed }) {
  const outcome = completed ? "cleared" : "stopped";
  return `Odd Tile Sprint ${seedKey}: ${outcome} ${roundsCleared}/${TOTAL_ROUNDS}, ${score} pts, ${misses}/${MISS_LIMIT} misses.`;
}

export {
  MISS_LIMIT,
  ROUND_SECONDS,
  TOTAL_ROUNDS,
  createRound,
  createSprint,
  hashString,
  resultText,
  scoreHit,
  todayKey
};
