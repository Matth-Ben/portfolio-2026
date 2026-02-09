import { cleanupScrollTriggers } from '../animations.js';
import { scrollToTop, destroyLenis, initLenis } from '../lenis.js';
import { initPageAnimations } from '../animations.js';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import gsap from 'gsap';

import {
    createOverlay,
    removeOverlay,
    fadeOutContent,
    fadeOverlay,
} from './utils.js';

/**
 * Transition: Home → Projects
 * Fade avec gradient orange
 */
export default {
    name: 'home-to-projects',
    from: { namespace: ['home'] },
    to: { namespace: ['projects'] },

    async leave(data) {
        const wrapperProjects = document.querySelector('.wrapperProjects');
        const allProjects = document.querySelector('.all-projects-btn');

        cleanupScrollTriggers();

        gsap.to(allProjects, {
            opacity: 0,
            duration: 0.3,
            ease: 'power2.out'
        });

        await gsap.fromTo(wrapperProjects, {
            width: '100%',
            aspectRatio: '16/9',
            duration: 0.3,
            ease: 'power2.out'
        }, {
            width: '69rem',
            aspectRatio: '16/9',
            duration: 0.3,
            ease: 'power2.out'
        });
    },

    async afterEnter(data) {
        const imageWrappered = document.querySelectorAll('.imageWrappered:not(.active)');

        gsap.fromTo(imageWrappered, {
            opacity: 0,
            duration: 0.3,
            ease: 'power2.out'
        }, {
            opacity: 1,
            duration: 0.3,
            stagger: 0,
            ease: 'power2.out'
        });
    },
};
