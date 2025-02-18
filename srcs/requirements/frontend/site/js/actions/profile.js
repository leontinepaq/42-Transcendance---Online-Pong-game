import { showModal } from "./modals.js"
import { authFetch } from "../api.js"

export const profileActions = [
	{
		selector: '[data-action="toggle-edit"]',
		handler: toggleEdit
	}
];

async function getUserProfile()
{
	const response = await authFetch('api/userprofile/', {method: 'GET'
	});
	if (!response.ok) {
		throw new Error('Failed to fetch profile')
	}
	return await response.json();
}

export async function loadUserProfile()
{
	const usernameElem = document.getElementById('display-username');
	const emailElem = document.getElementById('display-email');
	if (!usernameElem || !emailElem) {
		console.error("Elements absent from DOM"); // todo @leontinepaq: utile ??
		return;
	}
	usernameElem.textContent = "**error charging username**"; //todo @leontinepaq a changer
	emailElem.textContent = "**error charging email**";
	try {
		const user = await getUserProfile();
		document.getElementById('display-username').textContent = user.username;
		document.getElementById('display-email').textContent = user.email;
		if (user.avatarUrl)
			document.getElementById('profile-avatar').src = user.avatarUrl;
	}
	catch (error) {
		console.error("Error loading profile: ", error)
	}
};

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
		const response = await authFetch(fieldConfig.endpoint, {
			method: "PUT",
			credentials: "include",
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify(body)
		});
		const data = await response.json();
		console.log("Update profile: " + data.message);
		return { ok: response.ok, message: data.message };
	}
	catch (error)
	{
		console.error('Update error:', error);
		return { ok: false, message: "An error occurred while updating the profile" };
	}

}

function show(element) { element.classList.remove("d-none"); }
function hide(element) { element.classList.add("d-none"); }

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

async function switchToSaveMode(button, valueDisplay, input, confirmInput)
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

function checkInput(input)
{
	if (input.checkValidity())
		return true;
	input.reportValidity();
	return false;
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
		if (!checkInput(input)) // todo @leontinepaq a garder ? voir avec le back..?
			return;
		button.disabled = true;
		const response = await updateProfileField(field, input, confirmInput);
		if (response.ok)
			switchToSaveMode(button, valueDisplay, input, confirmInput)
		else
			showModal("Edit profile failed: " + response.message);
		button.disabled = false;
	}
}

// async function update2FABtn() {
//	 try {
//		 const response = await fetch('/api/user/profile', { credentials: 'include' });
//		 const user = await response.json();
		
//		 const button = document.getElementById("toggle-2fa");
//		 if (user.twoFAEnabled) {
//			 button.textContent = "DISABLE 2FA";
//			 button.classList.remove("d-none");
//		 } else {
//			 button.textContent = "ENABLE 2FA";
//			 button.classList.remove("d-none");
//		 }
//	 } catch (error) {
//		 console.error("Error fetching user profile:", error);
//	 }
// }

// Exécuter la mise à jour au chargement de la page
// document.addEventListener("DOMContentLoaded", update2FABtn);

// async function toggle2FA(element, event) {
// 	try {
// 		await api.activateAuthenticator();
// 		update2FABtn();
// 	} catch (error) {
// 		console.error("Error toggling 2FA:", error);
// 	}
// }