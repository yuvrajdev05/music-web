// js/views/home.js

const HomeView = {
    async render(container) {
        container.innerHTML = `
            <h1>Listen Now</h1>
            
            <section style="margin-bottom: 3rem;">
                <h2>Trending Music</h2>
                <div class="grid-container" id="home-trending-grid">
                    <!-- Loaded dynamically -->
                </div>
            </section>
            
            <section style="margin-bottom: 3rem;">
                <h2>Popular Songs</h2>
                <div class="grid-container" id="home-popular-grid">
                    <!-- Loaded dynamically -->
                </div>
            </section>
        `;

        const trendingGrid = document.getElementById('home-trending-grid');
        const popularGrid = document.getElementById('home-popular-grid');
        
        window.UI.showLoader(trendingGrid);
        window.UI.showLoader(popularGrid);

        // Fetch data
        const trending = await window.YuviAPI.getTrending();
        const popular = await window.YuviAPI.getPopular();

        // Render grids
        trendingGrid.innerHTML = '';
        if (trending.length > 0) {
            trending.forEach(song => trendingGrid.appendChild(window.UI.createSongCard(song)));
        } else {
            window.UI.showEmpty(trendingGrid, 'Could not load trending music.');
        }

        popularGrid.innerHTML = '';
        if (popular.length > 0) {
            popular.forEach(song => popularGrid.appendChild(window.UI.createSongCard(song)));
        } else {
            window.UI.showEmpty(popularGrid, 'Could not load popular music.');
        }
    }
};

window.HomeView = HomeView;
