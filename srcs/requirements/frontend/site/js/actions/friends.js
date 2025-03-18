import { navigate } from "../router.js";
import { authFetchJson, handleError } from "../api.js";

//<div class="mail">${user.email}</div>

export const friendsActions = [
  {
    selector: '[data-action="friends"]',
    handler: initFriends,
  },
];

//main function
function initFriends() {
  navigate("friends");
  setTimeout(function () {
    initTabs();
    showTabUsers(FRIENDSTAB);
  }, 150);
}

const FRIENDSTAB = 1;
const PENDINGTAB = 2;
const BLOCKEDTAB = 3;
const ALLTAB = 4;

//UTILS

function initTabs() {
  console.log("Initializing tabs...");
  const tabs = document.querySelectorAll('.nav-link');
  tabs.forEach((button) => {
    button.addEventListener('shown.bs.tab', (event) => {
      console.log("Tab clicked: ", button.innerHTML);

      const tabId = event.target.id;

      if (tabId === "pills-friends-tab") {
        showTabUsers(FRIENDSTAB);
      } else if (tabId === "pills-pending-tab") {
        showTabUsers(PENDINGTAB);
      } else if (tabId === "pills-blocked-tab") {
        showTabUsers(BLOCKEDTAB);
      } else if (tabId === "pills-all-users-tab") {
        showTabUsers(ALLTAB);
      }
    });
  });
}


//Va chercher les users de la tab correspondante, cree une card user pour chacun. 
async function showTabUsers(tabNbr) {
  let userData = [];
  let userList;

  console.log("SHOWTABUSERS", tabNbr)

  if (tabNbr === FRIENDSTAB) {
    userList = document.getElementById("pills-friends");
    userList.innerHTML = "";
    userData = await showFriends();
  }
  else if (tabNbr === PENDINGTAB) {
    userList = document.getElementById("pills-pending");
    userList.innerHTML = "";
    userData = await showPendingRequests();
  }
  else if (tabNbr === BLOCKEDTAB) {
    userList = document.getElementById("pills-blocked");
    userList.innerHTML = "";
    userData = await showBlockedUsers();
  }
  else if (tabNbr === ALLTAB) {
    userList = document.getElementById("pills-all-users");
    userList.innerHTML = "";
    userData = await showAllUsers();
  }
  userData.forEach((user) => {
    appendUser(user, userList, tabNbr);
  });
}

