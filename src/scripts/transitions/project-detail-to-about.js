import gsap from 'gsap';
import { cleanupScrollTriggers } from '../animations.js';
import { scrollToTop } from '../lenis.js';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { stopProjectScroll } from '../project.js';

/**
 * Transition: Project Detail → About
 *
 * Ferme le progress-project, puis rétrécit le project-bg vers la droite
 * pour devenir la sidebar sur la page about.
 */
export default {
    name: 'project-detail-to-about',
    from: { namespace: ['project-detail'] },
    to: { namespace: ['about'] },

    async leave(data) {
        const currentContainer = data.current.container;

        // Sauvegarde l'image et l'URL du projet pour la transition
        const projectBg = currentContainer.querySelector('.project-bg');
        const projectImg = projectBg?.querySelector('img');
        if (projectImg) {
            const savedState = JSON.parse(sessionStorage.getItem('homeSliderState') || '{}');
            savedState.image = projectImg.getAttribute('src');
            savedState.projectUrl = window.location.pathname;
            sessionStorage.setItem('homeSliderState', JSON.stringify(savedState));
        }

        cleanupScrollTriggers();
        stopProjectScroll();

        const navLinks = currentContainer.querySelectorAll('.transition-link');
        const mainProject = currentContainer.querySelector('.mainProject');
        const progressProject = currentContainer.querySelector('.progress-project');
        const projectContentInner = currentContainer.querySelector('.project-content-inner');

        // Clear project content inner transform
        if (projectContentInner) {
            gsap.set(projectContentInner, { clearProps: 'y' });
        }

        // Anime les nav links out
        await gsap.to(navLinks, {
            opacity: 0,
            yPercent: 100,
            duration: 0.3,
            stagger: 0.05,
            ease: 'power2.in',
        });

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

        // Fait disparaître mainProject
        if (mainProject) {
            await gsap.to(mainProject, {
                opacity: 0,
                duration: 0.3,
                ease: 'power2.in',
            });
        }

        // Rétrécit project-bg vers la sidebar à droite (comme home-to-about)
        if (projectBg) {
            await gsap.to(projectBg, {
                width: '7.8rem',
                height: '90%',
                left: 'calc(100% - 7.8rem)',
                top: '5%',
                duration: 0.6,
                ease: 'power2.inOut',
                onComplete: () => {
                    ScrollTrigger.refresh();
                },
            });
        }
    },

    beforeEnter(data) {
        // Cache les nav links de la page about
        const nextContainer = data.next.container;
        const navLinks = nextContainer.querySelectorAll('.transition-link');
        gsap.set(navLinks, { opacity: 0, yPercent: 100 });
    },

    async afterEnter(data) {
        console.log('✨ Transition: Project Detail → About');

        const nextContainer = data.next.container;

        scrollToTop();

        // Met à jour l'image de transition depuis le projet
        const savedState = sessionStorage.getItem('homeSliderState');
        if (savedState) {
            const state = JSON.parse(savedState);
            if (state.image) {
                const img = nextContainer.querySelector('#transition-image');
                if (img) img.src = state.image;
            }
        }

        // Anime les nav links in
        const links = nextContainer.querySelectorAll('.transition-link');
        gsap.to(links, {
            opacity: 1,
            yPercent: 0,
            duration: 0.4,
            stagger: 0.1,
            ease: 'power2.out',
        });

        // Anime la progress-back
        const progress = nextContainer.querySelectorAll('.progress-back');
        gsap.fromTo(
            progress,
            {
                scaleX: 0,
                opacity: 0,
            },
            {
                scaleX: 1,
                opacity: 1,
                transformOrigin: 'right',
                duration: 0.6,
                ease: 'power2.out',
            }
        );

        // Initialise les animations de texte
        await new Promise((resolve) => setTimeout(resolve, 150));

        const { initTextAnimations } = await import('../text-animations.js');
        initTextAnimations();

        if (window.refreshTextAnimationDebugger) {
            window.refreshTextAnimationDebugger();
        }
    },
};
