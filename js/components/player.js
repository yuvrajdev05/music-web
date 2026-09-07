// js/components/player.js
// Uses native HTML5 Audio for true background playback (no YouTube iframe)

const Player = {
    currentSong: null,
    isPlaying: false,
    audio: null,
    updateInterval: null,

    init() {
        // Create a single native HTML5 audio element
        this.audio = new Audio();
        this.audio.preload = 'auto';

        // Wire up audio element events
        this.audio.addEventListener('play', () => {
            this.isPlaying = true;
            this.startProgressTracking();
            this.updateUI();
        });

        this.audio.addEventListener('pause', () => {
            this.isPlaying = false;
            this.stopProgressTracking();
            this.updateUI();
        });

        this.audio.addEventListener('ended', () => {
            this.isPlaying = false;
            this.stopProgressTracking();
            this.playNext();
        });

        this.audio.addEventListener('error', (e) => {
            console.error('Audio error:', e);
            document.getElementById('bp-title').textContent = 'Error loading song. Trying next...';
            setTimeout(() => this.playNext(), 2000);
        });

        this.bindEvents();
    },

    bindEvents() {
        document.getElementById('bp-play-btn').addEventListener('click', () => this.togglePlay());

        document.getElementById('bp-volume').addEventListener('input', (e) => {
            this.audio.volume = e.target.value / 100;
            const npVol = document.getElementById('np-volume');
            if (npVol) npVol.value = e.target.value;
        });

        document.getElementById('bp-progress').addEventListener('input', (e) => {
            if (this.audio.duration) {
                this.audio.currentTime = (e.target.value / 100) * this.audio.duration;
            }
        });

        document.getElementById('bp-next-btn').addEventListener('click', () => this.playNext());
        document.getElementById('bp-prev-btn').addEventListener('click', () => {
            // Restart song if past 3s, else just restart
            if (this.audio.currentTime > 3) {
                this.audio.currentTime = 0;
            } else {
                this.playNext();
            }
        });

        // Click on left section of bottom player to open Now Playing overlay
        document.getElementById('player-trigger').addEventListener('click', () => {
            if (this.currentSong && window.NowPlaying) {
                window.NowPlaying.open();
            }
        });
    },

    playSong(song) {
        if (!song || !song.id) return;
        this.currentSong = song;

        // Point directly to our backend streaming endpoint
        this.audio.src = `/api/stream?id=${song.id}`;
        this.audio.load();
        this.audio.play().catch(err => {
            console.error('Playback failed:', err);
        });

        // Add to recently played
        window.Store.addRecent(song);

        // Update all UI
        this.updateUI();

        // --- Background Playback: Register with OS via Media Session API ---
        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: song.title,
                artist: song.artist,
                album: 'YUVI MUSIC',
                artwork: [
                    { src: song.thumbnail, sizes: '96x96',   type: 'image/jpeg' },
                    { src: song.thumbnail, sizes: '256x256', type: 'image/jpeg' },
                    { src: song.thumbnail, sizes: '512x512', type: 'image/jpeg' }
                ]
            });

            navigator.mediaSession.setActionHandler('play',          () => this.togglePlay());
            navigator.mediaSession.setActionHandler('pause',         () => this.togglePlay());
            navigator.mediaSession.setActionHandler('nexttrack',     () => this.playNext());
            navigator.mediaSession.setActionHandler('previoustrack', () => { this.audio.currentTime = 0; });
            navigator.mediaSession.setActionHandler('seekto', (details) => {
                if (details.seekTime && this.audio.duration) {
                    this.audio.currentTime = details.seekTime;
                }
            });
        }
    },

    togglePlay() {
        if (!this.currentSong) return;
        if (this.audio.paused) {
            this.audio.play().catch(e => console.error(e));
        } else {
            this.audio.pause();
        }
    },

    async playNext() {
        if (!this.currentSong) return;

        // 1. Try queue first
        const nextInQueue = window.Store.dequeue();
        if (nextInQueue) {
            this.playSong(nextInQueue);
            return;
        }

        // 2. Infinite Autoplay: fetch a related song
        try {
            document.getElementById('bp-title').textContent = 'Loading next song...';
            const related = await window.YuviAPI.getRelated(this.currentSong.artist);
            if (related && related.length > 0) {
                let nextSong = related.find(s => s.id !== this.currentSong.id);
                if (!nextSong) nextSong = related[0];
                this.playSong(nextSong);
            }
        } catch (e) {
            console.error('Autoplay failed', e);
        }
    },

    startProgressTracking() {
        if (this.updateInterval) clearInterval(this.updateInterval);
        this.updateInterval = setInterval(() => {
            const current = this.audio.currentTime;
            const duration = this.audio.duration || 0;
            const percentage = duration ? (current / duration) * 100 : 0;

            // Update Bottom Player
            document.getElementById('bp-progress').value = percentage;
            document.getElementById('bp-time-current').textContent = this.formatTime(current);
            document.getElementById('bp-time-total').textContent = this.formatTime(duration);

            // Update Now Playing overlay
            const npProgress = document.getElementById('np-progress');
            const npCurrent = document.getElementById('np-time-current');
            const npTotal = document.getElementById('np-time-total');
            if (npProgress) npProgress.value = percentage;
            if (npCurrent) npCurrent.textContent = this.formatTime(current);
            if (npTotal) npTotal.textContent = this.formatTime(duration);

            // Update Media Session position state
            if ('mediaSession' in navigator && navigator.mediaSession.setPositionState && duration) {
                navigator.mediaSession.setPositionState({
                    duration,
                    playbackRate: this.audio.playbackRate,
                    position: current
                });
            }
        }, 500);
    },

    stopProgressTracking() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    },

    updateUI() {
        if (!this.currentSong) return;

        document.getElementById('bp-artwork').src = this.currentSong.thumbnail;
        document.getElementById('bp-artwork').style.display = 'block';
        document.getElementById('bp-title').textContent = this.currentSong.title;
        document.getElementById('bp-artist').textContent = this.currentSong.artist;
        document.getElementById('bp-play-icon').textContent = this.isPlaying ? 'pause' : 'play_arrow';

        if (window.NowPlaying) {
            window.NowPlaying.sync(this.currentSong, this.isPlaying);
        }
    },

    formatTime(seconds) {
        if (!seconds || isNaN(seconds)) return '0:00';
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    }
};

window.Player = Player;
Player.init();
