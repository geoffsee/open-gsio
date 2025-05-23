import { visit } from "unist-util-visit";

export default function remarkImageGeneration() {
  return (tree) => {
    visit(tree, "code", (node, index, parent) => {
      if (node.lang === "generation") {
        try {
          const data = JSON.parse(node.value);
          parent.children[index] = {
            type: "generation",
            data: data,
          };
        } catch (error) {
          console.error("Invalid JSON in image-generation block:", error);
        }
      }
    });
  };
}
