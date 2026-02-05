import { cleanupScrollTriggers } from '../animations.js';
import { scrollToTop, destroyLenis, initLenis } from '../lenis.js';
import { initPageAnimations } from '../animations.js';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
    createOverlay,
    removeOverlay,
    fadeOutContent,
    scaleOverlay,
} from './utils.js';

/**
 * Transition: Project Detail → Home
 * Scale/Zoom reverse avec gradient violet
 */
export default {
    name: 'project-detail-to-home',
    from: { namespace: ['project-detail'] },
    to: { namespace: ['home'] },

    async leave(data) {
        const currentContainer = data.current.container;

        await fadeOutContent(currentContainer);
        cleanupScrollTriggers();

        // Gradient violet pour le retour
        const overlay = createOverlay('#8b5cf6, #7c3aed');
        document.body.appendChild(overlay);

        // Zoom in effect
        await scaleOverlay(overlay, 'in');
    },

    async afterEnter(data) {
        const overlay = document.getElementById('barba-overlay');
        const container = data.next.container;

        container.style.opacity = '0';
        container.style.visibility = 'visible';

        scrollToTop();
        destroyLenis();
        initLenis();

        // Zoom out effect
        await scaleOverlay(overlay, 'out');
        removeOverlay();

        // Faire apparaître le container ET initialiser les animations en même temps
        await gsap.to(container, {
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

        console.log('✨ Transition: Project Detail → Home');
    },
};
