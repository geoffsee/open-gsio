FROM oven/bun:latest

WORKDIR /app

# Copy package files first for better caching
COPY package.json bun.lock ./

# Create directory structure for all packages
RUN mkdir -p packages/ai packages/ai/src/types packages/client packages/coordinators packages/env packages/router packages/schema packages/scripts packages/server packages/services packages/cloudflare-workers/analytics packages/cloudflare-workers/open-gsio

# Copy package.json files for all packages
COPY packages/ai/package.json ./packages/ai/
COPY packages/ai/src/types/package.json ./packages/ai/src/types/
COPY packages/client/package.json ./packages/client/
COPY packages/coordinators/package.json ./packages/coordinators/
COPY packages/env/package.json ./packages/env/
COPY packages/router/package.json ./packages/router/
COPY packages/schema/package.json ./packages/schema/
COPY packages/scripts/package.json ./packages/scripts/
COPY packages/server/package.json ./packages/server/
COPY packages/services/package.json ./packages/services/
COPY packages/cloudflare-workers/analytics/package.json ./packages/cloudflare-workers/analytics/
COPY packages/cloudflare-workers/open-gsio/package.json ./packages/cloudflare-workers/open-gsio/

# Install dependencies
RUN bun install

# Copy the rest of the application
COPY . .

# Create .env file if it doesn't exist
RUN touch ./packages/server/.env

# Build client and server
RUN bun build:client && bun build:server

# Ensure the client directories exist
RUN mkdir -p ./client/public ./client/dist/client

# Copy client files to the expected locations
RUN cp -r ./packages/client/public/* ./client/public/ || true
RUN cp -r ./packages/client/dist/* ./client/dist/ || true

EXPOSE 3003

# Verify server.js exists
RUN test -f ./packages/server/dist/server.js || (echo "Error: server.js not found" && exit 1)



CMD ["bun", "./packages/server/dist/server.js"]
