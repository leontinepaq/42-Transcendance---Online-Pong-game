import login from "./api.js"
import navigate from "./"

document.getElementById('login-form').addEventListener('submit', async (event) => {
	event.preventDefault();
	const username = document.getElementById('username').value;
	const password = document.getElementById('password').value;

	try {
		const data = await login(username, password);
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