import { navigate  }					from "../router.js"
import { authFetchJson, handleError }	from "../api.js";

export const signupActions = [
	{
		selector: '[data-action="signup"]',
		handler: handleSignup
	},
];

async function handleSignup(element, event)
{
	const username = document.getElementById('new-username').value;
	const password = document.getElementById('new-password').value;
	const confirm_password = document.getElementById('confirm-password').value;
	const email = document.getElementById('new-email').value;
	try
	{
		await authFetchJson('/api/user/register/', {
			method: 'POST',
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ username, email, password, confirm_password }),
		});
		navigate('home');
	} 
	catch (error) 
	{
		handleError(error, "Signup error");
	}
}

	// const form = element.closest("form"); //todo @leontinepaq a supp si sur que inutile -> si utile ajouter dans login x2 et dans profile
	// if (!form.checkValidity())
	// {
	// 	form.reportValidity();
	// 	return;
	// }