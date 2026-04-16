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

/**
 * Animation d'apparition des éléments de la page d'accueil
 * Retourne une Promise qui se résout une fois l'animation terminée
 */
export function initHomeEntrance() {
    return new Promise((resolve) => {
        const namespace = document.querySelector('[data-barba-namespace]')?.getAttribute('data-barba-namespace');

        // Ne s'exécute que sur la page d'accueil
        if (namespace !== 'home') {
            resolve();
            return;
        }

        // Sélectionne tous les éléments avec la classe home-entrance-hidden
        const hiddenElements = document.querySelectorAll('.home-entrance-hidden');

        if (hiddenElements.length === 0) {
            resolve();
            return;
        }

        const navLinks = document.querySelectorAll('.mainHome nav a.home-entrance-hidden');
        const title = document.querySelector('.mainHome h1.home-entrance-hidden');
        const progressBack = document.querySelector('.progress-back.home-entrance-hidden');
        const projectInfo = document.querySelector('.project-info.home-entrance-hidden');
        const discoverBtn = document.querySelector('.discover-btn.home-entrance-hidden');
        const carouselBtns = document.querySelectorAll('.carousel-btn.home-entrance-hidden');
        const allProjectsBtn = document.querySelector('.all-projects-btn.home-entrance-hidden');

        // Retire la classe CSS et prépare l'état initial GSAP
        hiddenElements.forEach(el => {
            el.classList.remove('home-entrance-hidden');
        });

        // Set initial state avec GSAP
        if (navLinks.length) gsap.set(navLinks, { opacity: 0, y: -20, visibility: 'visible' });
        if (title) gsap.set(title, { opacity: 0, y: 30, visibility: 'visible' });
        if (progressBack) gsap.set(progressBack, { scaleX: 0, transformOrigin: 'left', visibility: 'visible', opacity: 0.3 });
        if (projectInfo) gsap.set(projectInfo, { opacity: 0, y: 20, visibility: 'visible' });
        if (discoverBtn) gsap.set(discoverBtn, { opacity: 0, y: 20, visibility: 'visible' });
        if (carouselBtns.length) gsap.set(carouselBtns, { opacity: 0, y: 20, visibility: 'visible' });
        if (allProjectsBtn) gsap.set(allProjectsBtn, { opacity: 0, y: 20, visibility: 'visible' });

        // Timeline d'apparition
        const tl = gsap.timeline({
            onComplete: resolve,
        });

        // Animation séquentielle
        if (navLinks.length) {
            tl.to(navLinks, {
                opacity: 1,
                y: 0,
                duration: 0.5,
                stagger: 0.1,
                ease: 'power2.out',
            }, 0);
        }

        if (title) {
            tl.to(title, {
                opacity: 1,
                y: 0,
                duration: 0.6,
                ease: 'power2.out',
            }, 0.2);
        }

        if (progressBack) {
            tl.to(progressBack, {
                scaleX: 1,
                duration: 0.8,
                ease: 'power2.out',
            }, 0.4);
        }

        if (projectInfo) {
            tl.to(projectInfo, {
                opacity: 1,
                y: 0,
                duration: 0.5,
                ease: 'power2.out',
            }, 0.5);
        }

        if (discoverBtn) {
            tl.to(discoverBtn, {
                opacity: 1,
                y: 0,
                duration: 0.5,
                ease: 'power2.out',
            }, 0.6);
        }

        if (carouselBtns.length) {
            tl.to(carouselBtns, {
                opacity: 1,
                y: 0,
                duration: 0.5,
                stagger: 0.1,
                ease: 'power2.out',
            }, 0.7);
        }

        if (allProjectsBtn) {
            tl.to(allProjectsBtn, {
                opacity: 1,
                y: 0,
                duration: 0.5,
                ease: 'power2.out',
            }, 0.8);
        }
    });
}
