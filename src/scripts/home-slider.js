import gsap from 'gsap';

const SLIDER_STATE_KEY = 'homeSliderState';

function saveSliderState(index, mode = 'slider') {
    sessionStorage.setItem(SLIDER_STATE_KEY, JSON.stringify({ index, mode }));
}

function getSliderState() {
    const saved = sessionStorage.getItem(SLIDER_STATE_KEY);
    return saved ? JSON.parse(saved) : null;
}

/**
 * HomeSlider - Slider on the home page.
 * All images are pre-rendered in the DOM, each with its own mask (.slider-slide__mask).
 * Navigation animates slides via xPercent on the mask and counter-translates the image.
 *
 * Supports two modes:
 * - "slider": fullscreen slider with mask reveal transitions
 * - "carousel": 3-item carousel (prev, active, next) with the active item centered
 */
class HomeSlider {
    constructor() {
        this.wrapper = document.querySelector('.wrapperProjects');
        this.slides = document.querySelectorAll('.slider-slide');
        this.prevBtn = document.querySelector('.carousel-btn-prev');
        this.nextBtn = document.querySelector('.carousel-btn-next');
        this.titleEl = document.querySelector('.project-title');
        this.counterEl = document.querySelector('.project-counter');
        this.discoverBtn = document.querySelector('.discover-btn');
        this.allProjectsBtn = document.querySelector('.all-projects-btn');

        this.currentIndex = 0;
        this.projects = [];
        this.isAnimating = false;
        this.mode = 'slider'; // 'slider' or 'carousel'

        if (!this.wrapper || this.slides.length === 0) return;

        this.init();
    }

    init() {
        this.projects = this.parseProjects();

        // Restore saved state
        const savedState = getSliderState();
        if (savedState) {
            this.currentIndex = savedState.index || 0;
            this.mode = savedState.mode || 'slider';
        }

        // Set initial visibility — current slide visible, others hidden
        this.slides.forEach((slide, i) => {
            const mask = slide.querySelector('.slider-slide__mask');
            const img = mask?.querySelector('img');
            const isActive = i === this.currentIndex;

            gsap.set(mask, { xPercent: isActive ? 0 : 100 });
            gsap.set(img, { xPercent: isActive ? 0 : -100 });
        });

        // Update info to match current slide
        this.updateProjectInfo(this.currentIndex);

        // Bind navigation
        this.onPrev = () => this.navigate('prev');
        this.onNext = () => this.navigate('next');
        this.onToggleCarousel = () => this.toggleCarousel();
        this.prevBtn?.addEventListener('click', this.onPrev);
        this.nextBtn?.addEventListener('click', this.onNext);
        this.allProjectsBtn?.addEventListener('click', this.onToggleCarousel);

        // If saved state was carousel, restore it immediately
        if (this.mode === 'carousel') {
            this._applyCarouselModeInstant();
        }
    }

    parseProjects() {
        try {
            return JSON.parse(this.wrapper.getAttribute('data-projects')) || [];
        } catch {
            return [];
        }
    }

    // ==========================================
    // Navigation
    // ==========================================

    navigate(direction) {
        if (this.isAnimating) return;

        if (this.mode === 'carousel') {
            this.navigateCarousel(direction);
            return;
        }

        const prevIndex = this.currentIndex;
        const total = this.projects.length;

        this.currentIndex = direction === 'prev'
            ? (this.currentIndex - 1 + total) % total
            : (this.currentIndex + 1) % total;

        this.showSlide(this.currentIndex, prevIndex, direction);
    }

