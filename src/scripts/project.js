import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let scrollTimeline = null;

/**
 * Initialise le scroll en deux phases pour les pages projet :
 *  - Phase 1 : mainHome glisse de y=50vh → y=0
 *  - Phase 2 : le contenu intérieur de progress-project défile vers le haut
 */
export function initProjectScroll() {
    const mainHome = document.querySelector('.mainProject');
    const projectContentInner = document.querySelector('.project-content-inner');

    if (!mainHome || !projectContentInner) return;

    // Phase 1 : hauteur de glissement de mainHome (50% du viewport)
    const phase1Height = window.innerHeight * 0.5 - 52;

    // Phase 2 : hauteur scrollable du contenu inner
    // La zone visible de progress-project depuis le viewport = 50vh (bas du viewport - top de navigation-info)
    const visibleArea = window.innerHeight * 0.5;
    const phase2Height = Math.max(0, projectContentInner.offsetHeight - visibleArea);

    const totalScroll = phase1Height + phase2Height;

    // Rend le document scrollable
    document.body.style.height = `${totalScroll + window.innerHeight}px`;

    // État initial : mainHome décalé vers le bas de 50vh
    gsap.set(mainHome, { y: phase1Height });

    // Timeline scrubée sur le scroll de la page
    scrollTimeline = gsap.timeline({
        scrollTrigger: {
            trigger: document.body,
            start: 'top top',
            end: `+=${totalScroll}`,
            scrub: 1,
        },
    });

    // Phase 1 : mainHome remonte jusqu'en haut
    scrollTimeline.to(mainHome, {
        y: 0,
        ease: 'none',
        duration: phase1Height,
    });

    // Phase 2 : le contenu intérieur défile vers le haut
    if (phase2Height > 0) {
        scrollTimeline.to(
            projectContentInner,
            {
                y: -phase2Height,
                ease: 'none',
                duration: phase2Height,
            },
        );
    }

    ScrollTrigger.refresh();
}

/**
 * Stoppe la timeline et libère le body height SANS toucher aux positions GSAP.
 * À utiliser pendant la transition retour (les positions sont gérées manuellement).
 */
export function stopProjectScroll() {
    if (scrollTimeline) {
        scrollTimeline.kill();
        scrollTimeline = null;
    }
    document.body.style.height = '';
}

/**
 * Nettoie complètement le scroll projet (positions remises à zéro).
 * À utiliser si la page est détruite sans transition visuelle.
 */
export function destroyProjectScroll() {
    if (scrollTimeline) {
        scrollTimeline.kill();
        scrollTimeline = null;
    }

    document.body.style.height = '';

    const mainProject = document.querySelector('.mainProject');
    if (mainProject) gsap.set(mainProject, { clearProps: 'y' });

    const projectContentInner = document.querySelector('.project-content-inner');
    if (projectContentInner) gsap.set(projectContentInner, { clearProps: 'y' });
}
