import navigate							from "../router.js"
import { authFetchJson, handleError }	from "../api.js";

export const logoutAction = [
	{
		selector:	'[data-action="logout"]',
		handler:	handleLogout
	}
];

async function handleLogout(element, event)
{
	try
	{
		await authFetchJson('/api/user/logout/', { method: 'POST' });
		navigate('login');
	}
	catch (error)
	{
		handleError(error, "Logout error");
	}
};
