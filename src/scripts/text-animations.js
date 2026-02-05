/**
 * Text Split Animations
 * 
 * Splits text into characters, words, or lines and animates them using GSAP
 */
import gsap from 'gsap';
import { SplitText } from 'gsap/SplitText';

// Register GSAP plugin
gsap.registerPlugin(SplitText);

// Store active animations for cleanup
const activeAnimations = [];
const observers = [];

/**
 * Initialize text animations
 */
export const initTextAnimations = async () => {
    // Clean up previous animations and observers
    cleanup();

    // Attendre que les polices soient chargées
    await waitForFonts();

    // Attendre un frame supplémentaire pour que le layout soit stable
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));

    // Find all elements with data-text-split attribute
    const elements = document.querySelectorAll('[data-text-split]');

    if (elements.length === 0) {
        return;
    }

    elements.forEach(element => {
        let splitType = element.dataset.textSplit || 'chars'; // chars, words, lines
        const animation = element.dataset.textAnimation || 'fade'; // fade, slideUp, slideDown, scale
        const stagger = parseFloat(element.dataset.textStagger) || 0.02;
        const duration = parseFloat(element.dataset.textDuration) || 0.6;
        const trigger = element.dataset.textTrigger || 'scroll'; // scroll, load

        // Normalize splitType (handle singular forms)
        if (splitType === 'char') splitType = 'chars';
        if (splitType === 'word') splitType = 'words';
        if (splitType === 'line') splitType = 'lines';

        // Validate splitType
        if (!['chars', 'words', 'lines'].includes(splitType)) {
            console.warn('Invalid split type:', splitType, 'for element:', element);
            return;
        }

        // Split the text
        const split = new SplitText(element, {
            type: splitType,
            linesClass: 'split-line',
            wordsClass: 'split-word',
            charsClass: 'split-char'
        });

        console.log(split)

        // Get the split elements based on type
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

        // Check if split was successful
        if (!targets || targets.length === 0) {
            console.warn('SplitText failed - no elements found for type:', splitType, 'Element:', element, 'Split object:', split);
            return;
        }

        // Mark element as ready (makes it visible)
        element.classList.add('split-ready');

        // Set initial state based on animation type
        const initialState = getInitialState(animation);
        gsap.set(targets, initialState);

        // Animate based on trigger type
        if (trigger === 'load') {
            animateText(targets, animation, stagger, duration);
        } else {
            // Use Intersection Observer for scroll trigger
            setupScrollTrigger(element, targets, animation, stagger, duration);
        }

        // Store for cleanup
        activeAnimations.push({ element, split });
    });
};

/**
 * Wait for fonts to be loaded (with timeout fallback)
 */
async function waitForFonts() {
    if ('fonts' in document) {
        try {
            // Race between fonts.ready and 2s timeout
            const timeout = new Promise(resolve => setTimeout(resolve, 2000));
            await Promise.race([document.fonts.ready, timeout]);
            console.log('✅ Fonts loaded');
        } catch (error) {
            console.warn('Font loading check failed:', error);
        }
    }
}

/**
 * Get initial state for animation type
 */
function getInitialState(animation) {
    switch (animation) {
        case 'slideUp':
            return { opacity: 0, y: 50 };
        case 'slideDown':
            return { opacity: 0, y: -50 };
        case 'scale':
            return { opacity: 0, scale: 0 };
        case 'fade':
        default:
            return { opacity: 0 };
    }
}

/**
 * Animate text elements
 */
function animateText(targets, animation, stagger, duration) {
    const animationProps = {
        opacity: 1,
        duration: duration,
        stagger: stagger,
        ease: 'power2.out'
    };

    switch (animation) {
        case 'slideUp':
            animationProps.y = 0;
            break;
        case 'slideDown':
            animationProps.y = 0;
            break;
        case 'scale':
            animationProps.scale = 1;
            break;
    }

    return gsap.to(targets, animationProps);
}

/**
 * Setup scroll-triggered animation with Intersection Observer
 */
function setupScrollTrigger(element, targets, animation, stagger, duration) {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateText(targets, animation, stagger, duration);
                    observer.unobserve(entry.target);
                }
            });
        },
        {
            threshold: 0.2, // Trigger when 20% visible
            rootMargin: '0px 0px -10% 0px' // Trigger slightly before element enters viewport
        }
    );

    observer.observe(element);
    observers.push(observer);
}

/**
 * Cleanup animations and observers
 */
function cleanup() {
    // Kill all active animations
    activeAnimations.forEach(({ split }) => {
        if (split) {
            split.revert();
        }
    });
    activeAnimations.length = 0;

    // Disconnect all observers
    observers.forEach(observer => observer.disconnect());
    observers.length = 0;
}

// Export cleanup for external use
export const cleanupTextAnimations = cleanup;

// Make available globally for Barba.js
if (typeof window !== 'undefined') {
    window.initTextAnimations = initTextAnimations;
}
