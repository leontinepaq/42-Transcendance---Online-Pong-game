let socket_users = null;

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
  };
}

export async function disconnect_socket_users() {
  socket_users.close();
  socket_users = null;
}

export default connect_socket_users;
