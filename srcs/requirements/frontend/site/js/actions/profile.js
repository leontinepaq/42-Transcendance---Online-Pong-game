import { navigate	} from "../router.js"
import { showModal } from "./modals.js"
// import { getUserProfile } from "../api.js"
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

export async function loadUserProfile() {
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

function toggleEdit(element, event) {
	const field = element.getAttribute("data-field");
	const displayElem = document.getElementById(`display-${field}`);
	const inputElem = document.getElementById(`edit-${field}`);
	const btn = element;
	
	// Si le bouton affiche "EDIT", on passe en mode édition
	if (btn.textContent.trim().toUpperCase() === "EDIT") {
		// Préremplir l'input avec la valeur affichée
		inputElem.value = displayElem.textContent;
		displayElem.classList.add("d-none");
		inputElem.classList.remove("d-none");
		btn.textContent = "SAVE";
	} else {
		// On récupère la nouvelle valeur et on l'envoie à l'API
		const newValue = inputElem.value.trim();
		// Optionnel : validation de newValue
		updateProfileField(field, newValue).then(response => {
			console.log("Réponse API :", response); // Debugging
		
			if (response.ok) {
				console.log("TEST"); // Devrait s'afficher
				displayElem.textContent = newValue;
				inputElem.classList.add("d-none");
				displayElem.classList.remove("d-none");
				btn.textContent = "EDIT";
			} else {
				alert(response.message || "Mise à jour échouée");
			}
		}).catch(error => {
		console.error(`Erreur lors de la mise à jour de ${field} :`, error);
		alert("Une erreur est survenue. Veuillez réessayer.");
		});
	}
	}
	
	function updateProfileField(field, value) {
		if (field == "username"){
			const new_username = value;
			return fetch('api/userprofile/update-username/', {
				method: "PUT",
				credentials: "include",
				headers: {
				"Content-Type": "application/json"
				},
				body: JSON.stringify({new_username})
			}).then(res => res.json().then(data => ({
			ok: res.ok, // Ajoute la clé `ok` manuellement
			...data})));
		}
		if (field == "email") {
			const new_email = value;
			return fetch('api/userprofile/update-email/', {
				method: "PUT",
				credentials: "include",
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({ new_email })  
			}).then(res => res.json().then(data => ({
    ok: res.ok, // Ajoute la clé `ok` manuellement
    ...data})));
		}


		
	}
	

// async function update2FABtn() {
//	 try {
//		 const response = await fetch('/api/user/profile', { credentials: 'include' });
//		 const user = await response.json();
		
//		 const btn = document.getElementById("toggle-2fa");
//		 if (user.twoFAEnabled) {
//			 btn.textContent = "DISABLE 2FA";
//			 btn.classList.remove("d-none");
//		 } else {
//			 btn.textContent = "ENABLE 2FA";
//			 btn.classList.remove("d-none");
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