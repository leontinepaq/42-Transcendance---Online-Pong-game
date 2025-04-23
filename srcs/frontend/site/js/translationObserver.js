/**
 * PAS MIS EN PLACE MAIS POURRAIT ETRE PAS MAL POUR LIMITER LES APPELS A doLanguages
 * Initialise un observateur pour surveiller les ajouts d'éléments dans le DOM
 * et appliquer automatiquement les traductions via doLanguage().
 */

import doLanguage from "./translate.js";

export function initTranslationObserver() {
  const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
        // Vérifie si l’un des nouveaux noeuds (ou ses enfants) a un data-i18n
        const shouldTranslate = Array.from(mutation.addedNodes).some((node) => {
          if (node.nodeType !== Node.ELEMENT_NODE) return false;
          return (
            node.hasAttribute("data-i18n") ||
            node.querySelector("[data-i18n]") !== null
          );
        });

        if (shouldTranslate) {
          doLanguage();
          break;
        }
      }
    }
  });

  // Observe body and childs
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
  console.log("Translation observer initialized");
}
