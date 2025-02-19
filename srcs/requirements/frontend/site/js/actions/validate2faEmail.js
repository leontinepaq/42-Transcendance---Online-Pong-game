import { authFetchJson, handleError } from "../api.js";
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
		const response = await authFetchJson('/api/user/send_2fa_mail_activation/', {method: 'POST'});
		console.log("send2faEmail: " + response.message);
	}
	catch (error)
	{
		handleError(error, "Send 2fa error");
	}
}

async function verifyCode(element, event)
{
	try 
	{
		const code = document.getElementById("verification-code").value;
		const response = await authFetchJson('/api/user/verify_2fa_mail/', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({code}),
		});
		await update2fa({ activate: true, mail: true });
	}
	catch (error)
	{
		await update2fa({ activate: true, mail: true }); //todo @leontinepaq a supprimer si envoi/verif fonctionne
		handleError(error, "Verify code error");
	}
}
