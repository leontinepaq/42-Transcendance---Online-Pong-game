import { navigateAction }			from "./actions/navigate.js";
import { logoutAction }				from "./actions/logout.js";
import { loginActions }				from "./actions/login.js";
import { signupActions }			from "./actions/signup.js";
import { pongActions }				from "./actions/pong.js";
import { friendsActions }			from "./actions/friends.js";
import { profileActions }			from "./actions/profile.js";
import { verify2faEmailActions }	from "./actions/validate2faEmail.js"
import { verify2faAppActions }		from "./actions/validate2faApp.js"
import { usersActions } 			from "./actions/users.js";

// Table des actions à gérer, "..." = concat
const clickActions = [
	...logoutAction,
	...navigateAction,
	...loginActions,
	...signupActions,
	...pongActions,
	...friendsActions,
	...usersActions,
	...profileActions,
	...verify2faEmailActions,
	...verify2faAppActions

	// ...TwofaActions,
];

export function initEventDelegation() {
	document.body.addEventListener("click", async (event) => {
		for (const action of clickActions) 
		{
			const el = event.target.closest(action.selector);
			if (el) {
				event.preventDefault();
				await action.handler(el, event);
				break;
			}
		}
	});
}

/*
 * 🎯 Délégation d'événements pour une application SPA
 *
 * 📌 Principe :
 * Au lieu d'attacher un écouteur d'événement à chaque élément interactif, 
 * on utilise un seul event listener sur le body. Lorsqu'un clic se produit,
 * on vérifie si l'élément cliqué (ou son parent proche) correspond à une action définie.
 *
 * 📌 Avantages :
 * - ✅ Meilleure performance : un seul écouteur au lieu de multiples listeners.
 * - ✅ Gestion dynamique : fonctionne même si le contenu est chargé dynamiquement.
 * - ✅ Code plus modulaire : chaque page/module peut définir ses propres actions.
 *
 * 📌 Structure des actions :
 * Une action est un objet défini dans un module (ex: `loginActions`).
 * Chaque action possède :
 * - `selector` : un sélecteur CSS pour cibler les éléments déclencheurs.
 * - `handler` : une fonction exécutée lorsqu'un élément correspondant est cliqué.
 *
 * 📌 Fonctionnement :
 * 1️⃣ Lorsqu'un clic est détecté sur la page :
 * 2️⃣ On parcourt les `clickActions` pour voir si l'élément cliqué (ou son parent) correspond à un `selector`.
 * 3️⃣ Si une correspondance est trouvée :
 *     - On empêche l'action par défaut (`event.preventDefault()`).
 *     - On exécute la fonction associée (`handler`).
 *     - On stoppe la boucle après la première correspondance (`break`).
 *
 * 📌 Exemple d'ajout d'actions :
 * - Ajouter un fichier `actions/home.js` avec des actions spécifiques à la page Home.
 * - L'inclure dans `clickActions` pour que ses actions soient prises en compte.
 *
 * 📌 Pour la navigation d'une vue a l'autre :
 * Utiliser des liens avec l'attribut data-action="navigate" et un href vers la vue
 * 
 * 📌 Exemple de page qui fontionne :
 * Page de login :
 *  - login.html avec boutons et lien avec data-action 
 *  - actions/login.js avec les deux actions a faire sur cette page: signin ou forgot-pwd

*/



// todo @leontinepaq voir si mieux de le faire que sur l'app
// const app = document.getElementById("body");
// app.addEventListener("click", async (event) => {