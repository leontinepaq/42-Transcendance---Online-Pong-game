import logout from "./api.js"
import navigate from "./router.js"
import observeAndAttachEvent from './observeAndAttachEvent.js'


// // PLUS UTILE SI ON FAIT DES LIENS
// observeAndAttachEvent(
// 	'profile-btn',
// 	'click',
// 	async () => {
// 		try {
// 			navigate('profile');
// 		} catch (error) {
// 			console.error('Profile error:', error);
// 			alert('An error occured. Please try again.');
// 		}
// 	}
// );

// observeAndAttachEvent(
// 	'logout-btn',
// 	'click',
// 	async () => {
// 		try {
// 			await logout();
// 			navigate('login');
// 		} catch (error) {
// 			console.error('Logout error:', error);
// 			alert('Logout failed. Please try again.');
// 		}
// 	}
// );

// todo @leontinepaq pas sur que c'est la bonne maniere ni le bon endroit pour gerer ca
document.body.addEventListener('click', async (event) =>  {
	if (event.target.matches('[data-action="logout"]')) {
		event.preventDefault();

		try {
			await logout();
			navigate('login');
		} catch (error) {
			console.error('Logout error:', error);
			alert('Logout failed. Please try again.');
		}
	}
});