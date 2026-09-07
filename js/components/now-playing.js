// js/components/now-playing.js

const NowPlaying = {
    overlay: null,
    
    init() {
        this.overlay = document.getElementById('now-playing-overlay');
        
        // Open on mobile by clicking player left side
        document.getElementById('player-trigger').addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                this.open();
            }
        });

        // Bind UI elements
        document.getElementById('close-overlay-btn').addEventListener('click', () => this.close());
        document.getElementById('np-play-btn').addEventListener('click', () => window.Player.togglePlay());
        
        document.getElementById('np-progress').addEventListener('input', (e) => {
            if (window.Player.audio && window.Player.audio.duration) {
                window.Player.audio.currentTime = (e.target.value / 100) * window.Player.audio.duration;
            }
        });
        
        document.getElementById('np-volume').addEventListener('input', (e) => {
            if (window.Player.audio) {
                window.Player.audio.volume = e.target.value / 100;
                document.getElementById('bp-volume').value = e.target.value;
            }
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

        this.bindTouchGestures();
    },

    bindTouchGestures() {
        let startY = 0;
        let currentY = 0;
        let isDragging = false;
        
        // Only bind touch gestures to the header so the main content can scroll natively
        const header = this.overlay.querySelector('.overlay-header');

        header.addEventListener('touchstart', (e) => {
            if (e.target.tagName === 'INPUT' || e.target.closest('button')) return;
            startY = e.touches[0].clientY;
            isDragging = true;
            this.overlay.style.transition = 'none'; // Follow finger exactly
        }, { passive: true });

        header.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            currentY = e.touches[0].clientY;
            const diff = currentY - startY;
            if (diff > 0) { // Only allow swiping down
                this.overlay.style.transform = `translateY(${diff}px)`;
            }
        }, { passive: true });

        header.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            isDragging = false;
            
            // Restore smooth transitions
            this.overlay.style.transition = 'top 0.4s cubic-bezier(0.25, 1, 0.5, 1), transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
            
            const diff = currentY - startY;
            if (diff > 120) {
                // Swipe threshold met, close it
                this.close();
            } else {
                // Snap back to top
                this.overlay.style.transform = `translateY(0px)`;
            }
            
            setTimeout(() => {
                if (!this.overlay.classList.contains('visible')) {
                    this.overlay.style.transform = '';
                }
            }, 400);
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
