import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';

// Register GSAP plugin
gsap.registerPlugin(SplitText);

/**
 * Utilitaires pour les transitions Barba.js
 */

/**
 * Anime la sortie des éléments UI de la page Home
 * @param {Object} options - Options d'animation
 * @returns {Promise}
 */
export async function animateHomeUIOut(options = {}) {
    const {
        duration = 0.4,
        stagger = 0.05,
        ease = 'power2.in'
    } = options;

    // Stop auto-slide and kill progress bar tweens from HomeSlider
    if (window.homeSliderInstance) {
        window.homeSliderInstance.stopAutoSlide();
    }

    const elements = {
        title: document.querySelector('.mainHome .ts-title'),
        projectInfo: document.querySelector('.project-info'),
        projectCounter: document.querySelector('.project-counter'),
        discoverBtn: document.querySelector('.discover-btn'),
        carouselBtns: document.querySelectorAll('.carousel-btn'),
        allProjectsBtn: document.querySelector('.all-projects-btn'),
        progressBar: document.querySelector('.progress-bar'),
        navigationInfo: document.querySelector('#navigation-info')
    };

    const allElements = [
        elements.title,
        elements.projectInfo,
        elements.discoverBtn,
        ...elements.carouselBtns,
        elements.allProjectsBtn
    ].filter(Boolean);

    // Kill any running tweens on progress bar and animate it out
    if (elements.progressBar) {
        gsap.killTweensOf(elements.progressBar);
        gsap.to(elements.progressBar, {
            scaleX: 0,
            opacity: 0,
            duration: duration * 0.5,
            ease
        });
    }

    if (allElements.length === 0) return;

    // Animate all UI elements out
    await gsap.to(allElements, {
        opacity: 0,
        y: 20,
        duration,
        stagger,
        ease
    });
}

/**
 * Anime l'entrée des éléments UI de la page Home
 * @param {Object} options - Options d'animation
 * @returns {Promise}
 */
export async function animateHomeUIIn(options = {}) {
    const {
        duration = 0.4,
        stagger = 0.05,
        ease = 'power2.out',
        delay = 0
    } = options;

    const elements = {
        title: document.querySelector('.mainHome .ts-title'),
        projectInfo: document.querySelector('.project-info'),
        projectCounter: document.querySelector('.project-counter'),
        discoverBtn: document.querySelector('.discover-btn'),
        carouselBtns: document.querySelectorAll('.carousel-btn'),
        allProjectsBtn: document.querySelector('.all-projects-btn'),
        progressBar: document.querySelector('.progress-bar')
    };

    const allElements = [
        elements.title,
        elements.projectInfo,
        elements.discoverBtn,
        ...elements.carouselBtns,
        elements.allProjectsBtn
    ].filter(Boolean);

    if (allElements.length === 0) return;

    // Reset and animate in
    gsap.set(allElements, { opacity: 0, y: 20 });

    await gsap.to(allElements, {
        opacity: 1,
        y: 0,
        duration,
        stagger,
        delay,
        ease
    });

    // Reset progress bar to initial state (HomeSlider will handle its animation)
    if (elements.progressBar) {
        gsap.set(elements.progressBar, {
            opacity: 1,
            scaleX: 0,
            transformOrigin: 'left'
        });
    }
}

/**
 * Anime la sortie des textes splitText d'une page
 * @param {HTMLElement} container - Le container de la page
 * @param {Object} options - Options d'animation
 * @returns {Promise}
 */
export async function animateSplitTextOut(container, options = {}) {
    const {
        duration = 0.4,
        stagger = 0.02,
        ease = 'power2.in'
    } = options;

    // Find all elements with text-split that have been animated
    const splitElements = container.querySelectorAll('[data-text-split].split-ready');

    if (splitElements.length === 0) return;

    const animations = [];

    splitElements.forEach(element => {
        const splitType = element.dataset.textSplit || 'chars';
        const animation = element.dataset.textAnimation || 'fade';

        // Create a new split for the animation out
        const split = new SplitText(element, {
            type: splitType,
            linesClass: 'split-line',
            wordsClass: 'split-word',
            charsClass: 'split-char'
        });

        let targets;
        switch (splitType) {
            case 'lines':
                targets = split.lines;
                break;
            case 'words':
                targets = split.words;
                break;
            case 'chars':
            default:
                targets = split.chars;
                break;
        }

        if (!targets || targets.length === 0) return;

        // Determine animation out props (reverse of animation in)
        const animProps = {
            opacity: 0,
            duration,
            stagger,
            ease
        };

        switch (animation) {
            case 'slideUp':
                animProps.y = -30;
                break;
            case 'slideDown':
                animProps.y = 30;
                break;
            case 'scale':
                animProps.scale = 0.8;
                break;
        }

        animations.push(gsap.to(targets, animProps));
    });

    if (animations.length > 0) {
        await Promise.all(animations);
    }
}

