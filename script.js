const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const gridSize = 20;
const tileCount = canvas.width / gridSize;

let snake = [{ x: 10, y: 10 }];
let direction = { x: 1, y: 0 };
let nextDirection = { x: 0, y: 0 };
let food = null;
let score = 0;
let speed = 150;
let interval;
let specialFood = null;

function startGame() {
  placeFood();
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

  // 撞牆或撞到自己
  if (
    head.x < 0 || head.x >= tileCount ||
    head.y < 0 || head.y >= tileCount ||
    snake.some(seg => seg.x === head.x && seg.y === head.y)
  ) {
    clearInterval(interval);
    alert(`遊戲結束！得分：${score}`);
    location.reload();
  }

  snake.unshift(head);

  if (food && head.x === food.x && head.y === food.y) {
    score += 1;
    placeFood();
  } else if (specialFood && head.x === specialFood.x && head.y === specialFood.y) {
    if (specialFood.type === "bonus") {
      score += 5;
    } else if (specialFood.type === "speed") {
      speed = Math.max(50, speed - 20);
      clearInterval(interval);
      interval = setInterval(gameLoop, speed);
    } else if (specialFood.type === "poison") {
      score = Math.max(0, score - 2);
      snake.splice(-2); // 縮短身體
    }
    specialFood = null;
  } else {
    snake.pop();
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

  // 畫普通食物
  if (food) {
    ctx.fillStyle = "red";
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize - 2, gridSize - 2);
  }

  // 畫特殊道具
  if (specialFood) {
    ctx.fillStyle =
      specialFood.type === "bonus" ? "gold" :
      specialFood.type === "speed" ? "blue" :
      "purple";
    ctx.fillRect(specialFood.x * gridSize, specialFood.y * gridSize, gridSize - 2, gridSize - 2);
  }
}

function placeFood() {
  food = getRandomEmptyTile();
  // 20% 機率生成特殊道具
  if (Math.random() < 0.2) {
    const types = ["bonus", "speed", "poison"];
    specialFood = {
      ...getRandomEmptyTile(),
      type: types[Math.floor(Math.random() * types.length)],
    };
  } else {
    specialFood = null;
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
    (food && position.x === food.x && position.y === food.y) ||
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

canvas.setAttribute("tabindex", "0");
canvas.focus();
canvas.addEventListener("click", () => canvas.focus());

startGame();
