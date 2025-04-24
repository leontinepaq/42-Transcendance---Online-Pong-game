export function createMessageElement(msg, sent = true) {
  const element = document.createElement("li");
  element.innerText = msg;
  if (sent) element.classList.add("msg-sent");
  else element.classList.add("msg");
  return element;
}

export function createFriendListElement(id, username) {
  const element = document.createElement("li");
  element.classList.add("chat-user");
  element.setAttribute("data-id", id);
  element.setAttribute("data-username", username);
  element.setAttribute("data-action", "open-chat");
  element.innerHTML = username;
  return element;
}

function chatBubbleContent(id, username) {
  return `
	<button type="button" class="btn btn-chat btn-secondary dropdown-toggle"
	data-bs-toggle="dropdown" aria-expanded="false" data-bs-offset="0,10"
	id="dropdown-toggle-${id}" data-bs-auto-close="false">
	<div class="chat-user" data-id="${id}">${username}</div>
	</button>
	<ul class="dropdown-menu">
	  <div class="d-flex flex-column">
		<div class="d-flex flex-row justify-content-end chat-header">
		  <span class="material-symbols-outlined" data-action="open-profile"
		  data-id="${id}" data-username="${username}">insert_chart</span>
		  <span class="material-symbols-outlined" data-action="launch-pong" 
		  data-id="${id}" data-username="${username}">videogame_asset</span>
		  <span class="material-symbols-outlined" data-action="collapse-chat" 
		  data-id="${id}">remove</span>
		  <span class="material-symbols-outlined" data-action="hide-chat" 
		  data-id="${id}">close</span>
		</div>
		<li><hr class="dropdown-divider"></li>
		<div class="msg-area d-flex flex-column flex-fill flex-column-reverse"
		id="msg-area-${id}">
		</div>
		<li><hr class="dropdown-divider"></li>
		<input id="chat-input-${id}" data-id=${id} type="text"
		class="form-control" placeholder=""/>
	  </div>
	</ul>`;
}

export function createChatBubble(userId, username) {
  var bubble = document.createElement("div");
  bubble.classList.add("btn-group", "dropup", "dropup-chat");
  // bubble.id = "bubble-" + userId;
  bubble.setAttribute("data-id", userId);
  bubble.setAttribute("data-username", username);
  bubble.innerHTML = chatBubbleContent(userId, username);
  getFooter().appendChild(bubble);
  return bubble;
}

// Element getters

export function getFriendListContainer() {
  return document.getElementById("chat-users");
}


export function getChatInput(id) {
  return document.getElementById("chat-input-" + id);
}

export function getMessageArea(id) {
  return document.getElementById("msg-area-" + id);
}

export function getFooter() {
  return document.getElementsByTagName("footer")[0];
}
