import { navigate	} from "../router.js"
import { showModal } from "./modals.js";

export const profileActions = [
	{
		selector: '[data-action="toggle-edit"]',
		handler: toggleEdit
	}
	
];

// todo @leontine: a voir avec thomas comment ca marche
export async function loadUserProfile() {
	try {
		const response = await fetch('/api/user/profile', { credentials: 'include' });
		const user = await response.json();
		document.getElementById('display-username').textContent = user.username;
		document.getElementById('display-email').textContent = user.email;
		if (user.avatarUrl)
			document.getElementById('profile-avatar').src = user.avatarUrl;
	}
	catch (error) {
		requestAnimationFrame(() => {
			const usernameElem = document.getElementById('display-username');
			const emailElem = document.getElementById('display-email');
			if (usernameElem) usernameElem.textContent = "**error charging username**";
			if (emailElem) emailElem.textContent = "**error charging email**";
			if (!usernameElem || !emailElem) {
				console.error("Elements absent from DOM");
				return;
			}
		  });
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
		if (response.ok) {
			// Mise à jour de l'affichage et retour au mode lecture
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
	
	/**
	 * Envoie une requête API pour mettre à jour un champ du profil.
	 * @param {string} field - "username" ou "email"
	 * @param {string} value - Nouvelle valeur pour le champ
	 * @returns {Promise<Object>} Réponse de l'API.
	 */
	function updateProfileField(field, value) {
	return fetch('/api/user/update', {
		method: "POST",
		credentials: "include",
		headers: {
		"Content-Type": "application/json"
		},
		body: JSON.stringify({ field, value })
	}).then(res => res.json());
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