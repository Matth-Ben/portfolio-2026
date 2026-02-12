import gsap from 'gsap';

// State management for slider persistence across page transitions
const SLIDER_STATE_KEY = 'homeSliderState';

function saveSliderState(index, mode, project = null) {
    const state = { index, mode };
    if (project) {
        state.image = project.image;
        state.title = project.title;
    }
    sessionStorage.setItem(SLIDER_STATE_KEY, JSON.stringify(state));
}

function getSliderState() {
    const saved = sessionStorage.getItem(SLIDER_STATE_KEY);
    return saved ? JSON.parse(saved) : null;
}

function clearSliderState() {
    sessionStorage.removeItem(SLIDER_STATE_KEY);
}

/**
 * HomeSlider - Manages two view modes on the home page:
 * 1. Slider Mode (default): Single large project image with prev/next navigation
 * 2. Carousel Mode: Vertical infinite carousel showing all projects
 */
class HomeSlider {
    constructor() {
        this.track = document.querySelector('.wrapperProjects');
        this.items = null; // Will be populated based on mode
        this.prevBtn = document.querySelector('.carousel-btn-prev');
        this.nextBtn = document.querySelector('.carousel-btn-next');
        this.toggleBtn = document.querySelector('.all-projects-btn');
        this.titleEl = document.querySelector('.project-title');
        this.counterEl = document.querySelector('.project-counter');
        this.discoverBtn = document.querySelector('.discover-btn');

        this.currentMode = 'slider'; // 'slider' or 'carousel'
        this.currentIndex = 0;
        this.projects = [];

        // Carousel-specific properties
        this.itemWidth = 0;
        this.gap = 0;
        this.spacing = 0;
        this.totalWidth = 0;
        this.progress = 0;
        this.targetProgress = 0;
        this.snapTimeout = 0;
        this.tickerActive = false;

        if (!this.track || !this.toggleBtn) return;

        this.init();
    }

    init() {
        // Load projects data
        this.loadProjectsData();

        // Check for saved state
        const savedState = getSliderState();
        if (savedState) {
            this.currentIndex = savedState.index || 0;
            this.currentMode = savedState.mode || 'slider';
        }

        // Initialize in appropriate mode
        if (this.currentMode === 'carousel') {
            this.initCarouselMode();
        } else {
            this.initSliderMode();
        }

        // Setup toggle button
        this.toggleBtn.addEventListener('click', (e) => {
            e.preventDefault();
            this.toggleMode();
        });
    }

    loadProjectsData() {
        // Extract projects from the data attribute we'll add to the track
        const dataEl = document.querySelector('[data-projects]');
        if (dataEl) {
            try {
                this.projects = JSON.parse(dataEl.getAttribute('data-projects'));
            } catch (e) {
                console.error('Failed to parse projects data:', e);
            }
        }
    }

    initSliderMode() {
        this.currentMode = 'slider';

        // Clear any existing project items
        const existingItems = this.track.querySelectorAll('.project-item');
        existingItems.forEach(item => item.remove());

        // Create single image element for slider mode
        const img = this.track.querySelector('img');
        if (img && this.projects.length > 0) {
            // Update image instantly without animation to prevent flash
            this.updateSliderImage(this.currentIndex, false);
        }

        // Setup navigation
        this.prevBtn?.addEventListener('click', () => this.navigateSlider('prev'));
        this.nextBtn?.addEventListener('click', () => this.navigateSlider('next'));

        // Update toggle button text
        if (this.toggleBtn) {
            this.toggleBtn.innerHTML = `
                All projects
                <span class="w-[8px] h-[10px] bg-white"></span>
            `;
        }

        // Reset track styles
        gsap.set(this.track, {
            width: '100%',
            height: '100%',
            clearProps: 'all'
        });
    }

