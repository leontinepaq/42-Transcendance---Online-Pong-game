import api from "./api.js"
import navigate from "./router.js"
import observeAndAttachEvent from './observeAndAttachEvent.js'
import { showModal } from "./actions/modals.js";

observeAndAttachEvent(
	'authenticator-form',
	'submit',
	async (event) => {
		event.preventDefault();
		const code = document.getElementById('verification-code').value;

		try {
			const data = await api.verifyAuthenticator(code, sessionStorage.getItem("username"));
			if (data.ok) {
				navigate('home');
			} else {
				showModal("2FA verification failed");
			}
		} catch (error) {
			console.error('2FA error:', error);
			showModal("An error occured. Please try again.");
		}
	}
);

//     // Handle verifying the TOTP code
//     verifyBtn.addEventListener("click", async () => {
//         const code = authCodeInput.value.trim();
//         if (!code) {
//             alert("Please enter the code from your authenticator app.");
//             return;
//         }

//         try {
//             const response = await fetch("/api/verify-totp-code/", {
//                 method: "POST",
//                 headers: {
//                     "Content-Type": "application/json",
//                     "Authorization": `Bearer ${localStorage.getItem("access_token")}`
//                 },
//                 body: JSON.stringify({ code: code })
//             });

//             const data = await response.json();
//             if (response.ok) {
//                 alert("2FA successfully activated!");
//                 navigate("profile");
//             } else {
//                 alert(data.error || "Invalid code. Please try again.");
//             }
//         } catch (error) {
//             console.error("Error verifying code:", error);
//             alert("Failed to verify code. Please try again.");
//         }
//     });