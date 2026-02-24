import { initLenis } from './lenis.js';
import { initPageAnimations } from './animations.js';
import { initBarba } from './barba.js';
import { initTextAnimations } from './text-animations.js';
import { initTextAnimationDebugger } from './text-animation-debugger.js';

/**
 * Point d'entrée principal de l'application
 */
async function init() {
    // Attendre que tous les styles CSS soient chargés
    await waitForStyles();

    // 1. Initialiser Lenis pour le smooth scroll
    initLenis();

    // 2. Initialiser les animations de la page
    initPageAnimations();

    // 3. Initialiser les animations de texte (attendre les polices)
    await initTextAnimations();

    // 4. Initialiser Barba.js pour les transitions
    initBarba();

    // 5. Initialiser le debugger d'animations (always active)
    initTextAnimationDebugger();

    // 6. Hide page loader
    hideLoader();
}

/**
 * Hide the page loader with smooth fade-out
 */
function hideLoader() {
    const loader = document.getElementById('page-loader');
    if (loader) {
        loader.classList.add('hidden');
        // Remove from DOM after transition
        setTimeout(() => loader.remove(), 500);
    }
}

/**
 * Attendre que tous les styles CSS soient chargés
 */
function waitForStyles() {
    return new Promise((resolve) => {
        // Si tous les styles sont déjà chargés
        if (document.readyState === 'complete') {
            resolve();
            return;
        }

        // Sinon, attendre l'événement load (DOM + CSS + images)
        window.addEventListener('load', resolve, { once: true });
    });
}

// Lancer l'initialisation
// On utilise DOMContentLoaded pour commencer, puis on attend les styles dans init()
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
