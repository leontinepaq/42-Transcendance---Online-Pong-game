import { loadUserProfile } from "./actions/profile.js";
// import { loadDashboardStats } from "./actions/dashboard.js";

// Table de routage : associe chaque route à sa fonction d'initialisation
const onRouteLoad = {
    profile: loadUserProfile
    // dashboard: loadDashboardStats, 
};

export default onRouteLoad;