import { initEventDelegation } from "./eventDelegator.js";
import { navigate } from "./router.js";
import { SkyAnimation } from "./background/SkyAnimation.js";
import { doLanguage } from "./translate.js"

document.addEventListener("DOMContentLoaded", () => {
  console.log("Initializing app");
  initEventDelegation();
  SkyAnimation.launch();
  navigate("home");

  // mise en place de la traduction 
  setTimeout(function () {
    doLanguage();
  }, 200);
});

//todo @leontinepaq a revoir..?

// Fonction de réinitialisation légère pour les animations Lottie
function reinitializeLottie(el) {
  const parent = el.parentNode;
  const src = el.getAttribute("src");
  const loop = el.getAttribute("loop");
  const autoplay = el.getAttribute("autoplay");
  const style = el.getAttribute("style");

  parent.removeChild(el);
  const newLottie = document.createElement("dotlottie-wc");
  newLottie.setAttribute("src", src);
  newLottie.setAttribute("loop", loop);
  newLottie.setAttribute("autoplay", autoplay);
  newLottie.setAttribute("style", style);
  parent.appendChild(newLottie);
  console.log("Reloading lottie animation"); //todo @leontinepaq a supp
}

function handleComponentsResize() {
  if (window.dashboardCharts) {
    window.dashboardCharts.forEach((chart) => {
      chart.resize();
    });
  }
  const lottieEls = document.querySelectorAll("dotlottie-wc");
  if (lottieEls) {
    lottieEls.forEach((el) => {
      reinitializeLottie(el);
    });
  }
}

// Utilisation d'un debounce pour limiter le nombre d'exécutions
function debounce(func, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), delay);
  };
}

const handleResize = debounce(() => {
  handleComponentsResize();
}, 150);

window.addEventListener("resize", handleResize);
