import barba from '@barba/core';

// Import custom transitions
import homeToAbout from './transitions/home-to-about.js';
import aboutToHome from './transitions/about-to-home.js';
import homeToContact from './transitions/home-to-contact.js';
import contactToHome from './transitions/contact-to-home.js';
import homeToProjects from './transitions/home-to-projects.js';
import projectsToHome from './transitions/projects-to-home.js';
import homeToProjectDetail from './transitions/home-to-project-detail.js';
import projectDetailToHome from './transitions/project-detail-to-home.js';

/**
 * Initialise Barba.js avec les transitions personnalisées
 */
export function initBarba() {
    barba.init({
        debug: true, // ⚠️ MODE DEBUG ACTIVÉ
        transitions: [
            // Transitions personnalisées (ordre important: du plus spécifique au plus général)
            homeToAbout,
            aboutToHome,
            homeToContact,
            contactToHome,
            homeToProjects,
            projectsToHome,
            homeToProjectDetail,
            projectDetailToHome,
        ],

        // Views spécifiques par namespace
        views: [
            {
                namespace: 'home',
                afterEnter() {
                    console.log('🏠 Home page loaded');
                },
            },
            {
                namespace: 'about',
                afterEnter() {
                    console.log('👤 About page loaded');
                },
            },
            {
                namespace: 'projects',
                afterEnter() {
                    console.log('💼 Projects page loaded');
                },
            },
            {
                namespace: 'contact',
                afterEnter() {
                    console.log('📧 Contact page loaded');
                },
            },
            {
                namespace: 'project-detail',
                afterEnter() {
                    console.log('📁 Project detail page loaded');
                },
            },
        ],
    });

    console.log('✅ Barba.js initialized with custom transitions');
}
