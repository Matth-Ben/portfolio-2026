import gsap from 'gsap';
import { cleanupScrollTriggers, initPageAnimations } from '../animations.js';
import { scrollToTop } from '../lenis.js';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { stopProjectScroll } from '../project.js';
import {
    hideHomeNavInfoInstant,
    animateHomeNavInfoIn,
} from './utils.js';

// Dimensions du slide actif en mode carrousel (doit correspondre à home-slider.js)
const CAROUSEL_WIDTH  = 43.125 * 16;               // 690 px
const CAROUSEL_HEIGHT = CAROUSEL_WIDTH * (432 / 690); // 432 px

/**
 * Transition: Project Detail → Home
 *
 * Mode slider  : progress-project se referme → home slider réapparaît
 * Mode carrousel: progress-project se referme → project-bg rétrécit vers
 *                 les dimensions carrousel (visible pendant le leave) →
 *                 home s'affiche avec le carrousel déjà en place
 */
export default {
    name: 'project-detail-to-home',
    from: { namespace: ['project-detail'] },
    to: { namespace: ['home'] },

    async leave(data) {
        const currentContainer = data.current.container;

        // Lit le mode AVANT l'init du slider home (le constructeur écrasera sessionStorage)
        const savedState = JSON.parse(sessionStorage.getItem('homeSliderState') || 'null');
        const returningToCarousel = savedState?.mode === 'carousel';

        // Fait disparaître le bouton Back
        const backLink = currentContainer.querySelector('.back-link');
        if (backLink) {
            await gsap.to(backLink, {
                opacity: 0,
                y: -10,
                duration: 0.2,
                ease: 'power2.in',
            });
        }

        stopProjectScroll();
        cleanupScrollTriggers();

        const mainProject      = currentContainer.querySelector('.mainProject');
        const progressProject  = currentContainer.querySelector('.progress-project');
        const projectContentInner = currentContainer.querySelector('.project-content-inner');
        const projectBg        = currentContainer.querySelector('.project-bg');

        if (projectContentInner) {
            gsap.set(projectContentInner, { clearProps: 'y' });
        }

        // Ramène mainProject à sa position initiale si l'user a scrollé
        const targetY = window.innerHeight * 0.5 - 52;
        if (mainProject) {
            const currentY = gsap.getProperty(mainProject, 'y');
            if (Math.abs(currentY - targetY) > 5) {
                await gsap.to(mainProject, {
                    y: targetY,
                    duration: 0.4,
                    ease: 'power2.inOut',
                });
            }
        }

        // Referme le panneau de contenu
        if (progressProject) {
            await gsap.to(progressProject, {
                height: 0,
                duration: 0.5,
                ease: 'power2.inOut',
            });
        }

        // Mode carrousel : anime project-bg (encore visible) vers la taille d'un slide carrousel
        // L'astuce margin:auto + inset:0 centre l'élément pendant qu'il rétrécit
        if (returningToCarousel && projectBg) {
            gsap.set(projectBg, { margin: 'auto' });
            await gsap.to(projectBg, {
                width:  CAROUSEL_WIDTH,
                height: CAROUSEL_HEIGHT,
                duration: 0.5,
                ease: 'power2.inOut',
            });
        }
    },

    beforeEnter(data) {
        // Cache slider + navigation-info content, mais PAS les transition-link
        hideHomeNavInfoInstant(data.next.container);
    },

    async afterEnter(data) {
        const nextContainer = data.next.container;

        scrollToTop();

        // Réinitialise le slider home (gère lui-même la restauration du mode carrousel)
        const HomeSliderModule = await import('../home-slider.js');
        const HomeSlider = HomeSliderModule.default;
        if (HomeSlider) {
            new HomeSlider();
        }

        // Anime l'entrée du slider + éléments navigation-info (sans les transition-link)
        await animateHomeNavInfoIn(nextContainer);

        ScrollTrigger.refresh();
        initPageAnimations(true);

        if (window.refreshTextAnimationDebugger) {
            window.refreshTextAnimationDebugger();
        }

        console.log('✨ Transition: Project Detail → Home');
    },
};
