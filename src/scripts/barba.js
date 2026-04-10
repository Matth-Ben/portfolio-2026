import barba from '@barba/core';
import gsap from 'gsap';

// Import custom transitions
import homeToAbout from './transitions/home-to-about.js';
import aboutToHome from './transitions/about-to-home.js';
import homeToContact from './transitions/home-to-contact.js';
import contactToHome from './transitions/contact-to-home.js';
import homeToProjects from './transitions/home-to-projects.js';
import projectsToHome from './transitions/projects-to-home.js';
import homeToProjectDetail from './transitions/home-to-project-detail.js';
import projectDetailToHome from './transitions/project-detail-to-home.js';
import { initProjectScroll } from './project.js';

// Import initialization functions
import { initPageAnimations, cleanupScrollTriggers } from './animations.js';
import { initTextAnimations, cleanupTextAnimations } from './text-animations.js';

/**
 * Update transition section image based on saved slider state
 */
function updateTransitionImage() {
    const savedState = sessionStorage.getItem('homeSliderState');
    if (savedState) {
        try {
            const state = JSON.parse(savedState);

            if (state.image && state.title) {
                const transitionImg = document.querySelector('.transition-section img');
                if (transitionImg) {
                    transitionImg.src = state.image;
                    transitionImg.alt = state.title;
                    console.log('🖼️ Updated transition image:', state.title);
                }
            }
        } catch (e) {
            console.error('Failed to restore slider state:', e);
        }
    }
}

/**
 * Initialise Barba.js avec les transitions personnalisées
 */
export function initBarba() {
    barba.init({
        debug: true, // ⚠️ MODE DEBUG ACTIVÉ

        // Performance optimizations
        prefetch: true,           // Précharge les pages au survol des liens
        prefetchIgnore: true,     // Ignore les liens externes
        cacheIgnore: false,       // Active le cache des pages visitées
        timeout: 5000,            // Timeout de 5s pour les transitions

        transitions: [
            // Transitions personnalisées (ordre important: du plus spécifique au plus général)
            homeToAbout,
            aboutToHome,
            homeToContact,
            contactToHome,
            homeToProjects,
            projectsToHome,
            homeToProjectDetail,
            projectDetailToHome,
        ],

        // Views spécifiques par namespace
        views: [
            {
                namespace: 'home',
                afterEnter() {
                    // Reinitialize home slider
                    const HomeSlider = window.HomeSlider;
                    if (HomeSlider) {
                        new HomeSlider();
                    }

                    // Reinitialize page animations
                    initPageAnimations(true);

                    // Reinitialize text animations
                    initTextAnimations();
                },
            },
            {
                namespace: 'about',
                afterEnter() {
                    updateTransitionImage();
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
                    updateTransitionImage();
                },
            },
            {
                namespace: 'project-detail',
                afterEnter(data) {
                    // Initialise le scroll à deux phases pour les pages projet qui le supportent
                    const container = data.next?.container ?? document.querySelector('[data-barba-namespace="project-detail"]')?.closest('[data-barba="container"]');
                    if (container?.querySelector('.project-content-inner')) {
                        initProjectScroll();
                    }
                },
            },
        ],

        hooks: {
            before() {
                // Cleanup before transition
                cleanupScrollTriggers();
                cleanupTextAnimations();
            },
            beforeEnter(data) {
                // New container always renders on top of the old one
                if (data?.next?.container) {
                    gsap.set(data.next.container, { zIndex: 51, position: 'relative' });
                }
                if (data?.current?.container) {
                    gsap.set(data.current.container, { zIndex: 50, position: 'relative' });
                }
            },
            after(data) {
                // Reset z-index after transition completes
                if (data?.next?.container) {
                    gsap.set(data.next.container, { zIndex: 'auto', position: 'relative' });
                }
            },
            afterEnter() {
                // Refresh debugger after page transition
                if (window.refreshTextAnimationDebugger) {
                    window.refreshTextAnimationDebugger();
                }

                // Reinitialize animations on all pages (except home which handles it in its view)
                const namespace = document.querySelector('[data-barba-namespace]')?.getAttribute('data-barba-namespace');
                if (namespace !== 'home') {
                    initPageAnimations(true);
                    initTextAnimations();
                }
            }
        }
    });
}
