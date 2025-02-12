import { initEventDelegation } from "./eventDelegator.js";
import {authRedirector, navigate} from './router.js'
import { SkyAnimation } from './background/SkyAnimation.js';


document.addEventListener('DOMContentLoaded', () => {
	console.log('Initializing app');
	initEventDelegation();
	SkyAnimation.launch();
	const	url = new URL(window.location.href);
	const	cleanedPath = url.pathname.replace(/^\//, ''); // todo @leontinepaq: retire le premier slash est-ce que ca suffit ?
	navigate(cleanedPath);
})



//  @leontinepaq: suppression de authentification comme déjà dans 

// todo @leontinepaq: a supprimer si plus necessaire
// function isInternalLink(link) {
// 	return link.href.startsWith(window.location.origin);
//  }

// // avoid reloading page when navigating within the website
// document.body.addEventListener('click', async (event) => {
// 	const link = event.target.closest('a');
// 	if (link && isInternalLink(link))
// 	{ 
// 		event.preventDefault();
// 		processRoute(link.getAttribute('href'));
// 	}
// });
