## Legacy Development History

The source code of open-gsio was drawn from the source code of my personal website. That commit history was contaminated early on with secrets. `open-gsio` is a refinement of those sources. A total of 367 commits were submitted to the main branch of the upstream source repository between August 2024 and May 2025.

#### **May 2025**

- Added **seemueller.ai** link to UI sidebar.
- Global config/markdown guide clean‑up; patched a critical forgotten bug.

#### **Apr 2025**

- **CI/CD overhaul**: auto‑deploy to dev & staging, Bun adoption as package manager, streamlined block‑list workflow (now auto‑updates via VPN blocker).
- New 404 error page; multiple robots.txt and editor‑resize fixes; removed dead/duplicate code.

#### **Mar 2025**

- Introduced **model‑specific `max_tokens`** handling and plugged in **Cloudflare AI models** for testing.
- Bundle size minimised (re‑enabled minifier, smaller vendor set).

#### **Feb 2025**

- **Full theme system** (runtime switching, Centauri theme, server‑saved prefs).
- Tightened MobX typing for messages; responsive break‑points & input scaling repaired.
- Dropped legacy document API; general folder restructure.

#### **Jan 2025**

- **Rate‑limit middleware**, larger KV/R2 storage quota.
- Switched default model → _llama‑v3p1‑70b‑instruct_; pluggable model handlers.
- Added **KaTeX fonts** & **Marked.js** for rich math/markdown.
- Fireworks key rotation; deprecated Google models removed.

#### **Dec 2024**

- Major package upgrades; **CodeHighlighter** now supports HTML/JSX/TS(X)/Zig.
- Refactored streaming + markdown renderer; Android‑specific padding fixes.
- Reset default chat model to **gpt‑4o**; welcome message & richer search‑intent logic.

#### **Nov 2024**

- **Fireworks API** + agent server; first‑class support for **Anthropic** & **GROQ** models (incl. attachments).
- **VPN blocker** shipped with CIDR validation and dedicated GitHub Action.
- Live search buffering, feedback modal, smarter context preprocessing.

#### **Oct 2024**

- Rolled out **image generation** + picker for image models.
- Deployed **ETH payment processor** & deposit‑address flow.
- Introduced few‑shot prompting library; analytics worker refactor; Halloween prompt.
- Extensive mobile‑UX polish and bundling/worker config updates.

#### **Sep 2024**

- End‑to‑end **math rendering** (KaTeX) and **GitHub‑flavoured markdown**.
- Migrated chat state to **MobX**; launched analytics service & metrics worker.
- Switched build minifier to **esbuild**; tokenizer limits enforced; gradient sidebar & cookie‑consent manager added.

#### **Aug 2024**

- **Initial MVP**: iMessage‑style chat UI, websocket prototype, Google Analytics, Cloudflare bindings, base worker‑site scaffold.
