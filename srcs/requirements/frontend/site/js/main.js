import { initEventDelegation } from "./eventDelegator.js";
import {authRedirector, navigate} from './router.js'
import { SkyAnimation } from './background/SkyAnimation.js';


document.addEventListener('DOMContentLoaded', () => {
	console.log('Initializing app');
	initEventDelegation();
	SkyAnimation.launch();
	navigate("home");
})

