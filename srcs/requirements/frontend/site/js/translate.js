
// Chargement des traductions à partir d'un fichier JSON
export function loadTranslations(language) {
  fetch(`../lang/${language}.json`)
  .then(response => response.json())
  .then(translations => {
      updateTextContent(translations); // Met à jour le texte des éléments
    })
    .catch(err => console.error('Erreur de chargement des traductions :', err));
}

// Fonction pour mettre à jour le contenu du texte avec les traductions
function updateTextContent(translations) {
  document.querySelectorAll('[data-i18n]').forEach(element => {
    console.log("elem == ", element);
    const key = element.getAttribute('data-i18n');  // Récupère la clé de traduction
    if (translations[key]) {
      element.textContent = translations[key];  // Remplace le texte avec la traduction
    }
  });
}

function changeLanguage(language) {
  localStorage.setItem('language', language);  // Sauvegarde la langue dans localStorage
  loadTranslations(language);  // Applique les traductions pour la nouvelle langue
}

export function doLanguage()
{
    const savedLanguage = localStorage.getItem('language') || 'fr';  // Langue par défaut : anglais
    loadTranslations(savedLanguage);
    const french = document.getElementById('french').addEventListener("click", () => changeLanguage('fr'));
    const english = document.getElementById('english').addEventListener("click", () => changeLanguage('en'));
    const espagnol = document.getElementById('espagnol').addEventListener("click", () => changeLanguage('es'));
}

export default doLanguage