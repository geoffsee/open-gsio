FROM oven/bun:1 as base
WORKDIR /app
COPY . .
RUN bun install

# Build client
FROM base as client-builder
WORKDIR /app
RUN cd packages/client && bun run build

# Build server
FROM base as server-builder
WORKDIR /app
COPY --from=client-builder /app/packages/client/dist /app/packages/client/dist
RUN cd packages/server && bun run build

# Final image
FROM oven/bun:1-slim
WORKDIR /app
COPY --from=server-builder /app/packages/server/build /app/packages/server/build
# Ensure client dist is in the expected location for the server
COPY --from=client-builder /app/packages/client/dist /app/packages/client/dist
# Create the client subdirectory if it doesn't exist
RUN mkdir -p /app/packages/client/dist/client
# Copy client dist files to the client subdirectory if they're not already there
RUN cp -r /app/packages/client/dist/* /app/packages/client/dist/client/ 2>/dev/null || true
COPY package.json .
COPY bun.lock .

# Install only production dependencies
RUN bun install --lockfile-only && bun install --production

# Set environment variables
ENV NODE_ENV=production

# The following environment variables can be provided at runtime:
# - EVENTSOURCE_HOST
# - GROQ_API_KEY
# - ANTHROPIC_API_KEY
# - FIREWORKS_API_KEY
# - XAI_API_KEY
# - CEREBRAS_API_KEY
# - CLOUDFLARE_API_KEY
# - CLOUDFLARE_ACCOUNT_ID

# Expose the server port
EXPOSE 3003

# Run the server
CMD ["bun", "packages/server/build/server.js"]