    initCarouselMode() {
        this.currentMode = 'carousel';

        // Clear single image
        const img = this.track.querySelector('img:not(.project-item img)');
        const overlay = this.track.querySelector('.absolute.inset-0.bg-\\[\\#00000033\\]');
        if (img) img.style.display = 'none';
        if (overlay) overlay.style.display = 'none';

        // Create carousel track
        let carouselTrack = this.track.querySelector('#carousel-track');
        if (!carouselTrack) {
            carouselTrack = document.createElement('div');
            carouselTrack.id = 'carousel-track';
            carouselTrack.className = 'relative w-full h-full flex items-center justify-center';
            this.track.appendChild(carouselTrack);
        }

        // Clear existing items
        carouselTrack.innerHTML = '';

        // Create project items
        this.projects.forEach((project, index) => {
            const item = document.createElement('div');
            item.className = 'project-item absolute top-1/2 -translate-y-1/2';
            item.setAttribute('data-index', index);
            item.setAttribute('data-title', project.title);
            item.setAttribute('data-slug', project.slug);

            item.innerHTML = `
                <div class="project-item--container">
                    <div class="relative">
                        <div class="absolute inset-0 bg-[#00000033]"></div>
                        <img 
                            src="${project.image}" 
                            alt="${project.title}"
                            class="block w-full aspect-video object-cover"
                        />
                    </div>
                </div>
            `;

            carouselTrack.appendChild(item);
        });

        this.items = carouselTrack.querySelectorAll('.project-item');

        // Calculate dimensions
        const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
        this.itemWidth = 69 * rem;
        this.gap = 4 * rem;
        this.spacing = this.itemWidth + this.gap;
        this.totalWidth = this.items.length * this.spacing;

        // Set initial progress based on current index
        this.progress = -this.currentIndex * this.spacing;
        this.targetProgress = this.progress;

        // Initial render
        this.renderCarousel();

        // Setup event listeners
        window.addEventListener('wheel', this.onWheel.bind(this), { passive: false });
        window.addEventListener('resize', this.onResize.bind(this));

        // Remove slider navigation, add carousel navigation
        this.prevBtn?.removeEventListener('click', this.navigateSlider);
        this.nextBtn?.removeEventListener('click', this.navigateSlider);
        this.prevBtn?.addEventListener('click', () => this.snapMove('prev'));
        this.nextBtn?.addEventListener('click', () => this.snapMove('next'));

        // Start ticker
        if (!this.tickerActive) {
            gsap.ticker.add(this.tick.bind(this));
            this.tickerActive = true;
        }

        // Update toggle button
        if (this.toggleBtn) {
            this.toggleBtn.innerHTML = `
                Close
                <span class="w-[8px] h-[10px] bg-white"></span>
            `;
        }

        // Initial snap
        this.snap();
    }

    toggleMode() {
        if (this.currentMode === 'slider') {
            // Animate to carousel mode
            this.animateToCarousel();
        } else {
            // Animate back to slider mode
            this.animateToSlider();
        }
    }

    animateToCarousel() {
        const timeline = gsap.timeline({
            onComplete: () => {
                this.initCarouselMode();
                const project = this.projects[this.currentIndex];
                saveSliderState(this.currentIndex, 'carousel', project);
            }
        });

        // Shrink the wrapper
        timeline.to(this.track, {
            width: '69rem',
            duration: 0.6,
            ease: 'power2.inOut'
        });
    }

    animateToSlider() {
        // Get current active item index to preserve position
        const activeItem = document.querySelector('.project-item.active');
        if (activeItem) {
            this.currentIndex = parseInt(activeItem.getAttribute('data-index') || '0');
        }

        // Stop ticker
        if (this.tickerActive) {
            gsap.ticker.remove(this.tick.bind(this));
            this.tickerActive = false;
        }

        // Remove wheel listener
        window.removeEventListener('wheel', this.onWheel.bind(this));

        const timeline = gsap.timeline({
            onComplete: () => {
                // Save state before cleanup
                const project = this.projects[this.currentIndex];
                saveSliderState(this.currentIndex, 'slider', project);

                // Clean up carousel elements
                const carouselTrack = this.track.querySelector('#carousel-track');
                if (carouselTrack) {
                    carouselTrack.remove();
                }

                // Show single image again
                const img = this.track.querySelector('img:not(.project-item img)');
                const overlay = this.track.querySelector('.absolute.inset-0.bg-\\[\\#00000033\\]');
                if (img) img.style.display = 'block';
                if (overlay) overlay.style.display = 'block';

                // Reinitialize slider mode
                this.initSliderMode();
            }
        });

        // Expand the wrapper
        timeline.to(this.track, {
            width: '100%',
            duration: 0.6,
            ease: 'power2.inOut'
        });
    }

    navigateSlider(direction) {
        if (this.currentMode !== 'slider') return;

        const totalProjects = this.projects.length;

        if (direction === 'prev') {
            this.currentIndex = (this.currentIndex - 1 + totalProjects) % totalProjects;
        } else {
            this.currentIndex = (this.currentIndex + 1) % totalProjects;
        }

        this.updateSliderImage(this.currentIndex);
    }

    updateSliderImage(index, animate = true) {
        const project = this.projects[index];
        if (!project) return;

        // Save current state
        saveSliderState(index, this.currentMode, project);

        const img = this.track.querySelector('img:not(.project-item img)');
        if (img) {
            if (animate) {
                // Fade out, change image, fade in
                gsap.to(img, {
                    opacity: 0,
                    duration: 0.3,
                    onComplete: () => {
                        img.src = project.image;
                        img.alt = project.title;
                        gsap.to(img, {
                            opacity: 1,
                            duration: 0.3
                        });
                    }
                });
            } else {
                // Instant update without animation
                img.src = project.image;
                img.alt = project.title;
                gsap.set(img, { opacity: 1 });
            }
        }

        // Update project info
        this.updateProjectInfo(project, index);
    }

    updateProjectInfo(project, index) {
        const totalProjects = this.projects.length;

        // Update title
        if (this.titleEl) {
            this.titleEl.textContent = project.title;
        }

        // Update counter
        if (this.counterEl) {
            const currentNum = (index + 1).toString().padStart(2, '0');
            const totalNum = totalProjects.toString().padStart(2, '0');
            this.counterEl.textContent = `${currentNum} / ${totalNum}`;
        }

        // Update discover button
        if (this.discoverBtn) {
            this.discoverBtn.setAttribute('href', `/projects/${project.slug}`);
        }
    }

