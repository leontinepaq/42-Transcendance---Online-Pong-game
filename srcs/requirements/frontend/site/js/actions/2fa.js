import navigate from "../router.js"
import { showModal } from "./modals.js";
import { authFetch } from "../api.js";
// import observeAndAttachEvent from './observeAndAttachEvent.js'

export async function update2fa({ activate, mail = false, app = false })
{
	const body = {
		new_activate_2fa: activate,
		new_activate_2fa_mail: mail,
		new_activate_2fa_auth: app
	};
	try 
	{
		const response = await authFetch("/api/userprofile/update-2fa/", {
			method: "PUT",
			credentials: "include",
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify(body)
		});
		if (!response.ok)
		{
			const data = await response.json();
			console.error("Disable 2fa: " + data.message);
			showModal("An error occured. Please try again.");
			return ;
		}
		console.log(`2FA update successful: activate=${activate}, mail=${mail}, app=${app}`);
		navigate("profile");
	}
	catch (error)
	{
		console.error('2FA update error:', error);
		showModal("An error occured. Please try again.");
	}
}
