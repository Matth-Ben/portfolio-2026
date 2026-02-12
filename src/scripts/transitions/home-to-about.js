import { cleanupScrollTriggers } from '../animations.js';
import { scrollToTop, destroyLenis, initLenis } from '../lenis.js';
import { initPageAnimations } from '../animations.js';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import gsap from 'gsap';

/**
 * Transition: Home → About
 * TEMPORAIREMENT DÉSACTIVÉE pour modifications
 */
export default {
    name: 'home-to-about',
    from: { namespace: ['home'] },
    to: { namespace: ['about'] },

    async leave(data) {
        const navLinks = document.querySelectorAll('.transition-link');
        const mainHome = document.querySelector('.mainHome');
        const wrapperProjects = document.querySelector('.wrapperProjects');

        cleanupScrollTriggers();

        // Ensure wrapper is in correct state for transition
        // If in carousel mode, first animate back to full width
        const savedState = sessionStorage.getItem('homeSliderState');
        if (savedState) {
            const state = JSON.parse(savedState);
            if (state.mode === 'carousel' && wrapperProjects) {
                await gsap.to(wrapperProjects, {
                    width: '100%',
                    duration: 0.3,
                    ease: 'power2.out'
                });
            }
        }

        await gsap.to(navLinks, {
            opacity: 0,
            yPercent: 100,
            duration: 0.3,
            stagger: 0.1,
            ease: 'power2.out'
        });

        await gsap.to(mainHome, {
            width: '11.8rem',
            height: '90%',
            left: 'calc(100% - 11.8rem)',
            duration: 0.6,
            ease: 'power2.out',
            onComplete: () => {
                ScrollTrigger.refresh();
            }
        });
    },

    async afterEnter(data) {
        console.log('✨ Page About chargée');
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

        // Réinitialiser les animations de texte pour la nouvelle page
        const { initTextAnimations } = await import('../text-animations.js');
        initTextAnimations();

        // Rafraîchir le debugger (dev only)
        if (window.refreshTextAnimationDebugger) {
            window.refreshTextAnimationDebugger();
        }
    },
};
