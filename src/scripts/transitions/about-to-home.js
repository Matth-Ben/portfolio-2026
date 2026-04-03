import { cleanupScrollTriggers, initPageAnimations } from '../animations.js';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
    animateSplitTextOut,
    animateFadeElementsOut,
    animateHomeUIIn,
    hideHomeContentInstant,
    animateHomeContentIn,
} from './utils.js';
import gsap from 'gsap';

/**
 * Transition: About → Home
 * Séquence: textes out → nav links out → sidebar expand → home content in
 */
export default {
    name: 'about-to-home',
    from: { namespace: ['about'] },
    to: { namespace: ['home'] },

    async leave(data) {
        const currentContainer = data.current.container;
        const navLinks = currentContainer.querySelectorAll('.transition-link');
        const transitionSection = currentContainer.querySelector('.transition-section');
        const progress = currentContainer.querySelector('.progress-back');

        cleanupScrollTriggers();

        // Step 1: Animate split text elements out (h1, skills, description)
        await animateSplitTextOut(currentContainer, { duration: 0.4, stagger: 0.02 });

        // Step 2: Animate fade-in elements out (if any remain)
        await animateFadeElementsOut(currentContainer, { duration: 0.3 });

        // Step 3: Animate nav links out
        await gsap.to(navLinks, {
            opacity: 0,
            yPercent: 100,
            duration: 0.3,
            stagger: 0.1,
            ease: 'power2.in'
        });

        await gsap.to(progress, {
          scaleX: 0,
          opacity: 0,
          transformOrigin: 'right',
          duration: 0.3,
          ease: 'power2.in'
        })

        // Step 4: Expand sidebar back to fullscreen
        await gsap.to(transitionSection, {
            width: '100%',
            height: '100%',
            left: '0',
            duration: 0.6,
            ease: 'power2.inOut',
            onComplete: () => {
                ScrollTrigger.refresh();
            }
        });
    },

    beforeEnter(data) {
        // Hide all Home content BEFORE it becomes visible to prevent flash
        hideHomeContentInstant(data.next.container);
    },

    async afterEnter(data) {
        console.log('✨ Page Home chargée');

        const nextContainer = data.next.container;

        // Step 1: Reinitialize HomeSlider
        const HomeSliderModule = await import('../home-slider.js');
        const HomeSlider = HomeSliderModule.default;
        if (HomeSlider) {
            new HomeSlider();
        }

        // Step 2: Animate all Home content in smoothly
        await animateHomeContentIn(nextContainer);

        initPageAnimations(true);

        // Rafraîchir le debugger (dev only)
        if (window.refreshTextAnimationDebugger) {
            window.refreshTextAnimationDebugger();
        }
    },
};
