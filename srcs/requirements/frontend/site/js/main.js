import { initEventDelegation } from "./eventDelegator.js";
import { navigate } from "./router.js";
import { SkyAnimation } from "./background/SkyAnimation.js";
// import { initTranslationObserver } from "./translationObserver.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log("Initializing app");
  initEventDelegation(); // Event delegation for clicks on buttons
  // initTranslationObserver(); // Automatic translation when body changes / not set-up and tested properly
  SkyAnimation.launch(); // Background animation
  navigate("home");
});



// Fonction de réinitialisation légère pour les animations Lottie
function reinitializeLottie(el) {
  if (!el.offsetParent) return; //if d-none

  const parent = el.parentNode;
  const newLottie = document.createElement("dotlottie-wc");

  ["src", "loop", "autoplay", "style"].forEach((attr) => {
    const value = el.getAttribute(attr);
    newLottie.setAttribute(attr, value);
  });

  parent.replaceChild(newLottie, el);
  console.log("Reloaded Lottie animation");
}

function handleComponentsResize() {
  if (window.dashboardCharts) {
    window.dashboardCharts.forEach((chart) => {
      chart.resize();
    });
  }
  const lottieEls = document.querySelectorAll("dotlottie-wc");
  lottieEls.forEach(reinitializeLottie);
}

// Utilisation d'un debounce pour limiter le nombre d'exécutions
function debounce(func, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
}

window.addEventListener("resize", debounce(handleComponentsResize, 150));
