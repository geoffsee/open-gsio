export class MarkdownSdk {
  static formatContextContainer(contextContainer) {
    let markdown = "# Assistant Tools Results\n\n";

    for (const [key, value] of contextContainer.entries()) {
      markdown += `## ${this._escapeForMarkdown(key)}\n\n`;
      markdown += this._formatValue(value);
    }

    return markdown.trim();
  }

  static _formatValue(value, depth = 0) {
    if (Array.isArray(value)) {
      return this._formatArray(value, depth);
    } else if (value && typeof value === "object") {
      return this._formatObject(value, depth);
    } else {
      return this._formatPrimitive(value, depth);
    }
  }

  static _formatArray(arr, depth) {
    let output = "";
    arr.forEach((item, i) => {
      output += `### Item ${i + 1}\n`;
      output += this._formatValue(item, depth + 1);
      output += "\n";
    });
    return output;
  }

  static _formatObject(obj, depth) {
    return (
      Object.entries(obj)
        .map(
          ([k, v]) =>
            `- **${this._escapeForMarkdown(k)}**: ${this._escapeForMarkdown(v)}`,
        )
        .join("\n") + "\n\n"
    );
  }

  static _formatPrimitive(value, depth) {
    return `${this._escapeForMarkdown(String(value))}\n\n`;
  }

  static _escapeForMarkdown(text) {
    if (typeof text !== "string") {
      text = String(text);
    }
    return text.replace(/(\*|`|_|~)/g, "\\$1");
  }
}
