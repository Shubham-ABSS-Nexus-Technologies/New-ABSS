const crypto = require("crypto");
const fs = require("fs");
const http = require("http");
const path = require("path");
const { URL } = require("url");

const rootDir = path.resolve(__dirname, "..");
const dbPath = path.join(__dirname, "data", "db.json");
const port = Number(process.env.PORT || 3000);
const adminUsername = process.env.ADMIN_USERNAME || "admin";
const adminPassword = process.env.ADMIN_PASSWORD || "abss2026";
const authSecret = process.env.AUTH_SECRET || "abss-local-dev-secret";
const hasSecureAdminConfig = Boolean(process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD && process.env.AUTH_SECRET);

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

const publicRedirects = {
  "/index.html": "/",
  "/src/pages/index": "/",
  "/src/pages/index.html": "/",
  "/about.html": "/about",
  "/src/pages/about": "/about",
  "/src/pages/about.html": "/about",
  "/services.html": "/services",
  "/src/pages/services": "/services",
  "/src/pages/services.html": "/services",
  "/projects.html": "/projects",
  "/src/pages/projects": "/projects",
  "/src/pages/projects.html": "/projects",
  "/contact.html": "/contact",
  "/src/pages/contact": "/contact",
  "/src/pages/contact.html": "/contact",
  "/privacy-policy.html": "/privacy-policy",
  "/src/pages/privacy-policy": "/privacy-policy",
  "/src/pages/privacy-policy.html": "/privacy-policy",
  "/terms-conditions": "/terms-and-conditions",
  "/terms-conditions.html": "/terms-and-conditions",
  "/terms-and-conditions.html": "/terms-and-conditions",
  "/src/pages/terms-conditions": "/terms-and-conditions",
  "/src/pages/terms-conditions.html": "/terms-and-conditions",
  "/disclaimer.html": "/disclaimer",
  "/src/pages/disclaimer": "/disclaimer",
  "/src/pages/disclaimer.html": "/disclaimer",
  "/refund-policy.html": "/refund-policy",
  "/src/pages/refund-policy": "/refund-policy",
  "/src/pages/refund-policy.html": "/refund-policy",
  "/support-policy.html": "/support-policy",
  "/src/pages/support-policy": "/support-policy",
  "/src/pages/support-policy.html": "/support-policy",
  "/sitemap.html": "/sitemap",
  "/src/pages/sitemap": "/sitemap",
  "/src/pages/sitemap.html": "/sitemap",
  "/service-website-development": "/services/website-development",
  "/service-website-development.html": "/services/website-development",
  "/src/pages/service-website-development": "/services/website-development",
  "/src/pages/service-website-development.html": "/services/website-development",
  "/case-study-template.html": "/projects",
  "/src/pages/case-study-template": "/projects",
  "/src/pages/case-study-template.html": "/projects",
  "/about/": "/about",
  "/services/": "/services",
  "/services/website-development/": "/services/website-development",
  "/projects/": "/projects",
  "/contact/": "/contact",
  "/privacy-policy/": "/privacy-policy",
  "/terms-and-conditions/": "/terms-and-conditions",
  "/disclaimer/": "/disclaimer",
  "/refund-policy/": "/refund-policy",
  "/support-policy/": "/support-policy",
  "/sitemap/": "/sitemap",
};

const rewrites = {
  "/": "/src/pages/index.html",
  "/about": "/src/pages/about.html",
  "/services": "/src/pages/services.html",
  "/services/website-development": "/src/pages/service-website-development.html",
  "/projects": "/src/pages/projects.html",
  "/contact": "/src/pages/contact.html",
  "/privacy-policy": "/src/pages/privacy-policy.html",
  "/terms-and-conditions": "/src/pages/terms-conditions.html",
  "/disclaimer": "/src/pages/disclaimer.html",
  "/refund-policy": "/src/pages/refund-policy.html",
  "/support-policy": "/src/pages/support-policy.html",
  "/sitemap": "/src/pages/sitemap.html",
  "/admin-login.html": "/src/admin/admin-login.html",
  "/admin-dashboard.html": "/src/admin/admin-dashboard.html",
  "/admin-leads.html": "/src/admin/admin-leads.html",
  "/admin-projects.html": "/src/admin/admin-projects.html",
  "/admin-clients.html": "/src/admin/admin-clients.html",
  "/admin-support.html": "/src/admin/admin-support.html",
  "/admin-pricing.html": "/src/admin/admin-pricing.html",
  "/src/admin/admin-login": "/src/admin/admin-login.html",
  "/src/admin/admin-dashboard": "/src/admin/admin-dashboard.html",
  "/src/admin/admin-leads": "/src/admin/admin-leads.html",
  "/src/admin/admin-projects": "/src/admin/admin-projects.html",
  "/src/admin/admin-clients": "/src/admin/admin-clients.html",
  "/src/admin/admin-support": "/src/admin/admin-support.html",
  "/src/admin/admin-pricing": "/src/admin/admin-pricing.html",
};

