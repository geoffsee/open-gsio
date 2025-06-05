# open-gsio
[![Tests](https://github.com/geoffsee/open-gsio/actions/workflows/test.yml/badge.svg)](https://github.com/geoffsee/open-gsio/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
</br>
<p align="center">
  <img src="https://github.com/user-attachments/assets/620d2517-e7be-4bb0-b2b7-3aa0cba37ef0" width="250" />
</p>

> **Note**: I am porting logic from 3 projects back into this one. The styling is a work in progress and some functionality
> may be broken. Tests are being actively ported and stability will improve over time. Thank you for your patience.

This is a full-stack Conversational AI. It runs on Cloudflare or Bun. 

## Table of Contents

- [Installation](#installation)
- [Deployment](#deployment)
- [Local Inference](#local-inference)
    - [mlx-omni-server (default)](#mlx-omni-server)
        - [Adding models](#adding-models-for-local-inference-apple-silicon)
    - [Ollama](#ollama)
        - [Adding models](#adding-models-for-local-inference-ollama)
- [Testing](#testing)
- [Troubleshooting](#troubleshooting)
- [History](#history)
- [Acknowledgments](#acknowledgments)
- [License](#license)


## Installation

1. `bun i && bun test:all`
1. [Setup Local Inference](#local-inference) OR [Add your own `GROQ_API_KEY` in packages/cloudflare-workers/open-gsio/.dev.vars](https://console.groq.com/keys)
1. In isolated shells, run `bun run server:dev` and `bun run client:dev`

> Note: it should be possible to use pnpm in place of bun.

## Deployment
1. Setup KV_STORAGE binding in `packages/server/wrangler.jsonc`
1.  [Add keys in secrets.json](https://console.groq.com/keys)
1. Run `bun run deploy && bun run deploy:secrets && bun run deploy`

> Note: Subsequent deployments should omit `bun run deploy:secrets`


## Local Inference
> Local inference is achieved by overriding the `OPENAI_API_KEY` and `OPENAI_API_ENDPOINT` environment variables. See below.

### mlx-omni-server
(default) (Apple Silicon Only) - Use Ollama for other platforms.
~~~bash
# (prereq) install mlx-omni-server
brew tap seemueller-io/tap                   
brew install seemueller-io/tap/mlx-omni-server 

bun run openai:local mlx-omni-server         # Start mlx-omni-server
bun run openai:local:configure               # Configure connection
bun run server:dev                           # Restart server
~~~
#### Adding models for local inference (Apple Silicon)

~~~bash
# ensure mlx-omni-server is running

# See https://huggingface.co/mlx-community for available models
MODEL_TO_ADD=mlx-community/gemma-3-4b-it-8bit

curl http://localhost:10240/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d "{
    \"model\": \"$MODEL_TO_ADD\",
    \"messages\": [{\"role\": \"user\", \"content\": \"Hello\"}]
  }"
~~~  

### Ollama
~~~bash
bun run openai:local ollama                  # Start ollama server
bun run openai:local:configure               # Configure connection
bun run server:dev                           # Restart server
~~~
#### Adding models for local inference (ollama)

~~~bash
# See https://ollama.com/library for available models
use the ollama web ui @ http://localhost:8080
~~~  


## Testing

Tests are located in `__tests__` directories next to the code they test. Testing is incomplete at this time.

> `bun test:all` will run all tests


## Troubleshooting
1.  `bun clean`
1.  `bun i`
1.  `bun server:dev`
1.  `bun client:dev`
1. Submit an issue

History
---
A high-level overview for the development history of the parent repository, [geoff-seemueller-io](https://geoff.seemueller.io), is provided in [LEGACY.md](./LEGACY.md).

## Acknowledgments

I would like to express gratitude to the following projects, libraries, and individuals that have contributed to making open-gsio possible:

  - [TypeScript](https://www.typescriptlang.org/) - Primary programming language
  - [React](https://react.dev/) - UI library for building the frontend
  - [Vike](https://vike.dev/) - Framework for server-side rendering and routing
  - [Cloudflare Workers](https://developers.cloudflare.com/workers/) - Serverless execution environment
  - [Bun](https://bun.sh/) - JavaScript runtime and toolkit
  - [itty-router](https://github.com/kwhitley/itty-router) - Lightweight router for serverless environments
  - [MobX-State-Tree](https://mobx-state-tree.js.org/) - State management solution
  - [OpenAI SDK](https://github.com/openai/openai-node) - Client for AI model integration
  - [Vitest](https://vitest.dev/) - Testing framework
  - [mlx-omni-server](https://github.com/seemueller-io/mlx-omni-server) - Local inference server for Apple Silicon
  - [OpenAI](https://github.com/openai) 
  - [Groq](https://console.groq.com/) - Fast inference API
  - [Anthropic](https://www.anthropic.com/) - Creator of Claude models
  - [Fireworks](https://fireworks.ai/) - AI inference platform
  - [XAI](https://x.ai/) - Creator of Grok models
  - [Cerebras](https://www.cerebras.net/) - AI compute and models
  - [Ollama](https://github.com/ollama/ollama) - Local model running
  - [(madroidmaq) MLX Omni Server](https://github.com/madroidmaq/mlx-omni-server) - Open-source high-performance inference for Apple Silicon

- **Contributors**
  - All the developers who have contributed code, reported issues, or provided feedback

- **Open Source Community**
  - The broader open-source community for creating and maintaining the tools and libraries that make this project possible

## License
~~~text
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
~~~
