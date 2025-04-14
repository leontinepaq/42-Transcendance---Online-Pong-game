import navigate from "./router.js";
import { initGameOnline } from "./actions/pong.js";
import { show, hide } from "./utils.js";
import { showModal, hideModal, showModalWithFooterButtons } from "./modals.js";

// JSON MSG MODEL
// {
//   type: "message"/"offline"/"blocked"/"game"/"game-cancel"/"game-accept",
//   init: "message"/"game" (what action initated the answer)
//   message: ""
//   receiver: (receiver id)
//   sender: (sender id)
//   receiver_username: (only in messages sent back by backend)
//   sender_username: (only in messages sent back by backend)
// }

class Chat {
  constructor() {
    this.socket = null;
    this.reconnect = true;
    this.bubbles = new Map();
    this.reconnectAttempts = 0;
    this.status = new Map();
    this.onopen = () => {
      console.log("✅ WebSocket Users connected!");
      this.reconnectAttempts = 0;
      show(getFooter());
    };

    this.onerror = () => {
      console.error("❌ WebSocket Users error:", error);
      this.socket = null;
      setTimeout(() => this.connect(), 5000);
    };

    this.onclose = () => {
      console.log("🔴 WebSocket Users closed.");
      this.socket = null;
      const friendListContainer = document.getElementById("chat-users");
      friendListContainer.innerHTML = "";
      if (this.reconnect) setTimeout(() => this.connect(), 1500);
    };

    this.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      console.log("Received: ", data);

      if (data.type === "update") return this.updateFriendList(data.data);
      else if (
        (data.type === "offline" || data.type === "blocked") &&
        data.init === "message"
      )
        return this.getBubble(data.receiver).setMsgNotReceived(
          data.type === "blocked"
        );
      else if (data.type === "message")
        return this.getBubble(data.sender, data.sender_username).addReceivedMessage(
          data.message
        );
      else if (data.type === "game") await receiveGame(data);
      else if (
        (data.type === "offline" || data.type === "blocked") &&
        data.init === "game"
      )
        return await showModal(null, {
          i18n: "unavailable",
          username: data.receiver_username,
        });
      else if (data.type === "game-decline") await receiveGameDeclined(data);
      else if (
        data.type === "game-cancel" &&
        document.querySelector('[data-action="game-accept"]')
      )
        await hideModal();
      else if (data.type === "game-accept") receiveGameAccept(data);
    };
  }

  getBubble(id, username = "") {
    var userId;

    if (typeof id === "number") userId = id;
    else userId = parseInt(id);

    if (this.bubbles.has(userId)) {
      const bubble = this.bubbles.get(userId);
      bubble.show();
      return bubble;
    }

    const bubble = new ChatBubble(userId, username);
    this.updateStatus();
    this.bubbles.set(userId, bubble);
    return bubble;
  }

  updateFriendList(data) {
    clearFriendListContainer();

    data.forEach((friend) => {
      var friendElement = createFriendListElement(friend.id, friend.username);
      getFriendListContainer().appendChild(friendElement);
      this.status.set(parseInt(friend.id), parseInt(friend.status));
    });
    this.updateStatus();
  }

  updateStatus() {
    this.status.forEach((status, id) => {
      console.log("for id " + id + " status is ", status);
      document.querySelectorAll(`.chat-user[data-id="${id}"]`).forEach((element) => {
        element.setAttribute("data-status", status);
      });
    });
  }

  connect() {
    if (this.socket === null && this.reconnectAttempts < 10) {
      this.reconnectAttempts++;
      this.socket = new WebSocket("/ws/users/");
    }

    this.socket.onopen = this.onopen;
    this.socket.onerror = this.onerror;
    this.socket.onclose = this.onclose;
    this.socket.onmessage = this.onmessage;
  }

  disconnect() {
    if (this.socket === null) return;
    this.socket.close();
    this.socket = null;
    hide(getFooter());
    this.reconnect = false;
  }

  updateList() {
    this.send({ type: "update" });
  }

  sendMessage(id, msg) {
    this.send({ type: "message", receiver: id, message: msg });
  }

  sendGame(id) {
    this.send({ type: "game", receiver: id });
  }

  sendGameCancel(id) {
    this.send({ type: "game-cancel", receiver: id });
  }

  sendGameAccept(id) {
    this.send({ type: "game-accept", receiver: id });
  }

  sendGameDecline(id) {
    this.send({ type: "game-decline", receiver: id });
  }

  sendBusyOn() {
    this.send({ type: "busy" });
  }

  sendBusyOff() {
    this.send({ type: "available" });
  }

  send(message) {
    console.log("Sending: ", message);
    this.socket.send(JSON.stringify(message));
  }
}

export const chat = new Chat();

function createMessageElement(msg, sent = true) {
  const element = document.createElement("li");
  element.innerText = msg;
  element.classList.add("msg");
  if (sent) element.classList.add("msg-sent");
  else element.classList.add("msg-received");
  return element;
}

class ChatBubble {
  constructor(id, username) {
    this.bubble = createChatBubble(id, username);
    this.msgArea = getMessageArea(id);
    this.dropdown = document.getElementById("dropdown-toggle-" + id);
    this.dropdownInstance = new bootstrap.Dropdown(this.dropdown);
    this.dropdown.addEventListener(
      "show.bs.dropdown",
      this.unsetFlickering.bind(this)
    );
  }

  open() {
    setTimeout(() => {
      this.dropdownInstance.show();
    }, 50);
  }

  close() {
    setTimeout(() => {
      this.dropdownInstance.hide();
    }, 50);
  }

