import { loadUserProfile } from "./actions/profile.js";
import { send2faEmail } from "./actions/validate2faEmail.js";
// import { loadDashboardStats } from "./actions/dashboard.js";

// Table de routage : associe chaque route à sa fonction d'initialisation
const onRouteLoad = {
    profile: loadUserProfile,
    validation2faEmail: send2faEmail
    // dashboard: loadDashboardStats, 
};

export default onRouteLoad;