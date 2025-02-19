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