/**
 * Anime la sortie des éléments avec classe fade-in
 * @param {HTMLElement} container - Le container de la page
 * @param {Object} options - Options d'animation
 * @returns {Promise}
 */
export async function animateFadeElementsOut(container, options = {}) {
    const {
        duration = 0.3,
        stagger = 0.05,
        ease = 'power2.in'
    } = options;

    const fadeElements = container.querySelectorAll('.fade-in');

    if (fadeElements.length === 0) return;

    await gsap.to(fadeElements, {
        opacity: 0,
        y: 20,
        duration,
        stagger,
        ease
    });
}

/**
 * Crée un overlay de transition
 * @param {string} gradient - Classes Tailwind pour le gradient
 * @returns {HTMLElement}
 */
export function createOverlay(gradient = 'from-purple-600 to-pink-600') {
    const overlay = document.createElement('div');
    overlay.id = 'barba-overlay';
    overlay.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to bottom right, ${gradient});
    z-index: 9999;
  `;
    return overlay;
}

/**
 * Supprime l'overlay
 */
export function removeOverlay() {
    const overlay = document.getElementById('barba-overlay');
    if (overlay) {
        overlay.remove();
    }
}

/**
 * Fade out du contenu actuel
 * @param {HTMLElement} container
 * @param {number} duration
 */
export async function fadeOutContent(container, duration = 0.3) {
    await gsap.to(container, {
        opacity: 0,
        y: -30,
        duration,
        ease: 'power2.in',
    });
}

/**
 * Fade in du nouveau contenu
 * @param {HTMLElement} container
 * @param {number} duration
 */
export async function fadeInContent(container, duration = 0.3) {
    await gsap.to(container, {
        opacity: 1,
        y: 0,
        duration,
        ease: 'power2.out',
    });
}

/**
 * Slide overlay horizontal
 * @param {HTMLElement} overlay
 * @param {string} direction - 'in' ou 'out'
 * @param {string} origin - 'left' ou 'right'
 */
export async function slideOverlay(overlay, direction = 'in', origin = 'left') {
    overlay.style.transformOrigin = origin;

    if (direction === 'in') {
        await gsap.fromTo(
            overlay,
            { scaleX: 0 },
            { scaleX: 1, duration: 0.5, ease: 'power2.inOut' }
        );
    } else {
        const exitOrigin = origin === 'left' ? 'right' : 'left';
        overlay.style.transformOrigin = exitOrigin;
        await gsap.to(overlay, {
            scaleX: 0,
            duration: 0.5,
            ease: 'power2.inOut',
        });
    }
}

/**
 * Slide overlay vertical
 * @param {HTMLElement} overlay
 * @param {string} direction - 'in' ou 'out'
 * @param {string} origin - 'top' ou 'bottom'
 */
export async function slideOverlayVertical(overlay, direction = 'in', origin = 'top') {
    overlay.style.transformOrigin = origin;

    if (direction === 'in') {
        await gsap.fromTo(
            overlay,
            { scaleY: 0 },
            { scaleY: 1, duration: 0.5, ease: 'power2.inOut' }
        );
    } else {
        const exitOrigin = origin === 'top' ? 'bottom' : 'top';
        overlay.style.transformOrigin = exitOrigin;
        await gsap.to(overlay, {
            scaleY: 0,
            duration: 0.5,
            ease: 'power2.inOut',
        });
    }
}

/**
 * Fade overlay
 * @param {HTMLElement} overlay
 * @param {string} direction - 'in' ou 'out'
 */
export async function fadeOverlay(overlay, direction = 'in') {
    if (direction === 'in') {
        await gsap.fromTo(
            overlay,
            { opacity: 0 },
            { opacity: 1, duration: 0.4, ease: 'power2.inOut' }
        );
    } else {
        await gsap.to(overlay, {
            opacity: 0,
            duration: 0.4,
            ease: 'power2.inOut',
        });
    }
}

/**
 * Scale overlay (zoom effect)
 * @param {HTMLElement} overlay
 * @param {string} direction - 'in' ou 'out'
 */
export async function scaleOverlay(overlay, direction = 'in') {
    if (direction === 'in') {
        await gsap.fromTo(
            overlay,
            { scale: 0 },
            { scale: 1, duration: 0.5, ease: 'power2.inOut' }
        );
    } else {
        await gsap.to(overlay, {
            scale: 2,
            opacity: 0,
            duration: 0.5,
            ease: 'power2.inOut',
        });
    }
}
