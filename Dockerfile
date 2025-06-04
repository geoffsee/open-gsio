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
RUN cd packages/server && bun run build:native && chmod +x ./build/open-gsio-server

# Final image
FROM bitnami/minideb:latest
WORKDIR /app
COPY --from=server-builder /app/packages/server/build/open-gsio-server /app/open-gsio-server
# The following environment variables can be provided at runtime:
# - EVENTSOURCE_HOST  
# - GROQ_API_KEY
# - ANTHROPIC_API_KEY
# - FIREWORKS_API_KEY
# - XAI_API_KEY
# - CEREBRAS_API_KEY
# - CLOUDFLARE_API_KEY
# - CLOUDFLARE_ACCOUNT_ID

# Check if server binary exists and is executable
RUN if [ ! -f /app/open-gsio-server ]; then \
      echo "Error: open-gsio-server binary not found"; \
      exit 1; \
    elif [ ! -x /app/open-gsio-server ]; then \
      echo "Error: open-gsio-server binary not executable"; \
      exit 1; \
    fi

# Expose the server port
EXPOSE 3003
# Run the server
ENTRYPOINT ["./open-gsio-server"]
