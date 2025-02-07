import signup from "./api.js"
import navigate from "./router.js"
import observeAndAttachEvent from './observeAndAttachEvent.js'

observeAndAttachEvent(
	'signup-form',
	'submit',
	async (event) => {
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
			const data = await signup(username, email, password);
			if (data.ok) {
				alert('Account created successfully');
				navigate('login');
			} else {
				alert(data.message || 'Signup failed');
			}
		} catch (error) {
			console.error('Signup error:', error);
			alert('An error occurred. Please try again.');
		}
	}
);

observeAndAttachEvent(
	'back-to-login-btn',
	'click',
	() => navigate('login')
);