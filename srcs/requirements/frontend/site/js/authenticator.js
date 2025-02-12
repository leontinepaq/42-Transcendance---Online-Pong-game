import api from "./api.js"
import navigate from "./router.js"
import observeAndAttachEvent from './observeAndAttachEvent.js'
import { showModal } from "./actions/modals.js";

observeAndAttachEvent(
	'authenticator-form',
	'submit',
	async (event) => {
		event.preventDefault();
		const code = document.getElementById('verification-code').value;

		try {
			const data = await api.verifyAuthenticator(code, sessionStorage.getItem("username"));
			if (data.ok) {
				navigate('home');
			} else {
				showModal("2FA verification failed");
			}
		} catch (error) {
			console.error('2FA error:', error);
			showModal("An error occured. Please try again.");
		}
	}
);
