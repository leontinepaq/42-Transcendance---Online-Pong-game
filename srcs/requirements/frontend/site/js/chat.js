import navigate from "./router.js";
import { initGameOnline } from "./actions/pong.js";
import { show, hide } from "./utils.js";

class Chat {
  constructor() {
    this.socket = null;
    this.reconnect = true;
    this.bubbles = new Map();
  }

  getBubble(id, username = "") {
    if (this.bubbles.has(id)) {
      return this.bubbles.get(id);
    }
  
    const bubble = new ChatBubble(id, username);
    this.bubbles.set(id, bubble);
    return bubble;
  }

  onopen() {
    console.log("✅ WebSocket Users connected!");
    show(getFooter());
  }

  onerror() {
    console.error("❌ WebSocket Users error:", error);
    this.socket = null;
    setTimeout(this.connect, 5000);
  }

  onclose() {
    console.log("🔴 WebSocket Users closed.");
    this.socket = null;
    const friendListContainer = document.getElementById("chat-users");
    friendListContainer.innerHTML = "";
    if (this.reconnect) setTimeout(this.connect, 1500);
  }

  onmessage(event) {
    console.log("Received: ", event);
    const data = JSON.parse(event.data);

    if (data.type === "update")
      return updateFriendList(data.data);
    if (data.type === "offline" || data.type === "blocked")
      return this.getBubble(data.receiver).setMsgNotReceived(data.type === "blocked");
    if (data.type === "message")
      return this.getBubble(data.sender, data.sender_username).addReceivedMessage(data.message);
    // if (data.type === "game") return addGameProposalUi(data.sender);
  }

  connect() {
    if (this.socket === null) this.socket = new WebSocket("/ws/users/");

    this.socket.onopen = this.onopen.bind(this);
    this.socket.onerror = this.onerror.bind(this);
    this.socket.onclose = this.onclose.bind(this);
    this.socket.onmessage = this.onmessage.bind(this);
  }

  disconnect() {
    if (this.socket === null) return;
    this.socket.close();
    this.socket = null;
    hide(getFooter());
    this.reconnect = false;
  }

  updateList() {
    this.send({type: "update"});
  }

  sendMessage(receiverId, msg)
  {
    this.send({
      type: "message",
      receiver: receiverId,
      message: msg
    })
  }

  sendGame(receiverId)
  {
    this.send({
      type: "game",
      receiver: receiverId
    })
  }

  send(message) {
    this.socket.send(JSON.stringify(message));
  }
}

export const chat = new Chat();


function createMessageElement(msg, sent = true) {
  const msgElement = document.createElement("li");
  msgElement.innerText = msg;
  msgElement.classList.add("msg");
  if (sent) msgElement.classList.add("msg-sent");
  else msgElement.classList.add("msg-received");
  return msgElement;
}

class ChatBubble {
  constructor(id, username) {
    this.bubble = createChatBubble(id, username, false);
    this.msgArea  = getMessageArea(id);
    this.dropdown = document.getElementById("dropdown-toggle-" + id);
    this.dropdownInstance = new bootstrap.Dropdown(this.dropdown);
    this.dropdown.addEventListener("show.bs.dropdown", this.unsetFlickering.bind(this));
  }

  open() {
    setTimeout(() => {this.dropdownInstance.show();}, 50);
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
    const messageElement = createMessageElement(message, sent = sent);
    this.msgArea.prepend(messageElement);
    this.msgArea.scrollTop = this.msgArea.scrollHeight;
    if (sent === false && !this.isOpened())
      this.setFlickering();
  }

  addReceivedMessage(message) {
    this.addMessage(message, false);
  }

  addSentMessage(message){
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

function createFriendListElement(id, username, online) {
  const element = document.createElement("li");
  element.classList.add("chat-user");
  element.setAttribute("data-id", id);
  element.setAttribute("data-username", username);
  element.setAttribute("data-action", "open-chat");
  element.innerHTML = username;
  if (online) element.classList.add("user-online");
  return element;
}

async function updateFriendList(data) {
  clearFriendListContainer();

  data.forEach((friend) => {
    var friendElement = createFriendListElement(
      friend.id,
      friend.username,
      friend.online
    );
    getFriendListContainer().appendChild(friendElement);
  });
}

// SEND TO SOCKET

function sendMessageOnEnter(event) {
  if (event.key !== "Enter")
      return ;
  event.preventDefault();

  const userId = event.target.dataset.id;
  const message = event.target.value;
  chat.sendMessage(userId, message);
  event.target.value = "";
  new ChatBubble(userId).addSentMessage(message);
}

// CHAT BUBBLE CREATION/OPEN/CLOSE

function chatBubbleContent(id, username) {
  const content = `
    <button type="button" class="btn btn-chat btn-secondary dropdown-toggle"
    data-bs-toggle="dropdown" aria-expanded="false" data-bs-offset="0,10"
    id="dropdown-toggle-$id">
    $username
    </button>
    <ul class="dropdown-menu">
      <div class="d-flex flex-column">
        <div class="d-flex flex-row align-items-center chat-header">
          <span class="flex-fill" data-action="open-profile"
           data-id="$id">$username</span>
          <span class="material-symbols-outlined"
          data-action="launch-pong" data-id="$id">videogame_asset</span>
          <span class="material-symbols-outlined">remove</span>
          <span class="material-symbols-outlined" data-action="hide-chat"
          data-id="$id">close</span>
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

function createChatBubble(userId, username, open = true) {
  var bubble = getChatBubble(userId);

  if (!bubble) {
    bubble = document.createElement("div");
    bubble.classList.add("btn-group", "dropup", "dropup-chat");
    bubble.id = "bubble-" + userId;
    bubble.innerHTML = chatBubbleContent(userId, username);
    getFooter().appendChild(bubble);
    getChatInput(userId).addEventListener("keydown", sendMessageOnEnter);
  }
  if (open) openDropDown(userId);
  return bubble;
}

export function createChatBubbleById(id, open) {
  const element = document.querySelector(`[data-id="` + id + `"`);
  return createChatBubble(element, null, open);
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
  if (bubble) show(bubble);
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
    selector: '[data-action="launch-pong"]',
    handler: sendPongFromChat,
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
  hideChat(id);
}

function sendPongFromChat(element) {
  const userId = element.dataset.id;
  chat.sendGame(userId);
}

export default chat;
