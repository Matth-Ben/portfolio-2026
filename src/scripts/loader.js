import gsap from 'gsap';

/**
 * Loader Carousel - Une seule animation fluide depuis la droite
 * qui décélère naturellement jusqu'à l'image cible.
 */

// Configuration
const ITEM_WIDTH = 690;
const ITEM_HEIGHT = 432;
const GAP = 40;
const SPACING = ITEM_WIDTH + GAP;

let loaderCarousel = null;
let items = [];         // Items originaux
let cloneItems = [];    // Clones pour le premier passage
let projects = [];
let targetIndex = 0;
let animationStarted = false;

/**
 * Initialise le loader carousel
 */
export function initLoader() {
    const loader = document.getElementById('page-loader');
    const container = document.getElementById('loader-carousel');

    if (!loader || !container) return;

    // Récupère les données des projets
    const dataEl = document.getElementById('home-projects-data');
    if (!dataEl) return;

    projects = JSON.parse(dataEl.dataset.homeProjects || '[]');
    if (projects.length === 0) return;

    loaderCarousel = container;

    // Crée les items originaux du carrousel
    projects.forEach((project, index) => {
        const item = document.createElement('div');
        item.className = 'loader-item';
        item.innerHTML = `
            <img src="${project.image}" alt="${project.title}" />
            <div class="loader-item__overlay"></div>
        `;
        item.dataset.index = index;
        container.appendChild(item);
        items.push(item);
    });

    // Crée les clones pour le premier passage (ils défileront en premier)
    projects.forEach((project, index) => {
        const clone = document.createElement('div');
        clone.className = 'loader-item loader-item--clone';
        clone.innerHTML = `
            <img src="${project.image}" alt="${project.title}" />
            <div class="loader-item__overlay"></div>
        `;
        clone.dataset.index = index;
        clone.dataset.clone = 'true';
        container.appendChild(clone);
        cloneItems.push(clone);
    });

    // Position initiale : clones d'abord (à droite), puis items originaux (encore plus à droite)
    // Les clones arrivent en premier, font le premier passage
    // Les originaux arrivent ensuite et s'arrêtent sur l'image cible
    const startX = window.innerWidth + ITEM_WIDTH;
    const totalItemsWidth = projects.length * SPACING;

    // Position des clones (arrivent en premier)
    cloneItems.forEach((clone, i) => {
        gsap.set(clone, {
            x: startX + i * SPACING,
            opacity: 1,
        });
        gsap.set(clone.querySelector('.loader-item__overlay'), { opacity: 0.7 });
    });

    // Position des items originaux (arrivent après les clones)
    items.forEach((item, i) => {
        gsap.set(item, {
            x: startX + totalItemsWidth + i * SPACING,
            opacity: 1,
        });
        gsap.set(item.querySelector('.loader-item__overlay'), { opacity: 0.7 });
    });
}

/**
 * Détermine l'index cible selon la page courante
 */
function getTargetIndex() {
    const namespace = document.querySelector('[data-barba-namespace]')?.getAttribute('data-barba-namespace');
    const pathname = window.location.pathname;
    const savedState = JSON.parse(sessionStorage.getItem('homeSliderState') || '{}');

    if (namespace === 'project-detail') {
        const slug = pathname.replace(/^\/|\/$/g, '');
        const index = projects.findIndex(p => p.slug === slug);
        return index >= 0 ? index : 0;
    }

    return savedState.index || 0;
}

/**
 * Lance l'animation du loader - une seule animation fluide
 * Les clones défilent en premier (premier passage), puis les originaux s'arrêtent sur l'image cible (second passage)
 */
export function startSlowdown(callback) {
    if (animationStarted) return;
    animationStarted = true;

    targetIndex = getTargetIndex();

    const loader = document.getElementById('page-loader');
    const centerX = (window.innerWidth - ITEM_WIDTH) / 2;
    const startX = window.innerWidth + ITEM_WIDTH;
    const totalItemsWidth = projects.length * SPACING;

    // Position actuelle de l'item original cible (après les clones)
    const targetItemStartX = startX + totalItemsWidth + targetIndex * SPACING;

    // Distance totale que l'item cible doit parcourir pour arriver au centre
    // Cela inclut le passage des clones (premier tour) puis l'arrêt sur l'original
    const totalDistance = targetItemStartX - centerX;

    // Durée basée sur la distance (plus c'est loin, plus c'est long)
    const baseDuration = 2.5;
    const extraDuration = Math.min(totalDistance / 1500, 2);
    const duration = baseDuration + extraDuration;

    // Combine tous les éléments pour l'animation
    const allItems = [...cloneItems, ...items];

    // Anime tous les items ensemble avec une seule timeline
    const tl = gsap.timeline({
        onUpdate: () => {
            // Met à jour l'opacité des overlays basée sur la distance au centre
            allItems.forEach((item) => {
                const itemX = gsap.getProperty(item, 'x');
                const distanceFromCenter = Math.abs(itemX - centerX);
                const maxDistance = window.innerWidth / 2 + ITEM_WIDTH;
                const overlayOpacity = gsap.utils.clamp(0, 0.7, (distanceFromCenter / maxDistance) * 0.7);
                gsap.set(item.querySelector('.loader-item__overlay'), { opacity: overlayOpacity });
            });
        },
        onComplete: () => {
            // Supprime les clones une fois l'animation terminée
            cloneItems.forEach(clone => clone.remove());
            cloneItems = [];
            transformToDestination(callback);
        },
    });

    // Anime les clones (ils sortent à gauche de l'écran)
    cloneItems.forEach((clone, i) => {
        const cloneStartX = startX + i * SPACING;
        // Les clones finissent à gauche de l'écran, hors vue
        const cloneFinalX = centerX - totalItemsWidth + (i - targetIndex) * SPACING;

        tl.to(clone, {
            x: cloneFinalX,
            duration: duration,
            ease: 'power3.out',
        }, 0);
    });

    // Anime les items originaux (celui ciblé s'arrête au centre)
    items.forEach((item, i) => {
        const itemStartX = startX + totalItemsWidth + i * SPACING;
        const itemFinalX = centerX + (i - targetIndex) * SPACING;

        tl.to(item, {
            x: itemFinalX,
            duration: duration,
            ease: 'power3.out',
        }, 0);
    });
}

