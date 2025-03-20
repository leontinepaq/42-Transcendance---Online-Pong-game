let socket_users = null;

async function update_friend_list(data) {
  const friendListContainer = document.getElementById("chat-users"); // Ensure you have an element with this ID

  if (!friendListContainer) {
    console.error("❌ Friend list container not found!");
    return;
  }

  // Clear previous friend list
  friendListContainer.innerHTML = "";

  // Loop through each friend in data and create an element
  data.forEach(friend => {
    const friendElement = document.createElement("li");
    friendElement.classList.add("chat-user");
    friendElement.setAttribute("user-id", friend.id);
    friendElement.innerHTML=friend.username;
    if (friend.online)
      friendElement.classList.add("user-online");
    friendListContainer.appendChild(friendElement);
  });
}

export async function connect_socket_users() {
  if (socket_users != null) return;
  socket_users = new WebSocket("/ws/users/");

  socket_users.onopen = function () {
    console.log("✅ WebSocket Users connected!");
  };

  socket_users.onerror = function (error) {
    console.error("❌ WebSocket Users error:", error);
  };

  socket_users.onclose = function () {
    console.log("🔴 WebSocket Users closed.");
    socket_users = null;
  };

  socket_users.onmessage = function (event) {
    console.log("Received: ", event);
    const data = JSON.parse(event.data);
    
    if (data.type === "update")
      return update_friend_list(data.data)
  };
}

export async function disconnect_socket_users() {
  if (socket_users === null) return;
  socket_users.close();
  socket_users = null;
}

export default connect_socket_users;
