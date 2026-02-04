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
 * Transition: Home → Contact
 * Slide vertical de haut en bas avec gradient pink
 */
export default {
    name: 'home-to-contact',
    from: { namespace: ['home'] },
    to: { namespace: ['contact'] },

    async leave(data) {
        const currentContainer = data.current.container;

        await fadeOutContent(currentContainer);
        cleanupScrollTriggers();

        // Gradient rose/pink
        const overlay = createOverlay('#ec4899, #db2777');
        document.body.appendChild(overlay);

        // Slide vertical de haut en bas
        await slideOverlayVertical(overlay, 'in', 'top');
    },

    async afterEnter(data) {
        const overlay = document.getElementById('barba-overlay');
        const container = data.next.container;

        container.style.opacity = '0';
        container.style.visibility = 'visible';

        scrollToTop();
        destroyLenis();
        initLenis();

        // Slide out vers le bas
        await slideOverlayVertical(overlay, 'out', 'top');
        removeOverlay();

        // Faire apparaître le container
        await gsap.to(container, {
            opacity: 1,
            duration: 0.3,
            ease: 'power2.out',
            onComplete: () => {
                ScrollTrigger.refresh();
            }
        });

        initPageAnimations(true);

        console.log('✨ Transition: Home → Contact');
    },
};
