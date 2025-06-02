# open-gsio
[![Tests](https://github.com/geoffsee/open-gsio/actions/workflows/test.yml/badge.svg)](https://github.com/geoffsee/open-gsio/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)
![image](https://github.com/user-attachments/assets/65ca4122-365a-44b8-a71f-fc6d80ec1e13)

## Table of Contents
- [Stack](#stack)
- [Installation](#installation)
- [Deployment](#deployment)
- [Local Inference](#local-inference)
    - [Ollama](#ollama)
    - [mlx-omni-server (Apple Silicon Only)](#mlx-omni-server-apple-silicon-only)
        - [Adding models for local inference (Apple Silicon)](#adding-models-for-local-inference-apple-silicon)
- [Testing](#testing)
- [History](#history)
- [License](#license)

## Stack
* typescript
* vike
* react
* cloudflare workers
* itty-router
* mobx-state-tree
* openai sdk
* vitest


## Installation

1. `bun i && bun test`
1. [Add your own `GROQ_API_KEY` in .dev.vars](https://console.groq.com/keys)  
1. In isolated shells, run `bun run server:dev` and `bun run client:dev`

> Note: it should be possible to use pnpm in place of bun. 

## Deployment
1. Setup the KV_STORAGE bindings in `wrangler.jsonc`  
1.  [Add another `GROQ_API_KEY` in secrets.json](https://console.groq.com/keys)
1. Run `bun run deploy && bun run deploy:secrets && bun run deploy`

> Note: Subsequent deployments should omit `bun run deploy:secrets`


## Local Inference
> Local inference is achieved by overriding the `OPENAI_API_KEY` and `OPENAI_API_ENDPOINT` environment variables. See below.
### Ollama
~~~bash
docker run -d -v ollama:/root/.ollama -p 11434:11434 --name ollama ollama/ollama ## Run Ollama (Can also be installed natively)
bun run openai:local                         # Start OpenAI-compatible server
sed -i '' '/^OPENAI_API_KEY=/d' .dev.vars; echo >> .dev.vars; echo 'OPENAI_API_KEY=required-but-not-used' >> .dev.vars # Reset API key
sed -i '' '/^OPENAI_API_ENDPOINT=/d' .dev.vars; echo >> .dev.vars; echo 'OPENAI_API_ENDPOINT=http://localhost:11434' >> .dev.vars # Reset endpoint
bun run server:dev                           # Start dev server
~~~

### mlx-omni-server (Apple Silicon Only)
~~~bash
brew tap seemueller-io/tap                   # Add seemueller-io tap
brew install seemueller-io/tap/mlx-omni-server # Install mlx-omni-server
bun run openai:local                         # Start OpenAI-compatible server
sed -i '' '/^OPENAI_API_KEY=/d' .dev.vars; echo >> .dev.vars; echo 'OPENAI_API_KEY=required-but-not-used' >> .dev.vars # Reset API key
sed -i '' '/^OPENAI_API_ENDPOINT=/d' .dev.vars; echo >> .dev.vars; echo 'OPENAI_API_ENDPOINT=http://localhost:10240' >> .dev.vars # Reset endpoint
bun run server:dev                           # Start dev server
~~~
#### Adding models for local inference (Apple Silicon)

~~~bash
# ensure mlx-omni-server is running in the background 
MODEL_TO_ADD=mlx-community/gemma-3-4b-it-8bit

curl http://localhost:10240/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d "{
    \"model\": \"$MODEL_TO_ADD\",
    \"messages\": [{\"role\": \"user\", \"content\": \"Hello\"}]
  }"
~~~  




## Testing

Tests are located in `__tests__` directories next to the code they test. Testing is incomplete at this time.

> `bun run test` will run all tests

History
---
A high-level overview for the development history of the parent repository, [geoff-seemueller-io](https://geoff.seemueller.io), is provided in [LEGACY.md](./LEGACY.md). 

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

