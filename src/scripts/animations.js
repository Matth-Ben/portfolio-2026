import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/**
 * Initialise les animations GSAP pour les éléments .fade-in
 * @param {boolean} skipImmediate - Si true, n'anime pas immédiatement les éléments visibles
 */
export function initPageAnimations(skipImmediate = false) {
    // Pour les transitions Barba, pas de délai. Pour le chargement initial, petit délai.
    const delay = skipImmediate ? 0 : 100;

    setTimeout(() => {
        const fadeElements = document.querySelectorAll('.fade-in');

        fadeElements.forEach((el, index) => {
            // Vérifier si l'élément est dans le viewport au chargement
            const rect = el.getBoundingClientRect();
            const isInViewport = rect.top < window.innerHeight * 0.8;

            if (isInViewport && !skipImmediate) {
                // Si l'élément est visible ET qu'on ne skip pas, l'animer immédiatement
                gsap.fromTo(
                    el,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.6,
                        delay: index * 0.1, // Délai séquentiel
                        ease: 'power2.out',
                    }
                );
            } else {
                // Utiliser ScrollTrigger pour tous les éléments (ou ceux en dessous)
                gsap.fromTo(
                    el,
                    { opacity: 0, y: 30 },
                    {
                        opacity: 1,
                        y: 0,
                        duration: 0.6,
                        ease: 'power2.out',
                        scrollTrigger: {
                            trigger: el,
                            start: 'top 85%',
                            end: 'top 20%',
                            toggleActions: 'play none none reverse',
                        },
                    }
                );
            }
        });
    }, delay);
}

/**
 * Nettoie tous les ScrollTriggers actifs
 */
export function cleanupScrollTriggers() {
    const triggers = ScrollTrigger.getAll();
    triggers.forEach((trigger) => trigger.kill());
}
