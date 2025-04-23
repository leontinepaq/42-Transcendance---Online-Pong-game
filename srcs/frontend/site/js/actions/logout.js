import navigate from "../router.js";
import { authFetchJson, handleError } from "../api.js";
import { chat } from "../chat.js"

export const logoutAction = [
  {
    selector: '[data-action="logout"]',
    handler: handleLogout,
  },
];

async function handleLogout(element, event) {
  try {
    await authFetchJson("/api/user/logout/", { method: "POST" });
    sessionStorage.removeItem("username");
    chat.disconnect();
    navigate("login");
  } catch (error) {
    handleError(error, "Logout error");
  }
}
