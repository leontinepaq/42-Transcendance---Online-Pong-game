import Router from './router.js';

let historyStack = [];
let currentIndex = -1;

function navigateTo(state) {
    if (currentIndex === historyStack.length - 1) {
        historyStack.push(state);  // Add the state if we're at the end of the history stack
    } else {
        // Truncate the forward history if we're in the middle
        historyStack = historyStack.slice(0, currentIndex + 1);
        historyStack.push(state);
    }

    currentIndex++;
    renderPage(state);
}

function renderPage(state) {
    document.getElementById('content').innerText = `Page: ${state.page}`;
}

function goBack() {
    if (currentIndex > 0) {
        currentIndex--;
        renderPage(historyStack[currentIndex]);
    }
}

function goForward() {
    if (currentIndex < historyStack.length - 1) {
        currentIndex++;
        renderPage(historyStack[currentIndex]);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const app = document.getElementById('app');
    const router = new Router(app);
    
    // Start with login view
    router.navigate('login');
});