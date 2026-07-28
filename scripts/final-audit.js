const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const distDir = path.join(rootDir, "dist");
const officialDomain = "https://abssnexus.in";

const publicPages = [
  ["index.html", `${officialDomain}/`],
  ["about.html", `${officialDomain}/about`],
  ["services.html", `${officialDomain}/services`],
  ["services/website-development.html", `${officialDomain}/services/website-development`],
  ["services/ui-ux-design.html", `${officialDomain}/services/ui-ux-design`],
  ["services/website-maintenance.html", `${officialDomain}/services/website-maintenance`],
  ["projects.html", `${officialDomain}/projects`],
  ["contact.html", `${officialDomain}/contact`],
  ["pricing.html", `${officialDomain}/pricing`],
  ["privacy-policy.html", `${officialDomain}/privacy-policy`],
  ["terms-and-conditions.html", `${officialDomain}/terms-and-conditions`],
  ["disclaimer.html", `${officialDomain}/disclaimer`],
  ["refund-policy.html", `${officialDomain}/refund-policy`],
  ["support-policy.html", `${officialDomain}/support-policy`],
  ["sitemap.html", `${officialDomain}/sitemap`],
];

const requiredFiles = [
  "index.html",
  "404.html",
  "_headers",
  "_redirects",
  "robots.txt",
  "sitemap.xml",
  "src/pages/index.html",
];

const adminFiles = [
  "src/admin/admin-login.html",
  "src/admin/admin-dashboard.html",
  "src/admin/admin-leads.html",
  "src/admin/admin-projects.html",
  "src/admin/admin-clients.html",
  "src/admin/admin-support.html",
  "src/admin/admin-pricing.html",
];

const failures = [];

