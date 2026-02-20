import gsap from 'gsap';

const SLIDER_STATE_KEY = 'homeSliderState';

function saveSliderState(index, mode = 'slider', image = null) {
    sessionStorage.setItem(SLIDER_STATE_KEY, JSON.stringify({ index, mode, image }));
}

function getSliderState() {
    const saved = sessionStorage.getItem(SLIDER_STATE_KEY);
    return saved ? JSON.parse(saved) : null;
}

/**
 * HomeSlider - Slider on the home page.
 *
 * Two modes:
 * - "slider": fullscreen with mask reveal transitions
 * - "carousel": infinite carousel with progress-based positioning (like projects page)
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
        this.mode = 'slider';

        // Carousel engine state
        this.carouselProgress = 0;
        this.carouselTargetProgress = 0;
        this.carouselItemWidth = 0;
        this.carouselGap = 0;
        this.carouselSpacing = 0;
        this.carouselTotalWidth = 0;
        this.carouselTickerActive = false;
        this.carouselSnapTimeout = 0;
        this.carouselVelocity = 0;
        this.carouselIsScrolling = false;
        this.carouselScrollTimeout = 0;
        this.carouselFriction = 0.95;
        this.carouselSnapThreshold = 0.5;
        this._boundTick = this._carouselTick.bind(this);
        this._boundWheel = this._onCarouselWheel.bind(this);
        this._boundResize = this._onCarouselResize.bind(this);

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
        saveSliderState(this.currentIndex, this.mode, this._getActiveImage());

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
            this._carouselSnapMove(direction);
            return;
        }

        const prevIndex = this.currentIndex;
        const total = this.projects.length;

        this.currentIndex = direction === 'prev'
            ? (this.currentIndex - 1 + total) % total
            : (this.currentIndex + 1) % total;

        this.showSlide(this.currentIndex, prevIndex, direction);
    }

    showSlide(nextIndex, prevIndex, direction) {
        this.isAnimating = true;

        const nextMask = this.slides[nextIndex]?.querySelector('.slider-slide__mask');
        const nextImg = nextMask?.querySelector('img');
        const prevMask = this.slides[prevIndex]?.querySelector('.slider-slide__mask');
        const prevImg = prevMask?.querySelector('img');

        const enter = direction === 'next' ? 100 : -100;
        const exit = -enter;

        this.updateProjectInfo(nextIndex);
        saveSliderState(nextIndex, this.mode, this._getActiveImage(nextIndex));

        const tl = gsap.timeline({
            defaults: { duration: 0.6, ease: 'power2.inOut' },
            onComplete: () => { this.isAnimating = false; },
        });

        tl.fromTo(nextMask, { xPercent: enter }, { xPercent: 0 }, 0);
        tl.fromTo(nextImg, { xPercent: -enter }, { xPercent: 0 }, 0);
        tl.fromTo(prevMask, { xPercent: 0 }, { xPercent: exit }, 0);
        tl.fromTo(prevImg, { xPercent: 0 }, { xPercent: -exit }, 0);
    }

    // ==========================================
    // Carousel Mode Toggle
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
     * 1. Shrink active slide to center (using margin: auto trick)
     * 2. Switch to carousel engine (progress-based positioning)
     */
    _transitionToCarousel() {
        this.isAnimating = true;
        const activeSlide = this.slides[this.currentIndex];
        const activeMask = activeSlide?.querySelector('.slider-slide__mask');
        const activeImg = activeMask?.querySelector('img');

        const tl = gsap.timeline();

        // Step 1: Shrink active slide while keeping it centered
        const targetWidth = 43.125 * 16;
        const targetHeight = targetWidth * (432 / 690);
        gsap.set(activeSlide, { margin: 'auto' });

        tl.to(activeSlide, {
            width: targetWidth,
            height: targetHeight,
            duration: 0.7,
            ease: 'power2.inOut',
        }, 0);

        tl.to(activeMask, { xPercent: 0, duration: 0.7, ease: 'power2.inOut' }, 0);
        tl.to(activeImg, { xPercent: 0, duration: 0.7, ease: 'power2.inOut' }, 0);

        // We need to store data computed inside the callback for step 3
        const entranceData = [];

        // Step 2: Switch to carousel positioning (but ticker not started yet)
        tl.call(() => {
            // Pre-hide ALL non-active slides before any layout change
            this.slides.forEach((slide, i) => {
                if (i !== this.currentIndex) {
                    gsap.set(slide, { visibility: 'hidden', opacity: 0 });
                }
            });

            // Clear margin from shrink animation
            gsap.set(activeSlide, { clearProps: 'margin,inset' });

            // Set active class BEFORE adding carousel-mode to prevent overlay flash
            activeSlide.classList.add('active');

            // Switch to carousel mode layout
            this.wrapper.classList.add('carousel-mode');

            // Calculate carousel dimensions
            this._calculateCarouselDimensions();

            // Set progress so current item is centered
            this.carouselProgress = -this.currentIndex * this.carouselSpacing;
            this.carouselTargetProgress = this.carouselProgress;

            // Position ONLY the active slide via carousel engine
            const halfWidth = this.carouselTotalWidth / 2;
            const wrapFn = gsap.utils.wrap(-halfWidth, halfWidth);

            // Position active slide at center
            const activePos = wrapFn(this.currentIndex * this.carouselSpacing + this.carouselProgress);
            gsap.set(activeSlide, {
                x: activePos,
                xPercent: -50,
                left: '50%',
                top: '50%',
                yPercent: -50,
                position: 'absolute',
                width: '43.125rem',
                height: 'auto',
                aspectRatio: '690/432',
                opacity: 1,
                overflow: 'hidden',
                zIndex: 10,
            });

            // Prepare non-active slides: compute final positions + offset
            this.slides.forEach((slide, i) => {
                if (i !== this.currentIndex) {
                    const initialPos = i * this.carouselSpacing;
                    const wrappedPos = wrapFn(initialPos + this.carouselProgress);
                    const offsetX = wrappedPos >= 0 ? 150 : -150;
                    const distFromCenter = Math.abs(wrappedPos);
                    const maxDist = this.carouselSpacing * 2;
                    const normalizedDist = Math.min(distFromCenter / maxDist, 1);
                    const itemOpacity = gsap.utils.interpolate(1, 0.5, normalizedDist);

                    // Set initial state: offset outward, transparent
                    gsap.set(slide, {
                        visibility: 'visible',
                        opacity: 0,
                        x: wrappedPos + offsetX,
                        xPercent: -50,
                        left: '50%',
                        top: '50%',
                        yPercent: -50,
                        position: 'absolute',
                        width: '43.125rem',
                        height: 'auto',
                        aspectRatio: '690/432',
                        overflow: 'hidden',
                        zIndex: Math.round((1 - normalizedDist) * 10),
                    });

                    // Store target values for the animation
                    entranceData.push({
                        slide,
                        targetX: wrappedPos,
                        targetOpacity: itemOpacity,
                    });
                }
            });

            // Reset masks for carousel display
            this.slides.forEach((slide) => {
                const mask = slide.querySelector('.slider-slide__mask');
                const img = mask?.querySelector('img');
                gsap.set(mask, { xPercent: 0, position: 'relative', inset: 'auto', width: '100%', height: '100%' });
                gsap.set(img, { xPercent: 0 });
            });
        });

        // Step 3: Fade in + slide inward (NO ticker running, so nothing overwrites)
        tl.call(() => {
            entranceData.forEach((data, idx) => {
                gsap.to(data.slide, {
                    opacity: data.targetOpacity,
                    x: data.targetX,
                    duration: 0.6,
                    ease: 'power2.out',
                    delay: idx * 0.03,
                });
            });
        });

        // Step 4: After entrance animation, start the ticker
        tl.call(() => {
            this._carouselRender();
            this._startCarouselTicker();
            this.isAnimating = false;
            this.mode = 'carousel';
            saveSliderState(this.currentIndex, this.mode, this._getActiveImage());
        }, null, `+=${0.6 + entranceData.length * 0.03 + 0.1}`);
    }

    /**
     * Transition: Carousel → Slider
     * 1. Fade out non-active slides
     * 2. Expand active back to fullscreen
     */
    _transitionToSlider() {
        this.isAnimating = true;
        const activeSlide = this.slides[this.currentIndex];
        const activeMask = activeSlide?.querySelector('.slider-slide__mask');
        const activeImg = activeMask?.querySelector('img');

        // Stop the carousel ticker FIRST so _carouselRender() doesn't overwrite animations
        this._stopCarouselTicker();

        const tl = gsap.timeline();

        // Step 1: Fade out + slide outward all non-active slides
        const nonActiveSlides = Array.from(this.slides).filter((_, i) => i !== this.currentIndex);

        const halfWidth = this.carouselTotalWidth / 2;
        const wrapFn = gsap.utils.wrap(-halfWidth, halfWidth);

        nonActiveSlides.forEach((slide) => {
            const i = Array.from(this.slides).indexOf(slide);
            const initialPos = i * this.carouselSpacing;
            const wrappedPos = wrapFn(initialPos + this.carouselProgress);
            const offsetX = wrappedPos >= 0 ? 150 : -150;

            tl.to(slide, {
                opacity: 0,
                x: wrappedPos + offsetX,
                duration: 0.4,
                ease: 'power2.in',
            }, 0);
        });

        // Step 2: Prepare active slide for expansion
        tl.call(() => {

            // Hide non-active slides
            nonActiveSlides.forEach(slide => {
                gsap.set(slide, { visibility: 'hidden' });
            });

            // Remove active classes BEFORE removing carousel-mode to prevent overlay flash
            this.slides.forEach(slide => slide.classList.remove('active'));

            // Remove carousel-mode so the wrapper is back to normal
            this.wrapper.classList.remove('carousel-mode');

            // Set active slide to absolute centered with its current carousel size
            // Using inset:0 + margin:auto for perfect centering during expand
            gsap.set(activeSlide, {
                clearProps: 'x,xPercent,yPercent,left,top,zIndex',
            });
            gsap.set(activeSlide, {
                position: 'absolute',
                inset: 0,
                margin: 'auto',
                width: '43.125rem',
                height: 'auto',
                aspectRatio: '690/432',
                overflow: 'hidden',
            });

            // Reset mask for slider mode
            gsap.set(activeMask, { xPercent: 0, position: '', inset: '', width: '', height: '' });
            gsap.set(activeImg, { xPercent: 0 });
        });

        // Step 3: Expand active slide to fullscreen
        tl.to(activeSlide, {
            width: '100%',
            height: '100%',
            duration: 0.7,
            ease: 'power2.inOut',
            onComplete: () => {
                // Clean up: remove margin auto, restore normal slider state
                gsap.set(activeSlide, { clearProps: 'all' });

                // Restore all slides to slider state
                this.slides.forEach((slide, i) => {
                    gsap.set(slide, { clearProps: 'all' });
                    slide.classList.remove('active');
                    const mask = slide.querySelector('.slider-slide__mask');
                    const img = mask?.querySelector('img');
                    gsap.set(mask, { clearProps: 'all' });
                    gsap.set(img, { clearProps: 'all' });

                    const isActive = i === this.currentIndex;
                    gsap.set(mask, { xPercent: isActive ? 0 : 100 });
                    gsap.set(img, { xPercent: isActive ? 0 : -100 });
                });

                this.isAnimating = false;
                this.mode = 'slider';
                saveSliderState(this.currentIndex, this.mode, this._getActiveImage());
            },
        });
    }

    // ==========================================
    // Carousel Engine (infinite, progress-based)
    // ==========================================

    _calculateCarouselDimensions() {
        this.carouselItemWidth = 43.125 * 16;
        this.carouselGap = 2.5 * 16;
        this.carouselSpacing = this.carouselItemWidth + this.carouselGap;
        this.carouselTotalWidth = this.slides.length * this.carouselSpacing;
    }

    _startCarouselTicker() {
        if (this.carouselTickerActive) return;
        this.carouselTickerActive = true;
        gsap.ticker.add(this._boundTick);
        window.addEventListener('wheel', this._boundWheel, { passive: false });
        window.addEventListener('resize', this._boundResize);
    }

    _stopCarouselTicker() {
        this.carouselTickerActive = false;
        gsap.ticker.remove(this._boundTick);
        window.removeEventListener('wheel', this._boundWheel);
        window.removeEventListener('resize', this._boundResize);
        window.clearTimeout(this.carouselSnapTimeout);
    }

    _onCarouselWheel(e) {
        e.preventDefault();

        // Accumulate velocity from wheel input
        this.carouselVelocity -= e.deltaY * 0.5;
        this.carouselIsScrolling = true;

        // When scrolling pauses: predict landing and snap target
        window.clearTimeout(this.carouselScrollTimeout);
        this.carouselScrollTimeout = window.setTimeout(() => {
            this.carouselIsScrolling = false;

            // Predict where momentum would carry us (geometric series sum)
            const predictedDistance = this.carouselVelocity * this.carouselFriction / (1 - this.carouselFriction);
            const predictedPosition = this.carouselTargetProgress + predictedDistance;

            // Snap to nearest item at predicted position
            const snapped = Math.round(predictedPosition / this.carouselSpacing) * this.carouselSpacing;
            this.carouselTargetProgress = snapped;
            this.carouselVelocity = 0;
        }, 150);
    }

    _onCarouselResize() {
        const oldSpacing = this.carouselSpacing;
        this._calculateCarouselDimensions();

        // Rescale progress so the current item stays centered
        if (oldSpacing > 0) {
            const ratio = this.carouselSpacing / oldSpacing;
            this.carouselProgress *= ratio;
            this.carouselTargetProgress *= ratio;
        }

        this._carouselRender();
    }

    _carouselSnap() {
        const raw = this.carouselTargetProgress / this.carouselSpacing;
        const snapped = Math.round(raw) * this.carouselSpacing;
        this.carouselTargetProgress = snapped;
    }

    _carouselTick() {
        if (!this.carouselTickerActive) return;

        if (this.carouselIsScrolling) {
            // While actively scrolling: apply velocity to target
            this.carouselTargetProgress += this.carouselVelocity;
            this.carouselVelocity *= 0.8;
        }

        // Smooth lerp toward target
        const diff = this.carouselTargetProgress - this.carouselProgress;
        if (Math.abs(diff) < 0.5) {
            this.carouselProgress = this.carouselTargetProgress;
            this._carouselRender();
            this._updateCarouselActiveItem();
        } else {
            this.carouselProgress += diff * 0.08;
            this._carouselRender();
        }
    }

    _carouselRender() {
        const halfWidth = this.carouselTotalWidth / 2;
        const wrapFn = gsap.utils.wrap(-halfWidth, halfWidth);

        this.slides.forEach((slide, i) => {
            const mask = slide.querySelector('.slider-slide__mask');
            const img = mask?.querySelector('img');

            // Reset mask to neutral for carousel display
            gsap.set(mask, { xPercent: 0, position: 'relative', inset: 'auto', width: '100%', height: '100%' });
            gsap.set(img, { xPercent: 0 });

            const initialPos = i * this.carouselSpacing;
            const currentPos = initialPos + this.carouselProgress;
            const wrappedPos = wrapFn(currentPos);

            // Calculate distance from center => scale & opacity
            const distFromCenter = Math.abs(wrappedPos);
            const maxDist = this.carouselSpacing * 2;
            const normalizedDist = Math.min(distFromCenter / maxDist, 1);

            // All items same size, only opacity changes with distance
            const itemOpacity = gsap.utils.interpolate(1, 0.5, normalizedDist);

            gsap.set(slide, {
                x: wrappedPos,
                xPercent: -50,
                left: '50%',
                top: '50%',
                yPercent: -50,
                position: 'absolute',
                width: '43.125rem',
                height: 'auto',
                aspectRatio: '690/432',
                opacity: itemOpacity,
                overflow: 'hidden',
                zIndex: Math.round((1 - normalizedDist) * 10),
            });

            // Toggle active class for CSS overlay
            if (distFromCenter < this.carouselSpacing * 0.5) {
                slide.classList.add('active');
            } else {
                slide.classList.remove('active');
            }
        });
    }

    _updateCarouselActiveItem() {
        const halfWidth = this.carouselTotalWidth / 2;
        const wrapFn = gsap.utils.wrap(-halfWidth, halfWidth);

        let closestIdx = 0;
        let minDist = Infinity;

        this.slides.forEach((slide, i) => {
            const initialPos = i * this.carouselSpacing;
            const currentPos = initialPos + this.carouselProgress;
            const wrappedPos = wrapFn(currentPos);

            if (Math.abs(wrappedPos) < minDist) {
                minDist = Math.abs(wrappedPos);
                closestIdx = i;
            }
        });

        if (closestIdx !== this.currentIndex) {
            this.currentIndex = closestIdx;
            this.updateProjectInfo(this.currentIndex);
            saveSliderState(this.currentIndex, this.mode, this._getActiveImage());
        }
    }

    _carouselSnapMove(direction) {
        this.carouselVelocity = 0;
        this.carouselIsScrolling = false;
        const dir = direction === 'next' ? -1 : 1;
        const currentSnap = Math.round(this.carouselTargetProgress / this.carouselSpacing);
        this.carouselTargetProgress = (currentSnap + dir) * this.carouselSpacing;

        // Pre-update project info for responsiveness
        const total = this.projects.length;
        const nextIndex = ((Math.abs(Math.round(this.carouselTargetProgress / this.carouselSpacing))) % total + total) % total;
        this.updateProjectInfo(nextIndex);
    }

    /**
     * Apply carousel mode instantly (restoring from sessionStorage)
     */
    _applyCarouselModeInstant() {
        this.wrapper.classList.add('carousel-mode');

        // Reset all masks
        this.slides.forEach((slide) => {
            const mask = slide.querySelector('.slider-slide__mask');
            const img = mask?.querySelector('img');
            gsap.set(mask, { clearProps: 'all' });
            gsap.set(img, { clearProps: 'all' });
            gsap.set(slide, { clearProps: 'all' });
        });

        // Initialize carousel engine
        this._calculateCarouselDimensions();
        this.carouselProgress = -this.currentIndex * this.carouselSpacing;
        this.carouselTargetProgress = this.carouselProgress;
        this._carouselRender();
        this._startCarouselTicker();
    }

    // ==========================================
    // Project Info
    // ==========================================

    _getActiveImage(index) {
        const idx = index !== undefined ? index : this.currentIndex;
        const slide = this.slides[idx];
        const img = slide?.querySelector('.slider-slide__mask img');
        return img?.getAttribute('src') || null;
    }

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
        saveSliderState(this.currentIndex, this.mode, this._getActiveImage());
        this._stopCarouselTicker();
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
    if (typeof window !== 'undefined') {
        window.homeSliderInstance = instance;
    }
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
