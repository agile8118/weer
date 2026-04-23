module.exports = {
  apps: [
    {
      name: "weer",
      script: "dist/index.js",
      instances: "max",
      exec_mode: "cluster",
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
    },
  ],
};