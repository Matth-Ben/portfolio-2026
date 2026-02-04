import { cleanupScrollTriggers } from '../animations.js';
import { scrollToTop, destroyLenis, initLenis } from '../lenis.js';
import { initPageAnimations } from '../animations.js';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
    createOverlay,
    removeOverlay,
    fadeOutContent,
    slideOverlay,
} from './utils.js';

/**
 * Transition: Home → About
 * Slide horizontal de gauche à droite avec gradient purple
 */
export default {
    name: 'home-to-about',
    from: { namespace: ['home'] },
    to: { namespace: ['about'] },

    async leave(data) {
        const currentContainer = data.current.container;

        // Fade out du contenu actuel
        await fadeOutContent(currentContainer);

        // Cleanup
        cleanupScrollTriggers();

        // Créer overlay avec gradient purple
        const overlay = createOverlay('#9333ea, #7c3aed');
        document.body.appendChild(overlay);

        // Slide in de gauche à droite
        await slideOverlay(overlay, 'in', 'left');
    },

    async afterEnter(data) {
        const overlay = document.getElementById('barba-overlay');
        const container = data.next.container;

        container.style.opacity = '0';
        container.style.visibility = 'visible';

        scrollToTop();
        destroyLenis();
        initLenis();

        // Slide out vers la droite
        await slideOverlay(overlay, 'out', 'left');
        removeOverlay();

        // Initialiser les animations AVANT de rendre le container visible
        initPageAnimations(true);

        // Faire apparaître le container - les ScrollTriggers se déclencheront
        gsap.to(container, {
            opacity: 1,
            duration: 0.3,
            ease: 'power2.out',
            onComplete: () => {
                ScrollTrigger.refresh();
            }
        });

        console.log('✨ Transition: Home → About');
    },
};
