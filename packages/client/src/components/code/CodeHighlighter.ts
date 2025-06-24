import { createHighlighterCore } from 'shiki';

/* eslint-disable import/no-unresolved */
export async function buildCodeHighlighter() {
  const [
    githubDark,
    html,
    javascript,
    jsx,
    typescript,
    tsx,
    go,
    rust,
    python,
    java,
    kotlin,
    shell,
    sql,
    yaml,
    toml,
    markdown,
    json,
    xml,
    zig,
    wasm,
  ] = await Promise.all([
    import('shiki/themes/github-dark.mjs'),
    import('shiki/langs/html.mjs'),
    import('shiki/langs/javascript.mjs'),
    import('shiki/langs/jsx.mjs'),
    import('shiki/langs/typescript.mjs'),
    import('shiki/langs/tsx.mjs'),
    import('shiki/langs/go.mjs'),
    import('shiki/langs/rust.mjs'),
    import('shiki/langs/python.mjs'),
    import('shiki/langs/java.mjs'),
    import('shiki/langs/kotlin.mjs'),
    import('shiki/langs/shell.mjs'),
    import('shiki/langs/sql.mjs'),
    import('shiki/langs/yaml.mjs'),
    import('shiki/langs/toml.mjs'),
    import('shiki/langs/markdown.mjs'),
    import('shiki/langs/json.mjs'),
    import('shiki/langs/xml.mjs'),
    import('shiki/langs/zig.mjs'),
    import('shiki/wasm'),
  ]);

  // Create the highlighter instance with the loaded themes and languages
  const instance = await createHighlighterCore({
    themes: [githubDark], // Set the Base_theme
    langs: [
      html,
      javascript,
      jsx,
      typescript,
      tsx,
      go,
      rust,
      python,
      java,
      kotlin,
      shell,
      sql,
      yaml,
      toml,
      markdown,
      json,
      xml,
      zig,
    ],
    loadWasm: wasm, // Ensure correct loading of WebAssembly
  });

  return instance;
}
