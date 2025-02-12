// import navigate from "../router.js"
// import observeAndAttachEvent from './observeAndAttachEvent.js'
// import { showModal } from "./actions/modals.js";

// export const TwofaActions = [
//     {
//         selector: '[data-action="2fa"]',
//         handler: handle2FA
//     },
// ];

// async function verify2FA(code, username)
// {
//     try {
//         const response = await fetch('/api/user/verify_2fa/', {
//             method: 'POST',
//             headers: { "Content-Type": "application/json" },
//             credentials: 'include',
//             body: JSON.stringify({ code, username }),
//         });
        
//         const data = await response.json();
//         return { ok: response.ok, ...data };
//     } catch (error) {
//         console.error('2FA verification error:', error);
//         throw error;
//     }
// }

// async function handle2FA(element, event)
// {
//     event.preventDefault();
//     const code = document.getElementById('verification-code').value;

//     try {
//         const data = await verify2FA(code, sessionStorage.getItem("username"));
//         if (data.ok) {
//             navigate('home');
//         } else {
//             showModal("2FA verification failed");
//         }
//     } catch (error) {
//         console.error('2FA error:', error);
//         showModal("An error occured. Please try again.");
//     }
// }
