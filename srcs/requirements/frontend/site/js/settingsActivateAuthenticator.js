//ADD BUTTON TO PUT USER TO is_2fa_authenticator

import api from "./api.js"
import navigate from "./router.js"
import observeAndAttachEvent from './observeAndAttachEvent.js'

const activateAuthenticator = async () => {
    try {
        const response = await api.get('/api/generate_totp_secret_and_qr/');
        const qrCodeBase64 = response.data.qr_code;

        // Set the QR code as the source of the image element
        document.getElementById('qr-code').src = `data:image/png;base64,${qrCodeBase64}`;
    } catch (error) {
        console.error('Error generating QR code:', error);
        alert('An error occurred while generating the QR code. Please try again.');
    }
};

const verifyAuthenticatorCode = async () => {
    const authCode = document.getElementById('auth-code').value;

    if (!authCode) {
        alert('Please enter the code from your authenticator app.');
        return;
    }

    try {
        // Verify the TOTP code with the backend
        const response = await api.post('/api/verify_totp_code/', { code: authCode });

        if (response.data.success) {
            alert('Authenticator enabled successfully!');
            navigate('profile');  // Redirect to the profile page or wherever necessary
        } else {
            alert('Invalid code. Please try again.');
        }
    } catch (error) {
        console.error('Error verifying code:', error);
        alert('An error occurred while verifying the code. Please try again.');
    }
};

observeAndAttachEvent('verify-btn', 'click', verifyAuthenticatorCode);

// Initialize the page by fetching the QR code
activateAuthenticator();
