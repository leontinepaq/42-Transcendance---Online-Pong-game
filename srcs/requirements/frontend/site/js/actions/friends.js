import { navigate } from "../router.js";
import { authFetchJson, handleError } from "../api.js";

export const friendsActions = [
  {
    selector: '[data-action="friends"]',
    handler: initFriends,
  },
];

function initFriends() {
  navigate("friends");
  setTimeout(function () {
    showTabUsers(1);
  }, 150);
}

const FRIENDSTAB = 1;
const PENDINGTAB = 2;
const BLOCKEDTAB = 3;
const ALLTAB = 4;

//UTILS
//create card user
function appendUser(user, userlist, tab) {
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
  userlist.appendChild(userCard);
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

  document.querySelectorAll(".add-friend").forEach((button) => {
    button.addEventListener("click", (e) => {
      const btn = e.target;
      const isFriend = button.classList.contains("added");

      if (isFriend) {
        btn.textContent = "ADD";
        btn.classList.remove("added");
        btn.style.background = ""; // Forcer la couleur
      } else {
        btn.textContent = "REMOVE";
        btn.classList.add("added");
        btn.style.background = "#07911a66";
      }
    });
  });
}

//Va chercher les users de la tab correspondante, cree une card user pour chacun. 
async function showTabUsers(tabNbr) {
  let userData = [];

  const userlist = document.getElementById("user-container");
  userlist.innerHTML = "";

  if (tabNbr === FRIENDSTAB)
    userData = await showFriends();
  else if (tabNbr === PENDINGTAB)
    userData = await showPendingRequests();
  else if (tabNbr === BLOCKEDTAB)
    userData = await showBlockedUsers();
  else if (tabNbr === ALLTAB)
    userData = await showAllUsers();
  userData.forEach((user) => {
    appendUser(user, userlist, tabNbr);
  });

  // useButton(userData);
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
async function rejectFriendRequest(userId) {
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

//retourne un tableau avec tous les amis du user
async function showFriends() {
  let tab = [];
  try {
    tab = await authFetchJson(`api/friends/get-friends`);
    console.log(tab);
    return tab;
  } catch (error) {
    console.log("Error.", error);
    return [];
  }
}

// Show blocked users
async function showBlockedUsers() {
  let tab = [];
  try {
    tab = await authFetchJson(`api/friends/blocked/`);
    console.log(tab);
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
    console.log("All users:", users);
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


