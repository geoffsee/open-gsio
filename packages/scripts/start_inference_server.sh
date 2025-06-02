#!/usr/bin/env bash

if [ "$1" = "mlx-omni-server" ]; then
    printf "Starting Inference Server: %s\n" "$1"
    mlx-omni-server --log-level debug
elif [ "$1" = "ollama" ]; then
    echo "starting ollama"
    docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama
else
    printf "Error: First argument must be 'mlx-omni-server'\n"
    exit 1
fi
