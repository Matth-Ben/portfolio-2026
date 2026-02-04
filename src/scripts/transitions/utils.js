import gsap from 'gsap';

/**
 * Utilitaires pour les transitions Barba.js
 */

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
