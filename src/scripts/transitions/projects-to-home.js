import { cleanupScrollTriggers } from '../animations.js';
import { scrollToTop, destroyLenis, initLenis } from '../lenis.js';
import { initPageAnimations } from '../animations.js';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
    createOverlay,
    removeOverlay,
    fadeOutContent,
    fadeOverlay,
} from './utils.js';

/**
 * Transition: Projects → Home
 * Fade avec gradient blue
 */
export default {
    name: 'projects-to-home',
    from: { namespace: ['projects'] },
    to: { namespace: ['home'] },

    async leave(data) {
        const currentContainer = data.current.container;

        await fadeOutContent(currentContainer);
        cleanupScrollTriggers();

        // Gradient bleu pour le retour
        const overlay = createOverlay('#3b82f6, #2563eb');
        document.body.appendChild(overlay);

        await fadeOverlay(overlay, 'in');
    },

    async afterEnter(data) {
        const overlay = document.getElementById('barba-overlay');
        const container = data.next.container;

        container.style.opacity = '0';
        container.style.visibility = 'visible';

        scrollToTop();
        destroyLenis();
        initLenis();

        await fadeOverlay(overlay, 'out');
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

        console.log('✨ Transition: Projects → Home');
    },
};
