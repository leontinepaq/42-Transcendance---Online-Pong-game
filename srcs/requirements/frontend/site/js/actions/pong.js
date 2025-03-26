import { navigate } from "../router.js";
import { handleError } from "../api.js";
import { authFetchJson } from "../api.js";
import doLanguage from "../translate.js";

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

let closeButton;
let rejouerButton;
let modalHeader;
let modalBody;
let modalFooter;
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

function addModalGameSoloMulti()
{
    // HEADER
    modalHeader = document.querySelector('.modal-header');

    const modalTitle = document.createElement('h5');
    modalTitle.setAttribute('data-i18n', 'congratulations');
    modalTitle.setAttribute('class', 'modal-title');
    modalTitle.setAttribute('id', 'winnerModalLabel');
    modalTitle.textContent = 'Congratulations !';

    closeButton = document.createElement('button');
    closeButton.setAttribute('type', 'button');
    closeButton.setAttribute('class', 'btn-close btn-close-white');
    closeButton.setAttribute('data-bs-dismiss', 'modal');
    closeButton.setAttribute('id', 'closeendgame');
    closeButton.setAttribute('aria-label', 'Close');

    modalHeader.appendChild(modalTitle);
    modalHeader.appendChild(closeButton);

    // BODY
    modalBody = document.querySelector('.modal-body');

    const winnerTitle = document.createElement('h3');
    winnerTitle.setAttribute('data-i18n', 'winnerIs');
    winnerTitle.setAttribute('id', 'winnerName');
    winnerTitle.textContent = 'Winner is :';

    const winnerName = document.createElement('h3');
    winnerName.setAttribute('id', 'winner-name');
    
    const victoryText = document.createElement('p');
    victoryText.setAttribute('data-i18n', 'amazingVictory');
    victoryText.textContent = 'What an amazing victory !';

    modalBody.appendChild(winnerTitle);
    modalBody.appendChild(winnerName);
    modalBody.appendChild(victoryText);

    // FOOTER 
    closeButton = document.createElement('button');
    closeButton.type = 'button';
    closeButton.classList.add('btn');
    closeButton.setAttribute('data-bs-dismiss', 'modal');
    closeButton.setAttribute('id', 'closeendgame1');
    closeButton.setAttribute('data-i18n', 'close');
    closeButton.textContent = 'CLOSE';

    rejouerButton = document.createElement('button');
    rejouerButton.type = 'button';
    rejouerButton.classList.add('btn');
    rejouerButton.setAttribute('data-bs-dismiss', 'modal');
    rejouerButton.setAttribute('id', 'rejouer');
    rejouerButton.setAttribute('data-i18n', 'playAgain');
    rejouerButton.textContent = 'PLAY AGAIN';

    modalFooter = document.querySelector('#myModal .modal-footer');
    modalFooter.appendChild(closeButton);
    modalFooter.appendChild(rejouerButton);
}

function addModalGameOnline()
{
  modalHeader = document.querySelector('.modal-header');

  closeButton = document.createElement('button');
  closeButton.setAttribute('type', 'button');
  closeButton.setAttribute('class', 'btn-close btn-close-white');
  closeButton.setAttribute('data-bs-dismiss', 'modal');
  closeButton.setAttribute('id', 'closeendgame');
  closeButton.setAttribute('aria-label', 'Close');

  modalHeader.appendChild(closeButton);
}

function rmModalParam()
{
    var remove1 = document.querySelector('.modal-header');
    while (remove1.firstChild) {
        remove1.removeChild(remove1.firstChild);
    }
    var remove2 = document.querySelector('.modal-body');
    while (remove2.firstChild) {
        remove2.removeChild(remove2.firstChild);
    }
    var remove3 = document.querySelector('.modal-footer');
    while (remove3.firstChild) {
        remove3.removeChild(remove3.firstChild);
    }
}

