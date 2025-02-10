import api from "./api.js";
import navigate from "./router.js";
import observeAndAttachEvent from "./observeAndAttachEvent.js";

observeAndAttachEvent(
    'activate-btn',
    'click',
    async (event) => {
        event.preventDefault();

        try {
            await api.activateAuthenticator();
        } catch (error) {
            console.error("Error in button click: ", error);
        }
    }
);

// document.addEventListener("DOMContentLoaded", () => {
//     const activateBtn = document.getElementById("activate-btn");
//     const qrContainer = document.getElementById("qr-container");
//     const qrCodeImg = document.getElementById("qr-code");
//     const verifyContainer = document.getElementById("verify-container");
//     const verifyBtn = document.getElementById("verify-btn");
//     const authCodeInput = document.getElementById("auth-code");

//     // Handle activating the authenticator
//     activateBtn.addEventListener("click", async () => {
//         console.log('clicked');
//         try {
//             const response = await fetch("/api/activate-authenticator/", {
//                 method: "PUT",
//                 headers: {
//                     "Content-Type": "application/json",
//                     "Authorization": `Bearer ${localStorage.getItem("access_token")}`
//                 }
//             });

//             if (!response.ok) {
//                 throw new Error("Failed to activate authenticator");
//             }

//             const data = await response.json();
//             qrCodeImg.src = data.qr_code;
//             qrContainer.style.display = "block";
//             verifyContainer.style.display = "block";
//         } catch (error) {
//             console.error("Error activating authenticator:", error);
//             alert("Failed to activate 2FA. Please try again.");
//         }
//     });
// });