/**
 * Transforme l'image cible vers sa destination finale
 */
function transformToDestination(callback) {
    const namespace = document.querySelector('[data-barba-namespace]')?.getAttribute('data-barba-namespace');
    const loader = document.getElementById('page-loader');
    const targetItem = items[targetIndex];

    if (!targetItem) {
        completeLoader(callback);
        return;
    }

    // Configure l'overlay final
    const overlay = targetItem.querySelector('.loader-item__overlay');
    const targetOverlayOpacity = getTargetOverlayOpacity(namespace);

    // Position actuelle de l'image (centrée à l'écran)
    const currentLeft = (window.innerWidth - ITEM_WIDTH) / 2;
    const currentTop = (window.innerHeight - ITEM_HEIGHT) / 2;

    // Convertit l'item en positionnement absolu avec left/top
    // pour pouvoir animer proprement vers fullscreen
    gsap.set(targetItem, {
        clearProps: 'x,transform',
        position: 'absolute',
        zIndex: 100,
        left: currentLeft,
        width: ITEM_WIDTH,
        height: ITEM_HEIGHT,
    });

    // Timeline pour le positionnement final
    // DEBUG: On bloque la disparition pour debugger
    const tl = gsap.timeline({
        onComplete: () => {
            console.log('🔍 DEBUG: Animation terminée - loader visible pour debug');
            // BLOQUÉ POUR DEBUG
            gsap.to(loader, {
                opacity: 0,
                duration: 0.3,
                ease: 'power2.out',
                onComplete: () => completeLoader(callback),
            });
        },
    });

    // Déplace les autres items vers l'extérieur de l'écran
    const centerX = (window.innerWidth - ITEM_WIDTH) / 2;
    items.forEach((item, i) => {
        if (i !== targetIndex) {
            // Calcule la position actuelle de l'item
            const currentX = centerX + (i - targetIndex) * SPACING;

            // Détermine la direction : gauche ou droite selon la position relative
            let targetX;
            if (i < targetIndex) {
                // Items à gauche : sortent vers la gauche
                targetX = -ITEM_WIDTH - 100;
            } else {
                // Items à droite : sortent vers la droite
                targetX = window.innerWidth + 100;
            }

            tl.to(item, {
                x: targetX,
                opacity: 0,
                duration: 0.6,
                ease: 'power2.in',
            }, 0);
        }
    });

    // Anime l'overlay vers sa valeur finale
    if (overlay) {
        tl.to(overlay, {
            opacity: targetOverlayOpacity,
            duration: 0.5,
        }, 0);
    }

    if (namespace === 'project-detail' || (namespace === 'home' && !isCarouselMode())) {
        // Fullscreen : anime de la position centrée vers fullscreen
        tl.to(targetItem, {
            left: 0,
            width: window.innerWidth,
            height: window.innerHeight,
            duration: 0.6,
            ease: 'power2.inOut',
        }, 0);
    } else if (namespace === 'home' && isCarouselMode()) {
        // Mode carrousel : reste au centre à la même taille
        tl.to(targetItem, {
            duration: 0.3,
        }, 0);
    } else if (namespace === 'about') {
        // Sidebar droite
        tl.to(targetItem, {
            left: window.innerWidth - (7.8 * 16),
            width: 7.8 * 16,
            height: window.innerHeight * 0.9,
            duration: 0.6,
            ease: 'power2.inOut',
        }, 0);
    } else if (namespace === 'contact') {
        // Sidebar gauche
        tl.to(targetItem, {
            left: 0,
            width: 7.8 * 16,
            height: window.innerHeight * 0.9,
            duration: 0.6,
            ease: 'power2.inOut',
        }, 0);
    }
}

/**
 * Vérifie si on est en mode carrousel
 */
function isCarouselMode() {
    const savedState = JSON.parse(sessionStorage.getItem('homeSliderState') || '{}');
    return savedState.mode === 'carousel';
}

/**
 * Retourne l'opacité de l'overlay selon la page
 */
function getTargetOverlayOpacity(namespace) {
    if (namespace === 'project-detail') {
        return 0.4; // bg-[#00000066]
    }
    if (namespace === 'about' || namespace === 'contact') {
        return 0.2; // bg-[#00000033]
    }
    return 0; // home
}

/**
 * Calcule le rectangle de destination selon la page
 */
function getTargetRect(namespace) {
    if (namespace === 'about') {
        return {
            left: window.innerWidth - (7.8 * 16),
            top: window.innerHeight * 0.05,
            width: 7.8 * 16,
            height: window.innerHeight * 0.9,
        };
    }
    if (namespace === 'contact') {
        return {
            left: 0,
            top: window.innerHeight * 0.05,
            width: 7.8 * 16,
            height: window.innerHeight * 0.9,
        };
    }
    // Fullscreen pour home et project-detail
    return {
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
    };
}

/**
 * Termine le loader
 */
function completeLoader(callback) {
    const loader = document.getElementById('page-loader');
    if (loader) {
        loader.remove();
    }
    if (callback) {
        callback();
    }
}

/**
 * Nettoie le loader
 */
export function destroyLoader() {
    items = [];
    cloneItems = [];
    loaderCarousel = null;
    projects = [];
    animationStarted = false;
}
