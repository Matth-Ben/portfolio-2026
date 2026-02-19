import { cleanupScrollTriggers } from '../animations.js';
import { scrollToTop, destroyLenis, initLenis } from '../lenis.js';
import { initPageAnimations } from '../animations.js';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import gsap from 'gsap';

/**
 * Transition: Home → About
 * TEMPORAIREMENT DÉSACTIVÉE pour modifications
 */
export default {
    name: 'home-to-about',
    from: { namespace: ['home'] },
    to: { namespace: ['about'] },

    async leave(data) {
        const navLinks = document.querySelectorAll('.transition-link');
        const mainHome = document.querySelector('.mainHome');
        const wrapperProjects = document.querySelector('.wrapperProjects');

        cleanupScrollTriggers();

        // Save the active slide image for the transition
        const activeSlide = wrapperProjects?.querySelector('.slider-slide[data-index]');
        const savedState = sessionStorage.getItem('homeSliderState');
        if (savedState) {
            const state = JSON.parse(savedState);
            // Get image from the active slide in the DOM
            const activeIndex = state.index || 0;
            const slide = wrapperProjects?.querySelectorAll('.slider-slide')[activeIndex];
            const imgEl = slide?.querySelector('.slider-slide__mask img');
            if (imgEl) {
                state.image = imgEl.getAttribute('src');
                sessionStorage.setItem('homeSliderState', JSON.stringify(state));
            }
            if (state.mode === 'carousel' && wrapperProjects) {
                // Stop the carousel ticker
                if (window.homeSliderInstance?._stopCarouselTicker) {
                    window.homeSliderInstance._stopCarouselTicker();
                }
                // Fade out + slide outward non-active carousel slides
                const allSlides = wrapperProjects.querySelectorAll('.slider-slide');
                const nonActive = Array.from(allSlides).filter((_, i) => i !== activeIndex);

                const inst = window.homeSliderInstance;
                const halfWidth = inst?.carouselTotalWidth / 2;
                const wrapFn = gsap.utils.wrap(-halfWidth, halfWidth);

                // Also fade out UI elements (buttons, project info)
                const uiElements = document.querySelectorAll('.carousel-btn, .discover-btn, .all-projects-btn, .project-info, .project-counter');

                const slideOutPromises = nonActive.map((s) => {
                    const i = Array.from(allSlides).indexOf(s);
                    const initialPos = i * inst.carouselSpacing;
                    const wrappedPos = wrapFn(initialPos + inst.carouselProgress);
                    const offsetX = wrappedPos >= 0 ? 150 : -150;

                    return gsap.to(s, {
                        opacity: 0,
                        x: wrappedPos + offsetX,
                        duration: 0.4,
                        ease: 'power2.in',
                    });
                });

                // Fade out UI elements in parallel
                slideOutPromises.push(
                    gsap.to(uiElements, {
                        opacity: 0,
                        duration: 0.3,
                        ease: 'power2.in',
                    })
                );

                await Promise.all(slideOutPromises);

                // Hide non-active slides
                nonActive.forEach(s => gsap.set(s, { visibility: 'hidden' }));

                // Expand active slide to fullscreen
                if (slide) {
                    gsap.set(slide, {
                        clearProps: 'x,xPercent,yPercent,left,top,scale,zIndex',
                    });
                    gsap.set(slide, {
                        position: 'absolute',
                        inset: 0,
                        margin: 'auto',
                        width: '690px',
                        height: '432px',
                        borderRadius: '0.4rem',
                        overflow: 'hidden',
                    });

                    // Reset mask
                    const mask = slide.querySelector('.slider-slide__mask');
                    const maskImg = mask?.querySelector('img');
                    gsap.set(mask, { xPercent: 0, position: 'relative', inset: 'auto', width: '100%', height: '100%' });
                    gsap.set(maskImg, { xPercent: 0 });

                    await gsap.to(slide, {
                        width: '100%',
                        height: '100%',
                        borderRadius: '0rem',
                        duration: 0.5,
                        ease: 'power2.inOut',
                    });

                    gsap.set(slide, { clearProps: 'margin,borderRadius,overflow' });
                }

                wrapperProjects.classList.remove('carousel-mode');
            }
        }

        await gsap.to(navLinks, {
            opacity: 0,
            yPercent: 100,
            duration: 0.3,
            stagger: 0.1,
            ease: 'power2.out'
        });

        await gsap.to(mainHome, {
            width: '11.8rem',
            height: '90%',
            left: 'calc(100% - 11.8rem)',
            duration: 0.6,
            ease: 'power2.out',
            onComplete: () => {
                ScrollTrigger.refresh();
            }
        });
    },

    async afterEnter(data) {
        console.log('✨ Page About chargée');

        // Update transition image from slider state
        const savedState = sessionStorage.getItem('homeSliderState');
        if (savedState) {
            const state = JSON.parse(savedState);
            if (state.image) {
                const img = data.next.container.querySelector('#transition-image');
                if (img) img.src = state.image;
            }
        }

        const links = document.querySelectorAll('.transition-link');

        gsap.fromTo(links, {
            opacity: 0,
            yPercent: 100,
            duration: 0.3,
            stagger: 0.1,
            ease: 'power2.out'
        }, {
            opacity: 1,
            yPercent: 0,
            duration: 0.3,
            stagger: 0.1,
            ease: 'power2.out',
            onComplete: () => {
                console.log('✨ Links appear');
            }
        })

        // Réinitialiser les animations de texte pour la nouvelle page
        const { initTextAnimations } = await import('../text-animations.js');
        initTextAnimations();

        // Rafraîchir le debugger (dev only)
        if (window.refreshTextAnimationDebugger) {
            window.refreshTextAnimationDebugger();
        }
    },
};
