import checkAuth from "./api.js";
import loadView from "./views.js";
import killGame from "./actions/pong.js";
import doLanguage from "./translate.js";
import chat from "./chat.js";

const publicRoutes = new Set(["login", "signup"]);

export async function authRedirector(route) {
  const isAuthenticated = await checkAuth();
  if (isAuthenticated) chat.connect();
  else chat.disconnect();
  if (isAuthenticated && publicRoutes.has(route)) return "home";
  else if (!isAuthenticated && !publicRoutes.has(route)) return "login";
  return route;
}

async function navigateToPage(route, isHistoryUpdate, ...params) {
  const newRoute = await authRedirector(route);

  try {
    killGame(); // si socket pong open on va la fermer
    if (isHistoryUpdate) {
      const state = { route: newRoute, params };
      const title = `${route.charAt(0).toUpperCase() + newRoute.slice(1)}`;
      history.pushState(state, title, `/${newRoute}`);
    }
    await loadView(newRoute, ...params);
    doLanguage();
  } catch (error) {
    console.error("Navigation error:", error);
  }
}

window.addEventListener("popstate", async (event) => {
  if (event.state) {
    console.log("Back to: ", event.state.route);
    await navigateToPage(event.state.route, false);
  }
});

export async function navigate(route, ...params) {
  console.log("Navigating: ", route);
  await navigateToPage(route, true, params);
}

export default navigate;
