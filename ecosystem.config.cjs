const path = require("path")

const root = __dirname
const logsDir = path.join(root, "logs")

/** PM2 — production server DPPI (Next.js port 2000) */
module.exports = {
  apps: [
    {
      name: "dppi",
      cwd: root,
      script: path.join(root, "node_modules", "next", "dist", "bin", "next"),
      args: "start -p 2000",
      interpreter: "node",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      max_restarts: 15,
      min_uptime: "10s",
      restart_delay: 5000,
      watch: false,
      env: {
        NODE_ENV: "production",
      },
      error_file: path.join(logsDir, "pm2-error.log"),
      out_file: path.join(logsDir, "pm2-out.log"),
      merge_logs: true,
      time: true,
    },
  ],
}
