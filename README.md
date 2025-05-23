## open-geoff-seemueller-io

Fork of [geoff.seemueller.io](https://geoff.seemueller.io).


### Stack:
- vike
- react
- cloudflare workers
- openai sdk

## Quickstart

1. `bun i`
2. `bun run build`
3. Configure .dev.vars
4. Setup KV_STORAGE bindings for local development.
5. In isolated shells, run `bun run server:dev` and `bun run client:dev`

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
