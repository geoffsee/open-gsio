#!/usr/bin/env bash

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

WRANGLER_SERVER_PATH=packages/cloudflare-workers/open-gsio
BUN_SERVER_PATH=packages/server


DEV_VARS_PATH="${REPO_ROOT}/${WRANGLER_SERVER_PATH}/.dev.vars"
ENV_LOCAL_PATH="${REPO_ROOT}/${BUN_SERVER_PATH}/.env"

configure_dev_vars() {
  local endpoint_url=$1
  local api_key="required-but-not-used"

  echo "Configuring: packages/cloudflare-workers/open-gsio/.dev.vars AND packages/server/.env"

  # Default URL is automatic but can be overridden for remote deployments
  if [[ "$endpoint_url" == *"11434"* ]]; then
    echo "OPENAI_API_ENDPOINT=http://localhost:11434" >> "${ENV_LOCAL_PATH}"
    echo "OLLAMA_API_KEY=active" >> "${ENV_LOCAL_PATH}"

    echo "OPENAI_API_ENDPOINT=http://localhost:11434" >> "${DEV_VARS_PATH}"
    echo "OLLAMA_API_KEY=active" >> "${DEV_VARS_PATH}"
  fi
  if [[ "$endpoint_url" == *"10240"* ]]; then

    echo "OPENAI_API_ENDPOINT=http://localhost:10240/v1" >> "${ENV_LOCAL_PATH}"
    echo "MLX_API_KEY=active" >> "${ENV_LOCAL_PATH}"

    echo "OPENAI_API_ENDPOINT=http://localhost:10240/v1" >> "${DEV_VARS_PATH}"
    echo "MLX_API_KEY=active" >> "${DEV_VARS_PATH}"
  fi

  echo "Local inference is configured for $endpoint_url"
}

echo "Checking for local inference services..."

# Check for Ollama on port 11434
# nc -z -w1 localhost 11434:
#   -z: Zero-I/O mode (port scanning)
#   -w1: Timeout after 1 second
#   >/dev/null 2>&1: Suppress output from nc
# check for ollama
if nc -z -w1 localhost 11434 >/dev/null 2>&1; then
  echo "Ollama service detected on port 11434."
  configure_dev_vars "http://localhost:11434"
elif nc -z -w1 localhost 10240 >/dev/null 2>&1; then
  echo "mlx-omni-server service detected on port 10240."
  configure_dev_vars "http://localhost:10240"
else
  echo "No active local inference service (Ollama or mlx-omni-server) found on default ports (11434, 10240)."
  echo "If a service is running on a different port, .dev.vars may need manual configuration."
  echo ".dev.vars was not modified by this script for OpenAI local inference settings."
fi

echo "Script finished."