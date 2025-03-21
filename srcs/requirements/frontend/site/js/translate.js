import { authFetchJson } from "./api.js"

let userId;
let user;

export function loadTranslations(language) {
  fetch(`../language/${language}.json`)
    .then(response => response.json())
    .then(translations => {
      updateTextContent(translations);
    })
    .catch(err => console.error('Erreur de chargement des traductions :', err));
}

function updateTextContent(translations) {
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    if (translations[key]) {
      if (element.placeholder !== undefined) {
        element.placeholder = translations[key];
      } else {
        element.textContent = translations[key];
      }
    }
  });
}

// Fonction pour récupérer l'ID de l'utilisateur connecté via l'API
async function getUserId() {
  try {
    const user = await authFetchJson("api/profile/", { method: "GET" });
    return user.id;  // Récupérer l'ID réel de l'utilisateur connecté
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur", error);
    return null;
  }
}

// Fonction pour stocker la langue dans un cookie avec l'ID de l'utilisateur
function setLanguageInCookie(language, userId) {
  document.cookie = `language_${userId}=${language}; path=/; max-age=31536000`;
  loadTranslations(language);
}

// Fonction pour obtenir la langue à partir du cookie spécifique à l'utilisateur
function getLanguageFromCookie(userId) {
  let cookies = document.cookie.split('; ');
  for (let cookie of cookies) {
    let [name, value] = cookie.split('=');
    if (name === `language_${userId}`) {
      return value;
    }
  }
  return 'en';
}

// Fonction pour changer la langue
async function changeLanguage(language) {
  const userId = await getUserId();
  if (userId) {
    setLanguageInCookie(language, userId);
  }
}

// Fonction pour appliquer la langue sauvegardée au chargement de la page
async function applySavedLanguage() {
  const userId = await getUserId();
  if (userId) {
    let savedLanguage = getLanguageFromCookie(userId);
    if (!savedLanguage) {
      savedLanguage = 'en';
    }
    setLanguageInCookie(savedLanguage, userId);
    loadTranslations(savedLanguage);
  }
}

function addButton()
{
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

export async function doLanguage()
{
  applySavedLanguage();
  addButton();
}

export default doLanguage