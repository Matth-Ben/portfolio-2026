import { initLenis } from './lenis.js';
import { initPageAnimations, initHomeEntrance } from './animations.js';
import { initBarba } from './barba.js';
import { initTextAnimations } from './text-animations.js';
import { initTextAnimationDebugger } from './text-animation-debugger.js';
import { initLoader, startSlowdown } from './loader.js';

/**
 * Point d'entrée principal de l'application
 */
async function init() {
    // 1. Initialiser le loader carousel immédiatement
    initLoader();

    // Marquer le loader comme prêt (cache le spinner)
    const loader = document.getElementById('page-loader');
    if (loader) loader.classList.add('carousel-ready');

    // Attendre que tous les styles CSS soient chargés
    await waitForStyles();

    // 2. Initialiser Lenis pour le smooth scroll
    initLenis();

    // 3. Initialiser Barba.js pour les transitions (sans lancer les animations)
    initBarba();

    // 4. Commencer le ralentissement du loader et attendre la fin
    // Les animations de page se lancent après la fin du loader
    startSlowdown(async () => {
        // 5. Initialiser les animations de la page après le loader
        initPageAnimations();

        // 6. Initialiser les animations de texte (attendre les polices)
        await initTextAnimations();

        // 7. Initialiser le debugger d'animations
        initTextAnimationDebugger();

        // 8. Animation d'entrée de la page d'accueil, puis démarrage du slider
        await initHomeEntrance();

        // 9. Démarrer le slider après l'animation d'entrée
        if (window.homeSliderInstance) {
            window.homeSliderInstance.start();
        }
    });
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
