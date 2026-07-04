const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml'
};

const server = http.createServer((req, res) => {
    // Convert URL path to system path
    let filePath = '.' + req.url;
    if (filePath === './') {
        filePath = './index.html';
    }

    // Solve for query strings or anchors
    filePath = filePath.split('?')[0].split('#')[0];

    const absolutePath = path.resolve(filePath);
    const workspacePath = path.resolve('.');

    // Security check: ensure path is within the workspace directory
    if (!absolutePath.startsWith(workspacePath)) {
        res.writeHead(403, { 'Content-Type': 'text/plain' });
        res.end('403 Forbidden: Access denied.');
        return;
    }

    // Check if file exists
    fs.stat(absolutePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
            return;
        }

        // Get extension
        const ext = path.extname(absolutePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        // Read and stream file
        res.writeHead(200, { 'Content-Type': contentType });
        const stream = fs.createReadStream(absolutePath);
        stream.pipe(res);
    });
});

server.listen(PORT, () => {
    console.log(`\n==================================================`);
    console.log(`  Myanmar Seismicity & Tectonic Web Map Server`);
    console.log(`  Running locally at: http://localhost:${PORT}`);
    console.log(`  Press Ctrl+C to terminate server.`);
    console.log(`==================================================\n`);
});
