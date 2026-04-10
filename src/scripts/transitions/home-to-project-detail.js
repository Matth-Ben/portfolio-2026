import gsap from 'gsap';
import { cleanupScrollTriggers } from '../animations.js';
import { scrollToTop, destroyLenis, initLenis } from '../lenis.js';
import { initPageAnimations } from '../animations.js';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

/**
 * Transition: Home → Project Detail
 * Le progress-project s'étend depuis la barre de progression vers le bas
 * pour couvrir le viewport, puis disparaît sur la nouvelle page.
 */
export default {
    name: 'home-to-project-detail',
    from: { namespace: ['home'] },
    to: { namespace: ['project-detail'] },

    async leave(data) {
        const currentContainer = data.current.container;
        const slider = window.homeSliderInstance;

        if (slider) slider.stopAutoSlide(false);
        cleanupScrollTriggers();

        const progressBar    = currentContainer.querySelector('.progress-bar');
        const progressProject = currentContainer.querySelector('.progress-project');
        let activeSlide = null;

        // En mode carrousel : prépare le slide actif pour l'animation (sans l'animer encore)
        if (slider?.mode === 'carousel') {
            slider._stopCarouselTicker();

            activeSlide = slider.slides[slider.currentIndex];
            const activeMask = activeSlide?.querySelector('.slider-slide__mask');
            const activeImg  = activeMask?.querySelector('img');

            // Fade out les slides non actifs en arrière-plan (pas d'await)
            const nonActiveSlides = Array.from(slider.slides).filter((_, i) => i !== slider.currentIndex);
            gsap.to(nonActiveSlides, { opacity: 0, duration: 0.3, ease: 'power2.in' });

            // Retire le mode carrousel et recentre le slide actif
            slider.slides.forEach(slide => slide.classList.remove('active'));
            slider.wrapper.classList.remove('carousel-mode');

            gsap.set(activeSlide, { clearProps: 'x,xPercent,yPercent,left,top,zIndex' });
            gsap.set(activeSlide, {
                position: 'absolute',
                inset: 0,
                margin: 'auto',
                width: '43.125rem',
                height: 'auto',
                aspectRatio: '690/432',
                overflow: 'hidden',
            });
            if (activeMask) gsap.set(activeMask, { xPercent: 0, position: '', inset: '', width: '', height: '' });
            if (activeImg)  gsap.set(activeImg,  { xPercent: 0 });
        }

        // progressBar se remplit en premier
        if (progressBar) {
            gsap.killTweensOf(progressBar);
            await gsap.to(progressBar, { scaleX: 1, duration: 0.3, ease: 'power2.out' });
        }

        // Prépare progressProject pour l'animation (position fixed, hauteur 0)
        if (progressProject) {
            gsap.set(progressProject, {
                position: 'fixed',
                top: '50%',
                left: '1.25rem',
                right: '1.25rem',
                width: 'auto',
                height: 0,
                zIndex: 9999,
            });
        }

        // Expansion de l'image + du panneau en simultané
        const animations = [];

        if (activeSlide) {
            animations.push(gsap.to(activeSlide, {
                width: '100%',
                height: '100%',
                duration: 0.6,
                ease: 'power2.inOut',
            }));
        }

        if (progressProject) {
            animations.push(gsap.to(progressProject, {
                height: 'calc(100dvh - 62px)',
                duration: 0.6,
                ease: 'power2.inOut',
            }));
        }

        if (animations.length) await Promise.all(animations);

        // Nettoyage après les animations
        if (activeSlide) {
            gsap.set(activeSlide, { clearProps: 'all' });
        }

        if (progressProject) {
            const uiElements = currentContainer.querySelectorAll(
                '.ts-title, .project-info, .project-counter, .discover-btn, .carousel-btn, .all-projects-btn'
            );
            gsap.set(uiElements, { opacity: 0 });

            progressProject.id = 'project-transition-overlay';
            document.body.appendChild(progressProject);
        }
    },

    beforeEnter(data) {
        // Cache le nouveau container IMMÉDIATEMENT à l'insertion pour éviter tout flash
        const container = data.next.container;
        gsap.set(container, { opacity: 0, visibility: 'visible' });

        // Pré-positionne mainProject à 50vh pour les pages avec scroll projet
        const mainProject = container.querySelector('.mainProject');
        if (mainProject && container.querySelector('.project-content-inner')) {
            gsap.set(mainProject, { y: window.innerHeight * 0.5 - 52 });
        }

        // Cache l'image de fond de la page projet (elle sera révélée plus tard si besoin)
        const projectBg = container.querySelector('.project-bg');
        if (projectBg) gsap.set(projectBg, { opacity: 1 });

        // DEBUG: les 2 containers sont présents ici — on rend le nouveau visible et on pause
        gsap.set(container, { opacity: 1 });
        gsap.globalTimeline.resume()
    },

    async afterEnter(data) {
        const overlay = document.getElementById('project-transition-overlay');
        const container = data.next.container;

        scrollToTop();
        destroyLenis();
        initLenis();

        // Fade in de la nouvelle page et retrait de l'overlay en parallèle
        gsap.to(container, {
            opacity: 1,
            duration: 0.4,
            ease: 'power2.out',
            onComplete: () => ScrollTrigger.refresh(),
        });

        if (overlay) {
            await gsap.to(overlay, {
                opacity: 0,
                duration: 0.4,
                ease: 'power2.out',
            });
            overlay.remove();
        }

        initPageAnimations(true);

        if (window.refreshTextAnimationDebugger) {
            window.refreshTextAnimationDebugger();
        }


        console.log('✨ Transition: Home → Project Detail');
    },
};
