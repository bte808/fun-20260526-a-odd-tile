import {
  MISS_LIMIT,
  TOTAL_ROUNDS,
  createSprint,
  resultText,
  scoreHit,
  todayKey
} from "./game.js";

const elements = {
  board: document.querySelector("#board"),
  round: document.querySelector("#round"),
  score: document.querySelector("#score"),
  time: document.querySelector("#time"),
  misses: document.querySelector("#misses"),
  feedback: document.querySelector("#feedback"),
  prompt: document.querySelector("#prompt"),
  restart: document.querySelector("#restart"),
  newRound: document.querySelector("#new-round"),
  copyScore: document.querySelector("#copy-score")
};

let sprint = [];
let state = {};
let ticker = 0;

function resetState() {
  const seedKey = todayKey();
  sprint = createSprint(seedKey);
  state = {
    seedKey,
    roundIndex: 0,
    score: 0,
    misses: 0,
    streak: 0,
    secondsLeft: sprint[0].seconds,
    started: false,
    locked: false,
    completed: false,
    startedAt: 0
  };
}

function tileStyle(tile) {
  return [
    `--hue:${tile.hue}`,
    `--accent-hue:${tile.accentHue}`,
    `--turn:${tile.turn}deg`,
    `--tilt:${tile.tilt}deg`,
    `--dot-x:${tile.dotX}%`,
    `--dot-y:${tile.dotY}%`,
    `--ring-inset:${tile.ringInset}%`,
    `--ring-width:${tile.ringWidth}px`,
    `--inner-radius:${tile.innerRadius}%`,
    `--inner-turn:${tile.innerTurn}deg`,
    `--chip:${tile.chip}%`
  ].join(";");
}

function setFeedback(message, tone = "") {
  elements.feedback.className = `feedback ${tone}`.trim();
  elements.feedback.textContent = message;
}

function currentRound() {
  return sprint[state.roundIndex];
}

function renderBoard() {
  const round = currentRound();
  elements.board.innerHTML = "";
  elements.board.style.setProperty("--size", round.size);
  round.tiles.forEach((tile, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "tile";
    button.style.cssText = tileStyle(tile);
    button.dataset.index = String(index);
    button.setAttribute("aria-label", `Tile ${index + 1}`);
    button.addEventListener("click", () => chooseTile(index, button));
    elements.board.append(button);
  });
}

function renderHud() {
  elements.round.textContent = `${Math.min(state.roundIndex + 1, TOTAL_ROUNDS)}/${TOTAL_ROUNDS}`;
  elements.score.textContent = String(state.score);
  elements.time.textContent = state.completed ? "0.0" : state.secondsLeft.toFixed(1);
  elements.misses.textContent = `${state.misses}/${MISS_LIMIT}`;
  elements.copyScore.disabled = state.score === 0 && !state.completed;
}

function revealOdd() {
  const round = currentRound();
  if (!round) return;
  const oddTile = elements.board.querySelector(`[data-index="${round.oddIndex}"]`);
  if (oddTile) oddTile.classList.add("revealed");
}

function finishSprint(message, tone) {
  state.completed = true;
  state.locked = true;
  clearInterval(ticker);
  revealOdd();
  setFeedback(message, tone);
  renderHud();
}

function advanceRound() {
  state.roundIndex += 1;
  if (state.roundIndex >= TOTAL_ROUNDS) {
    finishSprint(`Sprint complete. Final score: ${state.score}.`, "good");
    return;
  }
  state.locked = false;
  state.secondsLeft = currentRound().seconds;
  renderBoard();
  renderHud();
  setFeedback(`Round ${state.roundIndex + 1}: one tile changed its rhythm.`);
}

function chooseTile(index, button) {
  if (state.locked || state.completed) return;
  if (!state.started) {
    state.started = true;
    state.startedAt = Date.now();
  }

  const round = currentRound();
  if (index === round.oddIndex) {
    state.locked = true;
    state.streak += 1;
    const gained = scoreHit({
      secondsLeft: state.secondsLeft,
      roundIndex: state.roundIndex,
      streak: state.streak
    });
    state.score += gained;
    button.classList.add("revealed");
    setFeedback(`Hit. +${gained} points.`, "good");
    renderHud();
    window.setTimeout(advanceRound, 560);
    return;
  }

  state.streak = 0;
  state.misses += 1;
  button.classList.remove("wrong");
  button.getBoundingClientRect();
  button.classList.add("wrong");
  setFeedback(state.misses >= MISS_LIMIT ? "Miss limit reached." : "Not that one. Keep scanning.", "bad");
  renderHud();
  if (state.misses >= MISS_LIMIT) {
    finishSprint(`Game over. The odd tile is marked. Score: ${state.score}.`, "bad");
  }
}

function tick() {
  if (!state.started || state.locked || state.completed) return;
  state.secondsLeft = Math.max(0, state.secondsLeft - 0.1);
  if (state.secondsLeft <= 0) {
    state.streak = 0;
    state.misses += 1;
    if (state.misses >= MISS_LIMIT) {
      finishSprint(`Time ran out. The odd tile is marked. Score: ${state.score}.`, "bad");
      return;
    }
    state.locked = true;
    revealOdd();
    setFeedback("Time. Study the marked tile, then keep going.", "bad");
    renderHud();
    window.setTimeout(advanceRound, 760);
    return;
  }
  renderHud();
}

function start() {
  clearInterval(ticker);
  resetState();
  renderBoard();
  renderHud();
  setFeedback("Study the board. First tap starts the timer.");
  ticker = window.setInterval(tick, 100);
}

async function copyResult() {
  const text = resultText({
    seedKey: state.seedKey,
    score: state.score,
    roundsCleared: Math.min(state.roundIndex, TOTAL_ROUNDS),
    misses: state.misses,
    completed: state.completed && state.roundIndex >= TOTAL_ROUNDS
  });

  try {
    await navigator.clipboard.writeText(text);
    setFeedback("Result copied.", "good");
  } catch {
    setFeedback(text, "good");
  }
}

elements.restart.addEventListener("click", start);
elements.newRound.addEventListener("click", start);
elements.copyScore.addEventListener("click", copyResult);

start();

window.__ODD_TILE_DEBUG__ = {
  getState: () => ({ ...state }),
  getRound: () => currentRound(),
  chooseTile
};
