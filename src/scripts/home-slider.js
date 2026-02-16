import gsap from 'gsap';

const SLIDER_STATE_KEY = 'homeSliderState';

function saveSliderState(index) {
    sessionStorage.setItem(SLIDER_STATE_KEY, JSON.stringify({ index }));
}

function getSliderState() {
    const saved = sessionStorage.getItem(SLIDER_STATE_KEY);
    return saved ? JSON.parse(saved) : null;
}

/**
 * HomeSlider - Slider on the home page.
 * All images are pre-rendered in the DOM, each with its own mask (.slider-slide__mask).
 * Navigation animates slides via xPercent on the mask and counter-translates the image.
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

        this.currentIndex = 0;
        this.projects = [];
        this.isAnimating = false;

        if (!this.wrapper || this.slides.length === 0) return;

        this.init();
    }

    init() {
        this.projects = this.parseProjects();

        // Restore saved state
        const savedState = getSliderState();
        if (savedState) {
            this.currentIndex = savedState.index || 0;
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
        this.prevBtn?.addEventListener('click', this.onPrev);
        this.nextBtn?.addEventListener('click', this.onNext);
    }

    parseProjects() {
        try {
            return JSON.parse(this.wrapper.getAttribute('data-projects')) || [];
        } catch {
            return [];
        }
    }

    navigate(direction) {
        if (this.isAnimating) return;

        const prevIndex = this.currentIndex;
        const total = this.projects.length;

        this.currentIndex = direction === 'prev'
            ? (this.currentIndex - 1 + total) % total
            : (this.currentIndex + 1) % total;

        this.showSlide(this.currentIndex, prevIndex, direction);
    }

    /**
     * Animate from prevIndex to nextIndex.
     * Direction determines the slide direction (next = right→left, prev = left→right).
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
        saveSliderState(nextIndex);

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
        saveSliderState(this.currentIndex);
        this.prevBtn?.removeEventListener('click', this.onPrev);
        this.nextBtn?.removeEventListener('click', this.onNext);
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
