export const translateActions = [
  {
    selector: '[data-action="translate-en"]',
    handler: handleEnglish,
  },
  {
    selector: '[data-action="translate-fr"]',
    handler: handleFrench,
  },
  {
    selector: '[data-action="translate-es"]',
    handler: handleSpanish,
  },
];

export async function loadTranslations(language) {
  try {
    const response = await fetch(`../language/${language}.json`);
    const translations = await response.json();
    return translations;
  } catch (err) {
    console.error("Error loading translations:", err);
    return null;
  }
}

function updateButtonTranslations(button, translations, editKey) {
  button.dataset.editText = translations[editKey]; // Mise à jour de "EDIT"
  button.dataset.saveText = translations[editKey + "_save"]; // On utilise une clé commune "saveGeneral"
}

function replaceWithDataPlaceholders(str, element) {
  return str.replace(/{{(.*?)}}/g, (_, key) => {
    return element.getAttribute(`data-${key}`) || `{{${key}}}`;
  });
}

function applyTranslation(element, translation) {
  const translated = replaceWithDataPlaceholders(translation, element);
  if ("placeholder" in element) {
    element.placeholder = translated;
  } else {
    element.textContent = translated;
  }
}

function updateTextContent(translations, language) {
  document.querySelectorAll('[data-i18n]').forEach(element => {
    const key = element.getAttribute('data-i18n');
    const translation = translations[key];
    if (!translation) return;

    if (element.hasAttribute("data-edit-text") && element.hasAttribute("data-save-text")) {
      updateButtonTranslations(element, translations, key);}
    
    applyTranslation(element, translation);
  });
}

function setLanguageInCookie(language, username) {
  document.cookie = `language_${username}=${language}; path=/; max-age=31536000`;
}

function getLanguageFromCookie(username) {
  let cookies = document.cookie.split("; ");
  for (let cookie of cookies) {
    let [name, value] = cookie.split("=");
    if (name === `language_${username}`) {
      return value;
    }
  }
  return "en";
}

async function changeLanguage(language) {
  const username = sessionStorage.getItem("username");
  if (username) {
    console.log("Loading language for " + username);
    setLanguageInCookie(language, username);
  } else {
    localStorage.setItem("lang", language);
  }
  const translations = await loadTranslations(language);
  if (translations) {
    updateTextContent(translations, language);
  }
}

function handleFrench() {
  changeLanguage("fr");
}

function handleEnglish() {
  changeLanguage("en");
}

function handleSpanish() {
  changeLanguage("es");
}

export async function doLanguage() {
  let savedLanguage;
  
  const username = sessionStorage.getItem("username");
  if (username) {
    savedLanguage = getLanguageFromCookie(username);
  } else {
    savedLanguage = localStorage.getItem("lang");
  }

  const language = savedLanguage || "en";
  await changeLanguage(language);
}

export default doLanguage;
