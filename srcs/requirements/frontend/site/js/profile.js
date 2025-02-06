import api from "./api.js"
import navigate from "./router.js"
import observeAndAttachEvent from './observeAndAttachEvent.js'

observeAndAttachEvent(
	'update-btn',
	'click',
	async () => {
		try {
			navigate('updateProfile');
		} catch (error) {
			console.error('Profile error:', error);
			alert('An error occured. Please try again.');
		}
	}
);