import { cleanupScrollTriggers, initPageAnimations } from '../animations.js';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
    animateSplitTextOut,
    animateFadeElementsOut,
    animateHomeUIIn,
} from './utils.js';
import gsap from 'gsap';

/**
 * Transition: About → Home
 * Séquence: textes out → nav links out → sidebar expand
 */
export default {
    name: 'about-to-home',
    from: { namespace: ['about'] },
    to: { namespace: ['home'] },

    async leave(data) {
        const currentContainer = data.current.container;
        const navLinks = document.querySelectorAll('.transition-link');
        const transitionSection = document.querySelector('.transition-section');

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
            ease: 'power2.out'
        });

        // Step 4: Expand sidebar back to fullscreen
        await gsap.to(transitionSection, {
            width: '100%',
            height: '100%',
            left: '0',
            duration: 0.6,
            ease: 'power2.out',
            onComplete: () => {
                ScrollTrigger.refresh();
            }
        });
    },

    async afterEnter(data) {
        console.log('✨ Page Home chargée');

        // Step 1: Reinitialize HomeSlider (must be done before animating UI)
        const HomeSliderModule = await import('../home-slider.js');
        const HomeSlider = HomeSliderModule.default;
        if (HomeSlider) {
            new HomeSlider();
        }

        // Step 2: Animate nav links in
        const links = document.querySelectorAll('.transition-link');
        gsap.fromTo(links,
            { opacity: 0, yPercent: 100 },
            {
                opacity: 1,
                yPercent: 0,
                duration: 0.3,
                stagger: 0.1,
                ease: 'power2.out'
            }
        );

        // Step 3: Animate Home UI elements in with delay
        await animateHomeUIIn({ delay: 0.2 });

        initPageAnimations(true);

        // Rafraîchir le debugger (dev only)
        if (window.refreshTextAnimationDebugger) {
            window.refreshTextAnimationDebugger();
        }
    },
};
