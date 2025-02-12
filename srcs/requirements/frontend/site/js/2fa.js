// import verify2FA from "./api.js"
// import navigate from "./router.js"
// import observeAndAttachEvent from './observeAndAttachEvent.js'
// import { showModal } from "./actions/modals.js";
 
// observeAndAttachEvent(
// 	'2fa-form',
// 	'submit',
// 	async (event) => {
// 		event.preventDefault();
// 		const code = document.getElementById('verification-code').value;

// 		try {
// 			const data = await verify2FA(code, sessionStorage.getItem("username"));
// 			if (data.ok) {
// 				navigate('home');
// 			} else {
// 				showModal("2FA verification failed");
// 			}
// 		} catch (error) {
// 			console.error('2FA error:', error);
// 			showModal("An error occured. Please try again.");
// 		}
// 	}
// );
