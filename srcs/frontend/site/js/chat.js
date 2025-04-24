import navigate from "./router.js";
import { initGameOnline } from "./actions/pong.js";
import { show, hide } from "./utils.js";
import { showModal, hideModal, showModalWithFooterButtons } from "./modals.js";
import doLanguage from "./translate.js";
import {
  createFriendListElement,
  createMessageElement,
  createChatBubble,
  getFriendListContainer,
  getChatInput,
  getMessageArea,
  getFooter,
} from "./ui/ChatUI.js";

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

let MAXATTEMPTS = 5;

class Chat {
  constructor() {
    this.socket = null;
    this.bubbles = new Map();
    this.reconnectAttempts = 0;
    this.status = new Map();
    this.notifications = new Map();

    this.onopen = () => {
      console.log("✅ WebSocket Users connected!");
      this.reconnectAttempts = 0;
      this.reconnect = true;
      show(getFooter());
    };

    this.onerror = () => {
      this.socket = null;
      clearFriendListContainer();
      console.error("❌ WebSocket Users error");
      if (this.reconnect)
        setTimeout(() => this.connect(), 5000);
    };

    this.onclose = () => {
      this.socket = null;
      clearFriendListContainer();
      console.log("🔴 WebSocket Users closed.");
      if (this.reconnect)
        setTimeout(() => this.connect(), 1000);
    };

    this.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      // console.log("Received: ", data);

      if (data.type === "update") return this.updateFriendList(data.data);
      else if (data.type === "message") this.addReceivedMessage(data);
      else if (data.type === "game") await receiveGame(data);
      else if (data.type === "game-decline") await receiveGameDeclined(data);
      else if (data.type === "game-cancel") await receiveGameCancel(data);
      else if (data.type === "game-accept") await receiveGameAccept(data);
      else if (data.type === "next-game") this.updateNotifications(data.data);
      else if (data.type === "offline" || data.type === "blocked") {
        if (data.init === "message")
          this.getBubble(data.receiver).setMsgNotReceived(data.type === "blocked");
        else if (data.init === "game") await receiveUnavailable(data);
      }
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

  removeBubble(id) {
    var userId;

    if (typeof id === "number") userId = id;
    else userId = parseInt(id);

    if (!this.bubbles.has(userId))
      return;

    this.bubbles.get(userId).remove();
    this.bubbles.delete(userId);
  }

  updateFriendList(data) {
    clearFriendListContainer();
    this.status.clear();

    data.forEach((friend) => {
      var friendElement = createFriendListElement(friend.id, friend.username);
      getFriendListContainer().appendChild(friendElement);
      this.status.set(parseInt(friend.id), parseInt(friend.status));
    });
    this.updateStatus();
  }

  updateStatus() {
    document.querySelectorAll(`.chat-user`).forEach((element) => {
      element.removeAttribute("data-status");
    });
    this.status.forEach((status, id) => {
      document.querySelectorAll(`.chat-user[data-id="${id}"]`).forEach((element) => {
        element.setAttribute("data-status", status);
      });
    });
  }

  removeBubbles() {
    this.bubbles.forEach((bubble, key, map) => {
      bubble.remove();
      map.delete(key);
    })
  }

  getNotification(tournament_id) {
    const id = parseInt(tournament_id);

    if (!this.notifications.has(id)) this.notifications.set(id, new Notif(id));
    return this.notifications.get(id);
  }

  updateNotifications(data) {
    var flickering = false;

    this.notifications.forEach((notif) => {
      notif.setOutdated();
    });

    data.forEach((game) => {
      const notif = this.getNotification(game.tournament_id);
      flickering = notif.update(game) || flickering;
    });

    this.notifications.forEach((notif, key, map) => {
      if (notif.removeIfOutdated()) return map.delete(key);
      else notif.append();
    });

    doLanguage();
    if (!flickering) return;

    const dropdown = document.getElementById("dropdown-toggle-robot");
    if (dropdown.classList.contains("show")) return;
    dropdown.classList.add("flickering");
    dropdown.addEventListener("show.bs.dropdown", () => {
      dropdown.classList.remove("flickering");
    });
  }

  connect() {
    if (this.socket === null && this.reconnectAttempts >= MAXATTEMPTS)
    {
      this.reconnectAttempts = 0;
      return showModal(null, { i18n: "chatFailed" });
    }

    if (this.socket === null) {
      this.reconnectAttempts++;
      this.socket = new WebSocket("/ws/users/");
    }

    if (this.socket === null) return;

    this.socket.onopen = this.onopen;
    this.socket.onerror = this.onerror;
    this.socket.onclose = this.onclose;
    this.socket.onmessage = this.onmessage;
  }

  disconnect() {
    this.removeBubbles();
    this.reconnect = false;
    if (this.socket === null) return;
    this.socket.close();
    this.socket = null;
    hide(getFooter());
  }

  updateList() {
    this.send({ type: "update" });
  }

  sendMessage(id, msg) {
    this.send({ type: "message", receiver: id, message: msg });
  }

  sendGame(id, tournament_id, tournament_name) {
    this.send({
      type: "game",
      receiver: id,
      tournament: tournament_id,
      tournament_name: tournament_name,
    });
  }

  sendGameCancel(id) {
    this.send({ type: "game-cancel", receiver: id });
  }

  sendGameAccept(id, link) {
    this.send({ type: "game-accept", receiver: id, link: link });
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
    // console.log("Sending: ", message);
    if (!this.socket)
      return ;
    this.socket.send(JSON.stringify(message));
  }

  collapseAll() {
    this.bubbles.forEach((element) => {
      element.close();
    });
  }

  addReceivedMessage(data) {
    const id = data.sender;
    const username = data.sender_username;
    const bubble = this.getBubble(id, username);

    bubble.addReceivedMessage(data.message);
  }
}

export const chat = new Chat();

class ChatBubble {
  constructor(id, username) {
    this.bubble = createChatBubble(id, username);
    getChatInput(id).addEventListener("keydown", sendMessageOnEnter);
    this.msgArea = getMessageArea(id);
    this.dropdown = document.getElementById("dropdown-toggle-" + id);
    this.dropdownInstance = new bootstrap.Dropdown(this.dropdown);
    this.dropdown.addEventListener(
      "show.bs.dropdown",
      this.unsetFlickering.bind(this)
    );
  }