    /**
     * Animate from prevIndex to nextIndex (slider mode).
     */
    showSlide(nextIndex, prevIndex, direction) {
        this.isAnimating = true;

        const nextMask = this.slides[nextIndex]?.querySelector('.slider-slide__mask');
        const nextImg = nextMask?.querySelector('img');
        const prevMask = this.slides[prevIndex]?.querySelector('.slider-slide__mask');
        const prevImg = prevMask?.querySelector('img');

        const enter = direction === 'next' ? 100 : -100;
        const exit = -enter;

        this.updateProjectInfo(nextIndex);
        saveSliderState(nextIndex, this.mode);

        const tl = gsap.timeline({
            defaults: { duration: 0.6, ease: 'power2.inOut' },
            onComplete: () => { this.isAnimating = false; },
        });

        // Incoming slide
        tl.fromTo(nextMask, { xPercent: enter }, { xPercent: 0 }, 0);
        tl.fromTo(nextImg, { xPercent: -enter }, { xPercent: 0 }, 0);

        // Outgoing slide
        tl.fromTo(prevMask, { xPercent: 0 }, { xPercent: exit }, 0);
        tl.fromTo(prevImg, { xPercent: 0 }, { xPercent: -exit }, 0);
    }

    // ==========================================
    // Carousel Mode
    // ==========================================

    toggleCarousel() {
        if (this.isAnimating) return;

        if (this.mode === 'slider') {
            this._transitionToCarousel();
        } else {
            this._transitionToSlider();
        }
    }

    /**
     * Transition: Slider → Carousel
     * 1. Center the active slide and shrink it
     * 2. Switch to carousel layout (flex)
     * 3. Fade in prev/next slides
     */
    _transitionToCarousel() {
        this.isAnimating = true;
        const total = this.projects.length;
        const activeSlide = this.slides[this.currentIndex];
        const activeMask = activeSlide?.querySelector('.slider-slide__mask');
        const activeImg = activeMask?.querySelector('img');

        const prevIdx = (this.currentIndex - 1 + total) % total;
        const nextIdx = (this.currentIndex + 1) % total;
        const prevSlide = this.slides[prevIdx];
        const nextSlide = this.slides[nextIdx];

        const tl = gsap.timeline();

        // Step 1: Shrink the active slide while keeping it centered.
        // The slide is `position: absolute; inset: 0` which fills the parent.
        // By adding `margin: auto`, the remaining space is distributed equally
        // on all sides, keeping the element perfectly centered as it shrinks.
        gsap.set(activeSlide, { margin: 'auto' });

        tl.to(activeSlide, {
            width: '35vw',
            height: '60vh',
            borderRadius: '0.4rem',
            duration: 0.7,
            ease: 'power2.inOut',
        }, 0);

        // Reset mask transforms to neutral
        tl.to(activeMask, {
            xPercent: 0,
            duration: 0.7,
            ease: 'power2.inOut',
        }, 0);

        tl.to(activeImg, {
            xPercent: 0,
            duration: 0.7,
            ease: 'power2.inOut',
        }, 0);

        // Step 2: After shrink, switch to flex carousel layout
        tl.call(() => {
            // 1. Pre-hide prev/next to prevent any flash
            gsap.set(prevSlide, { opacity: 0, visibility: 'hidden' });
            gsap.set(nextSlide, { opacity: 0, visibility: 'hidden' });

            // 2. Reset all slide masks to neutral position
            this.slides.forEach((slide) => {
                const mask = slide.querySelector('.slider-slide__mask');
                const img = mask?.querySelector('img');
                gsap.set(mask, { xPercent: 0 });
                gsap.set(img, { xPercent: 0 });
            });

            // 3. Switch to carousel layout + apply classes
            //    CSS carousel-active now defines width: 35vw, height: 60vh
            this.wrapper.classList.add('carousel-mode');
            this._applyCarouselClasses();

            // 4. Disable CSS transitions to prevent re-animation
            //    when we clear GSAP inline styles below
            this.slides.forEach(s => s.style.transition = 'none');

            // 5. Clear GSAP inline styles — CSS classes now handle sizing
            //    Without this, GSAP inline overrides would conflict with CSS
            gsap.set(activeSlide, { clearProps: 'all' });
            gsap.set(activeMask, { clearProps: 'all' });
            gsap.set(activeImg, { clearProps: 'all' });

            // 6. Force browser reflow so cleared styles are applied instantly
            void this.wrapper.offsetHeight;

            // 7. Re-enable CSS transitions
            this.slides.forEach(s => s.style.transition = '');

            // 8. Prepare prev/next for fade-in (visible but transparent)
            gsap.set(prevSlide, { visibility: 'visible', opacity: 0 });
            gsap.set(nextSlide, { visibility: 'visible', opacity: 0 });
        });

        // Step 3: Fade in prev/next
        tl.to([prevSlide, nextSlide], {
            opacity: 1,
            duration: 0.5,
            ease: 'power2.out',
            stagger: 0.05,
            onComplete: () => {
                // Let CSS handle opacity via the carousel classes
                gsap.set([prevSlide, nextSlide], { clearProps: 'opacity' });
                this.isAnimating = false;
                this.mode = 'carousel';
                saveSliderState(this.currentIndex, this.mode);
            },
        });
    }

