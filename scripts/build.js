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

const publicPages = [
  ["src/pages/index.html", "index.html"],
  ["src/pages/about.html", "about.html"],
  ["src/pages/services.html", "services.html"],
  ["src/pages/projects.html", "projects.html"],
  ["src/pages/contact.html", "contact.html"],
  ["src/pages/privacy-policy.html", "privacy-policy.html"],
  ["src/pages/terms-conditions.html", "terms-and-conditions.html"],
  ["src/pages/disclaimer.html", "disclaimer.html"],
  ["src/pages/refund-policy.html", "refund-policy.html"],
  ["src/pages/support-policy.html", "support-policy.html"],
  ["src/pages/sitemap.html", "sitemap.html"],
  ["src/pages/service-website-development.html", path.join("services", "website-development.html")],
  ["src/pages/404.html", "404.html"],
];

for (const [sourceRelative, destinationRelative] of publicPages) {
  const source = path.join(rootDir, sourceRelative);
  const destination = path.join(distDir, destinationRelative);

  if (!fs.existsSync(source)) {
    throw new Error(`Required public page missing: ${sourceRelative}`);
  }

  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
}

copyTextFile("robots.txt");
copyTextFile("sitemap.xml");
copyTextFile("_headers", (content) => (includeAdmin ? content : content.replace(/^\/(?:src\/)?admin[^\n]*(?:\n  .*)*\n?/gm, "")));
copyTextFile("_redirects", (content) => (includeAdmin ? content : content.replace(/^\/(?:src\/)?admin[^\n]*\n/gm, "")));

const requiredBuildFiles = [
  "index.html",
  "about.html",
  "services.html",
  "projects.html",
  "contact.html",
  "404.html",
  path.join("services", "website-development.html"),
  "_redirects",
  "_headers",
];

for (const requiredFile of requiredBuildFiles) {
  if (!fs.existsSync(path.join(distDir, requiredFile))) {
    throw new Error(`Cloudflare build failed: dist/${requiredFile} was not created.`);
  }
}

console.log(`Build complete. Admin pages ${includeAdmin ? "included" : "excluded"} in dist.`);
