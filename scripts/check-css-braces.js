const fs = require("fs");

const css = fs.readFileSync("src/styles/styles.css", "utf8");
let depth = 0;

for (const char of css) {
  if (char === "{") depth += 1;
  if (char === "}") depth -= 1;

  if (depth < 0) {
    console.error("CSS has an extra closing brace.");
    process.exit(1);
  }
}

if (depth !== 0) {
  console.error(`CSS brace depth is ${depth}.`);
  process.exit(1);
}

console.log("CSS braces passed.");
