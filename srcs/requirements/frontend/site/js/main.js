import { initEventDelegation } from "./eventDelegator.js";
import { authRedirector, navigate } from "./router.js";
import { SkyAnimation } from "./background/SkyAnimation.js";

document.addEventListener("DOMContentLoaded", () => {
  console.log("Initializing app");
  initEventDelegation();
  SkyAnimation.launch();
  navigate("home");
});

//todo @leontinepaq a revoir..?

// Fonction de réinitialisation légère pour les animations Lottie
function reinitializeLottie(el) {
  const parent = el.parentNode;
  const src = el.getAttribute("src");
  const loop = el.getAttribute("loop");
  const autoplay = el.getAttribute("autoplay");

  parent.removeChild(el);
  const newLottie = document.createElement("dotlottie-wc");
  newLottie.setAttribute("src", src);
  newLottie.setAttribute("loop", loop);
  newLottie.setAttribute("autoplay", autoplay);
  newLottie.style.width = "100%";
  newLottie.style.height = "100%";
  parent.appendChild(newLottie);
}

function handleComponentsResize() {
  // window.dashboardCharts.forEach((chart) => {
  //   chart.resize();
  // });
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