const fail = (message) => failures.push(message);
const read = (filePath) => fs.readFileSync(filePath, "utf8");
const existsInDist = (relativePath) => fs.existsSync(path.join(distDir, relativePath));
const countMatches = (text, pattern) => (text.match(pattern) || []).length;
const attrs = (tag) => Object.fromEntries([...tag.matchAll(/([\w:-]+)\s*=\s*"([^"]*)"/g)].map((match) => [match[1], match[2]]));
const getMetaContent = (html, attributeName, attributeValue) => {
  const tag = html.match(new RegExp(`<meta\\b(?=[^>]*\\b${attributeName}="${attributeValue}")[^>]*>`, "i"))?.[0];
  return tag ? attrs(tag).content || "" : "";
};

requiredFiles.forEach((file) => {
  if (!existsInDist(file)) fail(`Missing required dist file: ${file}`);
});

const buildIncludesAdmin = process.env.ABSS_EXCLUDE_ADMIN !== "true";
adminFiles.forEach((file) => {
  const exists = existsInDist(file);
  if (buildIncludesAdmin && !exists) fail(`Missing Admin file in inclusive build: ${file}`);
  if (!buildIncludesAdmin && exists) fail(`Admin file exposed while ABSS_EXCLUDE_ADMIN=true: ${file}`);
});

const metaDescriptions = new Map();

for (const [relativePath, expectedCanonical] of publicPages) {
  const filePath = path.join(distDir, relativePath);
  if (!fs.existsSync(filePath)) {
    fail(`Missing public page: ${relativePath}`);
    continue;
  }

  const html = read(filePath);
  const ids = new Set([...html.matchAll(/\sid\s*=\s*"([^"]+)"/g)].map((match) => match[1]));
  const links = [...html.matchAll(/<(a|link|script|img|source)\b[^>]*(?:href|src)\s*=\s*"([^"]*)"/g)];

  const metaDescription = getMetaContent(html, "name", "description").trim();

  if (!/<title>[^<]+<\/title>/i.test(html)) fail(`${relativePath}: missing title`);
  if (!metaDescription) {
    fail(`${relativePath}: missing meta description`);
  } else {
    if (metaDescription.length < 100) fail(`${relativePath}: meta description below 100 characters`);
    if (metaDescription.length > 170) fail(`${relativePath}: meta description above 170 characters`);
    const duplicatePage = metaDescriptions.get(metaDescription);
    if (duplicatePage) {
      fail(`${relativePath}: duplicate meta description also used by ${duplicatePage}`);
    } else {
      metaDescriptions.set(metaDescription, relativePath);
    }
  }
  if (countMatches(html, /<link\s+rel="canonical"\s+href="[^"]+"/gi) !== 1) fail(`${relativePath}: expected exactly one canonical`);
  if (!html.includes(`<link rel="canonical" href="${expectedCanonical}"`)) fail(`${relativePath}: incorrect canonical`);
  if (!html.includes(`<meta property="og:url" content="${expectedCanonical}"`)) fail(`${relativePath}: incorrect og:url`);
  if (countMatches(html, /<h1\b/gi) !== 1) fail(`${relativePath}: expected exactly one h1`);
  if (/target="_blank"(?![^>]*rel="noopener noreferrer")/i.test(html)) fail(`${relativePath}: target blank link missing rel`);
  if (/href="\s*"|href="#"|javascript:void/i.test(html)) fail(`${relativePath}: unsafe or empty href`);

  for (const [, tagName, value] of links) {
    if (!value || value.startsWith("mailto:") || value.startsWith("tel:") || value.startsWith("https://wa.me/")) continue;
    if (/^https?:\/\//.test(value)) continue;

    const [beforeHash, hash] = value.split("#");
    const withoutHash = beforeHash.split("?")[0];
    if (hash && !withoutHash && !ids.has(hash)) fail(`${relativePath}: missing anchor target #${hash}`);
    if (tagName === "a" && (/\/src\/pages\//.test(value) || /\.html(?:$|[?#])/.test(value))) {
      fail(`${relativePath}: public link should use clean route: ${value}`);
    }
    if (!withoutHash || withoutHash.startsWith("?")) continue;

    const relativeTarget = withoutHash.startsWith("/")
      ? path.join(distDir, withoutHash)
      : path.resolve(path.dirname(filePath), withoutHash);
    const targetExists =
      fs.existsSync(relativeTarget) ||
      fs.existsSync(`${relativeTarget}.html`) ||
      fs.existsSync(path.join(relativeTarget, "index.html"));
    if (!targetExists) fail(`${relativePath}: missing local asset/link target: ${value}`);
  }

  const jsonLdBlocks = [...html.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi)];
  for (const block of jsonLdBlocks) {
    try {
      JSON.parse(block[1]);
    } catch (error) {
      fail(`${relativePath}: invalid JSON-LD`);
    }
  }

  const forbiddenPublicPatterns = [
    /shubhambca\.in/i,
    /new-abss\.pages\.dev/i,
    /\bVGU\b/i,
    /We do not share your information with anyone/i,
    /our team will contact you soon/i,
    /₹14,999/i,
    /50%\s*Off/i,
    /Most Popular/i,
    /Best Seller/i,
    /Testimonials Coming Soon/i,
    /Client Feedback Coming Soon/i,
    /Registered company/i,
    /24\/7 support/i,
    /100% client satisfaction/i,
  ];

  forbiddenPublicPatterns.forEach((pattern) => {
    if (pattern.test(html)) fail(`${relativePath}: forbidden public wording/reference: ${pattern}`);
  });

  if (/<a\b[^>]*href="[^"]*admin/i.test(html)) fail(`${relativePath}: public page links to Admin`);
}

const notFoundPath = path.join(distDir, "404.html");
if (fs.existsSync(notFoundPath)) {
  const html = read(notFoundPath);
  if (!/<title>[^<]+<\/title>/i.test(html)) fail("404.html: missing title");
  if (countMatches(html, /<h1\b/gi) !== 1) fail("404.html: expected exactly one h1");
}

const sitemapPath = path.join(distDir, "sitemap.xml");
if (fs.existsSync(sitemapPath)) {
  const sitemap = read(sitemapPath);
  const urls = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
  const expectedUrls = publicPages.map(([, url]) => url);
  const duplicates = urls.filter((url, index) => urls.indexOf(url) !== index);
  if (duplicates.length) fail(`sitemap.xml: duplicate URLs: ${duplicates.join(", ")}`);
  expectedUrls.forEach((url) => {
    if (!urls.includes(url)) fail(`sitemap.xml: missing ${url}`);
  });
  urls.forEach((url) => {
    if (!url.startsWith(`${officialDomain}/`)) fail(`sitemap.xml: non-official URL ${url}`);
    if (/\/admin|\/api|\/src\/|\.html|404|new-abss|shubhambca/i.test(url)) fail(`sitemap.xml: forbidden URL ${url}`);
  });
}

const robotsPath = path.join(distDir, "robots.txt");
if (fs.existsSync(robotsPath)) {
  const robots = read(robotsPath);
  if (!robots.includes(`Sitemap: ${officialDomain}/sitemap.xml`)) fail("robots.txt: incorrect Sitemap directive");
  if (!/Disallow:\s*\/src\/admin\//.test(robots)) fail("robots.txt: missing Admin disallow");
}

const redirectsPath = path.join(distDir, "_redirects");
if (fs.existsSync(redirectsPath)) {
  const redirects = read(redirectsPath);
  if (/\/src\/admin\/admin-[^\s]+\s+\/src\/admin\/admin-[^\s]+\.html\s+200/.test(redirects)) {
    fail("_redirects: contains Admin 200 rewrite to .html");
  }
  if (!redirects.includes("https://www.abssnexus.in/* https://abssnexus.in/:splat 301")) {
    fail("_redirects: missing www to apex redirect");
  }
}

if (failures.length) {
  console.error("Final audit failed:");
  failures.forEach((message) => console.error(`- ${message}`));
  process.exit(1);
}

console.log("Final audit passed.");
