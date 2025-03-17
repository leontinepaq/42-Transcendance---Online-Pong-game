// Fonction pour récupérer une variable CSS
function getCSSVariable(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
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

function remToPx(remValue) {
  const baseFontSize = parseFloat(
    getComputedStyle(document.documentElement).fontSize
  );
  return parseFloat(remValue) * baseFontSize;
}

// Objet des styles spécifiques à Chart.js
export const chartTheme = {
  fontFamily: getCSSVariable("--chart-font-family"),
  fontSize: (() => {
    const fontSizeRem = getCSSVariable("--chart-font-size");
    return fontSizeRem ? remToPx(fontSizeRem) : 18;
  })(),
  color:
    getCSSVariable("--chart-text-color") || getCSSVariable("--color-accent-light"),
};
