import navigate from "./router.js"
import observeAndAttachEvent from './observeAndAttachEvent.js'

async function login(username, password)
{
    try {
        const response = await fetch('/api/user/login/', {
            method: 'POST',
            credentials: 'include',
            body: JSON.stringify({ username, password }),
        });
        console.log(data.message);
        const data = await response.json();
        return {
            ok: response.ok,
            message: data.message,
            ...data
        };
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}


observeAndAttachEvent(
    'login-form',
    'submit',
    async (event) => {
        console.log("login try");
        event.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const data = await login(username, password);
            sessionStorage.setItem("username", username);
            if (data.ok)
                navigate('2fa');
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