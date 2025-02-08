import Router from './router.js';
import {authRedirector, navigate} from './router.js'
import { SkyAnimation } from './background/SkyAnimation.js';

document.addEventListener('DOMContentLoaded', async () => {
    console.log('initializing app');
    SkyAnimation.launch();
    const url = new URL(window.location.href);
    //SI PATH AVEC /BLABLA/BLABLA = 2 slashs changer cette merde
    const route = await authRedirector(url.pathname.replace('/', ''));
    navigate(route);
});