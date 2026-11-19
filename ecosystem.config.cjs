module.exports = {
  apps: [
    {
      name: 'czns-api',
      cwd: './apps/api',
      script: 'node',
      args: 'dist/server.js',
      env: {
        PORT: 5000,
        NODE_ENV: 'production',
      },
    },
    {
      name: 'czns-web',
      cwd: './apps/web',
      script: 'node_modules/next/dist/bin/next',
      args: 'start -p 3000',
      env: {
        PORT: 3000,
        NODE_ENV: 'production',
        NEXT_PUBLIC_API_URL: 'http://localhost:5000',
      },
    },
  ],
};
