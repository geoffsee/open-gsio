#!/usr/bin/env bash


# Set REPO_ROOT to the directory containing this script, then go up two levels to repo root
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"

WRANGLER_SERVER_PATH=packages/cloudflare-workers/open-gsio
BUN_SERVER_PATH=packages/server

# Set path to .dev.vars file in server directory
DEV_VARS_PATH="${REPO_ROOT}/${WRANGLER_SERVER_PATH}/.dev.vars"
ENV_LOCAL_PATH="${REPO_ROOT}/${BUN_SERVER_PATH}/.env"

# Function to configure .dev.vars with the specified API key and endpoint
configure_dev_vars() {
  local endpoint_url=$1
  local api_key="required-but-not-used"

  echo "Configuring .dev.vars for endpoint: ${endpoint_url}"

  # Configure OPENAI_API_KEY
  # 1. Remove any existing OPENAI_API_KEY line
  sed -i '' '/^OPENAI_API_KEY=/d' "${DEV_VARS_PATH}"
  sed -i '' '/^OPENAI_API_KEY=/d' "${ENV_LOCAL_PATH}"
  # 2. Append a blank line (ensures the new variable is on a new line and adds spacing)
  # 3. Append the new OPENAI_API_KEY line
  echo "OPENAI_API_KEY=${api_key}" >> "${DEV_VARS_PATH}"
  echo "OPENAI_API_KEY=${api_key}" >> "${ENV_LOCAL_PATH}"

  # Configure OPENAI_API_ENDPOINT
  # 1. Remove any existing OPENAI_API_ENDPOINT line
  sed -i '' '/^OPENAI_API_ENDPOINT=/d' "${DEV_VARS_PATH}"
  sed -i '' '/^OPENAI_API_ENDPOINT=/d' "${ENV_LOCAL_PATH}"
  # 3. Append the new OPENAI_API_ENDPOINT line
  echo "OPENAI_API_ENDPOINT=${endpoint_url}" >> "${DEV_VARS_PATH}"
  echo "OPENAI_API_ENDPOINT=${endpoint_url}" >> "${ENV_LOCAL_PATH}"

  echo "Local inference is configured for $endpoint_url"
}

echo "Checking for local inference services..."

# Check for Ollama on port 11434
# nc -z -w1 localhost 11434:
#   -z: Zero-I/O mode (port scanning)
#   -w1: Timeout after 1 second
#   >/dev/null 2>&1: Suppress output from nc
if nc -z -w1 localhost 11434 >/dev/null 2>&1; then
  echo "Ollama service detected on port 11434."
  configure_dev_vars "http://localhost:11434"
# Else, check for mlx-omni-server on port 10240
elif nc -z -w1 localhost 10240 >/dev/null 2>&1; then
  echo "mlx-omni-server service detected on port 10240."
  configure_dev_vars "http://localhost:10240"
else
  echo "No active local inference service (Ollama or mlx-omni-server) found on default ports (11434, 10240)."
  echo "If a service is running on a different port, .dev.vars may need manual configuration."
  echo ".dev.vars was not modified by this script for OpenAI local inference settings."
fi

echo "Script finished."
