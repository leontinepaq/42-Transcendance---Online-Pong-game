import { navigate } from "../router.js";
import { handleError } from "../api.js";
import { authFetchJson } from "../api.js";

export const pongActions = [
  {
    selector: '[data-action="playGameSolo"]',
    handler: initGameSolo,
  },
  {
    selector: '[data-action="playGameMultiplayer"]',
    handler: initGameMulti,
  },
  {
    selector: '[data-action="playGameOnline"]',
    handler: initGameOnline
  },
];

let state = true;
let mode;
let socket;
let interval;
let canvas;
let ctx;
let keysPressed = {
  ArrowUp: false,
  ArrowDown: false,
  w: false,
  s: false,
};

function initGameSolo() {
  navigate("pong");
  setTimeout(function () {
    socket = new WebSocket("/ws/pong/solo/"); // solo
    mode = "solo";
    playGame(mode);
  }, 500);
}

function initGameMulti() {
  navigate("pong");
  setTimeout(function () {
    socket = new WebSocket("/ws/pong/multi/"); // multi
    mode = "multi";
    playGame(mode);
  }, 500);
}

function initGameOnline()
{
  navigate('pong');
  setTimeout(function() {
    socket = new WebSocket("/ws/pong/online/");   // online/id --> comment specifier lid en question ? voir avec ja
    mode = "online";
    playGame(mode);
  }, 500)
}

function resetKey()
{
  keysPressed["w"] = false;
  keysPressed["s"] = false;
  keysPressed["ArrowUp"] = false;
  keysPressed["ArrowDown"] = false;
}

function handleSocket() {
  socket.onopen = function () {
    console.log("✅ WebSocket connected!");
  };

  socket.onerror = function (error) {
    console.error("❌ WebSocket error:", error);
  };

  socket.onclose = function () {
    console.log("🔴 WebSocket closed.");
  };
}

export function closeSocket() {
  if (socket) {
    socket.close();
  }
}

function statePause() {
  if (ctx)
  {
    ctx.fillStyle = "white";
    ctx.font = "50px Arial";
    ctx.textAlign = "center";

    const barWidth = 20;
    const barHeight = 100;
    const pauseX = canvas.width / 2 - 40;
    const pauseY = canvas.height / 2 - barHeight / 2;
    ctx.fillRect(pauseX + 10, pauseY, barWidth, barHeight);
    ctx.fillRect(pauseX + 50, pauseY, barWidth, barHeight);
  }
}

function drawBall(x, y, r) {
  ctx.beginPath();
  ctx.arc(
    (x * canvas.width) / 100,
    (y * canvas.height) / 100,
    (r * canvas.width) / 100,
    0,
    Math.PI * 2
  );
  ctx.fill();
}

