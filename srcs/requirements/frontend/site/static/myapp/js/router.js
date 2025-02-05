import api from './api.js';

class Router {
    constructor(app) {
        this.app = app;
        this.routes = {
            login: this.renderLoginView.bind(this),
            signup: this.renderSignupView.bind(this),
            '2fa': this.render2faView.bind(this),
            home: this.renderHomeView.bind(this),
        };

        // this.referrer = document.referrer && !document.referrer.includes(window.location.origin) 
        //     ? document.referrer 
        //     : null;

        window.addEventListener('popstate', (event) => {
            if (event.state) {
                (async () => {
                    await this.navigate(event.state.route, ...(event.state.params || []));
                })();
            }
        });
    }

    isFirstNav = true;

    async getUserConnectionStatus() {
        await api.checkAndRefreshToken();
        return api.accessToken !== null;
    }

    async navigate(route, ...params) {
        const view = this.routes[route];
        if (!view) return;
    
        const isAuthenticated = await this.getUserConnectionStatus();
    
        if (isAuthenticated && (route === 'login' || route === 'signup' || route === '2fa')) {
            history.replaceState({ route: 'home', params: [] }, '', '/home');
            this.renderHomeView();
            return;
        }
        else if (!isAuthenticated && route !== 'login' && route !== 'signup' && route !== '2fa') {
            history.pushState({ route: 'login', params: [] }, '', '/login');
            this.renderLoginView();
            return;
        }
    
        view(...params);
    
        const state = { route, params };
        const title = `${route.charAt(0).toUpperCase() + route.slice(1)}`;
    
        if (this.isFirstNav && !isAuthenticated) {
            history.pushState(state, title, '/login');
            this.isFirstNav = false;
        } 
        else {
            history.pushState(state, title, `/${route}`);
        }
    }

    renderLoginView() {
        this.app.innerHTML = `
            <div class="container">
                <h1>Login</h1>
                <form id="login-form">
                    <div class="form-group">
                        <label for="username">Username</label>
                        <input type="text" id="username" name="username" required>
                    </div>
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input type="password" id="password" name="password" required>
                    </div>
                    <button type="submit">Log In</button>
                </form>
                <button id="signup-btn">Sign Up</button>
            </div>
        `;

    //maybe look into this to display content https://developer.mozilla.org/en-US/docs/Web/API/History_API/Working_with_the_History_API
        document.getElementById('login-form').addEventListener('submit', async (event) => {
            event.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            try {
                const data = await api.login(username, password);
                if (data.ok) {
                    this.navigate('2fa', username);
                } else {
                    alert(data.message || 'Login failed');
                }
            } catch (error) {
                console.error('Login error:', error);
                alert('An error occurred. Please try again.');
            }
        });

        document.getElementById('signup-btn').addEventListener('click', () => this.navigate('signup'));
    }

    renderSignupView() {
        this.app.innerHTML = `
            <div id="signup-form-container">
                <h2>Sign Up</h2>
                <form id="signup-form">
                    <input type="text" id="new-username" placeholder="Username" required>
                    <input type="email" id="new-email" placeholder="Email" required>
                    <input type="password" id="new-password" placeholder="Password" required>
                    <input type="password" id="confirm-password" placeholder="Confirm Password" required>
                    <button type="submit">Sign Up</button>
                    <button type="button" id="back-to-login-btn">Back to Login</button>
                </form>
            </div>
        `;

        document.getElementById('signup-form').addEventListener('submit', async (event) => {
            event.preventDefault();
            
            const username = document.getElementById('new-username').value;
            const password = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const email = document.getElementById('new-email').value;

            if (password !== confirmPassword) {
                alert('Passwords do not match');
                return;
            }

            // Replace datasuccess by dataok
            try {
                const data = await api.signup(username, email, password);
                if (data.success) {
                    alert('Account created successfully');
                    this.navigate('send_link');
                } else {
                    alert(data.message || 'Signup failed');
                }
            } catch (error) {
                console.error('Signup error:', error);
                alert('An error occurred. Please try again.');
            }
        });

        document.getElementById('back-to-login-btn').addEventListener('click', () => this.navigate('login'));
    }

    render2faView(username) {
        this.app.innerHTML = `
            <div class="container">
                <h1>Two-Factor Authentication</h1>
                <form id="2fa-form">
                    <div class="form-group">
                        <label for="verification-code">Enter Verification Code</label>
                        <input type="text" id="verification-code" name="verification-code" required>
                    </div>
                    <button type="submit">Verify</button>
                </form>
            </div>
        `;

        document.getElementById('2fa-form').addEventListener('submit', async (event) => {
            event.preventDefault();
            const code = document.getElementById('verification-code').value;

            try {
                const data = await api.verify2FA(code, username);
                console.log(data);
                if (data.ok) {
                    this.navigate('home');
                } else {
                    alert(data.message || '2FA verification failed');
                }
            } catch (error) {
                console.error('2FA error:', error);
                alert('An error occurred. Please try again.');
            }
        });
    }

    renderHomeView() {
        this.app.innerHTML = `
            <div class="container">
                <h1>Welcome to Dashboard</h1>
                <button id="logout-btn">Logout</button>
            </div>
        `;

        document.getElementById('logout-btn').addEventListener('click', async () => {
            try {
                // await api.logout();
                this.accessToken = null;
                this.navigate('login');
            } catch (error) {
                console.error('Logout error:', error);
                alert('Logout failed. Please try again.');
            }
        });
    }
}

export default Router;