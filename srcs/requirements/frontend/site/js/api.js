import { navigate } from "./router.js";
import { showModal } from "./actions/modals.js";

export async function checkAuth() {
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

async function refreshToken() {
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

export function handleError(error, message = "An error occurred") {
  console.error(`${message}:`, error.message);
  showModal(`Error: ${error.message}`);
}

export async function authFetchJson(url, options = {}) {
  let response = await fetch(url, {
    ...options,
    credentials: "include",
  });
  // if (response.status === 401) {
  //   //todo @leontinepaq ou @Jean-Antoine > a checker : n'est jamais appelee..? (j'ai limpression) + je crois que ca ne fonctionnerait meme pas
  //   // si error 401 et changement de langue, refresh en boucle ?? // enlever ce trucccc
  //   console.log("refhresh token")
  //   const refreshSuccess = await refreshToken();
  //   if (refreshSuccess) {
  //     response = await fetch(url, {
  //       ...options,
  //       credentials: "include",
  //     });
  //   } else {
  //     navigate("login");
  //     throw new Error("Authentication failed");
  //   }
  // }
  return parseJsonResponse(response);
}

export async function fetchJson(url, options = {}) {
  let response = await fetch(url, {
    ...options,
  });
  return parseJsonResponse(response);
}

async function parseJsonResponse(response) {
  if (!response.ok) {
    let details = "Unknown error";
    try {
      const data = await response.json();
      details = data.details;
    } catch (error) {
      // console.warn("Failed to parse error response:", error);
    }
    throw new Error(details);
  }
  return response.json();
}

export default checkAuth;
