import { navigate  } from "../router.js"
import { authFetchJson, fetchJson, handleError } from "../api.js";

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

//todo @leontinepaq: en doublon avec profile.js > mettre dans un utils ?
function show(element) { element.classList.remove("d-none"); }
function hide(element) { element.classList.add("d-none"); }

async function displayAuthSection(data, username) {
	document.getElementById("page-title").textContent = "Nice to see you again " + username + " !";
	if (data.two_factor_mail == true)
	{
		document.getElementById("auth-label").textContent = "2FA code received by mail";
		show(document.getElementById("auth-input"));
	}
	if (data.two_factor_auth == true)
	{
		document.getElementById("auth-label").textContent = "2FA code from authentificator app";
		show(document.getElementById("auth-input"));
	}
	show(document.getElementById("auth-step"));
	hide(document.getElementById("pre-login"));
}

async function handleSignin(element, event)
{
	const username = document.getElementById('username').value;
	try {
		const data = await authFetchJson('/api/user/pre_login/', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({username}),
		});
		displayAuthSection(data, username);
	}
	catch (error)
	{
		handleError(error, "Handle signin error");
	}
}

async function handleAuth(element, event)
{
	const username = document.getElementById('username').value;
	const password = document.getElementById('pwd-input').value;
	const two_factor_code = document.getElementById('auth-input').value;

	try 
	{
		await fetchJson('/api/user/login/', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ username, password, two_factor_code}),
		});
		sessionStorage.setItem("username", username);//todo @leontinepaq checker si utile / si ok qd change username
		console.log("Login successful");
		navigate('home');
	}
	catch (error) 
	{
		handleError(error, "Handle authentification error");
	}
}

// todo @samihelal / @leontinepaq  => surement un lien vers une autre page donc pas gere ici mais a faire
async function handleForgotPwd(element, event)
{
	console.log("{login.js} forgot password button clicked", element);
}
