// js/views/search.js

let searchTimeout = null;

const SearchView = {
    render(container) {
        container.innerHTML = `
            <div class="search-container">
                <span class="material-symbols-rounded search-icon">search</span>
                <input type="text" id="search-input" class="search-input" placeholder="Search for songs, artists, or albums...">
            </div>
            
            <div id="search-results-container">
                <div class="empty-state">
                    <h3>Search YUVI MUSIC</h3>
                    <p>Find your favorite songs, artists, and playlists.</p>
                </div>
            </div>
        `;

        const input = document.getElementById('search-input');
        input.addEventListener('input', (e) => this.handleSearch(e.target.value));
        
        // Auto focus
        setTimeout(() => input.focus(), 100);
    },

    async handleSearch(query) {
        const container = document.getElementById('search-results-container');
        
        if (!query.trim()) {
            window.UI.showEmpty(container, '<h3>Search YUVI MUSIC</h3><p>Find your favorite songs, artists, and playlists.</p>');
            return;
        }

        if (searchTimeout) clearTimeout(searchTimeout);
        
        searchTimeout = setTimeout(async () => {
            window.UI.showLoader(container);
            
            const results = await window.YuviAPI.search(query);
            container.innerHTML = '<h2>Top Results</h2>';
            
            if (results && results.error) {
                window.UI.showEmpty(container, 'API Error: ' + results.error);
            } else if (results && results.length > 0) {
                const list = document.createElement('div');
                list.className = 'list-container';
                results.forEach((song, idx) => {
                    list.appendChild(window.UI.createListItem(song, idx));
                });
                container.appendChild(list);
            } else {
                window.UI.showEmpty(container, 'No results found for "' + query + '"');
            }
        }, 500); // 500ms debounce
    }
};

window.SearchView = SearchView;

