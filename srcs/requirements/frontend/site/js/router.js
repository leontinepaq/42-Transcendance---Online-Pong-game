import checkAuth from "./api.js";
import loadView from "./views.js";
import closeSocket from "./actions/pong.js";
import { doLanguage } from "./translate.js"
import connect_socket_users, { disconnect_socket_users } from "./chat.js"

window.addEventListener("popstate", async (event) => {
  if (event.state) {
    console.log("route is ", event.state.route);
    const newRoute = await authRedirector(event.state.route);
    console.log("new route is ", newRoute);
    closeSocket(); // si socket pong open on va la fermer
    loadView(newRoute);
    doLanguage();
  }
});

const publicRoutes = new Set(["login", "signup"]);
let socket_users = null;

export async function authRedirector(route) {
  const isAuthenticated = await checkAuth();
  if (isAuthenticated) connect_socket_users();
  else disconnect_socket_users();
  if (isAuthenticated && publicRoutes.has(route)) return "home";
  else if (!isAuthenticated && !publicRoutes.has(route)) return "login";
  return route;
}

export async function navigate(route, ...params) {
  console.log("Navigating: ", route);

  const newRoute = await authRedirector(route);
  route = newRoute;

  try {
    closeSocket(); // si socket pong open on va la fermer
    const state = { route, params };
    const title = `${route.charAt(0).toUpperCase() + route.slice(1)}`;
    history.pushState(state, title, `/${route}`);
    await loadView(route, ...params);
    doLanguage();
  } catch (error) {
    console.error("Navigation error:", error);
  }
}

export default navigate;
