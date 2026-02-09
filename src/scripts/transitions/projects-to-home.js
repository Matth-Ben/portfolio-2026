import gsap from 'gsap';

/**
 * Transition: Projects → Home
 * Fade avec gradient blue
 */
export default {
    name: 'projects-to-home',
    from: { namespace: ['projects'] },
    to: { namespace: ['home'] },

    async leave(data) {
        const imageWrappered = document.querySelectorAll('.imageWrappered:not(.active)');
        const imageWrapperedActive = document.querySelector('.imageWrappered.active');

        gsap.to(imageWrappered, {
            opacity: 0,
            duration: 0.3,
            ease: 'power2.out'
        });

        await gsap.fromTo(imageWrapperedActive, {
            width: '69rem',
        }, {
            width: '100%',
            duration: 0.3,
            ease: 'power2.out'
        });
    },

    async afterEnter(data) {
        const allProjects = document.querySelector('.all-projects-btn');

        gsap.fromTo(allProjects, {
            opacity: 0,
            duration: 0.3,
            ease: 'power2.out'
        }, {
            opacity: 1,
            duration: 0.3,
            ease: 'power2.out'
        });
    },
};
