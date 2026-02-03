import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let lenis;

/**
 * Initialise Lenis pour un scroll fluide
 */
export function initLenis() {
    lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
    });

    // Synchroniser Lenis avec GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });

    gsap.ticker.lagSmoothing(0);

    console.log('✅ Lenis initialized');
}

/**
 * Détruit l'instance Lenis
 */
export function destroyLenis() {
    if (lenis) {
        lenis.destroy();
        lenis = null;
        console.log('🗑️ Lenis destroyed');
    }
}

/**
 * Scroll vers le haut de la page
 */
export function scrollToTop() {
    if (lenis) {
        lenis.scrollTo(0, { immediate: true });
    } else {
        window.scrollTo(0, 0);
    }
}
