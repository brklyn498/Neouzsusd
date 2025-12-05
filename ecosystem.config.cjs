module.exports = {
    apps: [
        {
            name: 'server-3050',
            script: 'server.js',
            args: '--port=3050',
            cwd: 'd:/claudecode/exchangeusduzs',
            watch: false,
            autorestart: true,
            max_restarts: 10,
            restart_delay: 1000,
            env: {
                NODE_ENV: 'production'
            }
        },
        {
            name: 'server-3051',
            script: 'server.js',
            args: '--port=3051',
            cwd: 'd:/claudecode/exchangeusduzs',
            watch: false,
            autorestart: true,
            max_restarts: 10,
            restart_delay: 1000,
            env: {
                NODE_ENV: 'production'
            }
        }
    ]
};
