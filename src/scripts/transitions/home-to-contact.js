import { cleanupScrollTriggers } from '../animations.js';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { animateHomeUIOut } from './utils.js';
import gsap from 'gsap';

/**
 * Transition: Home → Contact
 * Séquence: UI out → nav links out → sidebar shrink (vers la gauche)
 */
export default {
    name: 'home-to-contact',
    from: { namespace: ['home'] },
    to: { namespace: ['contact'] },

    async leave(data) {
        const navLinks = document.querySelectorAll('.transition-link');
        const mainHome = document.querySelector('.mainHome');
        const wrapperProjects = document.querySelector('.wrapperProjects');

        cleanupScrollTriggers();

        // Save the active slide image for the transition
        const savedState = sessionStorage.getItem('homeSliderState');
        let activeIndex = 0;
        let slide = null;

        if (savedState) {
            const state = JSON.parse(savedState);
            activeIndex = state.index || 0;
            slide = wrapperProjects?.querySelectorAll('.slider-slide')[activeIndex];
            const imgEl = slide?.querySelector('.slider-slide__mask img');
            if (imgEl) {
                state.image = imgEl.getAttribute('src');
                sessionStorage.setItem('homeSliderState', JSON.stringify(state));
            }

            // Handle carousel mode collapse
            if (state.mode === 'carousel' && wrapperProjects) {
                if (window.homeSliderInstance?._stopCarouselTicker) {
                    window.homeSliderInstance._stopCarouselTicker();
                }

                const allSlides = wrapperProjects.querySelectorAll('.slider-slide');
                const nonActive = Array.from(allSlides).filter((_, i) => i !== activeIndex);

                const inst = window.homeSliderInstance;
                const halfWidth = inst?.carouselTotalWidth / 2;
                const wrapFn = gsap.utils.wrap(-halfWidth, halfWidth);

                // Slide out non-active carousel slides
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

                await Promise.all(slideOutPromises);
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

        // Step 1: Animate UI elements out (title, buttons, project info)
        await animateHomeUIOut({ duration: 0.4, stagger: 0.03 });

        // Step 2: Animate nav links out
        await gsap.to(navLinks, {
            opacity: 0,
            yPercent: 100,
            duration: 0.3,
            stagger: 0.1,
            ease: 'power2.out'
        });

        // Step 3: Shrink sidebar (to the left)
        await gsap.to(mainHome, {
            width: '7.8rem',
            height: '90%',
            right: 'calc(100% - 7.8rem)',
            duration: 0.6,
            ease: 'power2.out',
            onComplete: () => {
                ScrollTrigger.refresh();
            }
        });
    },

    async afterEnter(data) {
        console.log('✨ Page Contact chargée');

        // Update transition image from slider state
        const savedState = sessionStorage.getItem('homeSliderState');
        if (savedState) {
            const state = JSON.parse(savedState);
            if (state.image) {
                const img = data.next.container.querySelector('#transition-image');
                if (img) img.src = state.image;
            }
        }

        // Step 1: Animate nav links in
        const links = document.querySelectorAll('.transition-link');
        gsap.fromTo(links,
            { opacity: 0, yPercent: 100 },
            {
                opacity: 1,
                yPercent: 0,
                duration: 0.3,
                stagger: 0.1,
                ease: 'power2.out'
            }
        );

        const progress = document.querySelectorAll('.progress-back');
        gsap.fromTo(progress, {
          scaleX: 0,
          opacity: 0
        }, {
          scaleX: 1,
          opacity: 1,
          transformOrigin: 'left',
          duration: 0.6,
          ease: 'power2.out'
        })

        // Step 2: Initialize text animations with a small delay for smooth sequencing
        await new Promise(resolve => setTimeout(resolve, 150));

        const { initTextAnimations } = await import('../text-animations.js');
        initTextAnimations();

        // Rafraîchir le debugger (dev only)
        if (window.refreshTextAnimationDebugger) {
            window.refreshTextAnimationDebugger();
        }
    },
};
