import { navigate  } from "../router.js"
import { showModal } from "./modals.js";

export const signupActions = [
	{
		selector: '[data-action="signup"]',
		handler: handleSignup
	},
];

async function signup(username, email, password, confirm_password)
{
	try {
		const response = await fetch('/api/user/register/', {
			method: 'POST',
			// credentials: 'include',
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ username, email, password, confirm_password }),
		});
		
		const data = await response.json();
		return {
			ok: response.ok,
			...data
		};
	} catch (error) {
		console.error('Signup failed:', error);
		throw error;
	}
}

async function handleSignup(element, event)
{
	console.log("{signup.js} sign-up button clicked", element);

	// const form = element.closest("form"); //todo @leontinepaq a supp si sur que inutile -> si utile ajouter dans login x2 et dans profile
	// if (!form.checkValidity())
	// {
	// 	form.reportValidity();
	// 	return;
	// }

	const username = document.getElementById('new-username').value;
	const password = document.getElementById('new-password').value;
	const confirmPassword = document.getElementById('confirm-password').value;
	const email = document.getElementById('new-email').value;

	if (password !== confirmPassword) {
		showModal("Passwords do not match");
		return;
	}
	try {
		const data = await signup(username, email, password, confirmPassword);
		if (data.ok)
		{
			showModal("Account created successfully");
			navigate('home');
		}
		else
			showModal("Signup failed: " + data.message);
	} 
	catch (error) {
		console.error('Signup error:', error);
		showModal("An error occurred. Please try again.")
	}
}
