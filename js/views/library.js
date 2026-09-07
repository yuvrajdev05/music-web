// js/views/library.js

const LibraryView = {
    render(container, section = 'overview', id = null) {
        if (section === 'favorites') {
            this.renderFavorites(container);
        } else if (section === 'playlist' && id) {
            this.renderPlaylist(container, id);
        } else {
            this.renderOverview(container);
        }
    },

    renderOverview(container) {
        container.innerHTML = `
            <h1>Library</h1>
            
            <section style="margin-bottom: 3rem;">
                <h2>Recently Played</h2>
                <div class="grid-container" id="lib-recent-grid"></div>
            </section>

            <section style="margin-bottom: 3rem;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.75rem;">
                    <h2>Playlists</h2>
                    <button class="icon-btn" id="new-playlist-btn" style="opacity:1; color: var(--accent);">
                        <span class="material-symbols-rounded">add_circle</span>
                    </button>
                </div>
                <div class="list-container" id="lib-playlists-list"></div>
            </section>
        `;

        // Render Recently Played
        const recentGrid = document.getElementById('lib-recent-grid');
        const recent = window.Store.data.recentlyPlayed;
        if (recent.length > 0) {
            recent.forEach(song => recentGrid.appendChild(window.UI.createSongCard(song)));
        } else {
            window.UI.showEmpty(recentGrid, 'No recently played songs.');
        }

        // Render Playlists
        this.renderPlaylistList();

        // New Playlist Btn
        document.getElementById('new-playlist-btn').addEventListener('click', () => {
            const name = prompt('Enter playlist name:');
            if (name) {
                window.Store.createPlaylist(name);
                this.renderPlaylistList();
                window.UI.updateSidebarPlaylists();
            }
        });
    },

    renderPlaylistList() {
        const container = document.getElementById('lib-playlists-list');
        if (!container) return;
        
        container.innerHTML = '';
        const playlists = window.Store.data.playlists;
        
        if (playlists.length > 0) {
            playlists.forEach(p => {
                const item = document.createElement('div');
                item.className = 'list-item';
                item.innerHTML = `
                    <div class="list-info">
                        <h4 class="list-title">${p.name}</h4>
                        <p class="list-artist">${p.songs.length} songs</p>
                    </div>
                    <div class="list-actions">
                        <button class="icon-btn delete-pl-btn" data-id="${p.id}" style="color: #ff453a;">
                            <span class="material-symbols-rounded">delete</span>
                        </button>
                    </div>
                `;
                
                item.addEventListener('click', (e) => {
                    if (e.target.closest('.delete-pl-btn')) {
                        if (confirm(`Delete playlist "${p.name}"?`)) {
                            window.Store.deletePlaylist(p.id);
                            this.renderPlaylistList();
                            window.UI.updateSidebarPlaylists();
                        }
                    } else {
                        window.location.hash = `/playlist/${p.id}`;
                    }
                });
                
                container.appendChild(item);
            });
        } else {
            window.UI.showEmpty(container, 'No playlists created.');
        }
    },

    renderFavorites(container) {
        container.innerHTML = `
            <h1>Favorite Songs</h1>
            <div id="favorites-list" class="list-container"></div>
        `;
        
        const list = document.getElementById('favorites-list');
        const favs = window.Store.data.favorites;
        
        if (favs.length > 0) {
            favs.forEach((song, idx) => list.appendChild(window.UI.createListItem(song, idx)));
        } else {
            window.UI.showEmpty(list, 'You have no favorite songs yet.');
        }
    },

    renderPlaylist(container, id) {
        const playlist = window.Store.data.playlists.find(p => p.id === id);
        if (!playlist) {
            container.innerHTML = `<h1>Playlist Not Found</h1>`;
            return;
        }

        container.innerHTML = `
            <div style="display: flex; align-items: flex-end; gap: 2rem; margin-bottom: 2rem;">
                <div style="width: 200px; height: 200px; background: linear-gradient(135deg, var(--bg-surface-hover), var(--bg-surface)); border-radius: 12px; display: flex; align-items: center; justify-content: center; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
                    <span class="material-symbols-rounded" style="font-size: 64px; color: var(--text-tertiary);">queue_music</span>
                </div>
                <div>
                    <h3 style="text-transform: uppercase; font-size: 0.8rem; letter-spacing: 2px;">Playlist</h3>
                    <h1 style="font-size: 3rem; margin-bottom: 1rem;">${playlist.name}</h1>
                    <p>${playlist.songs.length} songs</p>
                    <button class="icon-btn play-btn" id="play-all-btn" style="margin-top: 1rem; width: 48px; height: 48px;">
                        <span class="material-symbols-rounded" style="font-size: 28px;">play_arrow</span>
                    </button>
                </div>
            </div>
            <div id="playlist-songs-list" class="list-container"></div>
        `;

        const list = document.getElementById('playlist-songs-list');
        if (playlist.songs.length > 0) {
            playlist.songs.forEach((song, idx) => list.appendChild(window.UI.createListItem(song, idx)));
        } else {
            window.UI.showEmpty(list, 'This playlist is empty.');
        }

        document.getElementById('play-all-btn').addEventListener('click', () => {
            if (playlist.songs.length > 0) {
                window.Player.playSong(playlist.songs[0]);
                // Queue logic can be added here
            }
        });
    }
};

window.LibraryView = LibraryView;