  hide() {
    this.bubble.classList.add("d-none");
  }

  show() {
    this.bubble.classList.remove("d-none");
  }

  isOpened() {
    return this.bubble.firstElementChild.classList.contains("show");
  }

  setFlickering() {
    this.bubble.firstElementChild.classList.add("flickering");
  }

  unsetFlickering() {
    this.bubble.firstElementChild.classList.remove("flickering");
  }

  addMessage(message, sent) {
    const messageElement = createMessageElement(message, (sent = sent));
    this.msgArea.prepend(messageElement);
    this.msgArea.scrollTop = this.msgArea.scrollHeight;
    if (sent === false && !this.isOpened()) this.setFlickering();
  }

  addReceivedMessage(message) {
    this.addMessage(message, false);
  }

  addSentMessage(message) {
    this.addMessage(message, true);
  }

  setMsgNotReceived(blocked = false) {
    this.msgArea.firstChild.classList.add("msg-alert");
    const offlineMsg = document.createElement("li");
    offlineMsg.classList.add("offline");
    offlineMsg.innerText = "User is offline.";
    if (blocked) offlineMsg.innerText = "User blocked you.";
    this.msgArea.prepend(offlineMsg);
  }
}

//CHAT FRIEND LIST

function getFriendListContainer() {
  return document.getElementById("chat-users");
}

function clearFriendListContainer() {
  getFriendListContainer().innerHTML = "";
}

function createFriendListElement(id, username) {
  const element = document.createElement("li");
  element.classList.add("chat-user");
  element.setAttribute("data-id", id);
  element.setAttribute("data-username", username);
  element.setAttribute("data-action", "open-chat");
  element.innerHTML = username;
  return element;
}

// CHAT BUBBLE CREATION

function chatBubbleContent(id, username) {
  const content = `
    <button type="button" class="btn btn-chat btn-secondary dropdown-toggle"
    data-bs-toggle="dropdown" aria-expanded="false" data-bs-offset="0,10"
    id="dropdown-toggle-$id" data-bs-auto-close="false">
    $username
    </button>
    <ul class="dropdown-menu">
      <div class="d-flex flex-column">
        <div class="d-flex flex-row align-items-center chat-header">
          <span class="flex-fill chat-user" data-action="open-profile"
           data-id="$id">$username</span>
          <span class="material-symbols-outlined"
          data-action="launch-pong" data-id="$id" data-username="$username">videogame_asset</span>
          <span class="material-symbols-outlined" data-action="collapse-chat" data-id="$id">remove</span>
          <span class="material-symbols-outlined" data-action="hide-chat" data-id="$id">close</span>
        </div>
        <li><hr class="dropdown-divider"></li>
        <div class="msg-area d-flex flex-column flex-fill flex-column-reverse"
        id="msg-area-$id">
        </div>
        <li><hr class="dropdown-divider"></li>
        <input id="chat-input-$id" data-id=$id type="text"
        class="form-control" placeholder=""/>
      </div>
    </ul>`;
  return content.replaceAll("$id", id).replaceAll("$username", username);
}

function createChatBubble(userId, username) {
  var bubble = document.createElement("div");
  bubble.classList.add("btn-group", "dropup", "dropup-chat");
  bubble.setAttribute("data-id", userId);
  bubble.setAttribute("data-username", username);
  bubble.innerHTML = chatBubbleContent(userId, username);
  getFooter().appendChild(bubble);
  getChatInput(userId).addEventListener("keydown", sendMessageOnEnter);
  return bubble;
}

// SEND TO SOCKET

function sendMessageOnEnter(event) {
  if (event.key !== "Enter") return;
  event.preventDefault();

  const userId = event.target.dataset.id;
  const message = event.target.value;
  chat.sendMessage(userId, message);
  event.target.value = "";
  chat.getBubble(userId).addSentMessage(message);
}

// Element getters

function getChatBubble(id) {
  return document.getElementById("bubble-" + id);
}

function getChatInput(id) {
  return document.getElementById("chat-input-" + id);
}

function getMessageArea(id) {
  return document.getElementById("msg-area-" + id);
}

function getFooter() {
  return document.getElementsByTagName("footer")[0];
}

export function hideChat(id) {
  const bubble = getChatBubble(id);
  if (bubble) hide(bubble);
}

// ACTIONS

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
  chat.sendGameCancel(id);
  chat.sendBusyOff();
}

async function sendGame(element) {
  const id = element.dataset.id;
  const username = element.dataset.username;

  chat.sendGame(id);
  await showModalWithFooterButtons(
    null,
    { i18n: "waitingFor", username: username },
    [{ action: "game-cancel", i18n: "cancel", id: id }],
    () => {
      sendGameCancel(id);
    },
    true
  );
  chat.sendBusyOn();
}

async function receiveGame(data) {
  const id = data.sender;
  const username = data.sender_username;
  const link = data.link;

  await showModalWithFooterButtons(null, { i18n: "gameFrom", username: username }, [
    { action: "game-decline", i18n: "decline", id: id },
    { action: "game-accept", i18n: "accept", id: id, link: link },
  ]);
  chat.sendBusyOn();
}

async function receiveGameDeclined(data) {
  const username = data.sender_username;

  hideModal();
  chat.sendBusyOff();
  await showModal(null, { i18n: "gameDeclined", username: username });
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
  chat.sendGameAccept(id);
  initGameOnline(link);
}

function receiveGameAccept(data) {
  const id = data.sender;
  const link = data.link;

  hideModal();
  initGameOnline(link);
}

export default chat;
