import { authFetchJson, handleError } from "../api.js";
import { displayGameCards } from "./dashboard.js";

export const paginationAction = [
  {
    selector: '[data-action="update-pagination" ]',
    handler: handlePaginationClick,
  },
];

const paginationTargetsMap = {
  "game-history": displayGameCards,
  // "available-tournaments": displayAvailableTournaments
};

function adaptApiUrl(url) {
  if (!url) return null;
  const parsed = new URL(url);
  return `api${parsed.pathname}${parsed.search}`;
}

export async function handlePaginationClick(element) {
  const rawUrl = element.dataset.url;
  const target = element.dataset.updatetarget;
  if (!rawUrl || !target) {
    console.error("Missing URL or target data for pagination");
    return;
  }

  try {
    const url = adaptApiUrl(rawUrl);
    const data = await authFetchJson(url, { method: "GET" });

    const targetHandler = paginationTargetsMap[target];
    if (targetHandler) {
      targetHandler(data);
    } else {
      console.error(`Handler not found for target: ${target}`);
    }
    updatePaginationBtns(data);
  } catch (error) {
    handleError(error, "Pagination error");
  }
}

export function updatePaginationBtns(data) {
  const prevBtn = document.getElementById("prev-page");
  const nextBtn = document.getElementById("next-page");

  if (prevBtn && nextBtn) {
    prevBtn.disabled = !data.previous;
    nextBtn.disabled = !data.next;

    prevBtn.dataset.url = data.previous || "";
    nextBtn.dataset.url = data.next || "";
  } else {
    console.error("Pagination buttons not found.");
  }
}

/**
 * Pagination.js - Gestion de la pagination pour divers composants de l'application.
 *
 * Ce module gère la logique de pagination en fonction des éléments HTML
 * contenant des boutons de pagination. Il permet de récupérer et d'afficher
 * des données paginées en utilisant une URL de pagination fournie par l'API.
 *
 * Fonctionnement :
 * 1. **Boutons de pagination** : Les boutons de pagination doivent avoir les attributs suivants :
 *    - `data-action="update-pagination"` : Indique qu'il s'agit d'un bouton de pagination.
 *    - `data-url` : Contient l'URL de la page suivante/précédente (généralement dans la réponse API).
 *    - `data-updatetarget` : Spécifie la cible à mettre à jour avec les nouvelles données (par ex. "game-history").
 *    - Les boutons doivent être désactivés par défaut (avec l'attribut `disabled`), jusqu'à ce qu'une URL valide soit présente.
 *
 * 2. **Mappage des targets aux handlers** : 
 *    - Ajoutez un mappage dans `paginationTargetHandlers` entre le nom de la cible (par ex. "game-history") et la fonction 
 *      qui mettra à jour le contenu pour cette cible (par ex. `displayGameCards`).
 *    - Par exemple : `"game-history": displayGameCards` associe la cible "game-history" au handler `displayGameCards`.
 *
 * 3. **Utilisation** :
 *    - Importez ce module dans d'autres fichiers où vous souhaitez utiliser la pagination.
 *    - Ajoutez les attributs `data-action`, `data-url` et `data-updatetarget` dans les boutons de pagination.
 *    - Assurez-vous que le handler correspondant à la cible existe dans `paginationTargetHandlers`.
 */
