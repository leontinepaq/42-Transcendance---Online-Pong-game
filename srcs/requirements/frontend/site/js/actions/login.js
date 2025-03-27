import { navigate } from "../router.js";
import { authFetchJson, fetchJson } from "../api.js";
import { show, hide } from "../utils.js";
import { doLanguage } from "../translate.js"

export const loginActions = [
  {
    selector: '[data-action="signin"]',
    handler: handleSignin,
  },
  {
    selector: '[data-action="submit-auth"]',
    handler: handleAuth,
  },
  {
    selector: '[data-action="forgot-pwd"]',
    handler: handleForgotPwd,
  },
];

export async function displayAuthSection(data, username) {
  const log = document.getElementById('login-page-title');
  log.setAttribute('data-i18n', "welcome2")
  doLanguage();
  log.textContent = log.textContent + username + " !";
  
    if (data.two_factor_mail == true)
    document.getElementById("auth-label").textContent = "2FA code received by mail";
  if (data.two_factor_auth == true)
    document.getElementById("auth-label").textContent =
      "2FA code from authentificator app";
  if (data.two_factor_mail == true || data.two_factor_auth == true)
    for (const el of document.getElementsByClassName("2fa-enabled")) show(el);
  for (const el of document.getElementsByClassName("auth-login")) show(el);
  for (const el of document.getElementsByClassName("pre-login")) hide(el);
}

export async function handleSignin(element, event) {
  const username = document.getElementById("username").value;
  try {
    const data = await authFetchJson("/api/user/pre_login/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username }),
    });
    displayAuthSection(data, username);
  } catch (error) {
    const profilModal = new bootstrap.Modal(document.getElementById("myModal"));
    let modalBody = document.getElementById("bodyModal")
    if (error.message === "User does not exist")
      modalBody.setAttribute('data-i18n', "login1")
    else
      modalBody.setAttribute('data-i18n', "errorUnknow")
    profilModal.show();
    doLanguage();
  }
}

export async function handleAuth(element, event) {
  const username = document.getElementById("username").value;
  const password = document.getElementById("pwd-input").value;
  const two_factor_code = document.getElementById("auth-input").value;
  
  try {
    await fetchJson("/api/user/login/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, two_factor_code }),
    });
    sessionStorage.setItem("username", username); //todo @leontinepaq checker si utile / si ok qd change username
    console.log("Login successful");
    navigate("home");
  } catch (error) {
    const profilModal = new bootstrap.Modal(document.getElementById("myModal"));
    let modalBody = document.getElementById("bodyModal")
    if (error.message === "Wrong password")
      modalBody.setAttribute('data-i18n', "login2")
    else
      modalBody.setAttribute('data-i18n', "errorUnknow")
    profilModal.show();
    doLanguage();
  }
}

// todo @samihelal / @leontinepaq  => surement un lien vers une autre page donc pas gere ici mais a faire
async function handleForgotPwd(element, event) {
  console.log("{login.js} forgot password button clicked", element);
}
