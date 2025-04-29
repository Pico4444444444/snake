const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [{ x: 10, y: 10 }];
let direction = { x: 1, y: 0 };
let nextDirection = { x: 0, y: 0 };
let foods = [];
let score = 0;
let speed = 150;
let interval;
let specialFood = null;

const gameOverScreen = document.getElementById("gameOverScreen");
const finalScore = document.getElementById("finalScore");
const restartBtn = document.getElementById("restartBtn");

function startGame() {
  snake = [{ x: 10, y: 10 }];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 0, y: 0 };
  score = 0;
  speed = 150;
  foods = [];
  specialFood = null;
  gameOverScreen.classList.add("hidden");

  placeFoods();
  clearInterval(interval);
  interval = setInterval(gameLoop, speed);
}

function gameLoop() {
  update();
  draw();
}

function update() {
  if (nextDirection.x === 0 && nextDirection.y === 0) return;
  direction = nextDirection;

  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y,
  };

  if (
    head.x < 0 || head.x >= tileCount ||
    head.y < 0 || head.y >= tileCount ||
    snake.some(seg => seg.x === head.x && seg.y === head.y)
  ) {
    clearInterval(interval);
    finalScore.innerText = `得分：${score}`;
    gameOverScreen.classList.remove("hidden");
    return;
  }

  snake.unshift(head);

  let ateFood = false;
  for (let i = 0; i < foods.length; i++) {
    if (head.x === foods[i].x && head.y === foods[i].y) {
      score += 1;
      foods.splice(i, 1);
      ateFood = true;
      break;
    }
  }

  if (specialFood && head.x === specialFood.x && head.y === specialFood.y) {
    if (specialFood.type === "bonus") {
      score += 5;
    } else if (specialFood.type === "speed") {
      speed = Math.max(50, speed - 20);
      clearInterval(interval);
      interval = setInterval(gameLoop, speed);
    } else if (specialFood.type === "poison") {
      score = Math.max(0, score - 2);
      snake.splice(-2);
    }
    specialFood = null;
  }

  if (!ateFood) {
    snake.pop();
  }

  if (foods.length < 3) {
    placeFoods();
  }

  document.getElementById("score").innerText = `得分：${score}`;
}

function draw() {
  ctx.fillStyle = "#111";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 畫蛇
  ctx.fillStyle = "lime";
  snake.forEach(seg => {
    ctx.fillRect(seg.x * gridSize, seg.y * gridSize, gridSize - 2, gridSize - 2);
  });

  // 畫普通食物（圓形）
  foods.forEach(food => {
    ctx.fillStyle = "red";
    ctx.beginPath();
    ctx.arc(
      food.x * gridSize + gridSize / 2,
      food.y * gridSize + gridSize / 2,
      gridSize / 2 - 3,
      0,
      Math.PI * 2
    );
    ctx.fill();
  });

  // 畫特殊食物
  if (specialFood) {
    const centerX = specialFood.x * gridSize + gridSize / 2;
    const centerY = specialFood.y * gridSize + gridSize / 2;

    if (specialFood.type === "bonus") {
      drawStar(centerX, centerY, 5, gridSize / 2 - 4, (gridSize / 2 - 6) / 2, "gold");
    } else if (specialFood.type === "speed") {
      drawLightning(centerX, centerY, "blue");
    } else if (specialFood.type === "poison") {
      drawSkull(centerX, centerY, "purple");
    }
  }
}

// 畫星星
function drawStar(cx, cy, spikes, outerRadius, innerRadius, color) {
  let rot = Math.PI / 2 * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);
  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

// 畫閃電
function drawLightning(cx, cy, color) {
  ctx.beginPath();
  ctx.moveTo(cx - 5, cy - 10);
  ctx.lineTo(cx + 2, cy - 2);
  ctx.lineTo(cx - 2, cy - 2);
  ctx.lineTo(cx + 5, cy + 10);
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.stroke();
}

// 畫骷髏
function drawSkull(cx, cy, color) {
  ctx.beginPath();
  ctx.arc(cx, cy, 8, 0, Math.PI * 2);
  ctx.moveTo(cx - 5, cy + 5);
  ctx.lineTo(cx - 5, cy + 10);
  ctx.moveTo(cx + 5, cy + 5);
  ctx.lineTo(cx + 5, cy + 10);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();
}

function placeFoods() {
  const howMany = Math.floor(Math.random() * 3) + 1;
  for (let i = 0; i < howMany; i++) {
    foods.push(getRandomEmptyTile());
  }

  if (!specialFood && Math.random() < 0.2) {
    const types = ["bonus", "speed", "poison"];
    specialFood = {
      ...getRandomEmptyTile(),
      type: types[Math.floor(Math.random() * types.length)],
    };
  }
}

function getRandomEmptyTile() {
  let position;
  do {
    position = {
      x: Math.floor(Math.random() * tileCount),
      y: Math.floor(Math.random() * tileCount),
    };
  } while (
    snake.some(seg => seg.x === position.x && seg.y === position.y) ||
    foods.some(f => f.x === position.x && f.y === position.y) ||
    (specialFood && position.x === specialFood.x && position.y === specialFood.y)
  );
  return position;
}

document.addEventListener("keydown", e => {
  switch (e.key) {
    case "ArrowUp":
      if (direction.y === 0) nextDirection = { x: 0, y: -1 };
      break;
    case "ArrowDown":
      if (direction.y === 0) nextDirection = { x: 0, y: 1 };
      break;
    case "ArrowLeft":
      if (direction.x === 0) nextDirection = { x: -1, y: 0 };
      break;
    case "ArrowRight":
      if (direction.x === 0) nextDirection = { x: 1, y: 0 };
      break;
  }
});

restartBtn.addEventListener("click", startGame);

canvas.setAttribute("tabindex", "0");
canvas.focus();
canvas.addEventListener("click", () => canvas.focus());

startGame();