function showWinnerGame(name)
{
  if (mode === "solo" || mode === "multi") // solo et multi 
  {
    addModalGameSoloMulti();
    eventClose();
    const winnerModal = new bootstrap.Modal(document.getElementById("myModal"));
    const winnerName = document.getElementById("winner-name");
    if (name === "one")
      winnerName.textContent = "player 1";
    else
      winnerName.textContent = "player 2";
    winnerModal.show();
    doLanguage();
  }
  else // online
  {
    rmModalParam();
    addModalGameOnline();
    eventClose();
    const modalBody = document.querySelector("#myModal .modal-body");
    if (state.score[0] == 3)
    {
      modalBody.textContent = "You won, what an amazing victory !";
      const waitingModal = new bootstrap.Modal(document.getElementById("myModal"));
      waitingModal.show();
    }
    else
    {
      modalBody.textContent = "You lost, you'll do better next time !";
      const waitingModal = new bootstrap.Modal(document.getElementById("myModal"));
      waitingModal.show();
    }
    doLanguage();
  }
}

function eventClose()
{
  const closeendgame = document.getElementById("closeendgame");
  if (closeendgame)
  {
    closeendgame.addEventListener("click", function () {
      rmModalParam();
      navigate("playerMode");
    });
  }

  const closeendgame1 = document.getElementById("closeendgame1");
  if (closeendgame1)
  {
    closeendgame1.addEventListener("click", function () {
      rmModalParam();
      navigate("playerMode");
    });
  }
}

function eventPlayAgain()
{
  const rejouer = document.getElementById("rejouer");
  if (rejouer)
  {
    if (mode === "solo" || mode === "multi")
    {
        rejouer.addEventListener("click", function () {
          if (mode == "solo") initGameSolo();
          else if (mode == "multi") initGameMulti();
        });
    }
    else
      rejouer.remove();
  }
}

async function handleEndGame(name)
{
  showWinnerGame(name);
  eventPlayAgain();
}

function addKey()
{
  document.addEventListener("keydown", keyDownHandler);
  document.addEventListener("keyup", keyUpHandler);
}

function rmKey()
{
  document.removeEventListener("keydown", keyDownHandler);
  document.removeEventListener("keyup", keyUpHandler);
}

function checkScore(state) {
  document.getElementById("leftScore").textContent = state.score[0];
  document.getElementById("rightScore").textContent = state.score[1];
  if (state.over) {
    rmKey();
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
          rmModalParam();
          addModalGameOnline();
          eventClose();
          const modalBody = document.querySelector("#myModal .modal-body");
          modalBody.textContent = state.message;
          const waitingModal = new bootstrap.Modal(document.getElementById("myModal"));
          waitingModal.show();
        }
        return ;
    }

    rmModalParam();
    document.getElementById("myModal").style.display = "none";
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
    if (keysPressed["ArrowUp"] && mode === "multi") {
      socket.send(
        JSON.stringify({
          toggle_pause: false,
          side: "right",
          paddle: -2,
        })
      );
    }
    if (keysPressed["ArrowDown"] && mode === "multi") {
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
  rmModalParam();
  closeSocket();
  rmKey();
  navigate("playerMode");
}

function eventHandleButton()
{
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

function scrollModal()
{
  // utiliser ces events listener pour tous les modals --> permet de continuer a scroller
  document.addEventListener("shown.bs.modal", function () {
    document.body.style.overflow = "auto";
  });
  document.addEventListener("hidden.bs.modal", function () {
      document.body.style.overflow = "";
  });
}

function setupGame()
{
  // evenement touches paddle bitch
  rmKey();
  addKey();
  
  // clearinterval pour repetition des frames
  clearInterval(interval);
  interval = setInterval(playGameMulti, 16);
  
  scrollModal();
  eventHandleButton();
}

function playGame(mode)
{
  canvas = document.getElementById("gameCanvas");
  ctx = canvas.getContext("2d");

  rmModalParam();
  statePause();
  resetKey();
  handleSocket();
  messageSocket();
  setupGame();
}

export default closeSocket;
