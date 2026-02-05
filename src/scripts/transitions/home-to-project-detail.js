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
 * Transition: Home → Project Detail
 * Scale/Zoom avec gradient indigo
 */
export default {
    name: 'home-to-project-detail',
    from: { namespace: ['home'] },
    to: { namespace: ['project-detail'] },

    async leave(data) {
        const currentContainer = data.current.container;

        await fadeOutContent(currentContainer);
        cleanupScrollTriggers();

        // Gradient indigo
        const overlay = createOverlay('#6366f1, #4f46e5');
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

        // Rafraîchir le debugger (dev only)
        if (import.meta.env.DEV && window.refreshTextAnimationDebugger) {
            window.refreshTextAnimationDebugger();
        }

        console.log('✨ Transition: Home → Project Detail');
    },
};
