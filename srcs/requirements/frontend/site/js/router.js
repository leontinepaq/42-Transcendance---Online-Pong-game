import checkAuth from "./api.js";
import loadView from "./views.js";
import killGame from "./actions/pong.js";
import { doLanguage } from "./translate.js"
import chat from "./chat.js"

window.addEventListener("popstate", async (event) => {
  if (event.state) {
    console.log("route is ", event.state.route);
    const newRoute = await authRedirector(event.state.route);
    console.log("new route is ", newRoute);
    killGame(); // si socket pong open on va la fermer
    loadView(newRoute);
    doLanguage();
  }
});

const publicRoutes = new Set(["login", "signup"]);
let socket_users = null;

export async function authRedirector(route) {
  const isAuthenticated = await checkAuth();
  if (isAuthenticated) chat.connect();
  else chat.disconnect();
  if (isAuthenticated && publicRoutes.has(route)) return "home";
  else if (!isAuthenticated && !publicRoutes.has(route)) return "login";
  return route;
}

export async function navigate(route, ...params) {
  console.log("Navigating: ", route);

  const newRoute = await authRedirector(route);
  route = newRoute;

  try {
    killGame(); // si socket pong open on va la fermer
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
