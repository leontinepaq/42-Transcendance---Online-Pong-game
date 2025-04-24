import { authFetchJson, handleError } from "../api.js";
import { navigate } from "../router.js";
import { show, hide } from "../utils.js";
import { chat } from "../chat.js";
import { UserUI } from "../ui/UserUI.js";
import { doLanguage } from "../translate.js";

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
    selector: '#friends-section [data-bs-toggle="pill"]',
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

async function fetchAndDisplayUsers(tab) {
  updatePendingCount();
  try {
    const apiPath = TABS[tab];
    if (!apiPath) return;
    const users = await authFetchJson(apiPath);
    const container = document.getElementById(`pills-${tab}`);
    container.innerHTML = users.map((t) => UserUI.createUserCard(t, tab)).join("");
  } catch (error) {
    handleError(error, "Display user error");
  }
}

async function updatePendingCount() {
  try {
    const data = await authFetchJson("api/friends/pending-count/");
    const count = data.pending_count;

    const badge = document.getElementById("pending-count");

    if (count > 0) {
      badge.textContent = count;
      show(badge);
    } else {
      hide(badge);
    }
  } catch (error) {
    handleError("Error fetching pending count:", error);
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
    if (actionType === "block-user") chat.removeBubble(userId);
    doLanguage();
  } catch (error) {
    handleError(error, "Error in friend action");
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
