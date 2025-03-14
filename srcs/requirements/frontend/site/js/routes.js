import { loadUserProfile } from "./actions/profile.js";
import { send2faEmail } from "./actions/validate2faEmail.js";
import { loadQRCode } from "./actions/validate2faApp.js";
import { loadUserStats } from "./actions/dashboard.js";
import { initFriends } from "./actions/friends.js";

// Table de routage : associe chaque route à sa fonction d'initialisation
export const onRouteLoad = {
  profile: loadUserProfile,
  validation2faEmail: send2faEmail,
  validation2faApp: loadQRCode,
  dashboard: loadUserStats,
  friends: initFriends,
};

export default onRouteLoad;
