import { PlanetAnimation } from "./background/PlanetAnimation.js";
import { onRouteLoad } from "./routes.js";

async function loadView(view, ...params) {
  let html = "<h1>Page Not Found</h1>";
  const app = document.getElementById("app");
  app.classList.remove("active");

  try {
    const response = await fetch(`./views/${view}.html`);
    if (!response.ok) throw new Error("View not found");
    html = await response.text();
    app.querySelector(".container").innerHTML = html;
    onRouteLoad[view]?.( ...params);
    if (view == "home" || view == "login" || view == "signup" || view == "dashboard")
      PlanetAnimation.init();
    else PlanetAnimation.exit();
  } catch (error) {
    app.querySelector(".container").innerHTML = html;
    console.error("Error loading view:", error);
  }
  app.classList.add("active");
}

export default loadView;
