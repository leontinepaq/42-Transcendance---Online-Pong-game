import api from "./api.js"
import navigate from "./router.js"
import observeAndAttachEvent from './observeAndAttachEvent.js'

observeAndAttachEvent(
    'login-form',
    'signin-btn',
    async (event) => {
        event.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const data = await api.login(username, password);
            sessionStorage.setItem("username", username);
            if (data.ok)
                navigate('2fa', username);
            else
                alert(data.message || 'Login failed');
        } catch (error) {
            console.error('Login error:', error);
            alert('An error occurred. Please try again.');
        }
    }
);

observeAndAttachEvent(
    'signup-btn',
    'click',
    () => navigate('signup')
);

observeAndAttachEvent(
    'pong',
    'click',
    () => navigate('pong')
);