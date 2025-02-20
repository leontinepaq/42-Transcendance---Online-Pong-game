import { navigate  } from "../router.js"
import { authFetchJson } from "../api.js";

export const friendsActions = [
    {
        selector: '[data-action=""]',
        handler: initFriends
    },
];
