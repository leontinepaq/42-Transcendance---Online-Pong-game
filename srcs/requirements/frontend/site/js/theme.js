// Fonction pour récupérer une variable CSS
function getCSSVariable(name) {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}

// Objet des couleurs basé sur les variables CSS
export const colors = {
  dark: getCSSVariable("--color-dark"),
  light: getCSSVariable("--color-light"),
  accent: getCSSVariable("--color-accent"),
  accentLight: getCSSVariable("--color-accent-light"),
  accentSecondary: getCSSVariable("--color-accent-secondary"),
  accentTertiary: getCSSVariable("--color-accent-tertiary"),
  darkTransparent: getCSSVariable("--color-dark-transparent"),
  lightTransparent: getCSSVariable("--color-light-transparent"),
  accentTransparent: getCSSVariable("--color-accent-transparent"),
};
