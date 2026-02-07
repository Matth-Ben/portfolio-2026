import { cleanupScrollTriggers } from '../animations.js';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import gsap from 'gsap';

/**
 * Transition: Home → Contact
 * Slide horizontal de gauche à droite avec gradient pink
 */
export default {
    name: 'home-to-contact',
    from: { namespace: ['home'] },
    to: { namespace: ['contact'] },

    async leave(data) {
        const navLinks = document.querySelectorAll('.transition-link');
        const mainHome = document.querySelector('.mainHome');

        cleanupScrollTriggers();

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
            right: 'calc(100% - 11.8rem)',
            duration: 0.6,
            ease: 'power2.out',
            onComplete: () => {
                ScrollTrigger.refresh();
            }
        });
    },

    async afterEnter(data) {
        console.log('✨ Page Contact chargée');
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
