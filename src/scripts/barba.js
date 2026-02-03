import barba from '@barba/core';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { initPageAnimations, cleanupScrollTriggers } from './animations.js';
import { scrollToTop, destroyLenis, initLenis } from './lenis.js';

/**
 * Initialise Barba.js avec les transitions
 */
export function initBarba() {
    barba.init({
        debug: false,
        transitions: [
            {
                name: 'overlay-transition',

                // Avant de quitter la page
                async leave(data) {
                    const currentContainer = data.current.container;

                    // 1. Faire disparaître le contenu actuel en premier
                    await gsap.to(currentContainer, {
                        opacity: 0,
                        y: -30,
                        duration: 0.3,
                        ease: 'power2.in',
                    });

                    // 2. Nettoyer les ScrollTriggers
                    cleanupScrollTriggers();

                    // 3. Créer l'overlay de transition
                    const overlay = document.createElement('div');
                    overlay.id = 'barba-overlay';
                    overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(to bottom right, #9333ea, #ec4899);
            z-index: 9999;
            transform-origin: left;
          `;
                    document.body.appendChild(overlay);

                    // 4. Animation de l'overlay
                    await gsap.fromTo(
                        overlay,
                        { scaleX: 0 },
                        {
                            scaleX: 1,
                            duration: 0.5,
                            ease: 'power2.inOut',
                        }
                    );
                },

                // Après l'entrée sur la nouvelle page
                async afterEnter(data) {
                    const overlay = document.getElementById('barba-overlay');
                    const container = data.next.container;

                    // Garder le nouveau contenu complètement caché
                    container.style.opacity = '0';
                    container.style.visibility = 'visible';

                    // Scroll to top
                    scrollToTop();

                    // Réinitialiser Lenis d'abord
                    destroyLenis();
                    initLenis();

                    // Initialiser les animations AVANT que l'overlay disparaisse
                    // Utiliser skipImmediate=true pour que tout passe par ScrollTrigger
                    initPageAnimations(true);

                    // Animation de sortie de l'overlay
                    if (overlay) {
                        await gsap.to(overlay, {
                            scaleX: 0,
                            transformOrigin: 'right',
                            duration: 0.5,
                            ease: 'power2.inOut',
                        });
                        overlay.remove();
                    }

                    // Faire apparaître le container - cela déclenchera les ScrollTriggers
                    gsap.to(container, {
                        opacity: 1,
                        duration: 0.3,
                        ease: 'power2.out',
                        onComplete: () => {
                            // Forcer le refresh des ScrollTriggers après que le container soit visible
                            ScrollTrigger.refresh();
                        }
                    });

                    console.log(`📄 Page loaded: ${data.next.namespace}`);
                },
            },
        ],

        // Views spécifiques par namespace
        views: [
            {
                namespace: 'home',
                afterEnter() {
                    console.log('🏠 Home page loaded');
                },
            },
            {
                namespace: 'about',
                afterEnter() {
                    console.log('👤 About page loaded');
                },
            },
            {
                namespace: 'projects',
                afterEnter() {
                    console.log('💼 Projects page loaded');
                },
            },
            {
                namespace: 'contact',
                afterEnter() {
                    console.log('📧 Contact page loaded');
                },
            },
            {
                namespace: 'project-detail',
                afterEnter() {
                    console.log('📁 Project detail page loaded');
                },
            },
        ],
    });

    console.log('✅ Barba.js initialized');
}
