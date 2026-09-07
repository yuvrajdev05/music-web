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
                <h2>Arijit Singh Essentials</h2>
                <div class="grid-container" id="home-arijit-grid"></div>
            </section>

            <section style="margin-bottom: 3rem;">
                <h2>Trending Music</h2>
                <div class="grid-container" id="home-trending-grid"></div>
            </section>
            
            <section style="margin-bottom: 3rem;">
                <h2>Bollywood Romance</h2>
                <div class="grid-container" id="home-romance-grid"></div>
            </section>

            <section style="margin-bottom: 3rem;">
                <h2>Popular Songs</h2>
                <div class="grid-container" id="home-popular-grid"></div>
            </section>
        `;

        const arijitGrid = document.getElementById('home-arijit-grid');
        const trendingGrid = document.getElementById('home-trending-grid');
        const romanceGrid = document.getElementById('home-romance-grid');
        const popularGrid = document.getElementById('home-popular-grid');
        
        window.UI.showLoader(arijitGrid);
        window.UI.showLoader(trendingGrid);
        window.UI.showLoader(romanceGrid);
        window.UI.showLoader(popularGrid);

        // Fetch data simultaneously for speed
        const [arijit, trending, romance, popular] = await Promise.all([
            window.YuviAPI.getArijitSongs(),
            window.YuviAPI.getTrending(),
            window.YuviAPI.getBollywoodRomance(),
            window.YuviAPI.getPopular()
        ]);

        // Render grids
        const renderGrid = (gridEl, data, errorMsg) => {
            gridEl.innerHTML = '';
            if (data && data.length > 0) {
                data.forEach(song => gridEl.appendChild(window.UI.createSongCard(song)));
            } else {
                window.UI.showEmpty(gridEl, errorMsg);
            }
        };

        renderGrid(arijitGrid, arijit, 'Could not load Arijit Singh hits.');
        renderGrid(trendingGrid, trending, 'Could not load trending music.');
        renderGrid(romanceGrid, romance, 'Could not load Bollywood hits.');
        renderGrid(popularGrid, popular, 'Could not load popular music.');
    }
};

window.HomeView = HomeView;
