const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");
const includeAdmin = process.env.ABSS_EXCLUDE_ADMIN !== "true";
const excludedPublicDirs = new Set([path.join("src", "templates")]);

const copyRecursive = (source, destination) => {
  const stat = fs.statSync(source);
  if (stat.isDirectory()) {
    const relativeSource = path.relative(rootDir, source);
    if (excludedPublicDirs.has(relativeSource)) {
      return;
    }

    if (!includeAdmin && relativeSource === path.join("src", "admin")) {
      return;
    }

    fs.mkdirSync(destination, { recursive: true });
    for (const entry of fs.readdirSync(source)) {
      copyRecursive(path.join(source, entry), path.join(destination, entry));
    }
    return;
  }

  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
};

const copyTextFile = (fileName, transform = (value) => value) => {
  const source = path.join(rootDir, fileName);
  if (!fs.existsSync(source)) return;
  fs.writeFileSync(path.join(distDir, fileName), transform(fs.readFileSync(source, "utf8")));
};

fs.rmSync(distDir, { recursive: true, force: true });

for (const entry of ["src", "public"]) {
  copyRecursive(path.join(rootDir, entry), path.join(distDir, entry));
}

copyTextFile("robots.txt");
copyTextFile("sitemap.xml");
copyTextFile("_headers", (content) => (includeAdmin ? content : content.replace(/^\/(?:src\/)?admin[^\n]*(?:\n  .*)*\n?/gm, "")));
copyTextFile("_redirects", (content) => (includeAdmin ? content : content.replace(/^\/(?:src\/)?admin[^\n]*\n/gm, "")));

console.log(`Build complete. Admin pages ${includeAdmin ? "included" : "excluded"} in dist.`);
