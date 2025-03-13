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
  // {
  //     selector: '[data-action="playGameOnline"]',
  //     handler: initGameOnline
  // },
];

let isPaused = true;
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

// function initGameOnline()
// {
//     navigate('pong');
//     setTimeout(function() {
//         socket = new WebSocket("/ws/pong/online/");   // online/id --> comment specifier lid en question ? voir avec ja
//         mode = "online";
//         playGame(mode);
//     }, 500)
// }

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
  ctx.fillStyle = "rgba(255, 255, 255, 0.7)"; // Light overlay
  ctx.fillRect(0, 0, canvas.width, canvas.height); // Transparent overlay

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

// +5 -5 --> valeur arbitraire
function drawPaddle(state) {
  ctx.fillRect(
    (state.left.top_left_corner.x * canvas.width) / 100 + 5,
    (state.left.top_left_corner.y * canvas.height) / 100,
    (state.left.width * canvas.width) / 100,
    (state.left.height * canvas.height) / 100
  );
  ctx.fillRect(
    (state.right.top_left_corner.x * canvas.width) / 100 - 5,
    (state.right.top_left_corner.y * canvas.height) / 100,
    (state.right.width * canvas.width) / 100,
    (state.right.height * canvas.height) / 100
  );
}

async function handleEndGame(name) // handle la creation des games ici 
{
  const winnerModal = new bootstrap.Modal(document.getElementById("winnerModal"));
  const winnerName = document.getElementById("winner-name");
  if (name === "one") winnerName.textContent = "player 1";
  else winnerName.textContent = "player 2";
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

  // evenement boutton rejouer du modal
  const rejouer = document.getElementById("rejouer");
  if (rejouer)
  {
    rejouer.addEventListener("click", function () {
      if (mode == "solo") initGameSolo();
      else if (mode == "multi") initGameMulti();
    });
  }
}

function checkScore(state) {
  document.getElementById("leftScore").textContent = state.score[0];
  document.getElementById("rightScore").textContent = state.score[1];
  if (state.score[0] == 1 || state.score[1] == 1) {
    closeSocket();
    if (state.score[0] == 1) handleEndGame("one");
    else handleEndGame("two");
  }
}

function messageSocket() {
  socket.onmessage = function (event) {
    const state = JSON.parse(event.data);
    if (state.alert) handleError(state.alert, "handle game error");

    checkScore(state);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "white";

    drawBall(state.ball.x, state.ball.y, state.ball.r);
    drawPaddle(state);

    if (state.paused)
      // si bouton pause on affiche lecran de pause
      statePause();
  };
}

function keyDownHandler(event) {
  if (event.key in keysPressed) {
    keysPressed[event.key] = true;
    event.preventDefault();
  }
  event.preventDefault();
  if (event.key === " " && !isPaused) {
    isPaused = true;
    socket.send(
      JSON.stringify({
        toggle_pause: true,
        side: "left",
        paddle: 0,
      })
    );
  } else if (event.key === " " && isPaused) {
    isPaused = false;
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
  if (!isPaused) {
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
  isPaused = !isPaused;
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
  navigate("playerMode");
}

async function playGame(mode) {
  const response = await fetch("api/dashboards/create-game/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      "player1_type": "user",
      "player1_id": 1,
      "player1_name": "string",
      "player2_type": "user",
      "player2_id": 2,
      "player2_name": "tes1t",
    }),
  });
  const users = await authFetchJson(`api/dashboards/display-game/?game_id=1`);
  console.log(users);
  canvas = document.getElementById("gameCanvas");
  ctx = canvas.getContext("2d");
  isPaused = true;

  handleSocket();
  messageSocket();
  if (mode === "solo" || mode === "multi")
  {
    // evenement touches paddle bitch
    document.removeEventListener("keydown", keyDownHandler);
    document.addEventListener("keydown", keyDownHandler);
    document.removeEventListener("keyup", keyUpHandler);
    document.addEventListener("keyup", keyUpHandler);

    // clearinterval pour repetition des frames
    clearInterval(interval);
    interval = setInterval(playGameMulti, 16);
    console.log("interval == ", interval);

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

    // boutton endgame / fin de jeu rho --> maybe rajouter un modal ?
    const endgame = document.getElementById("endgame");
    if (endgame)
    {
      endgame.removeEventListener("click", endgameButton);
      endgame.addEventListener("click", endgameButton);
    }
  }
  // else if (mode === "online")
  // {
  //     document.removeEventListener("keydown", playGameOnline);
  //     document.addEventListener("keydown", playGameOnline);
  // }
}

/*
     - handle les erreurs possibles
     - utiliser le mode multi pour les tournois --> page de jeu pong utiliser des modals pour specifier les affrontements
*/

export default closeSocket;
