import api from "../api.js"
import navigate from "../router.js"
import observeAndAttachEvent from './observeAndAttachEvent.js'
import { showModal } from "../actions/modals.js";

observeAndAttachEvent(
	'activ-auth',
	'click',
	async () => {
		try {
			navigate('settingsActivateAuthenticator');
		} catch (error) {
			console.error('Profile error:', error);
			showModal("An error occured. Please try again.");
		}
	}
);