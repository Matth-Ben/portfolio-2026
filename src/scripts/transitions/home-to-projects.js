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
 * Transition: Home → Projects
 * Fade avec gradient orange
 */
export default {
    name: 'home-to-projects',
    from: { namespace: ['home'] },
    to: { namespace: ['projects'] },

    async leave(data) {
        const currentContainer = data.current.container;

        await fadeOutContent(currentContainer);
        cleanupScrollTriggers();

        // Gradient orange
        const overlay = createOverlay('#f97316, #ea580c');
        document.body.appendChild(overlay);

        // Fade in de l'overlay
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

        // Fade out de l'overlay
        await fadeOverlay(overlay, 'out');
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

        console.log('✨ Transition: Home → Projects');
    },
};
