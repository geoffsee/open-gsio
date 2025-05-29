## open-geoff-seemueller-io
![image](https://github.com/user-attachments/assets/a323d373-6241-4b76-b564-f0d080ff93f7)

### Stack:
- vike
- react
- cloudflare workers
- openai sdk

## Quickstart

1. `bun i`
1. [Add your own `GROQ_API_KEY` in .dev.vars](https://console.groq.com/keys)  
1. In isolated shells, run `bun run server:dev` and `bun run client:dev`

> Note: it should be possible to use pnpm in place of bun

## Deploying
1. Setup the KV_STORAGE bindings in `wrangler.jsonc`  
1.  [Add another `GROQ_API_KEY` in secrets.json](https://console.groq.com/keys)
1. Run `bun run deploy && bun run deploy:secrets && bun run deploy`

> Note: Subsequent deployments should omit `bun run deploy:secrets`

History
---

### **May 2025**

| Hash    | Change                                                                |
| ------- |-----------------------------------------------------------------------|
| 049bf97 | **Add** *seemueller.ai* sidebar link and constrain Hero heading width |
| 6be5f68 | **Consolidate** configuration files (CI, bundler, environment)        |
| a047f19 | **Expand** Markdown usage guide for end‑users                         |

---

### **April 2025**

| Hash              | Change                                                                     |
| ----------------- |----------------------------------------------------------------------------|
| ce3457a           | **Introduce** custom error page and purge dead code                        |
| 806c933           | **Fix** duplicate`robots.txt` entries (SEO)                                |
| 4bbe8ea · e909e0b | **Restore** bundle‑size safeguards and **switch** tobun as package manager |
| 7f1520b·aa71f86 | **Automate** VPN block‑list deployment; retire legacy pull script          |
| b332c93           | **Repair** CI job for block‑list updates                                   |
| d506e7d           | **Deprecate** experimental **Mixtral** model                               |

---

### **March 2025**

| Hash              | Change                                                                   |
| ----------------- |--------------------------------------------------------------------------|
| 8b9e9eb           | **Add** per‑model `max_tokens` limits                                    |
| cb0d912           | **Expose** Cloudflare AI models for staging                              |
| 85de6ed·cec4f70 | **Shrink** production bundles: re‑enable minifier and drop unused assets |
| 4805c7e · 9709f61 | **Refresh** landing‑page copy (“Welcomehome”)                            |

---

### **February 2025**

| Hash              | Change                                                                      |
| ----------------- | --------------------------------------------------------------------------- |
| 8d70eef·886d45a | **Ship** runtime theme switching with dynamic navigation colors             |
| 4efaa93/194b168 | **Polish** resume & selector styling (padding, borders)                     |
| 7f925d1·0b9088a | **Refine** responsive chat: correct breakpoints, input scaling, MobX typing |
| 0865897           | **Remove** deprecated DocumentAPI                                          |
| e355540           | **Fix** background rendering issues                                         |

---

### **January 2025**

| Hash              | Change                                                                      |
| ----------------- | --------------------------------------------------------------------------- |
| d8b47c9 ·361a523 | **Enable** full LaTeX/KaTeX math rendering                                  |
| 64a0513·6ecc4f5 | **Set** default model to *llama‑v3p1‑70b‑instruct* and **limit** model list |
| 0ad9dc4           | **Add** rate‑limit middleware                                               |
| 42f371b·1f526ce | **Launch** VPN blocker with live CIDR validation and CI workflow            |
| f7464a1           | **Remove** user‑uploaded attachments to cut storage costs                   |
| e9c3a12           | **Rotate** Fireworks API credentials                                        |

---

### **Late 2024 Highlights**

| Area              | Notable Work                                                           |
| ----------------- | ---------------------------------------------------------------------- |
| **Generative UX** | Image‑generation pipeline; model‑selection UI; seasonal prompt packs   |
| **Analytics**     | Worker‑based metrics engine, event capture, tail helpers               |
| **Model Support** | GROQ & Anthropic streaming integrations with attachment handling       |
| **Feedback Loop** | Modal‑driven user‑feedback feature with dedicated store                |
| **Payments**      | On‑chain ETH/DOGE processor with dynamic deposit addresses             |
| **Performance**   | Tokenizer limits, LightningCSS minifier, esbuild migration             |
| **Mobile & A11y** | Dynamic textarea sizing, cookie‑consent banner, iMessage‑style bubbles |


### August 2024 - December 2024
History is available by request.


## License

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

