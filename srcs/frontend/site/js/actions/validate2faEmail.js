import { authFetchJson, handleError } from "../api.js";
import { navigate } from "../router.js";

export const verify2faEmailActions = [
  {
    selector: '[data-action="send-new-code"]',
    handler: send2faEmail,
  },
  {
    selector: '[data-action="verify-2fa-mail"]',
    handler: verifyCode,
  },
];

export async function send2faEmail() {
  try {
    const response = await authFetchJson("/api/user/send_2fa_mail_activation/", {
      method: "POST",
    });
    // console.log("send2faEmail: " + response.details);
  } catch (error) {
    handleError(error, "Send 2fa error");
  }
}

async function verifyCode(element, event) {
  try {
    const code = document.getElementById("verification-code").value;
    const response = await authFetchJson("/api/user/verify_2fa_mail/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    console.log("Verification successful - 2FA by mail enabled");
    navigate("profile");
  } catch (error) {
    handleError(error, "Verify code error");
  }
}
