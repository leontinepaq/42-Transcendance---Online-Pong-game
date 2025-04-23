import { navigate } from "../router.js";
import {
  showModal,
  hideModal,
  showModalWithFooterButtons,
  showModalWithCustomUi,
} from "../modals.js";
import Game from "../game.js";
import chat from "../chat.js";
import { createTournamentMatches } from "../ui/TournamentUI.js";

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
  tournament: "/ws/pong/multi/",
};

let tournament = {
  players: null,
  games: null,
  idx: null,
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
    selector: '[data-action="back-menu"]',
    handler: endGameBackMenu,
  },
  {
    selector: '[data-action="back-home"]',
    handler: endGameBackHome,
  },
  {
    selector: '[data-action="replay"]',
    handler: (element) => {
      hideModal();
      playGame();
    },
  },
  {
    selector: '[data-action="start-tournament"]',
    handler: initTournament,
  },
  {
    selector: '[data-action="play-tournament"]',
    handler: (element, event) => {
      hideModal();
      playGame();
    },
  },
];

// ACTIONS

async function initGame(element, event) {
  chat.collapseAll();
  if (element.dataset.mode) mode = element.dataset.mode;
  await navigate("pong");
  playGame();
}

function setTournamentPlayers() {
  const players = new Set();
  [1, 2, 3, 4].forEach((index) => {
    const name = document.getElementById("tournament_player" + index).value;
    players.add(name);
  });
  if (players.has("")) return showModal(null, { i18n: "playerNameEmpty" });
  if (players.size != 4) return showModal(null, { i18n: "doublePlayerName" });
  tournament.players = [...players];
  return null;
}

function newTournamentGame(player1, player2) {
  return {
    id: null,
    player1: { name: player1, id: player1 },
    player2: { name: player2, id: player2 },
    score_player1: null,
    score_player2: null,
    winner: null,
  };
}

function setTournamentGames() {
  tournament.games = [
    newTournamentGame(tournament.players[0], tournament.players[1]),
    newTournamentGame(tournament.players[2], tournament.players[3]),
  ];
}

function setFinalTournamentGame() {
  tournament.games[2] = newTournamentGame(
    tournament.games[0].winner.name,
    tournament.games[1].winner.name
  );
}

async function initTournament(element, event) {
  chat.collapseAll();
  mode = "tournament";
  tournament.idx = 0;

  if (setTournamentPlayers() !== null) return;
  await navigate("pong");
  setTournamentGames();
  showTournamentModal();
}

async function showTournamentModal() {
  const modalUi = document.createElement("div");
  var buttons = [{ i18n: "leaveTournament", action: "back-menu" }];
  var title;

  modalUi.innerHTML = createTournamentMatches({ games: tournament.games }, "");
  if (tournament.idx <= 2) {
    buttons.push({ i18n: "playNext", action: "play-tournament" });
    title = {
      i18n: "nextMatch",
      player1: tournament.games[tournament.idx].player1.name,
      player2: tournament.games[tournament.idx].player2.name,
    };
  }
  if (tournament.idx > 2)
    title = { i18n: "winnerIs", username: tournament.games[2].winner.name };
  showModalWithFooterButtons(title, null, [modalUi], buttons, endGameBackMenu);
}

export async function initGameOnline(link) {
  chat.collapseAll();
  mode = "link";
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
  if (!socket) return;
  resetKey();
  socket.send(JSON.stringify({ toggle_pause: true, side: "left", paddle: 0 }));
}

// GAME LOGIC

function playGame(link = null) {
  chat.sendBusyOn();
  game = new Game();
  if (!link) socket = new WebSocket(links[mode]);
  else socket = new WebSocket(link);
  updatePlayerName("");
  game.setInstructions(mode);

  socket.onmessage = handleSocketMessage;

  resetKey();
  addKeyListeners();
  interval = setInterval(keyGameLoop, 16);
}

export function killGame() {
  if (!socket) return;
  socket.close();
  socket = null;
  clearInterval(interval);
  removeKeyListeners();
  resetKey();
  chat.sendBusyOff();
}

function updatePlayerName(opponent) {
  const player1Element = document.getElementById("player1");
  const player2Element = document.getElementById("player2");
  var player1 = sessionStorage.getItem("username");
  var player2 = opponent;

  if (mode === "tournament") {
    player1 = tournament.games[tournament.idx].player1.name;
    player2 = tournament.games[tournament.idx].player2.name;
  }

  if (mode === "solo") player2 = "Computer";
  if (mode === "multi") player2 = "Guest";

  player1Element.textContent = player1;
  player2Element.textContent = player2;
}

// HANDLE MESSAGES FROM SOCKET

async function handleSocketMessage(event) {
  state = JSON.parse(event.data);
  // console.log("Received ", state);

  if (state.info && state.opponent) updatePlayerName(state.opponent);
  if (state.info && state.message === "") return game.clearMessage();
  if (state.info && state.message !== "") return game.writeMessage(state.message);
  game.draw(state);
  if (state.paused) game.drawPause();
  if (state.over) {
    return await handleGameEnd(state);
  }
}

function handleTournamentMatchEnd(state) {
  // console.log(state);
  tournament.games[tournament.idx].id = 1; //Game played -> id exists
  tournament.games[tournament.idx].score_player1 = state.score[0];
  tournament.games[tournament.idx].score_player2 = state.score[1];
  if (state.score[0] === 3)
    tournament.games[tournament.idx].winner =
      tournament.games[tournament.idx].player1;
  else if (state.score[1] === 3)
    tournament.games[tournament.idx].winner =
      tournament.games[tournament.idx].player2;
  tournament.idx++;
  if (tournament.idx === 2) setFinalTournamentGame();
  showTournamentModal();
}

async function handleGameEnd(state) {
  killGame();
  await displayGameOver(state);

  if (mode === "tournament") handleTournamentMatchEnd(state);
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
  var buttonsParam = [
    { action: "back-menu", i18n: "backToMenu" },
    { action: "replay", i18n: "playAgain" },
  ];
  var bodyUi = { i18n: state.score[0] == 3 ? "victory" : "lost" };
  const username = sessionStorage.getItem("username").toUpperCase();

  if (mode === "link") buttonsParam = [{ action: "back-home", i18n: "backToMenu" }];
  if (mode === "multi")
    bodyUi = {
      i18n: "winnerIs",
      username: state.score[0] == 3 ? username : "GUEST",
    };

  killGame();
  clearInterval(interval);
  return await showModalWithFooterButtons(
    { i18n: "" },
    bodyUi,
    null,
    buttonsParam,
    endGameBackMenu
  );
}

function sendMove(left = true, up = true) {
  if (!socket) return;
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
  if (keysPressed["ArrowUp"]) {
    if (mode === "multi" || mode === "tournament") sendMoveUp(false);
    else if (!keysPressed["w"]) sendMoveUp();
  }
  if (keysPressed["ArrowDown"]) {
    if (mode === "multi" || mode === "tournament") sendMoveDown(false);
    else if (!keysPressed["s"]) sendMoveDown();
  }
}

export default killGame;