    /**
     * Transition: Carousel → Slider
     * 1. Fade out prev/next
     * 2. Expand active slide to fullscreen
     */
    _transitionToSlider() {
        this.isAnimating = true;
        const total = this.projects.length;
        const prevIdx = (this.currentIndex - 1 + total) % total;
        const nextIdx = (this.currentIndex + 1) % total;
        const prevSlide = this.slides[prevIdx];
        const nextSlide = this.slides[nextIdx];
        const activeSlide = this.slides[this.currentIndex];

        const tl = gsap.timeline();

        // Step 1: Fade out prev/next
        tl.to([prevSlide, nextSlide], {
            opacity: 0,
            duration: 0.35,
            ease: 'power2.in',
        });

        // Step 2: Remove carousel mode, switch back to slider layout
        tl.call(() => {
            this.wrapper.classList.remove('carousel-mode');
            this._removeCarouselClasses();

            // Clear all inline styles
            this.slides.forEach((slide) => {
                gsap.set(slide, { clearProps: 'all' });
                const mask = slide.querySelector('.slider-slide__mask');
                const img = mask?.querySelector('img');
                gsap.set(mask, { clearProps: 'all' });
                gsap.set(img, { clearProps: 'all' });
            });

            // Restore slider state: only active slide visible
            this.slides.forEach((slide, i) => {
                const mask = slide.querySelector('.slider-slide__mask');
                const img = mask?.querySelector('img');
                const isActive = i === this.currentIndex;

                gsap.set(mask, { xPercent: isActive ? 0 : 100 });
                gsap.set(img, { xPercent: isActive ? 0 : -100 });
            });

            // Start active slide slightly scaled down for expand effect
            gsap.set(activeSlide, { scale: 0.9, opacity: 0.8 });
        });

        // Step 3: Scale active slide back to fullscreen
        tl.to(activeSlide, {
            scale: 1,
            opacity: 1,
            duration: 0.5,
            ease: 'power2.out',
            onComplete: () => {
                gsap.set(activeSlide, { clearProps: 'scale,opacity' });
                this.isAnimating = false;
                this.mode = 'slider';
                saveSliderState(this.currentIndex, this.mode);
            },
        });
    }

