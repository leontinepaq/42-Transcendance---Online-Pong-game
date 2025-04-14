import { navigate } from "../router.js";
import { showModal, hideModal, showModalWithFooterButtons } from "../modals.js";
import Game from "../game.js";
import chat from "../chat.js"

let state = true;
let mode;
let socket;
let interval;
let game;
let keysPressed = { ArrowUp: false, ArrowDown: false, w: false, s: false };
let links = {
  solo: "/ws/pong/solo/",
  multi: "/ws/pong/multi/",
  online: "/ws/pong/online/",
};

export const pongActions = [
  {
    selector: '[data-action="play-game"]',
    handler: initGame,
  },
  {
    selector: '[data-action="pause-game"]',
    handler: sendTogglePause,
  },
  {
    selector: '[data-action="end-game"]',
    handler: endGameBackMenu,
  },
  {
    selector: '[data-action="close-game"]',
    handler: endGameBackHome,
  },
  {
    selector: '[data-action="replay"]',
    handler: initGame,
  },
];

// ACTIONS

async function initGame(element, event) {
  if (element.dataset.mode) mode = element.dataset.mode;
  await navigate("pong");
  playGame();
}

export async function initGameOnline(link) {
  await navigate("pong");
  playGame(link);
}

function endGameBackHome() {
  killGame();
  navigate("home");
}

function endGameBackMenu() {
  killGame();
  navigate("playerMode");
}

function sendTogglePause() {
  socket.send(JSON.stringify({ toggle_pause: true, side: "left", paddle: 0 }));
}

// GAME LOGIC

function playGame(link = null) {
  chat.sendBusyOn();
  game = new Game();
  if (!link)
    socket = new WebSocket(links[mode]);
  else
    socket = new WebSocket(link);
  updatePlayerName("");

  socket.onmessage = handleSocketMessage;

  resetKey();
  addKeyListeners();
  interval = setInterval(keyGameLoop, 16);
}

export function killGame() {
  if (!socket) return
  socket.close();
  socket = null;
  clearInterval(interval);
  removeKeyListeners();
  resetKey();
  chat.sendBusyOff();
}

function updatePlayerName(opponent) {
  const player1 = document.getElementById("player1");
  const player2 = document.getElementById("player2");
  const username = sessionStorage.getItem("username");

  player1.textContent = username;
  if (mode === "solo") player2.textContent = "Computer";
  else if (mode === "multi") player2.textContent = "Player 2";
  else player2.textContent = opponent;
}

// HANDLE MESSAGES FROM SOCKET

async function handleSocketMessage(event) {
  state = JSON.parse(event.data);
  console.log(state);

  if (state.info && state.opponent) updatePlayerName(state.opponent);
  if (state.info && state.message === "")
    return hideModal();
  if (state.info && state.message !== "")
  {
    return await showModal(
      { i18n: "" },
      { i18n: state.message },
      null,
      true,
      endGameBackMenu,
      true
    );
  }
  hideModal();
  game.draw(state);
  if (state.paused) game.drawPause();
  if (state.over) return await displayGameOver(state);
}

// KEY CAPTURE MANAGEMENT

function resetKey() {
  keysPressed["w"] = false;
  keysPressed["s"] = false;
  keysPressed["ArrowUp"] = false;
  keysPressed["ArrowDown"] = false;
}

function keyDownHandler(event) {
  if (event.key in keysPressed) {
    keysPressed[event.key] = true;
    event.preventDefault();
  }
  event.preventDefault();
  if (event.key === " ") sendTogglePause();
}

function keyUpHandler(event) {
  if (event.key in keysPressed) {
    keysPressed[event.key] = false;
    event.preventDefault();
  }
}

function addKeyListeners() {
  document.addEventListener("keydown", keyDownHandler);
  document.addEventListener("keyup", keyUpHandler);
}

export function removeKeyListeners() {
  document.removeEventListener("keydown", keyDownHandler);
  document.removeEventListener("keyup", keyUpHandler);
}

async function displayGameOver(state) {
  killGame();
  clearInterval(interval);
  return await showModalWithFooterButtons(
    { i18n: "" },
    { i18n: state.score[0] == 3 ? "victory" : "lost" },
    [
      { action: "end-game", i18n: "close" },
      { action: "replay", i18n: "playAgain" },
    ]
  );
}

function sendMove(left = true, up = true) {
  socket.send(
    JSON.stringify({
      toggle_pause: false,
      side: left ? "left" : "right",
      paddle: up ? -2 : 2,
    })
  );
}

function sendMoveDown(left = true) {
  sendMove(left, false);
}

function sendMoveUp(left = true) {
  sendMove(left, true);
}

function keyGameLoop() {
  if (state.paused) return;
  if (keysPressed["w"]) sendMoveUp();
  if (keysPressed["s"]) sendMoveDown();
  if (keysPressed["ArrowUp"] && mode === "multi") sendMoveUp(false);
  if (keysPressed["ArrowUp"] && mode !== "multi") sendMoveUp();
  if (keysPressed["ArrowDown"] && mode === "multi") sendMoveDown(false);
  if (keysPressed["ArrowDown"] && mode !== "multi") sendMoveDown();
}

export default killGame;
