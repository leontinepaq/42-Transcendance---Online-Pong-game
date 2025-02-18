import { navigate  } from "../router.js"
import { showModal } from "./modals.js";
import { authFetch } from "../api.js";

export const loginActions = [
	{
		selector: '[data-action="signin"]',
		handler: handleSignin
	},
	{
		selector: '[data-action="submit-auth"]',
		handler: handleAuth
	},
	{
		selector: '[data-action="forgot-pwd"]',
		handler: handleForgotPwd
	}
];


async function displayAuthSection(data, username) {
	document.getElementById("page-title").textContent = "Nice to see you again " + username + " !";
	if (data.two_factor_mail == true)
	{
		document.getElementById("auth-label").textContent = "2FA code received by mail";
		document.getElementById("auth-input").type = "text";
		document.getElementById("auth-input").classList.remove("d-none");
	}
	if (data.two_factor_auth == true)
	{
		document.getElementById("auth-label").textContent = "2FA code from authentificator app";
		document.getElementById("auth-input").type = "text";
		document.getElementById("auth-input").classList.remove("d-none");
	}
	document.getElementById("auth-step").classList.remove("d-none");
	document.getElementById("pre-login").classList.add("d-none");
}

async function handleSignin(element, event)
{
	console.log("{login.js} sign-in button clicked", element);

	const form = element.closest("form");
	if (!form.checkValidity()) {
		form.reportValidity();
		return;
	}

	const username = document.getElementById('username').value;
	try {
		const response = await fetch('/api/user/pre_login/', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({username}),
		});
		const data = await response.json();
		if (response.ok)
			displayAuthSection(data, username);
		else
		{
			console.error("Signin error: " + data.message);
			showModal("Signin failed: " + data.message);
		}
	}
	catch (error) {
		console.error('Signin error:', error);
		showModal("An error occured. Please try again."); //todo @leontinepaq a checker
	}
}



async function login(username, password, two_factor_auth, two_factor_mail)
{
	try {
		const response = await authFetch('/api/user/login/', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username, password, two_factor_auth, two_factor_mail}),
		});
		const data = await response.json();
		console.log(data.message);
		return {
			ok: response.ok,
			message: data.message,
			...data
		};
	}
	catch (error) {
		console.error('Login error:', error);
		throw error;
	}
}

async function handleAuth(element, event)
{
	console.log("{login.js} log in button clicked", element);

	const form = element.closest("form");
	if (!form.checkValidity()) {
		form.reportValidity();
		return;
	}

	const username = document.getElementById('username').value;
	const password = document.getElementById('pwd-input').value;
	const two_factor_auth = document.getElementById('pwd-input').value;
	const two_factor_mail = document.getElementById('pwd-input').value;
	// todo @leontinepaq voir avec JA si utile d'en envoyer 2 ?

	try {
		const data = await login(username, password, two_factor_auth, two_factor_mail);
		sessionStorage.setItem("username", username);
		if (data.ok)
			navigate('home')
		else
			showModal("Login failed: " + data.message);
	}
	catch (error) {
		console.error('Login error:', error);
		showModal("An error occured. Please try again.");
	}
}

// todo @samihelal / @leontinepaq  => surement un lien vers une autre page donc pas gere ici mais a faire
async function handleForgotPwd(element, event)
{
	console.log("{login.js} forgot password button clicked", element);
}
