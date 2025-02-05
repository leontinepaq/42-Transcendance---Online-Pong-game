document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');

    function getCookie(name) {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        return parts.length === 2 ? parts.pop().split(';').shift() : null;
    }

    function renderLoginView() {
        app.innerHTML = `
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
    
        document.getElementById('login-form').addEventListener('submit', async (event) => {
            event.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch('/auth/login/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    body: JSON.stringify({ username, password }),
                });

                const data = await response.json();
                if (response.ok) {
                    render2faView(username);
                } else {
                    alert(data.message || 'Login failed');
                }
            } catch (error) {
                console.error('Login error:', error);
                alert('An error occurred. Please try again.');
            }
        });

        document.getElementById('signup-btn').addEventListener('click', renderSignupView);
    }

    function renderSignupView() {  
        app.innerHTML = `
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
        
            // Password confirmation check
            if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
            }
        
            try { 
            const response = await fetch('/user/register/', { 
                method: 'POST', 
                headers: { 
                'Content-Type': 'application/json', 
                'X-CSRFToken': getCookie('csrftoken')  
                }, 
                body: JSON.stringify({ username, email, password }),  
            }); 
            
            const data = await response.json(); 
            
            if (response.ok) { 
                alert('Account created successfully'); 
                renderLoginView();  
            } else { 
                alert(data.message || 'Signup failed');  
            }  
            } catch (error) { 
            console.error('Signup error:', error); 
            alert('An error occurred. Please try again.');  
            }  
        }); 
      
        document.getElementById('back-to-login-btn').addEventListener('click', renderLoginView);  
      }

    function render2faView(username) {
        app.innerHTML = `
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
            const inputCode = document.getElementById('verification-code').value;

            try {
                const response = await fetch('/auth/verify-2fa/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRFToken': getCookie('csrftoken')
                    },
                    body: JSON.stringify({ 
                        code: inputCode 
                    }),
                });

                const data = await response.json();
                if (response.ok) {
                    // Redirect to home or dashboard
                    renderHomeView();
                } else {
                    alert(data.message || '2FA verification failed');
                }
            } catch (error) {
                console.error('2FA error:', error);
                alert('An error occurred. Please try again.');
            }
        });
    }

    function renderHomeView() {
        app.innerHTML = `
            <div class="container">
                <h1>Welcome to Dashboard</h1>
                <button id="logout-btn">Logout</button>
            </div>
        `;

        document.getElementById('logout-btn').addEventListener('click', () => {
            // Implement logout logic
            renderLoginView();
        });
    }

    // Initial view
    renderLoginView();
});