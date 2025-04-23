import { navigate } from "../router.js";
import { authFetchJson, fetchJson, handleError } from "../api.js";
import { show, hide } from "../utils.js";
import { doLanguage } from "../translate.js";

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
  document.getElementById("login-page-title").dataset.username = username;
  doLanguage();
  let authLabel = document.getElementById("auth-label")
  if (data.two_factor_mail == true){
    authLabel.textContent = "2FA code received by mail";
    authLabel.dataset.i18n = "2fa-sent-mail"
  }
  if (data.two_factor_auth == true){
    authLabel.textContent = "2FA code from authentificator app";
    authLabel.dataset.i18n = "2fa-sent-app"
  }
  if (data.two_factor_mail == true || data.two_factor_auth == true)
    for (const el of document.getElementsByClassName("2fa-enabled")) show(el);
  for (const el of document.getElementsByClassName("auth-login")) show(el);
  for (const el of document.getElementsByClassName("pre-login")) hide(el);
  document.getElementById("pwd-input").focus();
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
    handleError(error, "Signin error");
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
    sessionStorage.setItem("username", username);
    console.log("Login successful");
    navigate("home");
  } catch (error) {
    handleError(error, "Authentification error");
  }
}

async function handleForgotPwd(element, event) {
  const username = document.getElementById("username").value;
    try {
      const response = await authFetchJson("/api/user/forgotten_password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username })
      });
      show(document.getElementById("passwordMailSent"));
    } catch (error) {
      handleError(error, "Forget password error");
    }
  }
