// js/components/now-playing.js

const NowPlaying = {
    overlay: null,
    
    init() {
        this.overlay = document.getElementById('now-playing-overlay');
        
        // Bind UI elements
        document.getElementById('close-overlay-btn').addEventListener('click', () => this.close());
        document.getElementById('np-play-btn').addEventListener('click', () => window.Player.togglePlay());
        
        document.getElementById('np-progress').addEventListener('input', (e) => {
            // Trigger same behavior as bottom player
            const bpProgress = document.getElementById('bp-progress');
            bpProgress.value = e.target.value;
            bpProgress.dispatchEvent(new Event('input'));
        });
        
        document.getElementById('np-volume').addEventListener('input', (e) => {
            const bpVolume = document.getElementById('bp-volume');
            bpVolume.value = e.target.value;
            bpVolume.dispatchEvent(new Event('input'));
        });

        // Lyrics toggle (placeholder)
        document.getElementById('bp-lyrics-btn').addEventListener('click', () => {
            this.open();
            document.getElementById('lyrics-section').classList.remove('hidden');
        });
        
        document.getElementById('np-fav-btn').addEventListener('click', (e) => {
            if (window.Player.currentSong) {
                window.Store.toggleFavorite(window.Player.currentSong);
                this.sync(window.Player.currentSong, window.Player.isPlaying);
            }
        });
    },

    open() {
        if (!this.overlay) return;
        this.overlay.classList.add('visible');
    },

    close() {
        if (!this.overlay) return;
        this.overlay.classList.remove('visible');
        document.getElementById('lyrics-section').classList.add('hidden');
    },

    sync(song, isPlaying) {
        if (!song) return;
        
        document.getElementById('np-artwork').src = song.thumbnail;
        document.getElementById('np-title').textContent = song.title;
        document.getElementById('np-artist').textContent = song.artist;
        document.getElementById('np-play-icon').textContent = isPlaying ? 'pause' : 'play_arrow';
        
        const favBtn = document.getElementById('np-fav-btn').querySelector('span');
        const isFav = window.Store.isFavorite(song.id);
        favBtn.textContent = isFav ? 'favorite' : 'favorite_border';
        favBtn.style.color = isFav ? 'var(--accent)' : '';
    }
};

window.NowPlaying = NowPlaying;
NowPlaying.init();
