import { PlanetAnimation } from "./background/PlanetAnimation.js";

async function loadView(view) {
	const app = document.getElementById("app");
	app.classList.remove('active');

	try {
		const response = await fetch(`./views/${view}.html`);
		if (!response.ok)
			throw new Error("View not found");
		const html = await response.text();
		setTimeout(() => {
			app.querySelector('.container').innerHTML = html;
			app.classList.add('active');
		}, 300); //timeout for transitions, todo @leontinepaq voir si bonne maniere de faire ??
		if (view == 'home' || view == 'login' || view == 'signup')
			PlanetAnimation.init();
		else 
			PlanetAnimation.exit();
	} catch (error) {
		console.error("Error loading view:", error);
		app.innerHTML = "<h1>Page Not Found</h1>";
	}
}

export default loadView;