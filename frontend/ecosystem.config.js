// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'tegra-backend',
      script: './server-trazabilidad/server.js',
      cwd: '/workspaces/TEGRA-2-0/frontend/mes-frontend',
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 8080
      },
      error_file: './logs/backend-error.log',
      out_file: './logs/backend-out.log',
      log_file: './logs/backend-combined.log',
      time: true
    },
    {
      name: 'tegra-frontend',
      script: 'npm',
      args: 'run preview',
      cwd: '/workspaces/TEGRA-2-0/frontend/mes-frontend',
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 5173
      },
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_file: './logs/frontend-combined.log',
      time: true
    }
  ]
};