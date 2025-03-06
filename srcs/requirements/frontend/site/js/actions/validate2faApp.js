import { authFetchJson, handleError } from "../api.js";
import { navigate } from "../router.js";

export const verify2faAppActions = [
  {
    selector: '[data-action="verify-2fa-app"]',
    handler: verifyCode,
  },
];

export async function loadQRCode() {
  try {
    const data = await authFetchJson("/api/user/get_2fa_qr_activation/", {
      method: "POST",
    });
    const qrCodeImg = document.getElementById("qrCodeImg");
    qrCodeImg.src = data.qr_code;
    console.log("QR code loaded successfully");
  } catch (error) {
    handleError(error, "Load QR Code error");
  }
}

async function verifyCode(element, event) {
  try {
    const code = document.getElementById("verification-code").value;
    const response = await authFetchJson("/api/user/verify_2fa_qr/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code }),
    });
    console.log("Verification successful - 2FA by app enabled");
    navigate("profile");
  } catch (error) {
    handleError(error, "Verify code error");
  }
}
