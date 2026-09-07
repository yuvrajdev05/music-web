// js/views/home.js

const HomeView = {
    async render(container) {
        this.container = container;
        this.container.innerHTML = '';
        
        // --- Recently Played Section ---
        if (window.Store.data.recent.length > 0) {
            const recentSection = document.createElement('section');
            recentSection.style.marginBottom = '2.5rem';
            
            const headerDiv = document.createElement('div');
            headerDiv.style.display = 'flex';
            headerDiv.style.justifyContent = 'space-between';
            headerDiv.style.alignItems = 'center';
            headerDiv.style.marginBottom = '1rem';
            
            const h2 = document.createElement('h2');
            h2.textContent = 'Recently Played';
            h2.style.marginBottom = '0';
            
            const clearBtn = document.createElement('button');
            clearBtn.textContent = 'Clear All';
            clearBtn.style.background = 'none';
            clearBtn.style.border = 'none';
            clearBtn.style.color = 'var(--accent)';
            clearBtn.style.cursor = 'pointer';
            clearBtn.style.fontWeight = '600';
            clearBtn.addEventListener('click', () => {
                window.Store.clearRecent();
                this.render(this.container); // Re-render the home page
            });
            
            headerDiv.appendChild(h2);
            headerDiv.appendChild(clearBtn);
            recentSection.appendChild(headerDiv);

            const grid = document.createElement('div');
            grid.className = 'grid-container';
            
            window.Store.data.recent.slice(0, 10).forEach(song => {
                grid.appendChild(window.UI.createSongCard(song, (songToRemove) => {
                    window.Store.removeRecent(songToRemove.id);
                    this.render(this.container); // Re-render to reflect deletion
                }));
            });
            
            recentSection.appendChild(grid);
            this.container.appendChild(recentSection);
        }

        // --- Trending/Popular Sections ---
        this.container.innerHTML += `
            <section style="margin-bottom: 3rem;">
                <h2>Trending Music</h2>
                <div class="grid-container" id="home-trending-grid"></div>
            </section>
            
            <section style="margin-bottom: 3rem;">
                <h2>Popular Songs</h2>
                <div class="grid-container" id="home-popular-grid"></div>
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
