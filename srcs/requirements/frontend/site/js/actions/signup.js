import { navigate } from "../router.js";
import { authFetchJson } from "../api.js";
import { doLanguage } from "../translate.js";

export const signupActions = [
  {
    selector: '[data-action="signup"]',
    handler: handleSignup,
  },
];

async function handleSignup(element, event) {
  const username = document.getElementById("new-username").value;
  const password = document.getElementById("new-password").value;
  const confirm_password = document.getElementById("confirm-password").value;
  const email = document.getElementById("new-email").value;
  try {
    await authFetchJson("/api/user/register/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password, confirm_password }),
    }); //todo @leontinepaq demander a @Jean-Antoine si peut login en meme temmps
    navigate("home");
  } catch (error) {
    const profilModal = new bootstrap.Modal(document.getElementById("myModal"));
    let modalBody = document.getElementById("bodyModal")
    console.log(error.message);
    if (error.message === "Invalid email format")
        modalBody.setAttribute('data-i18n', 'invalidEmail');
    else if (error.message === "Both fields required")
      modalBody.setAttribute('data-i18n', 'bothFields');
    else if (error.message === "Passwords dot not match")
      modalBody.setAttribute('data-i18n', 'passwordNotMatch');
    else if (error.message === "Username or email already exists")
      modalBody.setAttribute('data-i18n', "sameEmail")
    else
      modalBody.setAttribute('data-i18n', "errorUnknow")
    profilModal.show();
    doLanguage();
  }
}
