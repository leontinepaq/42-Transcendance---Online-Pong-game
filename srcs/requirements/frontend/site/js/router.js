import checkAuth from './api.js';
import loadView from './views.js';

window.addEventListener(
    'popstate', 
    async (event) => {
        if (event.state) {
        console.log("route is ", event.state.route);
        const newRoute = await authRedirector(event.state.route);
        console.log("new route is ", newRoute);
        loadView(newRoute);
    }
});

const publicRoutes = new Set(['login', 'signup', '2fa']);

export async function authRedirector(route)
{
    const isAuthenticated = await checkAuth();
    console.log({isAuthenticated});
    if (isAuthenticated && publicRoutes.has(route)) {
        return 'home';
    } else if (!isAuthenticated && !publicRoutes.has(route)) {
        return 'login';
    }
    else if (['pong'].includes(route))
        return ('pong');
    return route;
}

export async function navigate(route, ...params)
{
    const currentRoute = window.location.pathname.split('/')[1];  // Extract current route from URL
    
    // if (currentRoute === route) {
    //     console.log('Already on the target route:', route);
    //     return;
    // }

    console.log('navigating : ', route);

    const newRoute = await authRedirector(route);
    route = newRoute;

    try {
        const state = { route, params };
        const title = `${route.charAt(0).toUpperCase() + route.slice(1)}`;
        // if (currentRoute == "2fa" || currentRoute == "login")
        //     history.replaceState(state, title, `/${route}`);
        // else
        history.pushState(state, title, `/${route}`);
        loadView(route);
    } catch (error) {
        console.error('Navigation error:', error);
    }
};

export default navigate;