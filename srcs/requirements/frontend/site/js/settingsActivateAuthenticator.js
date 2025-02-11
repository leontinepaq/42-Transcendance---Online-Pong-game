import api from "./api.js";
import navigate from "./router.js";
import observeAndAttachEvent from "./observeAndAttachEvent.js";

observeAndAttachEvent(
    'activate-btn',
    'click',
    async (event) => {
        event.preventDefault();

        try {
            await api.activateAuthenticator();
        } catch (error) {
            console.error("Error in button click: ", error);
        }
    }
);


