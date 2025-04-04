import navigate from "../router.js";
import { rmKey } from "./pong.js"

export const navigateAction = [
  {
    selector: '[data-action="navigate"]',
    handler: handleNavigate,
  },
];

async function handleNavigate(element, event) {
  rmKey()
  const route = element.getAttribute("href");
  if (route) await navigate(route);
}
