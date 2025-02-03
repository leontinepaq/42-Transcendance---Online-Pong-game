import Router from './router.js';

document.addEventListener('DOMContentLoaded', async () => {
    console.log('initializing app');
    const app = document.getElementById('app');
    const router = new Router(app);
    
    const url = new URL(window.location.href);
    const route = await router.authRedirector(url.pathname.splice(1));

    //SI PATH AVEC /BLABLA/BLABLA = 2 slashs changer cette merde
    router.navigate(route);
});

