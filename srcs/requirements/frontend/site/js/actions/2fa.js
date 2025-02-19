import navigate from "../router.js"
import { authFetchJson, handleError } from "../api.js";

export async function update2fa({ activate, mail = false, app = false })
{
	const body = {
		new_activate_2fa: activate,
		new_activate_2fa_mail: mail,
		new_activate_2fa_auth: app
	};
	try 
	{
		const response = await authFetchJson("/api/userprofile/update-2fa/", {
			method: "PUT",
			credentials: "include",
			headers: {"Content-Type": "application/json"},
			body: JSON.stringify(body)
		});
		console.log(`Update 2fa successful: activate=${activate}, mail=${mail}, app=${app}`);
		navigate("profile");
	}
	catch (error)
	{
		handleError(error, "Update 2fa error");
	}
}
