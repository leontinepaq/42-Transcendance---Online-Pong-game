export function observeAndAttachEvent(id, eventType, callback) {
    const observer = new MutationObserver((mutationsList, observer) => {
        const targetElement = document.getElementById(id);
        if (targetElement) {
            console.log(`Element with ID "${id}" appeared. Adding event listener for "${eventType}".`);
            targetElement.addEventListener(eventType, callback);
        }
    });

    // Start observing the entire document for changes
    observer.observe(document.body, { childList: true, subtree: true });
}

// Example usage: When #myButton appears, add a click event listener to it
// observeAndAttachEvent("myButton", "click", () => {
//     console.log("Button clicked!");
// });

export default observeAndAttachEvent;