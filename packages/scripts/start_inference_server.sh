#!/usr/bin/env bash

if [ "$1" = "mlx-omni-server" ]; then
    printf "Starting Inference Server: %s\n" "$1"
    mlx-omni-server --log-level debug
elif [ "$1" = "ollama" ]; then
    echo "starting ollama"
    SCRIPT_DIR=$(dirname $(realpath "$0"))
    docker-compose -f "${SCRIPT_DIR}/ollama-compose.yml" up -d
else
    printf "Error: First argument must be 'mlx-omni-server' or 'ollama'\n"
    exit 1
fi
