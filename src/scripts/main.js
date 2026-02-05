import { initLenis } from './lenis.js';
import { initPageAnimations } from './animations.js';
import { initBarba } from './barba.js';
import { initTextAnimations } from './text-animations.js';
import { initTextAnimationDebugger } from './text-animation-debugger.js';

/**
 * Point d'entrée principal de l'application
 */
function init() {
    console.log('🚀 Initializing portfolio...');

    // 1. Initialiser Lenis pour le smooth scroll
    initLenis();

    // 2. Initialiser les animations de la page
    initPageAnimations();

    // 3. Initialiser les animations de texte
    initTextAnimations();

    // 4. Initialiser Barba.js pour les transitions
    initBarba();

    // 5. Initialiser le debugger d'animations (dev only)
    if (import.meta.env.DEV) {
        initTextAnimationDebugger();
    }

    console.log('✅ Portfolio initialized successfully');
}

// Lancer l'initialisation quand le DOM est prêt
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