//create card user
function appendUser(user, userList, tab) {
  const userCard = document.createElement("div");
  userCard.classList.add("col-md-4");
  userCard.dataset.userId = user.id;
  console.log("appenduser id = ", user.id)

  if (tab === FRIENDSTAB) {
    userCard.innerHTML = `
      <div class="card card-user neon-border gap-3">
        <div class="card-body">
          <div class="d-flex justify-content-between" style="align-items: center">
            <div class="d-flex justify-content-start">
              <div class="avatar-container position-relative" style="cursor: pointer">
                <img src="${user.avatar}" alt="Avatar" class="img-fluid rounded-circle neon-border view-profile-btn" data-user-id="${user.id}" style="max-width: 100px" />
              </div>
              <div class="infos ms-3">
                <div class="username">${user.username}</div>
              </div>
            </div>
            <div>
              <button type="button" class="btn btn-green d-none accept-btn" data-user-id="${user.id}">
                <span class="material-symbols-outlined">accept</span>
              </button>
              <button type="button" class="btn btn-red d-none decline-btn" data-user-id="${user.id}">
                <span class="material-symbols-outlined">decline</span>
              </button>
              <button type="button" class="btn d-none send-request-btn" data-user-id="${user.id}">
                <span class="material-symbols-outlined">send request</span>
              </button>
              <button type="button" class="btn btn-red d-none block-btn" data-user-id="${user.id}">
                <span class="material-symbols-outlined">block</span>
              </button>
              <button type="button" class="btn removef-btn" data-user-id="${user.id}">
                <span class="material-symbols-outlined">removef</span>
              </button>
              <button type="button" class="btn d-none removeb-btn" data-user-id="${user.id}">
                <span class="material-symbols-outlined">removeb</span>
              </button>
            </div>
          </div>
        </div>
      </div>`;
  }
  if (tab === PENDINGTAB) {
    userCard.innerHTML = `
    <div class="card card-user neon-border gap-3">
        <div class="card-body">
          <div class="d-flex justify-content-between" style="align-items: center">
            <div class="d-flex justify-content-start">
              <div class="avatar-container position-relative" style="cursor: pointer">
                <img src="${user.avatar}" alt="Avatar" class="img-fluid rounded-circle neon-border view-profile-btn" data-user-id="${user.id}" style="max-width: 100px" />
              </div>
              <div class="infos ms-3">
                <div class="username">${user.username}</div>
              </div>
            </div>
            <div>
              <button type="button" class="btn btn-green accept-btn" data-user-id="${user.id}">
                <span class="material-symbols-outlined">accept</span>
              </button>
              <button type="button" class="btn btn-red decline-btn" data-user-id="${user.id}">
                <span class="material-symbols-outlined">decline</span>
              </button>
              <button type="button" class="btn d-none send-request-btn" data-user-id="${user.id}">
                <span class="material-symbols-outlined">send request</span>
              </button>
              <button type="button" class="btn btn-red d-none block-btn" data-user-id="${user.id}">
                <span class="material-symbols-outlined">block</span>
              </button>
              <button type="button" class="btn d-none removef-btn" data-user-id="${user.id}">
                <span class="material-symbols-outlined">removef</span>
              </button>
              <button type="button" class="btn d-none removeb-btn" data-user-id="${user.id}">
                <span class="material-symbols-outlined">removeb</span>
              </button>
            </div>
          </div>
        </div>
      </div>`;
  }
  if (tab === BLOCKEDTAB) {
    userCard.innerHTML = `
    <div class="card card-user neon-border gap-3">
        <div class="card-body">
          <div class="d-flex justify-content-between" style="align-items: center">
            <div class="d-flex justify-content-start">
              <div class="avatar-container position-relative" style="cursor: pointer">
                <img src="${user.avatar}" alt="Avatar" class="img-fluid rounded-circle neon-border view-profile-btn" data-user-id="${user.id}" style="max-width: 100px" />
              </div>
              <div class="infos ms-3">
                <div class="username">${user.username}</div>
              </div>
            </div>
            <div>
              <button type="button" class="btn btn-green d-none accept-btn" data-user-id="${user.id}">
                <span class="material-symbols-outlined">accept</span>
              </button>
              <button type="button" class="btn btn-red d-none decline-btn" data-user-id="${user.id}">
                <span class="material-symbols-outlined">decline</span>
              </button>
              <button type="button" class="btn d-none send-request-btn" data-user-id="${user.id}">
                <span class="material-symbols-outlined">send request</span>
              </button>
              <button type="button" class="btn btn-red d-none block-btn" data-user-id="${user.id}">
                <span class="material-symbols-outlined">block</span>
              </button>
              <button type="button" class="btn d-none removef-btn" data-user-id="${user.id}">
                <span class="material-symbols-outlined">removef</span>
              </button>
              <button type="button" class="btn removeb-btn" data-user-id="${user.id}">
                <span class="material-symbols-outlined">removeb</span>
              </button>
            </div>
          </div>
        </div>
      </div>`;
  }
  if (tab === ALLTAB) {
    userCard.innerHTML = `
    <div class="card card-user neon-border gap-3">
        <div class="card-body">
          <div class="d-flex justify-content-between" style="align-items: center">
            <div class="d-flex justify-content-start">
              <div class="avatar-container position-relative" style="cursor: pointer">
                <img src="${user.avatar}" alt="Avatar" class="img-fluid rounded-circle neon-border view-profile-btn" data-user-id="${user.id}" style="max-width: 100px" />
              </div>
              <div class="infos ms-3">
                <div class="username">${user.username}</div>
              </div>
            </div>
            <div>
              <button type="button" class="btn btn-green d-none accept-btn" data-user-id="${user.id}">
                <span class="material-symbols-outlined">accept</span>
              </button>
              <button type="button" class="btn btn-red d-none decline-btn" data-user-id="${user.id}">
                <span class="material-symbols-outlined">decline</span>
              </button>
              <button type="button" class="btn send-request-btn" data-user-id="${user.id}">
                <span class="material-symbols-outlined">send request</span>
              </button>
              <button type="button" class="btn btn-red block-btn" data-user-id="${user.id}">
                <span class="material-symbols-outlined">block</span>
              </button>
              <button type="button" class="btn d-none removef-btn" data-user-id="${user.id}">
                <span class="material-symbols-outlined">removef</span>
              </button>
              <button type="button" class="btn d-none removeb-btn" data-user-id="${user.id}">
                <span class="material-symbols-outlined">removeb</span>
              </button>
            </div>
          </div>
        </div>
      </div>`;
  }
  userList.appendChild(userCard);
  useButton(userCard, user);
}

