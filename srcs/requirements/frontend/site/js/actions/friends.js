import { authFetchJson, handleError } from "../api.js";

export const friendsActions = [
  {
    selector: '[data-action="friend-action"]',
    handler: handleDynamicFriendAction,
  },
  {
    selector: '[data-bs-toggle="pill"]',
    handler: switchFriendsTab,
  },
];

export function initFriends() 
{
  fetchAndDisplayUsers("friends")
}

const TABS = {
  friends: "api/friends/get-friends/",
  pending: "api/friends/pending-requests/",
  blocked: "api/friends/blocked/",
  all: "api/profile/all/",
};

// Fonction pour créer une carte utilisateur
function createUserCard(user, tabKey) {
  return `
    <div class="card card-user neon-border gap-3" data-user-id="${user.id}">
      <div class="card-body">
        <div class="d-flex justify-content-between align-items-center">
          <div class="d-flex align-items-center">
            <img src="${user.avatar_url}" alt="Avatar" class="img-fluid rounded-circle" style="max-width: 100px" />
            <div class="infos ms-3">
              <div class="username">${user.username}</div>
              <div class="mail">${user.email}</div>
            </div>
          </div>
          <div class="button-container">
            ${getUserCardButtons(tabKey)}
          </div>
        </div>
      </div>
    </div>
  `;
}

const BUTTONS = {
  friends: [
    { type: "delete-friend", icon: "remove", class: "btn-red" }
  ],
  pending: [
    { type: "accept-request", icon: "check", class: "btn-green" },
    { type: "decline-request", icon: "close", class: "btn-red" }
  ],
  blocked: [
    { type: "unblock-user", icon: "remove", class: "btn-red" }
  ],
  all: [
    { type: "send-request", icon: "add", class: "btn-green" },
    { type: "block-user", icon: "block", class: "btn-red" }
  ]
};

function getUserCardButtons(tabKey) {
  return (BUTTONS[tabKey] || [])
    .map(btn => `
      <button type="button" class="btn ${btn.class}" data-action="friend-action" data-type="${btn.type}">
        <span class="material-symbols-outlined">${btn.icon}</span>
      </button>
    `)
    .join("");
}


async function fetchAndDisplayUsers(tab) {
  try {
    const apiPath = TABS[tab];
    if (!apiPath) return;
  
    const users = await authFetchJson(apiPath);
    const container = document.getElementById(`pills-${tab}`);
    container.innerHTML = users.map(user => createUserCard(user, tab)).join("");
  } catch (error) {
    handleError(error, `Error fetching ${tab}:`);
  }
}

// Fonction pour gérer le changement d'onglet
function switchFriendsTab(element, event) {
  const tabKey = element.dataset.tab;
  if (!TABS[tabKey]) return;
  
  console.log(`Switching to tab: ${tabKey}`);
  fetchAndDisplayUsers(tabKey, TABS[tabKey]);
}

const FRIENDSTAB = "friends";
const PENDINGTAB = "pending";
const BLOCKEDTAB = "blocked";
const ALLTAB = "all";

const friendActionsMap = {
  "send-request": { path: "send-request", message: "Friend request sent", tab: ALLTAB },
  "accept-request": { path: "accept-request", message: "Friend request accepted", tab: PENDINGTAB },
  "decline-request": { path: "decline-request", message: "Friend request declined", tab: PENDINGTAB },
  "delete-friend": { path: "delete-friend", message: "Friend removed", tab: FRIENDSTAB },
  "block-user": { path: "block-user", message: "User blocked", tab: ALLTAB },
  "unblock-user": { path: "unblock-user", message: "User unblocked", tab: BLOCKEDTAB },
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
    const response = await authFetchJson(`api/friends/${path}/${userId}/`, { method: "POST" });
    console.log(message + ": ", response);
    await fetchAndDisplayUsers(tab);
  } catch (error) {
    handleError(error, `Error during ${actionType.replace("-", " ")}`);
  }
}