  remove() {
    this.bubble.remove();
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

class Notif {
  constructor(id) {
    this.element = createMessageElement("", false);
    this.outdated = false;
  }

  isOnline() {
    return this.element.getAttribute("data-i18n") === "notification_online";
  }

  getOpponentId() {
    return this.element.getAttribute("data-id");
  }

  setOutdated() {
    this.outdated = true;
  }

  removeIfOutdated() {
    if (!this.outdated) return;
    this.element.remove();
    return true;
  }

  update(data) {
    this.outdated = false;

    var flickering = false;
    //If opponent changed, or changed status, trigger flickering notif bubble
    if (!this.isOnline() && data.online) flickering = true;
    if (this.getOpponentId() != data.id) flickering = true;
    this.element.setAttribute("data-i18n", "notification_offline");
    this.element.removeAttribute("data-action");
    if (data.online) {
      this.element.setAttribute("data-i18n", "notification_online");
      this.element.setAttribute("data-action", "launch-pong");
    }
    this.element.setAttribute("data-username", data.username.toUpperCase());
    this.element.setAttribute("data-id", data.id);
    this.element.setAttribute("data-tournament-id", data.tournament_id);
    this.element.setAttribute(
      "data-tournament-name",
      data.tournament_name.toUpperCase()
    );
    return flickering;
  }

  append() {
    if (!this.isOnline()) getMessageArea("robot").append(this.element);
    else getMessageArea("robot").prepend(this.element);
  }
}

//CHAT FRIEND LIST

function clearFriendListContainer() {
  getFriendListContainer().innerHTML = "";
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

// GAME MSG TREATMENT

async function receiveGameCancel(data) {
  if (
    !document.querySelector(`[data-id="${data.sender}"][data-action="game-accept"]`)
  )
    return;
  await hideModal();
  chat.sendBusyOff();
}

async function receiveGame(data) {
  const id = data.sender;
  const username = data.sender_username;
  const link = data.link;
  var tournament_name = "";
  var i18n = "gameFrom";

  if (data.tournament_name) tournament_name = data.tournament_name;
  if (data.tournament) i18n = "tournamentFrom";

  await showModalWithFooterButtons(
    null,
    {
      i18n: i18n,
      username: username.toUpperCase(),
      "tournament-name": tournament_name.toUpperCase(),
    },
    null,
    [
      { action: "game-decline", i18n: "decline", id: id },
      { action: "game-accept", i18n: "accept", id: id, link: link },
    ],
    () => {
      chat.sendGameDecline(id);
      chat.sendBusyOff();
    }
  );
  chat.sendBusyOn();
}

async function receiveGameDeclined(data) {
  const username = data.sender_username;

  if (
    !document.querySelector(`[data-id="${data.sender}"][data-action="game-cancel"]`)
  )
    return;
  chat.sendBusyOff();
  await showModal(null, { i18n: "gameDeclined", username: username });
}

async function receiveGameAccept(data) {
  const id = data.sender;
  const link = data.link;

  if (!document.querySelector('[data-action="game-accept"]')) hideModal();
  await initGameOnline(link);
}

async function receiveUnavailable(data) {
  showModal(null, { i18n: "unavailable", username: data.receiver_username });
}

export default chat;
