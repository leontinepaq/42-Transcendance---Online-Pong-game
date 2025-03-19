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
    handleFriends();
  }, 150);
}

function appendUser(user, userlist) {
  const userCard = document.createElement("div");
  userCard.classList.add("col-md-4");

  userCard.innerHTML = `
        <div class="card user-card text-center p-3">
            <img src="${user.avatar}" alt="Avatar de ${user.username}" class="user-avatar mx-auto" width="100" height="100>
            <h5 class="mt-2">${user.username}</h5>
            <button class="btn btn-primary add-friend" data-id="${user.id}">ADD</button>
            <button class="btn btn-primary view-profile" data-action="userModal" data-id="${user.id}">Profile</button>
        </div>
    `;
  userlist.appendChild(userCard);
}

async function getFriendInfo() {
  let tab = [];
  try {
    tab = await authFetchJson(`api/userprofile/display-all-profiles`);
    console.log(tab);
  } catch (error) {
    console.log("Error.", error);
  }
  return tab;
}

async function getFriendStatistic(id) {
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

async function handleFriends() {
  let userData = [];

  const userlist = document.getElementById("user-container");

  userData = await getFriendInfo();
  userData.forEach((user) => {
    appendUser(user, userlist);
  });

  useButton(userData);
}

function useButton(userData) {
  document.querySelectorAll(".view-profile").forEach((button) => {
    button.addEventListener("click", async (e) => {
      const profileModal = new bootstrap.Modal(
        document.getElementById("profileModal")
      );

      const userId = parseInt(e.target.getAttribute("data-id"));

      const statUser = await getFriendStatistic(userId);

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
        btn.style.background = "#07911a66"; // Forcer la couleura
      }
    });
  });
}
