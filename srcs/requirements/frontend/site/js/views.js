import { renderTest1 } from "./pong.js";
import { PlanetAnimation } from "./background/PlanetAnimation.js";

async function loadView(view) {
    const app = document.getElementById("app");

    try {
        const response = await fetch(`./views/${view}.html`);
        if (!response.ok)
            throw new Error("View not found");

        const html = await response.text();
        // if (view === 'pong')
        //     renderTest1()
        // else    
        //     app.innerHTML = html;
        app.innerHTML = html;
        if (view == 'home' || view == 'login' || view == 'signup--') //todo: fix signup-- to signup
            PlanetAnimation.init();
        else 
            PlanetAnimation.exit();
    } catch (error) {
        console.error("Error loading view:", error);
        app.innerHTML = "<h1>Page Not Found</h1>";
    }
}

export default loadView;