import logout from "../api.js"
import navigate from "../router.js"
import { showModal } from "./modals.js";

export const logoutAction = [
	{
		selector:	'[data-action="logout"]',
		handler:	handleLogout
	}
];

async function handleLogout(element, event)
{
	try {
		await logout();
		navigate('login');
	}
	catch (error) {
		console.error('Logout error:', error);
		showModal("Logout failed. Please try again");
	}
};
