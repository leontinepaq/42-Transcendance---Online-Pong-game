export function loadTranslations(language) {
  fetch(`../language/${language}.json`)
    .then(response => response.json())
    .then(translations => {
      updateTextContent(translations); // Met à jour le texte des éléments
    })
    .catch(err => console.error('Erreur de chargement des traductions :', err));
}

// Fonction pour mettre à jour le contenu du texte avec les traductions
function updateTextContent(translations) {
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');  // Récupère la clé de traduction
    if (translations[key]) {
      element.textContent = translations[key];  // Remplace le texte avec la traduction
    }
  });
}

function generateUniqueSessionID() {
  return `user-${Math.random().toString(36).substr(2, 9)}`;
}

function getUserId() {
  let userId = localStorage.getItem('userId');
  if (!userId) {
    userId = generateUniqueSessionID();
    localStorage.setItem('userId', userId);
    return (userId)
  }
  return userId;
  // return window.loggedInUserId || 'user-' + Math.random().toString(36).substr(2, 9);
}

function changeLanguage(language) {
  const userId = getUserId();
  localStorage.setItem(`${userId}_language`, language);
  loadTranslations(language);
}

function applySavedLanguage() {
  const userId = getUserId();
  console.log("userID ==  ", userId)
  let savedLanguage = localStorage.getItem(`${userId}_language`);
  console.log("langue == ", savedLanguage);
  if (!savedLanguage) {
    savedLanguage = 'en';
    localStorage.setItem(`${userId}_language`, savedLanguage);
  }

  loadTranslations(savedLanguage); 
}

export function doLanguage()
{
  applySavedLanguage();
  const french = document.getElementById('french');
  if (french) {
    french.addEventListener("click", () => changeLanguage('fr'));
  }
  const english = document.getElementById('english');
  if (english) {
    english.addEventListener("click", () => changeLanguage('en'));
  }
  const espagnol = document.getElementById('espagnol');
  if (espagnol) {
    espagnol.addEventListener("click", () => changeLanguage('es'));
  }
}



export default doLanguage