    /**
     * Navigate in carousel mode using a clean crossfade approach:
     * 1. Fade out current 3 items
     * 2. Update index + reassign classes
     * 3. Fade in new 3 items
     */
    navigateCarousel(direction) {
        this.isAnimating = true;
        const total = this.projects.length;

        // Determine the leaving side
        const oldPrevIdx = (this.currentIndex - 1 + total) % total;
        const oldNextIdx = (this.currentIndex + 1) % total;
        const leavingSlide = direction === 'next'
            ? this.slides[oldPrevIdx]
            : this.slides[oldNextIdx];

        // Update current index
        this.currentIndex = direction === 'prev'
            ? (this.currentIndex - 1 + total) % total
            : (this.currentIndex + 1) % total;

        this.updateProjectInfo(this.currentIndex);
        saveSliderState(this.currentIndex, this.mode);

        // The new incoming slide (the new prev or new next)
        const newIncomingIdx = direction === 'next'
            ? (this.currentIndex + 1) % total
            : (this.currentIndex - 1 + total) % total;
        const incomingSlide = this.slides[newIncomingIdx];

        const tl = gsap.timeline({
            onComplete: () => {
                // Ensure clean state
                gsap.set(incomingSlide, { clearProps: 'opacity' });
                gsap.set(leavingSlide, { clearProps: 'opacity' });
                this.isAnimating = false;
            },
        });

        // Step 1: Fade out the leaving slide
        tl.to(leavingSlide, {
            opacity: 0,
            duration: 0.3,
            ease: 'power2.in',
        });

        // Step 2: Swap classes at the midpoint
        tl.call(() => {
            this._removeCarouselClasses();
            this._applyCarouselClasses();

            // Reset mask on incoming slide
            const inMask = incomingSlide.querySelector('.slider-slide__mask');
            const inImg = inMask?.querySelector('img');
            gsap.set(inMask, { xPercent: 0 });
            gsap.set(inImg, { xPercent: 0 });

            // Start incoming invisible
            gsap.set(incomingSlide, { opacity: 0 });

            // Clear leaving slide inline styles (CSS handles hidden)
            gsap.set(leavingSlide, { clearProps: 'opacity' });
        });

        // Step 3: Fade in the new incoming slide
        tl.to(incomingSlide, {
            opacity: 1,
            duration: 0.35,
            ease: 'power2.out',
        });
    }

    // ==========================================
    // Carousel Helpers
    // ==========================================

    /**
     * Assign carousel-prev, carousel-active, carousel-next, carousel-hidden classes
     */
    _applyCarouselClasses() {
        const total = this.projects.length;
        const prevIdx = (this.currentIndex - 1 + total) % total;
        const nextIdx = (this.currentIndex + 1) % total;

        this.slides.forEach((slide, i) => {
            slide.classList.remove('carousel-prev', 'carousel-active', 'carousel-next', 'carousel-hidden');

            if (i === this.currentIndex) {
                slide.classList.add('carousel-active');
            } else if (i === prevIdx) {
                slide.classList.add('carousel-prev');
            } else if (i === nextIdx) {
                slide.classList.add('carousel-next');
            } else {
                slide.classList.add('carousel-hidden');
            }
        });
    }

    _removeCarouselClasses() {
        this.slides.forEach((slide) => {
            slide.classList.remove('carousel-prev', 'carousel-active', 'carousel-next', 'carousel-hidden');
        });
    }

    /**
     * Apply carousel mode instantly (for restoring from sessionStorage)
     */
    _applyCarouselModeInstant() {
        this.wrapper.classList.add('carousel-mode');
        this._applyCarouselClasses();

        // Reset all mask transforms for carousel display
        this.slides.forEach((slide) => {
            const mask = slide.querySelector('.slider-slide__mask');
            const img = mask?.querySelector('img');
            gsap.set(mask, { xPercent: 0 });
            gsap.set(img, { xPercent: 0 });
            gsap.set(slide, { clearProps: 'all' });
        });
    }

    // ==========================================
    // Project Info
    // ==========================================

    updateProjectInfo(index) {
        const project = this.projects[index];
        if (!project) return;

        if (this.titleEl) {
            this.titleEl.textContent = project.title;
        }

        if (this.counterEl) {
            const current = String(index + 1).padStart(2, '0');
            const total = String(this.projects.length).padStart(2, '0');
            this.counterEl.textContent = `${current} / ${total}`;
        }

        if (this.discoverBtn) {
            this.discoverBtn.href = `/projects/${project.slug}`;
        }
    }

    destroy() {
        saveSliderState(this.currentIndex, this.mode);
        this.prevBtn?.removeEventListener('click', this.onPrev);
        this.nextBtn?.removeEventListener('click', this.onNext);
        this.allProjectsBtn?.removeEventListener('click', this.onToggleCarousel);
    }
}

// Singleton instance
let instance = null;

const init = () => {
    instance?.destroy();
    instance = new HomeSlider();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

if (typeof window !== 'undefined') {
    window.HomeSlider = HomeSlider;
}

export default HomeSlider;
