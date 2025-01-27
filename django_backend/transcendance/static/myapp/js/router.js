import api from './api.js';

class Router {
    constructor(app) {
        this.app = app;
        this.routes = {
            login: this.renderLoginView.bind(this),
            signup: this.renderSignupView.bind(this),
            '2fa': this.render2faView.bind(this),
            home: this.renderHomeView.bind(this)
        };
    }

    navigate(route, ...params) {
        const view = this.routes[route];
        if (view) {
            view(...params);
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

        this.setupLoginHandlers();
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

        this.setupSignupHandlers();
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

        this.setup2FAHandlers();
    }

    renderHomeView() {
        this.app.innerHTML = `
            <div class="container">
                <h1>Welcome to Dashboard</h1>
                <button id="logout-btn">Logout</button>
            </div>
        `;

        this.setupHomeHandlers();
    }

    setupLoginHandlers() {
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

    // REPLACE DATA.SUCCESS WITH DATA.OK ? IDK MAN THIS LOOKS LIKE SHIT
    setupSignupHandlers() {
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
                if (data.success) {
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

    setup2FAHandlers() {
        document.getElementById('2fa-form').addEventListener('submit', async (event) => {
            event.preventDefault();
            const code = document.getElementById('verification-code').value;

            try {
                const data = await api.verify2FA(code);
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

    setupHomeHandlers() {
        document.getElementById('logout-btn').addEventListener('click', () => {
            // Implement logout logic here
            this.navigate('login');
        });
    }
}

export default Router;