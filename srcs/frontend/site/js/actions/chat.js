import { initGameOnline } from "./pong.js";
import { chat } from "../chat.js";
import { hideModal, showModalWithFooterButtons } from "../modals.js";
import { navigate } from "../router.js"

export const chatActions = [
  {
    selector: '[data-action="open-chat"]',
    handler: createChatBubbleAction,
  },
  {
    selector: '[data-action="connect-chat"]',
    handler: chat.connect,
  },
  {
    selector: '[data-action="open-profile"]',
    handler: navigateToStatsFromChat,
  },
  {
    selector: '[data-action="hide-chat"]',
    handler: hideChatAction,
  },
  {
    selector: '[data-action="collapse-chat"]',
    handler: collapseChatAction,
  },
  {
    selector: '[data-action="launch-pong"]',
    handler: sendGame,
  },
  {
    selector: '[data-action="game-cancel"]',
    handler: (element) => {
      const id = element.dataset.id;
      sendGameCancel(id);
    },
  },
  {
    selector: '[data-action="game-decline"]',
    handler: sendGameDeclined,
  },
  {
    selector: '[data-action="game-accept"]',
    handler: sendGameAccept,
  },
];

export function createChatBubbleAction(element) {
  chat.collapseAll();
  const userId = element.dataset.id;
  const username = element.dataset.username;
  chat.getBubble(userId, username).open();
}

function navigateToStatsFromChat(element) {
  const userId = element.dataset.id;
  navigate("dashboard", userId);
}

export function hideChatAction(element) {
  const id = element.dataset.id;
  chat.getBubble(id).hide();
}

export function collapseChatAction(element) {
  const id = element.dataset.id;
  chat.getBubble(id).close();
}

function sendGameCancel(id) {
  hideModal();
  chat.sendGameCancel(id);
  chat.sendBusyOff();
}

async function sendGame(element) {
  const id = element.dataset.id;
  const username = element.dataset.username;
  const tournament_id = element.dataset.tournamentId;
  const tournament_name = element.dataset.tournamentName;

  chat.sendGame(id, tournament_id, tournament_name);
  await showModalWithFooterButtons(
    null,
    { i18n: "waitingFor", username: username.toUpperCase() },
    null,
    [{ action: "game-cancel", i18n: "cancel", id: id }],
    () => {sendGameCancel(id);},
    true
  );
  chat.sendBusyOn();
}

function sendGameDeclined(element) {
  const id = element.dataset.id;

  hideModal();
  chat.sendBusyOff();
  chat.sendGameDecline(id);
}

function sendGameAccept(element) {
  const id = element.dataset.id;
  const link = element.dataset.link;

  hideModal();
  chat.sendGameAccept(id, link);
  initGameOnline(link);
}

export default chatActions;
