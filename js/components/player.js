// js/components/player.js

let ytPlayer;
let isPlayerReady = false;

const Player = {
    currentSong: null,
    isPlaying: false,
    updateInterval: null,

    init() {
        // Expose globally for YT API
        window.onYouTubeIframeAPIReady = () => {
            ytPlayer = new YT.Player('yt-player', {
                height: '100',
                width: '100',
                videoId: '',
                playerVars: {
                    'playsinline': 1,
                    'controls': 0,
                    'disablekb': 1,
                    'fs': 0,
                    'modestbranding': 1
                },
                events: {
                    'onReady': () => { isPlayerReady = true; },
                    'onStateChange': this.onPlayerStateChange.bind(this)
                }
            });
        };
        
        this.bindEvents();
    },

    bindEvents() {
        const playBtn = document.getElementById('bp-play-btn');
        const prevBtn = document.getElementById('bp-prev-btn');
        const nextBtn = document.getElementById('bp-next-btn');
        const volSlider = document.getElementById('bp-volume');
        const progressBar = document.getElementById('bp-progress');
        
        playBtn.addEventListener('click', () => this.togglePlay());
        
        volSlider.addEventListener('input', (e) => {
            if (isPlayerReady) ytPlayer.setVolume(e.target.value);
            document.getElementById('np-volume').value = e.target.value; // Sync with now playing
        });
        
        progressBar.addEventListener('input', (e) => {
            if (isPlayerReady && ytPlayer.getDuration) {
                const duration = ytPlayer.getDuration();
                const seekTo = (e.target.value / 100) * duration;
                ytPlayer.seekTo(seekTo, true);
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
        
        if (isPlayerReady) {
            ytPlayer.loadVideoById(song.id);
            this.isPlaying = true;
            this.updateUI();
            
            // Add to recently played
            window.Store.addToRecentlyPlayed(song);
        } else {
            console.warn("YouTube API not ready yet");
        }
    },

    togglePlay() {
        if (!this.currentSong || !isPlayerReady) return;
        
        const state = ytPlayer.getPlayerState();
        if (state === YT.PlayerState.PLAYING) {
            ytPlayer.pauseVideo();
            this.isPlaying = false;
        } else {
            ytPlayer.playVideo();
            this.isPlaying = true;
        }
        this.updateUI();
    },

    onPlayerStateChange(event) {
        if (event.data === YT.PlayerState.PLAYING) {
            this.isPlaying = true;
            this.startProgressTracking();
        } else {
            this.isPlaying = false;
            this.stopProgressTracking();
        }
        
        if (event.data === YT.PlayerState.ENDED) {
            this.isPlaying = false;
            this.playNext(); // Autoplay next song
        }
        
        this.updateUI();
    },

    async playNext() {
        if (!this.currentSong) return;
        
        // 1. Try to play from queue
        const nextInQueue = window.Store.dequeue();
        if (nextInQueue) {
            this.playSong(nextInQueue);
            return;
        }

        // 2. Infinite Autoplay: Fetch related song
        try {
            // Give UI feedback
            document.getElementById('bp-title').textContent = 'Loading next song...';
            
            const related = await window.YuviAPI.getRelated(this.currentSong.artist);
            if (related && related.length > 0) {
                // Try to find a song that isn't the exact same one
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
            if (isPlayerReady && ytPlayer.getCurrentTime) {
                const current = ytPlayer.getCurrentTime();
                const duration = ytPlayer.getDuration();
                const percentage = (current / duration) * 100;
                
                // Update Bottom Player
                document.getElementById('bp-progress').value = percentage || 0;
                document.getElementById('bp-time-current').textContent = this.formatTime(current);
                document.getElementById('bp-time-total').textContent = this.formatTime(duration);
                
                // Update Now Playing
                document.getElementById('np-progress').value = percentage || 0;
                document.getElementById('np-time-current').textContent = this.formatTime(current);
                document.getElementById('np-time-total').textContent = this.formatTime(duration);
            }
        }, 1000);
    },

    stopProgressTracking() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    },

    updateUI() {
        if (!this.currentSong) return;
        
        // Update Bottom Player UI
        document.getElementById('bp-artwork').src = this.currentSong.thumbnail;
        document.getElementById('bp-artwork').style.display = 'block';
        document.getElementById('bp-title').textContent = this.currentSong.title;
        document.getElementById('bp-artist').textContent = this.currentSong.artist;
        document.getElementById('bp-play-icon').textContent = this.isPlaying ? 'pause' : 'play_arrow';
        
        // Sync with Now Playing if it exists
        if (window.NowPlaying) {
            window.NowPlaying.sync(this.currentSong, this.isPlaying);
        }
    },

    formatTime(seconds) {
        if (!seconds) return '0:00';
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    }
};

window.Player = Player;
Player.init();
