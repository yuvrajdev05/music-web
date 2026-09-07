const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
    // 1. Intercept API Proxy Requests
    if (req.url.startsWith('/api/search')) {
        const urlObj = new URL(req.url, `http://localhost:${PORT}`);
        const query = urlObj.searchParams.get('q');
        
        if (!query) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Missing query parameter' }));
        }

        const targetUrl = `https://youtube-api-jnhq.onrender.com/search?title=${encodeURIComponent(query)}`;
        
        https.get(targetUrl, (apiRes) => {
            let data = '';
            apiRes.on('data', chunk => data += chunk);
            apiRes.on('end', () => {
                // Add permissive CORS headers to our local response
                res.writeHead(apiRes.statusCode, {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                });
                res.end(data);
            });
        }).on('error', (err) => {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Failed to proxy request', details: err.message }));
        });
        
        return;
    }

    // 2. Audio Streaming Proxy Endpoint
    if (req.url.startsWith('/api/stream')) {
        const urlObj = new URL(req.url, `http://localhost:${PORT}`);
        const videoId = urlObj.searchParams.get('id');
        
        if (!videoId) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Missing video ID' }));
        }

        try {
            const ytdl = require('ytdl-core');
            const streamUrl = `https://www.youtube.com/watch?v=${videoId}`;
            
            // Allow range requests if needed, but for simple streaming:
            res.writeHead(200, {
                'Content-Type': 'audio/mpeg',
                'Access-Control-Allow-Origin': '*'
            });
            
            ytdl(streamUrl, { filter: 'audioonly', quality: 'highestaudio' })
                .on('error', err => {
                    console.error('YTDL Error:', err);
                    if (!res.headersSent) {
                        res.writeHead(500);
                        res.end('Streaming error');
                    }
                })
                .pipe(res);
                
        } catch (err) {
            console.error('Stream setup error:', err);
            res.writeHead(500);
            res.end(JSON.stringify({ error: 'Failed to stream', details: err.message }));
        }
        return;
    }

    // 3. Serve Static Files
    let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url);
    
    // Normalize path to prevent directory traversal
    filePath = path.normalize(filePath);
    if (!filePath.startsWith(__dirname)) {
        res.writeHead(403);
        return res.end('403 Forbidden');
    }

    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 Not Found</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end('Sorry, check with the site admin for error: ' + error.code + ' ..\n');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`\n=============================================`);
    console.log(`🚀 YUVI MUSIC Server is running!`);
    console.log(`👉 Open http://localhost:${PORT} in your browser`);
    console.log(`=============================================\n`);
});
