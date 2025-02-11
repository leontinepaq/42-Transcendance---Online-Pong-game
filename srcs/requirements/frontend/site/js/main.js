import Router from './router.js';
import {authRedirector, navigate} from './router.js'
import { SkyAnimation } from './background/SkyAnimation.js';


async function processRoute(path) {
	const	cleanedPath = path.replace(/^\//, ''); // todo @leontinepaq: retire le premier slash est-ce que ca suffit ?
	const	route = await authRedirector(cleanedPath);
	navigate(route);
}

function isInternalLink(link) {
	return link.href.startsWith(window.location.origin);
 }

document.addEventListener('DOMContentLoaded', async () => {
	console.log('Initializing app');
	SkyAnimation.launch();

	const url = new URL(window.location.href);
	processRoute(url.pathname);
});

// avoid reloading page when navigating within the website
document.body.addEventListener('click', async (event) => {
	const link = event.target.closest('a');
	if (link && isInternalLink(link))
	{ 
		event.preventDefault();
		processRoute(link.getAttribute('href'));
	}
});
