import Router from './router.js';

document.addEventListener('DOMContentLoaded', () => {
    console.log('initializing app');
    const app = document.getElementById('app');
    const router = new Router(app);
    
    const url = new URL(window.location.href);

    //SI PATH AVEC /BLABLA/BLABLA = 2 slashs changer cette merrde
    router.navigate(url.pathname.replace('/', ''));
});

