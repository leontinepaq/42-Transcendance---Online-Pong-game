import api from "./api.js"
import navigate from "./router.js"
import observeAndAttachEvent from './observeAndAttachEvent.js'

observeAndAttachEvent(
	'activ-auth',
	'click',
	async () => {
		try {
			navigate('activateAuthenticator');
		} catch (error) {
			console.error('Profile error:', error);
			alert('An error occured. Please try again.');
		}
	}
);