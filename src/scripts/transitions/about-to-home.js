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
 * Transition: About → Home
 * Slide horizontal de droite à gauche avec gradient green
 */
export default {
    name: 'about-to-home',
    from: { namespace: ['about'] },
    to: { namespace: ['home'] },

    async leave(data) {
        const currentContainer = data.current.container;

        await fadeOutContent(currentContainer);
        cleanupScrollTriggers();

        // Gradient vert pour le retour
        const overlay = createOverlay('#10b981, #059669');
        document.body.appendChild(overlay);

        // Slide in de droite à gauche
        await slideOverlay(overlay, 'in', 'right');
    },

    async afterEnter(data) {
        const overlay = document.getElementById('barba-overlay');
        const container = data.next.container;

        container.style.opacity = '0';
        container.style.visibility = 'visible';

        scrollToTop();
        destroyLenis();
        initLenis();

        // Slide out vers la gauche
        await slideOverlay(overlay, 'out', 'right');
        removeOverlay();

        // Faire apparaître le container ET initialiser les animations en même temps
        gsap.to(container, {
            opacity: 1,
            duration: 0.3,
            ease: 'power2.out',
            onComplete: () => {
                ScrollTrigger.refresh();
            }
        });

        initPageAnimations(true);

        console.log('✨ Transition: About → Home');
    },
};
