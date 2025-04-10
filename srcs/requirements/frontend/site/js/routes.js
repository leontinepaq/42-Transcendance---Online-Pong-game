import { initProfile } from "./actions/profile.js";
import { send2faEmail } from "./actions/validate2faEmail.js";
import { loadQRCode } from "./actions/validate2faApp.js";
import { loadUserStats } from "./actions/dashboard.js";
import { initFriends } from "./actions/friends.js";
import { initTournament } from "./actions/tournament.js";

// Table de routage : associe chaque route à sa fonction d'initialisation
export const onRouteLoad = {
  profile: initProfile,
  validation2faEmail: send2faEmail,
  validation2faApp: loadQRCode,
  dashboard: loadUserStats,
  friends: initFriends,
  tournament: initTournament,
};

export default onRouteLoad;
