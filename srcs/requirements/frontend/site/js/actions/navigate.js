import navigate from "../router.js"

export const navigateAction = [
	{
		selector: '[data-action="navigate"]',
		handler: handleNavigate
	}
];

async function handleNavigate(element, event)
{
	console.log("{navigate.js} link clicked", element);
	const route = element.getAttribute('href');
	if (route)
		await navigate(route);
}