    // Carousel methods
    onResize() {
        if (this.currentMode !== 'carousel') return;

        const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
        this.itemWidth = 69 * rem;
        this.gap = 4 * rem;
        this.spacing = this.itemWidth + this.gap;
        this.totalWidth = this.items.length * this.spacing;
    }

    onWheel(e) {
        if (this.currentMode !== 'carousel') return;

        e.preventDefault();
        const delta = e.deltaY;
        this.targetProgress -= delta * 0.5;

        this.clearActiveClasses();

        window.clearTimeout(this.snapTimeout);
        this.snapTimeout = window.setTimeout(() => {
            this.snap();
        }, 50);
    }

    snap() {
        if (this.currentMode !== 'carousel') return;

        const raw = this.targetProgress / this.spacing;
        const snapped = Math.round(raw) * this.spacing;
        this.targetProgress = snapped;
    }

    clearActiveClasses() {
        if (!this.items) return;

        this.items.forEach((item) => {
            item.classList.remove('active');
            const img = item.querySelector('img');
            if (img) img.classList.remove('active');
        });
    }

    snapMove(direction) {
        if (this.currentMode !== 'carousel') return;

        const dir = direction === 'next' ? -1 : 1;

        this.clearActiveClasses();

        const currentSnap = Math.round(this.targetProgress / this.spacing);
        this.targetProgress = (currentSnap + dir) * this.spacing;

        const nextIndex = Math.abs(Math.round(this.targetProgress / this.spacing)) % this.items.length;
        const nextItem = this.items[nextIndex];
        if (nextItem) {
            const project = this.projects[nextIndex];
            this.updateProjectInfo(project, nextIndex);
        }

        window.clearTimeout(this.snapTimeout);
        this.snapTimeout = window.setTimeout(() => {
            this.snap();
        }, 100);
    }

    tick() {
        if (this.currentMode !== 'carousel') return;

        if (Math.abs(this.targetProgress - this.progress) < 0.5) {
            this.progress = this.targetProgress;
            this.renderCarousel();
            this.updateActiveItem();
        } else {
            this.progress += (this.targetProgress - this.progress) * 0.2;
            this.renderCarousel();
        }
    }

    updateActiveItem() {
        if (this.currentMode !== 'carousel' || !this.items) return;

        const halfWidth = this.totalWidth / 2;
        const wrapFn = gsap.utils.wrap(-halfWidth, halfWidth);

        let closestItem = null;
        let minDist = Infinity;

        this.items.forEach((item) => {
            const index = parseInt(item.getAttribute('data-index') || '0');
            const initialPos = index * this.spacing;
            const currentPos = initialPos + this.progress;
            const wrappedPos = wrapFn(currentPos);

            if (Math.abs(wrappedPos) < minDist) {
                minDist = Math.abs(wrappedPos);
                closestItem = item;
            }
        });

        if (closestItem && !closestItem.classList.contains('active')) {
            this.clearActiveClasses();
            closestItem.classList.add('active');
            const img = closestItem.querySelector('img');
            if (img) img.classList.add('active');

            const index = parseInt(closestItem.getAttribute('data-index') || '0');
            const project = this.projects[index];
            this.updateProjectInfo(project, index);
        }
    }

    renderCarousel() {
        if (this.currentMode !== 'carousel' || !this.items) return;

        const halfWidth = this.totalWidth / 2;
        const wrapFn = gsap.utils.wrap(-halfWidth, halfWidth);

        const velocity = this.targetProgress - this.progress;
        const skew = velocity * 0.01;

        this.items.forEach((item, i) => {
            const initialPos = i * this.spacing;
            const currentPos = initialPos + this.progress;
            const wrappedPos = wrapFn(currentPos);

            gsap.set(item, {
                x: wrappedPos,
                xPercent: -50,
                left: '50%'
            });

            const container = item.querySelector('.project-item--container');
            if (container) {
                gsap.set(container, {
                    skewX: skew
                });
            }
        });
    }

    destroy() {
        // Save state before destroying
        const project = this.projects[this.currentIndex];
        saveSliderState(this.currentIndex, this.currentMode, project);

        // Clean up event listeners and ticker
        if (this.tickerActive) {
            gsap.ticker.remove(this.tick.bind(this));
        }
        window.removeEventListener('wheel', this.onWheel.bind(this));
        window.removeEventListener('resize', this.onResize.bind(this));
    }
}

// Track the current slider instance
let currentSliderInstance = null;

// Initialize
const init = () => {
    // Destroy previous instance if it exists
    if (currentSliderInstance) {
        currentSliderInstance.destroy();
        currentSliderInstance = null;
    }

    // Create new instance
    currentSliderInstance = new HomeSlider();
};

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// Make HomeSlider available globally for Barba.js
if (typeof window !== 'undefined') {
    window.HomeSlider = HomeSlider;
}

export default HomeSlider;
