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
import gsap from 'gsap';

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
        const navLinks = document.querySelectorAll('.transition-link');
        const transitionSection = document.querySelector('.transition-section');
        const elemsFadeIn = document.querySelectorAll('.fade-in');

        cleanupScrollTriggers();

        await gsap.to(elemsFadeIn, {
            opacity: 0,
            yPercent: 100,
            duration: 0.3,
            stagger: 0.1,
            ease: 'power2.out'
        });

        await gsap.to(navLinks, {
            opacity: 0,
            yPercent: 100,
            duration: 0.3,
            stagger: 0.1,
            ease: 'power2.out'
        });

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
        const links = document.querySelectorAll('.transition-link');

        gsap.fromTo(links, {
            opacity: 0,
            yPercent: 100,
            duration: 0.3,
            stagger: 0.1,
            ease: 'power2.out'
        }, {
            opacity: 1,
            yPercent: 0,
            duration: 0.3,
            stagger: 0.1,
            ease: 'power2.out',
            onComplete: () => {
                console.log('✨ Links appear');
            }
        })

        initPageAnimations(true);

        // Rafraîchir le debugger (dev only)
        if (window.refreshTextAnimationDebugger) {
            window.refreshTextAnimationDebugger();
        }
    },
};
