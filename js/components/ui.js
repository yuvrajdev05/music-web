// js/components/ui.js

const UI = {
    /**
     * Creates a standard song card (e.g. for Home/Browse grid)
     */
    createSongCard(song) {
        const card = document.createElement('div');
        card.className = 'song-card';
        card.innerHTML = `
            <div class="card-container">
                <img src="${song.thumbnail}" alt="${song.title}" class="card-artwork">
                <span class="yuvi-badge">Made by Yuvi</span>
            </div>
            <h4 class="card-title">${song.title}</h4>
            <p class="card-artist">${song.artist}</p>
        `;
        card.addEventListener('click', () => {
            window.Player.playSong(song);
        });
        return card;
    },

    /**
     * Creates a list item (e.g. for Search results or Playlists)
     */
    createListItem(song, index = -1) {
        const item = document.createElement('div');
        item.className = 'list-item';
        
        const favIcon = window.Store.isFavorite(song.id) ? 'favorite' : 'favorite_border';

        item.innerHTML = `
            ${index > -1 ? `<span style="color: var(--text-tertiary); width: 30px;">${index + 1}</span>` : ''}
            <div style="position: relative;">
                <img src="${song.thumbnail}" alt="${song.title}" class="list-artwork">
                <span class="yuvi-badge">Yuvi</span>
                <div class="list-play-overlay">
                    <span class="material-symbols-rounded">play_arrow</span>
                </div>
            </div>
            <div class="list-info">
                <h4 class="list-title">${song.title}</h4>
                <p class="list-artist">${song.artist}</p>
            </div>
            <div class="list-actions">
                <button class="icon-btn fav-btn" data-id="${song.id}">
                    <span class="material-symbols-rounded" style="${window.Store.isFavorite(song.id) ? 'color: var(--accent)' : ''}">${favIcon}</span>
                </button>
                <button class="icon-btn reload-btn" title="Reload Song" data-id="${song.id}">
                    <span class="material-symbols-rounded">refresh</span>
                </button>
            </div>
            <span class="list-duration">${song.duration}</span>
        `;

        item.addEventListener('click', (e) => {
            if (e.target.closest('.fav-btn')) {
                window.Store.toggleFavorite(song);
                const btn = item.querySelector('.fav-btn span');
                const isFav = window.Store.isFavorite(song.id);
                btn.textContent = isFav ? 'favorite' : 'favorite_border';
                btn.style.color = isFav ? 'var(--accent)' : '';
            } else if (e.target.closest('.reload-btn')) {
                // Force reload the song
                window.Player.playSong(song);
            } else {
                window.Player.playSong(song);
            }
        });

        return item;
    },

    /**
     * Renders a loader
     */
    showLoader(container) {
        container.innerHTML = '<div class="loader"></div>';
    },

    /**
     * Renders an empty state
     */
    showEmpty(container, message) {
        container.innerHTML = `<div class="empty-state">${message}</div>`;
    },

    /**
     * Updates sidebar playlists
     */
    updateSidebarPlaylists() {
        const container = document.getElementById('sidebar-playlists');
        if (!container) return;
        
        // Keep the h3 title
        container.innerHTML = '<h3>Playlists</h3>';
        
        window.Store.data.playlists.forEach(p => {
            const a = document.createElement('a');
            a.href = `#/playlist/${p.id}`;
            a.className = 'nav-item';
            a.innerHTML = `<span class="material-symbols-rounded">queue_music</span> ${p.name}`;
            container.appendChild(a);
        });
    }
};

window.UI = UI;
