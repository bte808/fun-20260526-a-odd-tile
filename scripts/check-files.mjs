import { readFileSync, statSync } from "node:fs";

const requiredFiles = [
  "index.html",
  "favicon.svg",
  "styles.css",
  "src/app.js",
  "src/game.js",
  "README.md",
  "LICENSE",
  ".gitignore"
];

for (const file of requiredFiles) {
  const stat = statSync(file);
  if (!stat.isFile() || stat.size === 0) {
    throw new Error(`${file} is missing or empty`);
  }
}

const html = readFileSync("index.html", "utf8");
const app = readFileSync("src/app.js", "utf8");
const css = readFileSync("styles.css", "utf8");
const readme = readFileSync("README.md", "utf8");

const checks = [
  [html.includes('<div id="board"'), "index.html should include the board mount"],
  [html.includes('type="module"'), "index.html should load module JavaScript"],
  [app.includes("window.__ODD_TILE_DEBUG__"), "app should expose a small browser debug hook"],
  [css.includes("@media (max-width: 620px)"), "styles should include mobile layout rules"],
  [readme.includes("How to run"), "README should explain how to run"],
  [readme.includes("Inspiration"), "README should document public inspiration"]
];

for (const [ok, message] of checks) {
  if (!ok) throw new Error(message);
}

console.log(`Checked ${requiredFiles.length} project files.`);
