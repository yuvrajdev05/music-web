// js/api.js

const API_BASE = 'https://youtube-api-jnhq.onrender.com/search';

const YuviAPI = {
    /**
     * Parses ISO 8601 duration (e.g. PT3M18S) to MM:SS
     */
    parseDuration(pt) {
        if (!pt) return '0:00';
        let match = pt.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
        if (!match) return pt;
        
        let h = match[1] ? parseInt(match[1]) : 0;
        let m = match[2] ? parseInt(match[2]) : 0;
        let s = match[3] ? parseInt(match[3]) : 0;
        
        let result = '';
        if (h > 0) result += h + ':';
        result += (h > 0 ? m.toString().padStart(2, '0') : m) + ':';
        result += s.toString().padStart(2, '0');
        
        return result;
    },

    /**
     * Extracts videoId from YouTube URL
     */
    extractVideoId(url) {
        if (!url) return null;
        const match = url.match(/[?&]v=([^&]+)/);
        return match ? match[1] : null;
    },

    /**
     * Attempts to parse an artist name from a YouTube title
     */
    extractArtist(title) {
        if (!title) return 'Unknown Artist';
        if (title.includes('-')) {
            return title.split('-')[0].trim();
        } else if (title.includes('|')) {
            return title.split('|')[0].trim();
        }
        return 'Unknown Artist';
    },

    /**
     * Normalizes the API response object
     */
    normalize(data) {
        const videoId = this.extractVideoId(data.url);
        if (!videoId) return null;

        return {
            id: videoId,
            title: data.title || 'Unknown Title',
            artist: this.extractArtist(data.title),
            thumbnail: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
            duration: this.parseDuration(data.duration),
            url: data.url
        };
    },

    /**
     * Searches the API via our local Node.js proxy to bypass CORS
     */
    /**
     * Searches the API via our Node.js proxy to bypass CORS with Caching
     */
    async search(query) {
        try {
            const targetUrl = `/api/search?q=${encodeURIComponent(query)}`;
            
            // Check cache to improve performance significantly
            const cached = sessionStorage.getItem('yuvi_cache_' + targetUrl);
            if (cached) return JSON.parse(cached);

            const res = await fetch(targetUrl);
            if (!res.ok) {
                let errorMsg = 'API Error';
                try {
                    const errData = await res.json();
                    if (errData.error) errorMsg = errData.error;
                } catch(e) {}
                throw new Error(errorMsg);
            }
            const data = await res.json();
            
            const normalized = this.normalize(data);
            const result = normalized ? [normalized] : [];
            
            // Save to cache
            if (result.length > 0) {
                sessionStorage.setItem('yuvi_cache_' + targetUrl, JSON.stringify(result));
            }
            
            return result;
        } catch (error) {
            console.error('Search failed:', error);
            return { error: error.message };
        }
    },

    /**
     * Gets related songs (using artist name as a fallback search)
     */
    async getRelated(artistName) {
        if (!artistName) return [];
        const results = await this.search(`${artistName} songs`);
        return results.filter(s => s.thumbnail); // filter valid
    },

    /**
     * Gets top Arijit Singh hits
     */
    async getArijitSongs() {
        return this.search('arijit singh top hits');
    },

    /**
     * Gets Bollywood romance hits
     */
    async getBollywoodRomance() {
        return this.search('bollywood romantic songs 2024');
    },

    /**
     * Mock functions for Home Page sections using real searches
     */
    async getTrending() {
        return await this.search('Top Hits 2024');
    },

    async getPopular() {
        return await this.search('Viral Songs Official');
    }
};

window.YuviAPI = YuviAPI;
