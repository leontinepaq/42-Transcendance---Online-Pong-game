import { authFetchJson } from "./api.js"

export function loadTranslations(language) {
  fetch(`../language/${language}.json`)
    .then(response => response.json())
    .then(translations => {
      updateTextContent(translations, language);
    })
    .catch(err => console.error('Erreur de chargement des traductions :', err));
}

function updateTextContent(translations, language) {
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    
    if (translations[key] || key === "pending")
    {
      if (key === "pending")
      {
        const variable = document.getElementById("pending1");
        if (language === "fr")
          variable.firstChild.textContent = 'EN ATTENTE';        
        else if (language === "es")
          variable.firstChild.textContent = 'EN ESPERA';        
        else if (language === "en")
          variable.firstChild.textContent = 'PENDING';
      }
      else if (element.placeholder !== undefined)
      {
        element.placeholder = translations[key];
      }
      else
      {
        element.textContent = translations[key];
      }
    }
  });
}

async function getUserId() {
  try
  {
    const user = await authFetchJson("api/profile/", { method: "GET" });
    return user.id;
  }
  catch (error)
  {
    // console.error("Erreur lors de la récupération de l'utilisateur", error);
    return null;
  }
}

function setLanguageInCookie(language, userId) {
  console.log(userId);
  document.cookie = `language_${userId}=${language}; path=/; max-age=31536000`;
  loadTranslations(language);
}

function getLanguageFromCookie(userId) {
  let cookies = document.cookie.split('; ');
  for (let cookie of cookies)
  {
    let [name, value] = cookie.split('=');
    if (name === `language_${userId}`)
    {
      return value;
    }
  }
  return 'en';
}

async function changeLanguage(language) {
  const userId = await getUserId();
  if (userId)
  {
    setLanguageInCookie(language, userId);
  }
  else
  {
    loadTranslations(language);
  }
}

async function applySavedLanguage() {
  const userId = await getUserId();
  if (userId)
  {
    let savedLanguage = getLanguageFromCookie(userId);
    if (!savedLanguage)
    {
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