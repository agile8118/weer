#!/bin/sh

HOST_ENV="/mnt/host_server/.env"
CONTAINER_ENV="/app/packages/server/.env"

# Strip CRLF when copying so sourcing doesn't break on Windows-edited files
tr -d '\r' < "$HOST_ENV" > "$CONTAINER_ENV"

# Append Docker DB overrides (later lines win when the file is sourced)
printf "\nDB_HOST=postgres\nDB_PORT=5432\nDB_USER=weer\nDB_PASSWORD=weer\nDB_DATABASE=weer\n" >> "$CONTAINER_ENV"

set -a; . "$CONTAINER_ENV"; set +a

if [ "${SEED_DB:-false}" = "true" ]; then
  echo "[docker] seeding database..."
  cd /app/packages/server && /app/node_modules/.bin/tsx ./src/database/seed.ts
fi

cd /app/packages/server
if [ "${START_MODE:-node}" = "pm2" ]; then
  printf "\n[docker] starting server with PM2...\n"
  exec pm2-runtime start ecosystem.config.cjs
else
  printf "\n[docker] starting server...\n"
  exec node dist/index.js
fi