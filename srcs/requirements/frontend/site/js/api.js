import navigate from "./router.js"
import { showModal } from "./actions/modals.js";

export async function checkAuth()
{
    try {
        const response = await fetch("/api/user/check_auth/", {
            method: "GET",
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error("Not authenticated");
        }

        const data = await response.json();
        console.log("Authenticated user:", data.username);
        return true;
    } catch (error) {
        console.log("User is not authenticated");
        return false;
    }
}

async function refreshToken()
{
    const response = await fetch("/api/token/refresh/", {
        method: "POST",
        credentials: "include",
    });

    if (response.ok) {
        const data = await response.json();
        console.log("Token refreshed successfully for user:", data.user);
        return true;
    } else {
        console.log("Refresh failed, user needs to log in again");
        return false;
    }
}

export async function authFetch(url, options = {})
{
    // First attempt with current access token
    const response = await fetch(url, {
        ...options,
        credentials: 'include'
    });

    // If unauthorized, try refreshing token (maybe add 403 ?)
    if (response.status === 401) {
        const refreshSuccess = await refreshToken();
        if (refreshSuccess) {
            // Retry original request with new access token
            return fetch(url, {
                ...options,
                credentials: 'include'
            });
        } else {
            // Redirect to login if refresh fails
            // window.location.href = '/login';
            throw new Error('Authentication failed');
        }
    }
    return response;
}

// export async function signup(username, email, password)
// {
//     try {
//         const response = await fetch('/api/user/register/', {
//             method: 'POST',
//             credentials: 'include',
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ username, email, password }),
//         });
//         const data = await response.json();
//         return {
//             ok: response.ok,
//             ...data
//         };
//     } catch (error) {
//         console.error('Signup failed:', error);
//         throw error;
//     }
// }

// export async function verify2FA(code, username)
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

export async function logout()
{
    try {
        const response = await this.authFetch('/auth/logout/', {
            method: 'POST'
        });
        
        if (response.ok) {
            this.accessToken = null;
            window.location.href = '/login';
        }
        return response.ok;
    } catch (error) {
        console.error('Logout error:', error);
        throw error;
    }
}


export async function activateAuthenticator() {
    try {
        console.log('clicked');
        const response = await fetch("/api/user/activate_authenticator/", {
            method: "PUT",
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error("Failed to activate authenticatooor");
        }

        const data = await response.json();

        if (data.qr_code) {
            const qrCodeImg = document.getElementById("qrCodeImg");
            const qrContainer = document.getElementById("qrContainer");
            const verifyContainer = document.getElementById("verifyContainer");

            qrCodeImg.src = data.qr_code;
            qrContainer.style.display = "block";
            verifyContainer.style.display = "block";
        } else {
            throw new Error("QR code not received");
        }
    } catch (error) {
        console.error("Error activating authenticator:", error);
        showModal("Failed to activate 2FA. Please try again.");
    }
}

export async function verifyAuthenticator(code, username) {
    try {
        const response = await fetch('/api/user/authenticator/', {
            method: 'POST',
            credentials: 'include',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code, username}),
        });

        const data = await response.json();
        if (response.ok) {
            this.accessToken = data.access;
        }
        return { ok: response.ok, ...data};
    } catch (error) {
        console.error('2FA Auhenticator verification error:', error);
        throw error;
    }
}
// const api = {
    // accessToken: null,
// 
    // getCookie(name) {
    //     const value = `; ${document.cookie}`;
    //     const parts = value.split(`; ${name}=`);
    //     return parts.length === 2 ? parts.pop().split(';').shift() : null;
    // },

    // getHeaders() {
    //     const headers = {
    //         'Content-Type': 'application/json',
    //         'X-CSRFToken': this.getCookie('csrftoken')
    //     };
        
    //     if (this.accessToken) {
    //         headers['Authorization'] = `Bearer ${this.accessToken}`;
    //     }
        
    //     return headers;
    // },

    // Refresh access token using HttpOnly refresh token cookie

    // Example of an authenticated request

    // async updateUserProfile(profileData) {
    //     try {
    //         const response = await this.authFetch('/profile/', { 
    //             method: 'PUT',
    //             body:JSON.stringify(profileData)
    //     });
    //         if (!response.ok) {
    //             throw new Error('Failed to update profile')
    //         }
    //         return await response.json();

    //     } catch (error) {
    //         console.error('Profile update error:', error);
    //         throw error;
    //     }
    // }
// };

export default checkAuth;