import navigate from "../router.js"
import { showModal } from "./modals.js";
import { authFetch } from "../api.js"

export const logoutAction = [
	{
		selector:	'[data-action="logout"]',
		handler:	handleLogout
	}
];


// async function logout()
// {
// 	try {
// 		const response = await authFetch('/auth/user/logout/', {
// 			method: 'POST'
// 		});
		
// 		// if (response.ok) {
// 		// 	this.accessToken = null;
// 		// 	window.location.href = '/login';
// 		// }
// 		// return response.ok;
// 	}
// 	catch (error) {
	// 		console.error('Logout error:', error);
	// 		throw error;
	// 	}
	// }
	
// todo @leontinepaq /@samihelal a checker car marche pas 
async function handleLogout(element, event)
{
	try
	{
		await authFetch('/auth/user/logout/', { method: 'POST' });
		navigate('login');
	}
	catch (error)
	{
		console.error('Logout error:', error);
		showModal("Logout failed. Please try again");
	}
};
