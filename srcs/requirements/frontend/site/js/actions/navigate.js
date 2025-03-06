import navigate from "../router.js";

export const navigateAction = [
  {
    selector: '[data-action="navigate"]',
    handler: handleNavigate,
  },
];

async function handleNavigate(element, event) {
  const route = element.getAttribute("href");
  if (route) await navigate(route);
}
