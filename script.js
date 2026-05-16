const HUMAN = "○";
const CPU = "×";
const WIN_LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const resetBtn = document.getElementById("reset");
const cells = Array.from(document.querySelectorAll(".cell"));
const scoreYouEl = document.getElementById("scoreYou");
const scoreCpuEl = document.getElementById("scoreCpu");
const scoreDrawEl = document.getElementById("scoreDraw");
const scoreYouLabelEl = document.getElementById("scoreYouLabel");

let state = Array(9).fill("");
let gameOver = false;
let turn = HUMAN;
const score = { you: 0, cpu: 0, draw: 0 };

function playerName() {
  try {
    const raw = localStorage.getItem("marubatsu_user");
    if (!raw) return "あなた";
    const user = JSON.parse(raw);
    return user.name?.split(" ")[0] || "あなた";
  } catch {
    return "あなた";
  }
}

function humanTurnLabel() {
  return `${playerName()}の番です（○）`;
}

window.addEventListener("auth:changed", () => {
  if (!gameOver && turn === HUMAN) {
    statusEl.textContent = humanTurnLabel();
  }
  scoreYouLabelEl && (scoreYouLabelEl.textContent = `${playerName()}（○）`);
});

function render() {
  cells.forEach((cell, i) => {
    const v = state[i];
    cell.textContent = v;
    cell.classList.toggle("maru", v === HUMAN);
    cell.classList.toggle("batsu", v === CPU);
    cell.disabled = v !== "" || gameOver;
  });
}

function checkWinner(s) {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (s[a] && s[a] === s[b] && s[a] === s[c]) {
      return { winner: s[a], line };
    }
  }
  if (s.every((v) => v !== "")) return { winner: "draw", line: null };
  return null;
}

function highlight(line) {
  if (!line) return;
  line.forEach((i) => cells[i].classList.add("win"));
}

function updateScore() {
  scoreYouEl.textContent = score.you;
  scoreCpuEl.textContent = score.cpu;
  scoreDrawEl.textContent = score.draw;
}

function endGame(result) {
  gameOver = true;
  if (result.winner === HUMAN) {
    statusEl.textContent = "あなたの勝ち！";
    score.you++;
  } else if (result.winner === CPU) {
    statusEl.textContent = "CPUの勝ち…";
    score.cpu++;
  } else {
    statusEl.textContent = "引き分け";
    score.draw++;
  }
  highlight(result.line);
  updateScore();
  render();
}

// Minimax で CPU を強くする（先読み）
function minimax(s, isCpuTurn) {
  const result = checkWinner(s);
  if (result) {
    if (result.winner === CPU) return { score: 1 };
    if (result.winner === HUMAN) return { score: -1 };
    return { score: 0 };
  }
  const moves = [];
  for (let i = 0; i < 9; i++) {
    if (s[i] !== "") continue;
    s[i] = isCpuTurn ? CPU : HUMAN;
    const { score } = minimax(s, !isCpuTurn);
    moves.push({ index: i, score });
    s[i] = "";
  }
  if (isCpuTurn) {
    return moves.reduce((best, m) => (m.score > best.score ? m : best));
  } else {
    return moves.reduce((best, m) => (m.score < best.score ? m : best));
  }
}

function cpuMove() {
  if (gameOver) return;
  const { index } = minimax(state.slice(), true);
  state[index] = CPU;
  render();
  const result = checkWinner(state);
  if (result) {
    endGame(result);
    return;
  }
  turn = HUMAN;
  statusEl.textContent = humanTurnLabel();
}

function handleCellClick(e) {
  const i = Number(e.currentTarget.dataset.index);
  if (gameOver || turn !== HUMAN || state[i] !== "") return;
  state[i] = HUMAN;
  render();
  const result = checkWinner(state);
  if (result) {
    endGame(result);
    return;
  }
  turn = CPU;
  statusEl.textContent = "CPUの番…";
  setTimeout(cpuMove, 400);
}

function reset() {
  state = Array(9).fill("");
  gameOver = false;
  turn = HUMAN;
  cells.forEach((cell) => cell.classList.remove("win"));
  statusEl.textContent = humanTurnLabel();
  render();
}

cells.forEach((cell) => cell.addEventListener("click", handleCellClick));
resetBtn.addEventListener("click", reset);
statusEl.textContent = humanTurnLabel();
if (scoreYouLabelEl) scoreYouLabelEl.textContent = `${playerName()}（○）`;
render();
