import { navigate } from "../router.js";
import { authFetchJson, handleError } from "../api.js";

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

//create card user
function appendUser(user, userList, tab) {
  const userCard = document.createElement("div");
  userCard.classList.add("col-md-4");

  if (tab === FRIENDSTAB) {
    userCard.innerHTML = `
          <div class="card user-card text-center p-3">
              <img src="${user.avatar_url}" alt="Avatar de ${user.username}" class="user-avatar mx-auto" width="100" height="100">
              <h5 class="mt-2">${user.username}</h5>
              <button class="btn btn-primary unfriend" data-id="${user.id}">UNFRIEND</button>
              <button class="btn btn-primary view-profile" data-action="userModal" data-id="${user.id}">Profile</button>
          </div>
      `;
  }
  if (tab === PENDINGTAB) {
    userCard.innerHTML = `
          <div class="card user-card text-center p-3">
              <img src="${user.avatar_url}" alt="Avatar de ${user.username}" class="user-avatar mx-auto" width="100" height="100">
              <h5 class="mt-2">${user.username}</h5>
              <button class="btn btn-primary accept" data-id="${user.id}">ACCEPT</button>
              <button class="btn btn-primary decline" data-id="${user.id}">DECLINE</button>
              <button class="btn btn-primary view-profile" data-action="userModal" data-id="${user.id}">Profile</button>
          </div>
      `;
  }
  if (tab === BLOCKEDTAB) {
    userCard.innerHTML = `
          <div class="card user-card text-center p-3">
              <img src="${user.avatar_url}" alt="Avatar de ${user.username}" class="user-avatar mx-auto" width="100" height="100">
              <h5 class="mt-2">${user.username}</h5>
              <button class="btn btn-primary unblock" data-id="${user.id}">UNBLOCK</button>
              <button class="btn btn-primary view-profile" data-action="userModal" data-id="${user.id}">Profile</button>
          </div>
      `;
  }
  if (tab === ALLTAB) {
    userCard.innerHTML = `
          <div class="card user-card text-center p-3">
              <img src="${user.avatar_url}" alt="Avatar de ${user.username}" class="user-avatar mx-auto" width="100" height="100">
              <h5 class="mt-2">${user.username}</h5>
              <button class="btn btn-primary addFriend" data-id="${user.id}">ADD</button>
              <button class="btn btn-primary block" data-id="${user.id}">BLOCK</button>
              <button class="btn btn-primary view-profile" data-action="userModal" data-id="${user.id}">Profile</button>
          </div>
      `;
  }
  userList.appendChild(userCard);
}


//Active les boutons profile (stats) et add/remove 
function useButton(userData) {
  document.querySelectorAll(".view-profile").forEach((button) => {
    button.addEventListener("click", async (e) => {
      const profileModal = new bootstrap.Modal(
        document.getElementById("profileModal")
      );

      const userId = parseInt(e.target.getAttribute("data-id"));

      const statUser = await getUserStatistics(userId);

      const user = userData.find((u) => u.id === userId);

      document.getElementById("profile-avatar").src = user.avatar;
      document.getElementById("profile-name").innerText = user.username;
      document.getElementById("profile-wins").innerText = `Wins: ${statUser.wins}`;
      document.getElementById(
        "profile-losses"
      ).innerText = `Losses: ${statUser.losses}`;
      if (user.is_active == true)
        document.getElementById("profile-status").innerText = "Online";
      else document.getElementById("profile-status").innerText = "Offline";

      profileModal.show();
    });
  });

  function attachEventListener(className, handler) {
    document.querySelectorAll(`.${className}`).forEach((button) => {
      button.addEventListener("click", (e) => {
        const userId = parseInt(e.target.getAttribute("data-id"));
        handler(userId);
      });
    });
  }

  attachEventListener("unfriend", removeFriend);
  attachEventListener("accept", acceptFriendRequest);
  attachEventListener("decline", declineFriendRequest);
  attachEventListener("unblock", unblockUser);
  attachEventListener("addFriend", sendFriendRequest);
  attachEventListener("block", blockUser);
}

//Va chercher les users de la tab correspondante, cree une card user pour chacun. 
async function showTabUsers(tabNbr) {
  let userData = [];
  let userList;

  console.log("SHOWTABUSERS", tabNbr)

  if (tabNbr === FRIENDSTAB) {
    userList = document.getElementById("pills-friends-tab");
    userData = await showFriends();
  }
  else if (tabNbr === PENDINGTAB) {
    userList = document.getElementById("pills-pending-tab");
    userData = await showPendingRequests();
  }
  else if (tabNbr === BLOCKEDTAB) {
    userList = document.getElementById("pills-blocked-tab");
    userData = await showBlockedUsers();
  }
  else if (tabNbr === ALLTAB) {
    userList = document.getElementById("pills-all-users-tab");
    userData = await showAllUsers();
  }
  userData.forEach((user) => {
    appendUser(user, userList, tabNbr);
  });

  useButton(userData);
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



