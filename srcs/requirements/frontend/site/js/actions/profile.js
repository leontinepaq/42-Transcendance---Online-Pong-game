import { authFetchJson, handleError } from "../api.js";
import { navigate  } from "../router.js"

export const profileActions = [
	{
		selector: '[data-action="toggle-edit"]',
		handler: toggleEdit
	},
	{
		selector: '[data-action="disable-2fa"]',
		handler: disable2fa
	}
];

function show(element) { element.classList.remove("d-none"); }
function hide(element) { element.classList.add("d-none"); }

function display2fa(user)
{
	if (!user.is_two_factor_mail && !user.is_two_factor_auth)
	{
		show(document.getElementById('display-enable-2fa'));
		hide(document.getElementById('display-disable-2fa'));
		return ;
	}
	hide(document.getElementById('display-enable-2fa'));
	show(document.getElementById('display-disable-2fa'));
	if (user.is_two_factor_mail)
		show(document.getElementById('span-2fa-mail'));
	else
		show(document.getElementById('span-2fa-app'));
}

export async function loadUserProfile()
{
	const usernameElem = document.getElementById('display-username');
	const emailElem = document.getElementById('display-email');

	usernameElem.textContent = "**charging username**"; //todo @leontinepaq a changer ?
	emailElem.textContent = "**charging email**";
	try {
		const user = await authFetchJson('api/userprofile/', {method: 'GET'});
		usernameElem.textContent = user.username;
		emailElem.textContent = user.email;
		if (user.avatarUrl)
			document.getElementById('profile-avatar').src = user.avatarUrl;
		display2fa(user);
	}
	catch (error) {
		handleError(error, "Load user profile error");
	}
};

async function switchToEditMode(button, valueDisplay, input, confirmInput)
{
	if (valueDisplay)
	{
		input.value = valueDisplay.textContent;
		hide(valueDisplay);
	}
	show(input);
	if (confirmInput)
		show(confirmInput);
	button.textContent = "SAVE";
}

async function switchToDisplayMode(button, valueDisplay, input, confirmInput)
{
	if (valueDisplay)
	{
		valueDisplay.textContent = input.value;
		show(valueDisplay);
	}
	hide(input);
	if (confirmInput)
		hide(confirmInput);
	button.textContent = "EDIT";
}

const PROFILE_FIELDS = {
	username:	{ endpoint: "api/userprofile/update-username/",	key: "new_username" },
	email:		{ endpoint: "api/userprofile/update-email/",	key: "new_email" },
	password:	{ endpoint: "api/userprofile/update-password/", key: "new_password", confirmKey: "confirm_password"}
};

async function updateProfileField(field, input, confirmInput)
{
	const value = input.value;
	const confirmValue = confirmInput ? confirmInput.value : null;
	const fieldConfig = PROFILE_FIELDS[field];

	let body = { [fieldConfig.key]: value };
	if (fieldConfig.confirmKey)
		body[fieldConfig.confirmKey] = confirmValue;

	try 
	{
		const response = await authFetchJson(fieldConfig.endpoint, {
			method: "PUT",
			credentials: "include",
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify(body)
		});
		console.log("Update profile: " + response.message);
		return true;
	}
	catch (error)
	{
		handleError(error, "Update profile error");
		return false;
	}

}

async function toggleEdit(element, event) {
	const field = element.getAttribute("data-field");
	const valueDisplay = document.getElementById(`display-${field}`);
	const input = document.getElementById(`edit-${field}`);
	const confirmInput = document.getElementById(`confirm-${field}`) || null;
	const button = element;
	
	if (button.textContent === "EDIT")
		switchToEditMode(button, valueDisplay, input, confirmInput);
	else if (button.textContent === "SAVE")
	{
		button.disabled = true;
		if (await updateProfileField(field, input, confirmInput))
			switchToDisplayMode(button, valueDisplay, input, confirmInput)
		button.disabled = false;
	}
}

async function disable2fa(element, event)
{
	try 
	{
		const response = await authFetchJson("/api/userprofile/deactivate-2fa/", {
			method: "PUT",
			headers: {"Content-Type": "application/json"},
		});
		console.log("Disable 2fa successful");
		navigate("profile");
	}
	catch (error)
	{
		handleError(error, "Disable 2fa error");
	}
}
