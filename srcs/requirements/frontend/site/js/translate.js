import { authFetchJson, fetchJson } from "./api.js"

export function loadTranslations(language) {
  fetch(`../language/${language}.json`)
    .then(response => response.json())
    .then(translations => {
      updateTextContent(translations, language);
    })
    .catch(err => console.error('Error loading translations:', err));
}


function updateButtonTranslations(button, translations, editKey) {
  button.dataset.editText = translations[editKey];       // Mise à jour de "EDIT"
  button.dataset.saveText = translations[editKey + "_save"]; // On utilise une clé commune "saveGeneral"
}

function replaceWithDataPlaceholders(str, element) {
  return str.replace(/{{(.*?)}}/g, (_, key) => {
    return element.getAttribute(`data-${key}`) || `{{${key}}}`;
  });
}

function updateTextContent(translations, language) {
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');

    if (element.hasAttribute("data-edit-text") && element.hasAttribute("data-save-text")) {
      updateButtonTranslations(element, translations, key);
    }

    if (translations[key] || key === "pending") {
      if (key === "pending") {
        const variable = document.getElementById("pending1");
        const textMap = {
          fr: 'EN ATTENTE',
          es: 'EN ESPERA',
          en: 'PENDING'
        };
        variable.firstChild.textContent = textMap[language] || 'PENDING';
      } else {
        const content = replaceWithDataPlaceholders(translations[key], element);

        if (element.placeholder !== undefined && element.tagName === "INPUT") {
          element.placeholder = content;
        } else {
          element.textContent = content;
        }
      }
    }
  });
}

function setLanguageInCookie(language, username) {
  document.cookie = `language_${username}=${language}; path=/; max-age=31536000`;
  loadTranslations(language);
}

function getLanguageFromCookie(username) {
  let cookies = document.cookie.split('; ');
  for (let cookie of cookies)
  {
    let [name, value] = cookie.split('=');
    if (name === `language_${username}`)
    {
      return value;
    }
  }
  return 'en';
}

async function changeLanguage(language) {
  const username = sessionStorage.getItem("username");
  console.log(username)
  if (username)
  {
    setLanguageInCookie(language, username);
  }
  else
  {
    loadTranslations(language);
    localStorage.setItem('lang', language);
  }
}

async function applySavedLanguage() {
  const username = sessionStorage.getItem("username");

  if (username)
  {
    let savedLanguage = getLanguageFromCookie(username);
    console.log(savedLanguage)
    if (!savedLanguage)
    {
      savedLanguage = 'en';
    }  
    setLanguageInCookie(savedLanguage, username);
    loadTranslations(savedLanguage);
  }
  else
  {
    const savedLang = localStorage.getItem('lang');
    if (savedLang)
      loadTranslations(savedLang);
    else
      loadTranslations('en')
  }
}

function handleFrench() {
  changeLanguage('fr');
}

function handleEnglish() {
  changeLanguage('en');
}

function handleEspagnol() {
  changeLanguage('es');
}

function rmButton() {
  const french = document.getElementById('french');
  const english = document.getElementById('english');
  const espagnol = document.getElementById('espagnol');

  if (french) french.removeEventListener("click", handleFrench);
  if (english) english.removeEventListener("click", handleEnglish);
  if (espagnol) espagnol.removeEventListener("click", handleEspagnol);
}

function addButton() {
  const french = document.getElementById('french');
  const english = document.getElementById('english');
  const espagnol = document.getElementById('espagnol');

  if (french) french.addEventListener("click", handleFrench);
  if (english) english.addEventListener("click", handleEnglish);
  if (espagnol) espagnol.addEventListener("click", handleEspagnol);
}


export async function doLanguage()
{
  applySavedLanguage();
  rmButton();
  addButton();
}

export default doLanguage