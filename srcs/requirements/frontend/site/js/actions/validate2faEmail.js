import { authFetch } from "../api.js";
import { showModal } from "./modals.js"
import { update2fa } from "./2fa.js"

export const verify2faEmailActions = [
	{
		selector: '[data-action="send-new-code"]',
		handler: send2faEmail
	},
	{
		selector: '[data-action="verify-code"]',
		handler: verifyCode
	}
];

export async function send2faEmail()
{
	try 
	{
		const response = await authFetch('/api/user/send_2fa_mail_activation/', {method: 'POST'});
		const data = await response.json()
		console.log("send2faEmail: " + data.message);
	}
	catch (error)
	{
		console.error('Send 2fa error:', error);
		showModal("An error occured. Please try again.");
	}
}

async function verifyCode(element, event)
{
	try 
	{
		const code = document.getElementById("verification-code").value;
		const response = await fetch('/api/user/verify_2fa_mail/', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({code}),
		});
		const data = await response.json();
		if (response.ok)
			await update2fa({ activate: true, mail: true });
		else
		{
			await update2fa({ activate: true, mail: true }); //todo @leontinepaq a supprimer si envoi/verif fonctionne
			console.error("Verification failed: " + data.message);
			showModal("Verification failed: " + data.message);
		}
	}
	catch (error)
	{
		console.error('Verification error:', error);
		showModal("An error occured. Please try again.");
	}
}
