
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
//   console.log(translations);
//   const test = document.querySelector('[data-i18n="welcome"]');
//   console.log("test == ", test);
//   const test1 = document.getElementById("login-page-title");
//   console.log("test1 == ", test1);
  document.querySelectorAll('[data-i18n]').forEach(element => {
    console.log("elem == ", element);
    const key = element.getAttribute('data-i18n');  // Récupère la clé de traduction
    if (translations[key]) {
      element.textContent = translations[key];  // Remplace le texte avec la traduction
    }
  });
}

// Fonction pour changer la langue
function changeLanguage(language) {
  localStorage.setItem('language', language);  // Sauvegarde la langue dans localStorage
  loadTranslations(language);  // Applique les traductions pour la nouvelle langue
}

export function doLanguage()
{
    const savedLanguage = localStorage.getItem('language') || 'es';  // Langue par défaut : anglais
    console.log("language : ", savedLanguage);
    loadTranslations(savedLanguage);
}

// Ajouter des événements pour changer la langue
// document.querySelector("#change-to-fr").addEventListener("click", () => changeLanguage('fr'));
// document.querySelector("#change-to-en").addEventListener("click", () => changeLanguage('en'));
// document.querySelector("#change-to-en").addEventListener("click", () => changeLanguage('es'));

export default doLanguage