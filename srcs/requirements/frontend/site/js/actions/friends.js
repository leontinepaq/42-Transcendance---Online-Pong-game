import { authFetchJson } from "../api.js";
import navigate from "../router.js";
import { doLanguage } from "../translate.js"
import { sendChatUpdateRequest, hideChatById } from "../chat.js"

export const friendsActions = [
  {
    selector: '[data-action="friend-action"]',
    handler: handleDynamicFriendAction,
  },
  {
    selector: '[data-action="view-stats"]',
    handler: navigateToStats,
  },
  {
    selector: '[data-bs-toggle="pill"]',
    handler: switchFriendsTab,
  },
];

export function initFriends() {
  fetchAndDisplayUsers("friends");
}

const TABS = {
  friends: "api/friends/get-friends/",
  pending: "api/friends/pending-requests/",
  blocked: "api/friends/blocked/",
  all: "api/profile/all/",
};

const ACTION_BUTTONS = {
  friends: [{ type: "delete-friend", icon: "remove", class: "btn-red" }],
  pending: [
    { type: "accept-request", icon: "check", class: "btn-green" },
    { type: "decline-request", icon: "close", class: "btn-red" },
  ],
  blocked: [{ type: "unblock-user", icon: "remove", class: "btn-red" }],
  all: [
    { type: "send-request", icon: "add", class: "btn-green" },
    { type: "block-user", icon: "block", class: "btn-red" },
  ],
};

const VIEW_STATS_BUTTON = { type: "view-stats", icon: "emoji_events", class: "" };

function getUserCardButtons(tabKey) {
  const viewStatsButton = createButton(VIEW_STATS_BUTTON, "view-stats");
  const buttons = ACTION_BUTTONS[tabKey] || [];
  const actionButtons = buttons
    .map((btn) => createButton(btn, "friend-action"))
    .join("");
  return viewStatsButton + actionButtons;
}

function createButton({ type, icon, class: btnClass }, action) {
  return `
    <button type="button" class="btn ${btnClass}" data-action="${action}" data-type="${type}">
      <span class="material-symbols-outlined">${icon}</span>
    </button>
  `;
}

function createUserCard(user, tabKey) {
  var msgButton = "";
  if (tabKey !== "blocked")
    msgButton = `
      <button type="button" class="btn chat-btn" data-action="open-chat" 
      data-id="${user.id}" data-username="${user.username}">
        <span class="material-symbols-outlined">chat</span>
      </button>`;
  return `
    <div class="card card-user neon-border mt-4 gap-3" data-user-id="${user.id}">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center">
          <div class="d-flex align-items-center">
            <img src="${
              user.avatar_url ? user.avatar_url : "assets/nyancat.jpeg"
            }" alt="Avatar" class="img-fluid rounded-circle" style="max-width: 100px" />
            <div class="infos ms-3">
              <div class="username">${user.username}</div>
              <div class="mail">${user.email}</div>
            </div>
          </div>
          <div class="button-container">
            ${msgButton}    
            ${getUserCardButtons(tabKey)}
          </div>
        </div>
      </div>
    </div>
  `;
}

const errorFriends = {
  "You cannot send a friend request to yourself": "friend1",
  "You are already friends with this user": "friend2",
  "This user blocked you": "friend3",
  "You cannot send a friend request to a user you blocked": "friend4",
  "Friend request already sent": "friend5",
  "You have a pending friend request from this user": "friend6",
  "No pending friend request found": "friend7",
  "You are not friends with this user": "friend8",
  "User already blocked": "friend9",
  "User not blocked": "friend10",
  "User not found": "friend11",
};

async function fetchAndDisplayUsers(tab) {
  updatePendingCount();
  try {
    const apiPath = TABS[tab];
    if (!apiPath) return;

    //todo @leontinepaq gerer les pending notifs
    const users = await authFetchJson(apiPath);
    const container = document.getElementById(`pills-${tab}`);
    container.innerHTML = users.map((user) => createUserCard(user, tab)).join("");
  } catch (error) {
    const profilModal = new bootstrap.Modal(document.getElementById("myModal"));
    let modalBody = document.getElementById("bodyModal")
    modalBody.setAttribute('data-i18n', errorFriends[error.message] || "errorUnknow");
    profilModal.show();
    doLanguage();
  }
}

async function updatePendingCount() {
  try {
    // const data = await authfetchJson("api/friends/pending-count/");
    const data = await authFetchJson("api/friends/pending-requests/");
    data.pending_count = 2; //todo @leontinepaq a supp
    const count = data.pending_count;

    const badge = document.getElementById("pending-count");
    
    if (count > 0) {
      badge.textContent = count;
      badge.classList.remove("hidden");
    } else {
      badge.classList.add("hidden");
    }
  } catch (error) {
    console.error("Error fetching pending count:", error);
  }
}

function switchFriendsTab(element, event) {
  const tabKey = element.dataset.tab;
  if (!TABS[tabKey]) return;

  console.log(`Switching to tab: ${tabKey}`);
  fetchAndDisplayUsers(tabKey, TABS[tabKey]);
}

const friendActionsMap = {
  "send-request": {
    path: "send-request",
    message: "Friend request sent",
    tab: "all",
  },
  "accept-request": {
    path: "accept-request",
    message: "Friend request accepted",
    tab: "pending",
  },
  "decline-request": {
    path: "decline-request",
    message: "Friend request declined",
    tab: "pending",
  },
  "delete-friend": {
    path: "delete-friend",
    message: "Friend removed",
    tab: "friends",
  },
  "block-user": { path: "block-user", message: "User blocked", tab: "all" },
  "unblock-user": {
    path: "unblock-user",
    message: "User unblocked",
    tab: "blocked",
  },
};

async function handleDynamicFriendAction(element) {
  const card = element.closest(".card-user");
  if (!card) {
    console.error("User card not found");
    return;
  }

  const userId = card.dataset.userId;
  const actionType = element.dataset.type;
  if (!userId || !friendActionsMap[actionType]) {
    console.error(`Invalid action: ${actionType} for user ${userId}`);
    return;
  }

  const { path, message, tab } = friendActionsMap[actionType];

  try {
    const response = await authFetchJson(`api/friends/${path}/${userId}/`, {
      method: "POST",
    });
    console.log(message + ": ", response);
    await fetchAndDisplayUsers(tab);
    await sendChatUpdateRequest();
    if (actionType === "block-user")
      hideChatById(userId);
  } catch (error) {
    const profilModal = new bootstrap.Modal(document.getElementById("myModal"));
    let modalBody = document.getElementById("bodyModal")
    modalBody.setAttribute('data-i18n', errorFriends[error.message] || "errorUnknow");
    profilModal.show();
    doLanguage();
  }
}

async function navigateToStats(element) {
  const card = element.closest(".card-user");
  if (!card) {
    console.error("User card not found");
    return;
  }

  const userId = card.dataset.userId;
  if (!userId) {
    console.error(`Invalid user: ${userId}`);
    return;
  }

  navigate("dashboard", userId);
}
