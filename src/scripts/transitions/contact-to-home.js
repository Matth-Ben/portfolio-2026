import { cleanupScrollTriggers } from '../animations.js';
import { scrollToTop, destroyLenis, initLenis } from '../lenis.js';
import { initPageAnimations } from '../animations.js';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
    createOverlay,
    removeOverlay,
    fadeOutContent,
    slideOverlayVertical,
} from './utils.js';

/**
 * Transition: Contact → Home
 * Slide vertical de bas en haut avec gradient cyan
 */
export default {
    name: 'contact-to-home',
    from: { namespace: ['contact'] },
    to: { namespace: ['home'] },

    async leave(data) {
        const currentContainer = data.current.container;

        await fadeOutContent(currentContainer);
        cleanupScrollTriggers();

        // Gradient cyan pour le retour
        const overlay = createOverlay('#06b6d4, #0891b2');
        document.body.appendChild(overlay);

        // Slide vertical de bas en haut
        await slideOverlayVertical(overlay, 'in', 'bottom');
    },

    async afterEnter(data) {
        const overlay = document.getElementById('barba-overlay');
        const container = data.next.container;

        container.style.opacity = '0';
        container.style.visibility = 'visible';

        scrollToTop();
        destroyLenis();
        initLenis();

        // Slide out vers le haut
        await slideOverlayVertical(overlay, 'out', 'bottom');
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

        // Rafraîchir le debugger (dev only)
        if (window.refreshTextAnimationDebugger) {
            window.refreshTextAnimationDebugger();
        }

        console.log('✨ Transition: Contact → Home');
    },
};
