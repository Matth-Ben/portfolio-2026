import gsap from 'gsap';
import { cleanupScrollTriggers, initPageAnimations } from '../animations.js';
import { scrollToTop, destroyLenis, initLenis } from '../lenis.js';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import {
    animateSplitTextOut,
    animateFadeElementsOut,
} from './utils.js';

/**
 * Transition: About → Project Detail
 *
 * Étend la sidebar vers le fullscreen puis affiche le contenu du projet.
 */
export default {
    name: 'about-to-project-detail',
    from: { namespace: ['about'] },
    to: { namespace: ['project-detail'] },

    async leave(data) {
        const currentContainer = data.current.container;
        const navLinks = currentContainer.querySelectorAll('.transition-link');
        const transitionSection = currentContainer.querySelector('.transition-section');
        const progress = currentContainer.querySelector('.progress-back');

        cleanupScrollTriggers();

        // Step 1: Anime les textes out
        await animateSplitTextOut(currentContainer, { duration: 0.4, stagger: 0.02 });

        // Step 2: Anime les éléments fade out
        await animateFadeElementsOut(currentContainer, { duration: 0.3 });

        // Step 3: Anime les nav links out
        await gsap.to(navLinks, {
            opacity: 0,
            yPercent: 100,
            duration: 0.3,
            stagger: 0.1,
            ease: 'power2.in',
        });

        // Step 4: Anime la progress-back out
        await gsap.to(progress, {
            scaleX: 0,
            opacity: 0,
            transformOrigin: 'right',
            duration: 0.3,
            ease: 'power2.in',
        });

        // Step 5: Étend la sidebar vers le fullscreen
        await gsap.to(transitionSection, {
            width: '100%',
            height: '100%',
            left: '0',
            top: '0',
            duration: 0.6,
            ease: 'power2.inOut',
            onComplete: () => {
                ScrollTrigger.refresh();
            },
        });
    },

    beforeEnter(data) {
        const container = data.next.container;
        gsap.set(container, { visibility: 'hidden' });

        // Pré-positionne mainProject à 50vh pour les pages avec scroll projet
        const mainProject = container.querySelector('.mainProject');
        if (mainProject && container.querySelector('.project-content-inner')) {
            gsap.set(mainProject, { y: window.innerHeight * 0.5 - 52 });
        }

        // Cache les nav links
        const navLinks = container.querySelectorAll('.transition-link');
        gsap.set(navLinks, { opacity: 0, yPercent: -100 });

        // Cache le progress-project pour l'animer ensuite
        const progressProject = container.querySelector('.progress-project');
        if (progressProject) {
            gsap.set(progressProject, { height: 0 });
        }

        gsap.set(container, { visibility: 'visible' });
    },

    async afterEnter(data) {
        const container = data.next.container;

        scrollToTop();
        destroyLenis();
        initLenis();

        // Fade in de la nouvelle page
        gsap.to(container, {
            opacity: 1,
            duration: 0.4,
            ease: 'power2.out',
            onComplete: () => ScrollTrigger.refresh(),
        });

        // Anime les nav links in
        const navLinks = container.querySelectorAll('.transition-link');
        gsap.to(navLinks, {
            opacity: 1,
            yPercent: 0,
            duration: 0.4,
            stagger: 0.1,
            ease: 'power2.out',
        });

        // Anime le progress-project
        const progressProject = container.querySelector('.progress-project');
        if (progressProject) {
            gsap.to(progressProject, {
                height: 'calc(100dvh - 56px)',
                duration: 0.5,
                ease: 'power2.inOut',
            });
        }

        // Anime le progress-back
        const progressBack = container.querySelector('.progress-back');
        if (progressBack) {
            gsap.fromTo(
                progressBack,
                { scaleX: 0, opacity: 0 },
                {
                    scaleX: 1,
                    opacity: 0.3,
                    transformOrigin: 'left',
                    duration: 0.6,
                    ease: 'power2.out',
                }
            );
        }

        // Assombrit l'overlay de project-bg
        const projectBgOverlay = container.querySelector('.project-bg__overlay');
        if (projectBgOverlay) {
            gsap.to(projectBgOverlay, {
                backgroundColor: '#00000066',
                duration: 0.6,
                ease: 'power2.out',
            });
        }

        initPageAnimations(true);

        // Efface l'URL du projet après la navigation
        const savedState = JSON.parse(sessionStorage.getItem('homeSliderState') || '{}');
        delete savedState.projectUrl;
        sessionStorage.setItem('homeSliderState', JSON.stringify(savedState));

        if (window.refreshTextAnimationDebugger) {
            window.refreshTextAnimationDebugger();
        }

        console.log('✨ Transition: About → Project Detail');
    },
};
