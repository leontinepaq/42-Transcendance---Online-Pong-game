import { SkyAnimation } from "../background/SkyAnimation.js";
import { PlanetAnimation } from "../background/PlanetAnimation.js";
import { show, hide } from "../utils.js";

export const backgroundAction = [
  {
    selector: '[data-action="toggle-bg"]',
    handler: toggleBackground,
  },
];

async function toggleBackground(element, event) {
  if (element.dataset.mode == "deactivate") {
    element.dataset.mode = "activate";
    SkyAnimation.stop();
    PlanetAnimation.stop();
    hide(document.getElementById("stars"));
  } else {
    element.dataset.mode = "deactivate";
    SkyAnimation.launch();
    show(document.getElementById("stars"));
  }
}
