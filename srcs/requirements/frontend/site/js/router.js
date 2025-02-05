import api from './api.js';
import loadView from './views.js';

class Router {
    constructor(app) {
        this.app = app;
        this.routes = {
            login: this.renderLoginView.bind(this),
            signup: this.renderSignupView.bind(this),
            '2fa': this.render2faView.bind(this),
            home: this.renderHomeView.bind(this),
            profile: this.renderProfileView.bind(this),
            // play: this.renderPlayView.bind(this),
            // history: this.renderHistoryView.bind(this),
            
        };

        window.addEventListener('popstate', async (event) => {
            if (event.state) {
                const newRoute = await this.authRedirector(event.state.route);
                this.routes[newRoute]();
            }
        });
    }

    async getUserConnectionStatus() {
        await api.checkAndRefreshToken();
        return api.accessToken !== null;
    }
    
    async authRedirector(route) {
        const isAuthenticated = await this.getUserConnectionStatus();

        console.log({isAuthenticated});

        if (isAuthenticated && ['login', 'signup', '2fa', ''].includes(route)) {
            return ('home');
        } else if (!isAuthenticated && !['login', 'signup', '2fa'].includes(route)) {
            return ('login');
        }
        return route;
    }

    async navigate(route, ...params) {
        if (!this.routes[route]) return;
        console.log('navigating : ', route);

        const newRoute = await this.authRedirector(route);
        route = newRoute;

        try {
            const state = { route, params };
            const title = `${route.charAt(0).toUpperCase() + route.slice(1)}`;
            history.pushState(state, title, `/${route}`);
            this.routes[route](...params);
        } catch (error) {
            console.error('Navigation error:', error);
        }
    }
    
    renderLoginView() {
        loadView("login");
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

            try {
                const data = await api.signup(username, email, password);
                if (data.ok) {
                    alert('Account created successfully');
                    this.navigate('login');
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
        console.log("username is " , username);
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
                console.log("username is " + username);
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
                <button id="profile-btn">Profile</button>
            </div>
        `;

        document.getElementById('profile-btn').addEventListener('click', async () => {
            try {
                this.navigate('profile');
            } catch (error) {
                console.error('Profile error:', error);
                alert('An error occured. Please try again.');
            }
        })

        document.getElementById('logout-btn').addEventListener('click', async () => {
            try {
                await api.logout();
                this.navigate('login');
            } catch (error) {
                console.error('Logout error:', error);
                alert('Logout failed. Please try again.');
            }
        });
    }

    renderProfileView() {
        this.app.innerHTML = `
            <div class="container">
                <h1>PROFILE</h1>
            </div>
        `;
    }

    // renderHomeView() {
    //     this.app.innerHTML = `
    //         <div class="container">
    //             <h1 class="mb-4">Welcome to the Home Page!</h1>
    //             <button id="logout-btn" class="btn btn-danger">Logout</button>
    //             <button id="profile-btn" class="btn btn-primary">Profile</button>
    //             <button id="play-btn" class="btn btn-success">Play</button>
    //         </div>
    //     `;
    
    //     const buttonActions = {
    //         "logout-btn": async () => {
    //             try {
    //                 await api.logout();
    //                 this.navigate('login');
    //             } catch (error) {
    //                 console.error('Logout error:', error);
    //                 alert('Logout failed. Please try again.');
    //             }
    //         },
    //         "profile-btn": () => this.navigate('profile'),
    //         "play-btn": () => this.navigate('play'),
    //     };
    
    //     Object.entries(buttonActions).forEach(([id, action]) => {
    //         document.getElementById(id).addEventListener('click', async () => {
    //             try {
    //                 await action();
    //             } catch (error) {
    //                 console.error(`${id} error:`, error);
    //                 alert('An error occurred. Please try again.');
    //             }
    //         });
    //     });
    // }

    // renderProfileView() {
    //     this.app.innerHTML = `
    //         <div class="container">
    //              <h1 class="text-center mb-4">Profile</h1>
    //             <button id="history-btn" class="btn btn-secondary">History</button>
    //         </div>
    //     `;

    //     document.getElementById('history-btn').addEventListener('click', async () => {
    //         try {
    //             this.navigate('history');
    //         } catch (error) {
    //             console.error('History error:', error);
    //             alert('An error occured. Please try again.');
    //         }
    //     })
    // }
}

export default Router;