const readDb = () => JSON.parse(fs.readFileSync(dbPath, "utf8"));
const writeDb = (data) => fs.writeFileSync(dbPath, `${JSON.stringify(data, null, 2)}\n`);

const send = (response, status, payload, headers = {}) => {
  const body = typeof payload === "string" ? payload : JSON.stringify(payload);
  response.writeHead(status, {
    "Content-Type": typeof payload === "string" ? "text/plain; charset=utf-8" : "application/json; charset=utf-8",
    "X-Frame-Options": "DENY",
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    ...headers,
  });
  response.end(body);
};

const readBody = (request) =>
  new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        request.destroy();
      }
    });
    request.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (error) {
        reject(error);
      }
    });
  });

const createToken = () => {
  const payload = JSON.stringify({ exp: Date.now() + 1000 * 60 * 60 * 8 });
  const signature = crypto.createHmac("sha256", authSecret).update(payload).digest("hex");
  return `${Buffer.from(payload).toString("base64url")}.${signature}`;
};

const verifyToken = (token) => {
  if (!token || !token.includes(".")) return false;
  const [encodedPayload, signature] = token.split(".");
  const expected = crypto.createHmac("sha256", authSecret).update(Buffer.from(encodedPayload, "base64url").toString()).digest("hex");
  if (signature !== expected) return false;
  const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString());
  return payload.exp > Date.now();
};

const requireAuth = (request, response) => {
  const header = request.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!verifyToken(token)) {
    send(response, 401, { error: "Unauthorized" });
    return false;
  }
  return true;
};

const normalizeLead = (input) => ({
  id: input.id || `lead-${Date.now()}`,
  client: String(input.client || "Website Inquiry").trim(),
  service: String(input.service || "Website Inquiry").trim(),
  budget: Number(input.budget || 0),
  status: String(input.status || "New").trim(),
  contact: String(input.contact || "").trim(),
});

const serveStatic = (request, response, pathname) => {
  const mappedPath = rewrites[pathname] || pathname;
  const filePath = path.resolve(rootDir, `.${mappedPath}`);
  if (!filePath.startsWith(rootDir)) {
    send(response, 403, "Forbidden");
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      fs.readFile(path.join(rootDir, "src", "pages", "404.html"), (notFoundError, notFoundData) => {
        if (notFoundError) {
          send(response, 404, "Not found");
          return;
        }
        response.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
        response.end(notFoundData);
      });
      return;
    }

    response.writeHead(200, {
      "Content-Type": contentTypes[path.extname(filePath)] || "application/octet-stream",
      "X-Frame-Options": "DENY",
      "X-Content-Type-Options": "nosniff",
      "Referrer-Policy": "strict-origin-when-cross-origin",
    });
    response.end(data);
  });
};

const server = http.createServer(async (request, response) => {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const pathname = decodeURIComponent(url.pathname);

  try {
    if ((request.method === "GET" || request.method === "HEAD") && publicRedirects[pathname]) {
      response.writeHead(301, {
        Location: `${publicRedirects[pathname]}${url.search}`,
        "Cache-Control": "no-store",
      });
      response.end();
      return;
    }

    if (request.method === "POST" && pathname === "/api/auth/login") {
      if (process.env.NODE_ENV === "production" && !hasSecureAdminConfig && process.env.ABSS_ALLOW_DEV_ADMIN !== "true") {
        send(response, 503, { error: "Admin authentication is development-only until secure production credentials are configured." });
        return;
      }

      const body = await readBody(request);
      if (body.username === adminUsername && body.password === adminPassword) {
        send(response, 200, { token: createToken() });
        return;
      }
      send(response, 401, { error: "Invalid credentials" });
      return;
    }

    if (request.method === "GET" && pathname === "/api/admin/state") {
      if (!requireAuth(request, response)) return;
      send(response, 200, readDb());
      return;
    }

    if (request.method === "PUT" && pathname === "/api/admin/state") {
      if (!requireAuth(request, response)) return;
      const body = await readBody(request);
      writeDb(body);
      send(response, 200, body);
      return;
    }

    if (request.method === "POST" && pathname === "/api/leads/contact") {
      const body = await readBody(request);
      const db = readDb();
      const lead = normalizeLead(body);
      db.leads.unshift(lead);
      db.activity.unshift(`${lead.client} submitted website inquiry`);
      db.activity = db.activity.slice(0, 20);
      writeDb(db);
      send(response, 201, { ok: true, lead });
      return;
    }

    if (request.method === "GET" || request.method === "HEAD") {
      serveStatic(request, response, pathname);
      return;
    }

    send(response, 405, { error: "Method not allowed" });
  } catch (error) {
    send(response, 500, { error: "Server error" });
  }
});

server.listen(port, () => {
  console.log(`ABSS Nexus server running at http://localhost:${port}`);
});
