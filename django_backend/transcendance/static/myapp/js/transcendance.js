import Router from './router.js';

document.addEventListener('DOMContentLoaded', async () => {
    console.log('initializing app');
    const app = document.getElementById('app');
    const router = new Router(app);
    
    //This doesnt work with nginx anymore, look to fix
    const url = new URL(window.location.href);
    //SI PATH AVEC /BLABLA/BLABLA = 2 slashs changer cette merde
    const route = await router.authRedirector(url.pathname.replace('/', ''));

    router.navigate(route);
});