//Active les boutons profile (stats) et add/remove 
function useButton(userCard, user) {

  console.log("userId == ", user.id)

  const viewProfileBtn = userCard.querySelector(".view-profile-btn");
  if (viewProfileBtn) {
    viewProfileBtn.addEventListener("click", async () => {
      const profileModal = new bootstrap.Modal(
        document.getElementById("profileModal")
      );

      const statUser = await getUserStatistics(user.id);

      document.getElementById("profile-avatar").src = user.avatar;
      document.getElementById("profile-name").innerText = user.username;
      document.getElementById("profile-wins").innerText = `Wins: ${statUser.wins}`;
      document.getElementById("profile-losses").innerText = `Losses: ${statUser.losses}`;
      document.getElementById("profile-status").innerText = user.is_active ? "Online" : "Offline";

      profileModal.show();
    });
  }

  function attachEventListener(buttonClass, handler) {
    const button = userCard.querySelector(`.${buttonClass}`);
    if (button) {
      button.addEventListener("click", () => {
        handler(user.id);
      });
    }
  }

  attachEventListener("accept-btn", acceptFriendRequest);
  attachEventListener("decline-btn", declineFriendRequest);
  attachEventListener("send-request-btn", sendFriendRequest);
  attachEventListener("block-btn", blockUser);
  attachEventListener("removef-btn", removeFriend);
  attachEventListener("removeb-btn", unblockUser);
}

//retourne un tableau avec tous les amis du user
async function showFriends() {
  let tab = [];
  try {
    tab = await authFetchJson(`api/friends/get-friends/`);
    console.log("Friends:",tab);
    return tab;
  } catch (error) {
    console.log("Error.", error);
    return [];
  }
}

// Show pending friend requests
async function showPendingRequests() {
  try {
    const pendingRequests = await authFetchJson(`api/friends/pending-requests/`);
    console.log("Pending requests:", pendingRequests);
    return pendingRequests;
  } catch (error) {
    console.error("Error fetching pending requests:", error);
    return [];
  }
}

// Show blocked users
async function showBlockedUsers() {
  let tab = [];
  try {
    tab = await authFetchJson(`api/friends/blocked/`);
    console.log("Blocked users:", tab);
    return tab;
  } catch (error) {
    console.error("Error fetching blocked users:", error);
    return [];
  }
}

// Show all users
async function showAllUsers() {
  let tab = [];
  try {
    tab = await authFetchJson(`api/profile/all/`);
    console.log("All users:", tab);
    return tab;
  } catch (error) {
    console.error("Error fetching all users:", error);
    return [];
  }
}

//va chercher les stats d'un user identifie par id
async function getUserStatistics(id) {
  console.log("get user stats called ", user.id)
  let data;
  try {
    data = await authFetchJson(`api/dashboard/display-user-stats/?user_id=${id}`, {
      method: "GET",
    });
    console.log(data);
  } catch (error) {
    handleError(error, "Load user stats error");
  }
  return data;
}

// Send friend request
async function sendFriendRequest(userId) {
  try {
    const response = await authFetchJson(`api/friends/send-request/${userId}/`, {
      method: "POST",
    });
    console.log("Friend request sent:", response);
  } catch (error) {
    console.error("Error sending friend request:", error);
  }
}

// Accept friend request
async function acceptFriendRequest(userId) {
  console.log("userIdaccept == ", userId)
  try {
    const response = await authFetchJson(`api/friends/accept-request/${userId}/`, {
      method: "POST",
    });
    console.log("Friend request accepted:", response);
  } catch (error) {
    console.error("Error accepting friend request:", error);
  }
}

// Reject friend request
async function declineFriendRequest(userId) {
  try {
    const response = await authFetchJson(`api/friends/decline-request/${userId}/`, {
      method: "POST",
    });
    console.log("Friend request rejected:", response);
  } catch (error) {
    console.error("Error rejecting friend request:", error);
  }
}

// Remove friend
async function removeFriend(userId) {
  try {
    const response = await authFetchJson(`api/friends/delete-friend/${userId}/`, {
      method: "POST",
    });
    console.log("Friend removed:", response);
  } catch (error) {
    console.error("Error removing friend:", error);
  }
}

// Block user
async function blockUser(userId) {
  try {
    const response = await authFetchJson(`api/friends/block-user/${userId}/`, {
      method: "POST",
    });
    console.log("User blocked:", response);
  } catch (error) {
    console.error("Error blocking user:", error);
  }
}

// Unblock user
async function unblockUser(userId) {
  try {
    const response = await authFetchJson(`api/friends/unblock-user/${userId}/`, {
      method: "POST",
    });
    console.log("User unblocked:", response);
  } catch (error) {
    console.error("Error unblocking user:", error);
  }
}