// Function to draw a rectangle with rounded corners
function drawRoundedRect(x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.arcTo(x + width, y, x + width, y + radius, radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
  ctx.lineTo(x + radius, y + height);
  ctx.arcTo(x, y + height, x, y + height - radius, radius);
  ctx.lineTo(x, y + radius);
  ctx.arcTo(x, y, x + radius, y, radius);
  ctx.closePath();
  ctx.fill();
}

// +5 -5 --> valeur arbitraire
function drawPaddle(state) {
  drawRoundedRect(
    (state.left.top_left_corner.x * canvas.width) / 100 + 5,
    (state.left.top_left_corner.y * canvas.height) / 100,
    (state.left.width * canvas.width) / 100,
    (state.left.height * canvas.height) / 100, 
    5
  );
  drawRoundedRect(
    (state.right.top_left_corner.x * canvas.width) / 100 - 5,
    (state.right.top_left_corner.y * canvas.height) / 100,
    (state.right.width * canvas.width) / 100,
    (state.right.height * canvas.height) / 100,
    5
  );
}

async function handleEndGame(name) // handle la creation des games ici 
{
  const winnerModal = new bootstrap.Modal(document.getElementById("winnerModal"));
  const winnerName = document.getElementById("winner-name");
  if (name === "one")
    winnerName.textContent = "player 1";
  else
    winnerName.textContent = "player 2";
  winnerModal.show();

  // evenement croix du modal pour close
  const closeendgame = document.getElementById("closeendgame");
  if (closeendgame)
  {
    closeendgame.addEventListener("click", function () {
      navigate("playerMode");
    });
  }
  
  // evenement boutton fermer du modal
  const closeendgame1 = document.getElementById("closeendgame1");
  if (closeendgame1)
  {
    closeendgame1.addEventListener("click", function () {
      navigate("playerMode");
    });
  }

  const rejouer = document.getElementById("rejouer");
  if (mode === "solo" || mode === "multi")
  {
    if (rejouer)
    {
      rejouer.addEventListener("click", function () {
        if (mode == "solo") initGameSolo();
        else if (mode == "multi") initGameMulti();
      });
    }
  }
  else
    rejouer.remove();
}

function checkScore(state) {
  document.getElementById("leftScore").textContent = state.score[0];
  document.getElementById("rightScore").textContent = state.score[1];
  if (state.over) {
    document.removeEventListener("keydown", keyDownHandler);
    document.removeEventListener("keyup", keyUpHandler);
    closeSocket();
    if (state.score[0] == 3)
      handleEndGame("one");
    else
      handleEndGame("two");
  }
}

function messageSocket() {
  socket.onmessage = function (event) {
    state = JSON.parse(event.data);
    if (state.alert)
      handleError(state.alert, "handle game error");
    if (state.info)
    {
        if (!state.start || !state.run)
        {
          const modalBody = document.querySelector("#waitingModal .modal-body");
          console.log(state.message)
          modalBody.textContent = state.message;
          console.log(modalBody.textContent)
          const waitingModal = new bootstrap.Modal(document.getElementById("waitingModal"));
          waitingModal.show();
        }
        return ;
    }
    
    document.getElementById("message").textContent = ""
    document.getElementById("waitingModal").style.display = "none";
    checkScore(state);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";

    drawBall(state.ball.x, state.ball.y, state.ball.r);
    drawPaddle(state);

    if (state.paused)
      statePause();
  };
}

function keyDownHandler(event) {
  if (event.key in keysPressed) {
    keysPressed[event.key] = true;
    event.preventDefault();
  }
  event.preventDefault();
  if (event.key === " " && !state.paused) {
    socket.send(
      JSON.stringify({
        toggle_pause: true,
        side: "left",
        paddle: 0,
      })
    );
  } else if (event.key === " " && state.paused) {
    socket.send(
      JSON.stringify({
        toggle_pause: true,
        side: "left",
        paddle: 0,
      })
    );
  }
}

function keyUpHandler(event) {
  if (event.key in keysPressed) {
    keysPressed[event.key] = false;
    event.preventDefault();
  }
}

function playGameMulti() {
  if (!state.paused) {
    if (keysPressed["w"]) {
      socket.send(
        JSON.stringify({
          toggle_pause: false,
          side: "left",
          paddle: -2,
        })
      );
    }
    if (keysPressed["s"]) {
      socket.send(
        JSON.stringify({
          toggle_pause: false,
          side: "left",
          paddle: 2,
        })
      );
    }
    if (keysPressed["ArrowUp"]) {
      socket.send(
        JSON.stringify({
          toggle_pause: false,
          side: "right",
          paddle: -2,
        })
      );
    }
    if (keysPressed["ArrowDown"]) {
      socket.send(
        JSON.stringify({
          toggle_pause: false,
          side: "right",
          paddle: 2,
        })
      );
    }
  }
}

function pauseButton() {
  socket.send(
    JSON.stringify({
      toggle_pause: true,
      side: "left",
      paddle: 0,
    })
  );
}

function endgameButton() {
  closeSocket();
  document.removeEventListener("keydown", keyDownHandler);
  document.removeEventListener("keyup", keyUpHandler);
  navigate("playerMode");
}

function setupGame(mode)
{
    // evenement touches paddle bitch
    document.removeEventListener("keydown", keyDownHandler);
    document.removeEventListener("keyup", keyUpHandler);
    document.addEventListener("keydown", keyDownHandler);
    document.addEventListener("keyup", keyUpHandler);
  
    // clearinterval pour repetition des frames
    clearInterval(interval);
    interval = setInterval(playGameMulti, 16);
  
    // utiliser ces events listener pour tous les modals --> permet de continuer a scroller
    document.addEventListener("shown.bs.modal", function () {
        document.body.style.overflow = "auto";
    });
    document.addEventListener("hidden.bs.modal", function () {
        document.body.style.overflow = "";
    });
  
    // boutton pause en plus du space
    const boutton = document.getElementById("pause");
    if (boutton)
    {
      boutton.removeEventListener("click", pauseButton);
      boutton.addEventListener("click", pauseButton);
    }
    const endgame = document.getElementById("endgame");
    if (endgame)
    {
      endgame.removeEventListener("click", endgameButton);
      endgame.addEventListener("click", endgameButton);
    }
}

function playGame(mode)
{
  canvas = document.getElementById("gameCanvas");
  ctx = canvas.getContext("2d");

  resetKey();
  handleSocket();
  messageSocket();
  setupGame(mode);
}

export default closeSocket;
