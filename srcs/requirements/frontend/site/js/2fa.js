import api from "./api.js"
import navigate from "./router.js"
import observeAndAttachEvent from './observeAndAttachEvent.js'

observeAndAttachEvent(
	'2fa-form',
	'submit',
	async (event) => {
		event.preventDefault();
		const code = document.getElementById('verification-code').value;

		try {
			const data = await api.verify2FA(code, sessionStorage.getItem("username"));
			if (data.ok) {
				navigate('home');
			} else {
				alert(data.message || '2FA verification failed');
			}
		} catch (error) {
			console.error('2FA error:', error);
			alert('An error occurred. Please try again.');
		}
	}
);
