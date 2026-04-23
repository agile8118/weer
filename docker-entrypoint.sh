#!/bin/sh

if [ "${SEED_DB:-false}" = "true" ]; then
  echo "[docker] seeding database..."
  cd /app && yarn seed
fi

cd /app/packages/server
if [ "${START_MODE:-node}" = "pm2" ]; then
  printf "\n[docker] starting server with PM2...\n"
  exec pm2-runtime start ecosystem.config.cjs
else
  printf "\n[docker] starting server...\n"
  exec node dist/index.js
fi