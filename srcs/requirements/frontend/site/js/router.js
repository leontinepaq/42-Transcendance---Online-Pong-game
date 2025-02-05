import api from './api.js';
import loadView from './views.js';

// window.addEventListener('popstate', async (event) => {
//     if (event.state) {
//         const newRoute = await authRedirector(event.state.route);
//         routes[newRoute]();
//     }
// });

async function getUserConnectionStatus() {
    await api.checkAndRefreshToken();
    return api.accessToken !== null;
}

export async function authRedirector(route)
{
    const isAuthenticated = await getUserConnectionStatus();

    console.log({isAuthenticated});

    if (isAuthenticated && ['login', 'signup', '2fa', ''].includes(route)) {
        return ('home');
    } else if (!isAuthenticated && !['login', 'signup', '2fa'].includes(route)) {
        return ('login');
    }
    return route;
}

export async function navigate(route, ...params) {
    // if (!routes[route]) return;
    console.log('navigating : ', route);

    const newRoute = await authRedirector(route);
    route = newRoute;

    try {
        const state = { route, params };
        const title = `${route.charAt(0).toUpperCase() + route.slice(1)}`;
        history.pushState(state, title, `/${route}`);
        loadView(route);
    } catch (error) {
        console.error('Navigation error:', error);
    }
};

export default navigate;