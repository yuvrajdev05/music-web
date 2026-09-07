// js/app.js

const App = {
    init() {
        this.mainContent = document.getElementById('main-content');
        this.navItems = document.querySelectorAll('.nav-item');
        
        window.UI.updateSidebarPlaylists();

        // Listen for hash changes for routing
        window.addEventListener('hashchange', () => this.handleRoute());
        
        // Listen for store updates to refresh sidebar
        window.addEventListener('store_updated', () => window.UI.updateSidebarPlaylists());

        // Handle initial route
        if (!window.location.hash) {
            window.location.hash = '#/';
        } else {
            this.handleRoute();
        }
    },

    handleRoute() {
        const hash = window.location.hash || '#/';
        const path = hash.replace('#', '');
        
        // Update active nav state
        this.navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === hash) {
                item.classList.add('active');
            }
        });

        // Simple Router
        if (path === '/' || path === '/home' || path === '/browse') {
            window.HomeView.render(this.mainContent);
        } 
        else if (path === '/search') {
            window.SearchView.render(this.mainContent);
        }
        else if (path === '/library') {
            window.LibraryView.render(this.mainContent, 'overview');
        }
        else if (path === '/favorites') {
            window.LibraryView.render(this.mainContent, 'favorites');
        }
        else if (path.startsWith('/playlist/')) {
            const id = path.split('/')[2];
            window.LibraryView.render(this.mainContent, 'playlist', id);
            
            // Highlight playlist in sidebar if possible
            this.navItems.forEach(item => {
                if (item.getAttribute('href') === hash) item.classList.add('active');
            });
        }
        else {
            this.mainContent.innerHTML = `<h1>404 Not Found</h1>`;
        }
        
        // Scroll to top on route change
        this.mainContent.scrollTo(0, 0);
    }
};

// Start the app when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
