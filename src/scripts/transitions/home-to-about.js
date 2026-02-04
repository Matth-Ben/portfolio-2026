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
        console.log('🚀 TRANSITION DÉCLENCHÉE: Home → About');
        console.log('📦 Data:', data);

        gsap.to(navLinks, {
            opacity: 0,
            yPercent: 100,
            duration: 0.3,
            stagger: 0.1,
            ease: 'power2.out',
            onComplete: () => {
                gsap.to(mainHome, {
                    width: '11.8rem',
                    height: '90%',
                    left: 'calc(100% - 11.8rem)',
                    duration: 0.6,
                    ease: 'power2.out'
                });
            }
        });

        // ⚠️ NAVIGATION BLOQUÉE - Décommentez le code ci-dessous pour activer la transition

        /*
        const currentContainer = data.current.container;

        // Cleanup
        cleanupScrollTriggers();
        
        // Fade out du contenu
        await fadeOutContent(currentContainer);
        */

        // ⚠️ BLOQUER LA NAVIGATION - Rejeter la Promise pour empêcher le changement de page
        return Promise.reject('Navigation bloquée pour debug');
    },

    async afterEnter(data) {
        console.log('✨ Page About chargée');

        /*
        const container = data.next.container;
        
        scrollToTop();
        destroyLenis();
        initLenis();
        
        // Initialiser les animations
        initPageAnimations(true);
        
        // Faire apparaître le container
        gsap.to(container, {
            opacity: 1,
            duration: 0.3,
            ease: 'power2.out',
            onComplete: () => {
                ScrollTrigger.refresh();
            }
        });
        */
    },
};
