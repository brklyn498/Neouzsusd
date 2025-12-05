import http from 'http';
import { exec } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Parse command line arguments for port
const args = process.argv.slice(2);
const portArg = args.find(arg => arg.startsWith('--port='));
const PORT = portArg ? parseInt(portArg.split('=')[1]) : 3050;

const server = http.createServer((req, res) => {
    // Set CORS headers to allow requests from the frontend (if not using proxy)
    // But since we are using proxy, strict CORS isn't strictly necessary, but good for safety.
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    if (req.method === 'POST' && req.url === '/api/refresh') {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            let scope = 'exchange';
            try {
                if (body) {
                    const parsed = JSON.parse(body);
                    if (parsed.scope) scope = parsed.scope;
                }
            } catch (e) {
                console.error("Error parsing request body:", e);
            }

            console.log(`Received refresh request for scope: ${scope}. Running scraper...`);

            // Execute the python script with --force flag and --scope
            const scriptPath = path.join(__dirname, 'scripts', 'scraper.py');
            const command = `python "${scriptPath}" --force --scope ${scope}`;

            exec(command, (error, stdout, stderr) => {
                if (error) {
                    console.error(`Error executing scraper: ${error.message}`);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: error.message }));
                    return;
                }

                if (stderr) {
                    console.error(`Scraper stderr: ${stderr}`);
                }

                console.log(`Scraper output: ${stdout}`);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, message: 'Scraper executed successfully' }));
            });
        });
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end('Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
