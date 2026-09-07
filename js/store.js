// js/store.js

const Store = {
    data: {
        favorites: [], // Array of song objects
        playlists: [], // Array of { id, name, songs: [] }
        queue: [], // Array of song objects
        recentlyPlayed: [] // Array of song objects
    },

    init() {
        const stored = localStorage.getItem('yuvi_music_store');
        if (stored) {
            try {
                this.data = { ...this.data, ...JSON.parse(stored) };
            } catch (e) {
                console.error('Failed to parse store:', e);
            }
        }
        // Initialize default playlists if empty
        if (this.data.playlists.length === 0) {
            this.createPlaylist('My Top Tracks');
        }
    },

    save() {
        localStorage.setItem('yuvi_music_store', JSON.stringify(this.data));
        // Dispatch custom event for UI updates
        window.dispatchEvent(new Event('store_updated'));
    },

    // --- Favorites ---
    toggleFavorite(song) {
        const index = this.data.favorites.findIndex(s => s.id === song.id);
        if (index > -1) {
            this.data.favorites.splice(index, 1);
        } else {
            this.data.favorites.push(song);
        }
        this.save();
    },

    isFavorite(songId) {
        return this.data.favorites.some(s => s.id === songId);
    },

    // --- Playlists ---
    createPlaylist(name) {
        const id = 'pl_' + Date.now();
        this.data.playlists.push({ id, name, songs: [] });
        this.save();
        return id;
    },

    deletePlaylist(id) {
        this.data.playlists = this.data.playlists.filter(p => p.id !== id);
        this.save();
    },

    addSongToPlaylist(playlistId, song) {
        const playlist = this.data.playlists.find(p => p.id === playlistId);
        if (playlist && !playlist.songs.some(s => s.id === song.id)) {
            playlist.songs.push(song);
            this.save();
        }
    },

    // --- History ---
    addToRecentlyPlayed(song) {
        this.data.recentlyPlayed = this.data.recentlyPlayed.filter(s => s.id !== song.id);
        this.data.recentlyPlayed.unshift(song);
        if (this.data.recentlyPlayed.length > 20) {
            this.data.recentlyPlayed.pop();
        }
        this.save();
    },

    // --- Queue ---
    setQueue(songs) {
        this.data.queue = [...songs];
        this.save();
    },

    addToQueue(song) {
        this.data.queue.push(song);
        this.save();
    },

    clearQueue() {
        this.data.queue = [];
        this.save();
    }
};

window.Store = Store;
Store.init();
