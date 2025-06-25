# open-gsio

[![Tests](https://github.com/geoffsee/open-gsio/actions/workflows/test.yml/badge.svg)](https://github.com/geoffsee/open-gsio/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
</br>

<p align="center">
  <img src="https://github.com/user-attachments/assets/620d2517-e7be-4bb0-b2b7-3aa0cba37ef0" width="250" />
</p>

This is a full-stack Conversational AI.

## Table of Contents

- [Installation](#installation)
- [Deployment](#deployment)
- [Docker](#docker)
- [Local Inference](#local-inference)
  - [mlx-omni-server (default)](#mlx-omni-server)
    - [Adding models](#adding-models-for-local-inference-apple-silicon)
  - [Ollama](#ollama)
    - [Adding models](#adding-models-for-local-inference-ollama)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [Acknowledgments](#acknowledgments)
- [License](#license)

## Installation

1. `bun i && bun test:all`
1. [Setup Local Inference](#local-inference) OR [Add your own `GROQ_API_KEY` in packages/cloudflare-workers/open-gsio/.dev.vars](https://console.groq.com/keys)
1. In isolated shells, run `bun run server:dev` and `bun run client:dev`

> Note: it should be possible to use pnpm in place of bun.

## Deployment

1. Setup KV_STORAGE binding in `packages/server/wrangler.jsonc`
1. [Add keys in secrets.json](https://console.groq.com/keys)
1. Run `bun run deploy && bun run deploy:secrets && bun run deploy`

> Note: Subsequent deployments should omit `bun run deploy:secrets`

## Docker

You can run the server using Docker. The image is large but will be slimmed down in future commits.

### Building the Docker Image

```bash
docker compose build
# OR
docker build -t open-gsio .
```

### Running the Docker Container

```bash
docker run -p 3003:3003 \
  -e GROQ_API_KEY=your_groq_api_key \
  -e FIREWORKS_API_KEY=your_fireworks_api_key \
  open-gsio
```

You can omit any environment variables that you don't need. The server will be available at http://localhost:3003.

### Using Docker Compose

A `docker-compose.yml` file is provided in the repository. You can edit it to add your API keys:

```yaml
version: '3'
services:
  open-gsio:
    build: .
    ports:
      - "3003:3003"
    environment:
      - GROQ_API_KEY=your_groq_api_key
      - FIREWORKS_API_KEY=your_fireworks_api_key
      # Other environment variables are included in the file
    restart: unless-stopped
```

Then run:

```bash
docker compose up
```

Or to run in detached mode:

```bash
docker compose up -d
```

## Local Inference

> Local inference is supported for Ollama and mlx-omni-server. OpenAI compatible servers can be used by overriding OPENAI_API_KEY and OPENAI_API_ENDPOINT.

### mlx-omni-server

(default) (Apple Silicon Only)

```bash
# (prereq) install mlx-omni-server
brew tap seemueller-io/tap
brew install seemueller-io/tap/mlx-omni-server

bun run openai:local mlx-omni-server         # Start mlx-omni-server
bun run openai:local:configure               # Configure connection
bun run server:dev                           # Restart server
```

#### Adding models for local inference (Apple Silicon)

```bash
# ensure mlx-omni-server is running

# See https://huggingface.co/mlx-community for available models
MODEL_TO_ADD=mlx-community/gemma-3-4b-it-8bit

curl http://localhost:10240/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d "{
    \"model\": \"$MODEL_TO_ADD\",
    \"messages\": [{\"role\": \"user\", \"content\": \"Hello\"}]
  }"
```

### Ollama

```bash
bun run openai:local ollama                  # Start ollama server
bun run openai:local:configure               # Configure connection
bun run server:dev                           # Restart server
```

#### Adding models for local inference (ollama)

```bash
# See https://ollama.com/library for available models
use the ollama web ui @ http://localhost:8080
```

## Testing

Tests are located in `__tests__` directories next to the code they test. Testing is incomplete at this time.

> `bun test:all` will run all tests

## Troubleshooting

1.  `bun clean`
1.  `bun i`
1.  `bun server:dev`
1.  `bun client:dev`
1.  Submit an issue

## History

A high-level overview for the development history of the parent repository, [geoff-seemueller-io](https://geoff.seemueller.io), is provided in [LEGACY.md](./LEGACY.md).

## Acknowledgments

I would like to express gratitude to the following projects, libraries, and individuals that have contributed to making open-gsio possible:

- [TypeScript](https://www.typescriptlang.org/) - Primary programming language
- [React](https://react.dev/) - UI library for building the frontend
- [Vike](https://vike.dev/) - Framework for server-side rendering and routing
- [Cloudflare Workers](https://developers.cloudflare.com/workers/) - Serverless execution environment
- [Bun](https://bun.sh/) - JavaScript runtime and toolkit
- [Marked.js](https://github.com/markedjs/marked) - Markdown Rendering
- [Shiki](https://github.com/shikijs/shiki) - Syntax Highlighting
- [itty-router](https://github.com/kwhitley/itty-router) - Lightweight router for serverless environments
- [MobX-State-Tree](https://mobx-state-tree.js.org/) - State management solution
- [OpenAI SDK](https://github.com/openai/openai-node) - Client for AI model integration
- [Vitest](https://vitest.dev/) - Testing framework
- [OpenAI](https://github.com/openai)
- [Groq](https://console.groq.com/) - Fast inference API
- [Anthropic](https://www.anthropic.com/) - Creator of Claude models
- [Fireworks](https://fireworks.ai/) - AI inference platform
- [XAI](https://x.ai/) - Creator of Grok models
- [Cerebras](https://www.cerebras.net/) - AI compute and models
- [(madroidmaq) MLX Omni Server](https://github.com/madroidmaq/mlx-omni-server) - Open-source high-performance inference for Apple Silicon
- [MLX](https://github.com/ml-explore/mlx) - An array framework for Apple silicon
- [Ollama](https://github.com/ollama/ollama) - Versatile solution for self-hosting models

## License

```text
MIT License

Copyright (c) 2025 Geoff Seemueller

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```
