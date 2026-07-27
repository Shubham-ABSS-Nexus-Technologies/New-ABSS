import {
  createLead as createD1Lead,
  deleteLead as deleteD1Lead,
  getDashboardMetrics,
  getStorageStatus,
  initializeDatabase,
  listLeads,
  migrateKvStateToD1,
  readD1State,
  updateLead as updateD1Lead,
  writeD1State,
} from "../_lib/d1-storage.js";

const defaultState = {
  leads: [],
  projects: [],
  clients: [],
  tickets: [],
  pricing: [],
  activity: [],
};

const stateKey = "admin-state.json";
const allowedLeadStatuses = new Set(["New", "Follow Up", "Call Booked", "Proposal Sent", "Converted", "Rejected"]);
const jsonHeaders = {
  "Content-Type": "application/json; charset=utf-8",
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
};

const encoder = new TextEncoder();

const respond = (status, body, headers = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...jsonHeaders, ...headers },
  });

const getAdminUsername = (env) => env.ADMIN_USERNAME || "";
const getAdminPassword = (env) => env.ADMIN_PASSWORD || "";
const getAuthSecret = (env) => env.AUTH_SECRET || "";

const base64UrlEncode = (value) =>
  btoa(value).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");

const base64UrlDecode = (value) => {
  const normalized = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), "=");
  return atob(padded);
};

const hmacSha256 = async (secret, payload) => {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
};

const constantTimeEqual = (left, right) => {
  if (left.length !== right.length) return false;

  let diff = 0;
  for (let index = 0; index < left.length; index += 1) {
    diff |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return diff === 0;
};

const createToken = async (env) => {
  const payload = JSON.stringify({ exp: Date.now() + 1000 * 60 * 60 * 8 });
  const encodedPayload = base64UrlEncode(payload);
  const signature = await hmacSha256(getAuthSecret(env), payload);
  return `${encodedPayload}.${signature}`;
};

const verifyToken = async (request, env) => {
  const authSecret = getAuthSecret(env);
  if (!authSecret) return false;

  const header = request.headers.get("Authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token || !token.includes(".")) return false;

  const [encodedPayload, signature] = token.split(".");

  try {
    const payload = base64UrlDecode(encodedPayload);
    const expected = await hmacSha256(authSecret, payload);
    if (!constantTimeEqual(signature, expected)) return false;
    return JSON.parse(payload).exp > Date.now();
  } catch (error) {
    return false;
  }
};

const requireConfiguredAdmin = (env) => {
  if (getAdminUsername(env) && getAdminPassword(env) && getAuthSecret(env) && env.ABSS_ADMIN) return null;
  return respond(503, {
    error:
      "Cloudflare backend is not configured. Set ADMIN_USERNAME, ADMIN_PASSWORD, AUTH_SECRET, and the ABSS_ADMIN KV binding.",
  });
};

const hasD1 = (env) => Boolean(env.ABSS_DB);

const requireConfiguredAdminStorage = (env) => {
  if (getAdminUsername(env) && getAdminPassword(env) && getAuthSecret(env) && (env.ABSS_DB || env.ABSS_ADMIN)) return null;
  return respond(503, {
    error:
      "Cloudflare backend is not configured. Set ADMIN_USERNAME, ADMIN_PASSWORD, AUTH_SECRET, and ABSS_DB or the ABSS_ADMIN fallback binding.",
  });
};

const safeLogError = (label, error) => {
  console.error(label, error?.message || error);
};

const readState = async (env) => {
  const storedState = await env.ABSS_ADMIN.get(stateKey, "json");
  return storedState || defaultState;
};

const writeState = async (env, state) => {
  const normalizedState = {
    leads: Array.isArray(state.leads) ? state.leads.map((lead) => normalizeLead(lead, { preserveCreatedAt: true })) : [],
    projects: Array.isArray(state.projects) ? state.projects : [],
    clients: Array.isArray(state.clients) ? state.clients : [],
    tickets: Array.isArray(state.tickets) ? state.tickets : [],
    pricing: Array.isArray(state.pricing) ? state.pricing : [],
    activity: Array.isArray(state.activity) ? state.activity : [],
  };

  await env.ABSS_ADMIN.put(stateKey, JSON.stringify(normalizedState));
  return normalizedState;
};

const trimText = (value, maxLength = 160) => String(value || "").trim().slice(0, maxLength);
const validDateString = (value) => {
  const text = trimText(value, 40);
  return text && !Number.isNaN(Date.parse(text)) ? text : "";
};
const normalizeStatus = (value) => {
  const status = trimText(value, 40);
  return allowedLeadStatuses.has(status) ? status : "New";
};
const normalizeBudget = (value, label) => {
  const numericValue = Number(value);
  if (Number.isFinite(numericValue) && numericValue >= 0) return numericValue;
  const firstBudgetNumber = trimText(label, 120).match(/\d[\d,]*/)?.[0]?.replaceAll(",", "");
  return firstBudgetNumber ? Number(firstBudgetNumber) : 0;
};
const leadSourceFromForm = (value) => {
  const source = trimText(value, 120).toLowerCase();
  if (source.includes("pricing") || source.includes("package")) return "Pricing Form";
  if (source.includes("maintenance")) return "Maintenance Form";
  if (source.includes("feedback")) return "Feedback Form";
  return "Contact Form";
};
const normalizeLead = (input = {}, options = {}) => {
  const now = new Date().toISOString();
  const name = trimText(input.name || input.client, 160);
  const company = trimText(input.company || input.organization, 160);
  const email = trimText(input.email, 254);
  const phone = trimText(input.phone, 30);
  const contact = trimText(input.contact || [email, phone].filter(Boolean).join(" / "), 320);
  const client = trimText(input.client || name || company, 180);
  const service = trimText(input.service || input["maintenance-type"] || input["feedback-type"] || "Website Inquiry", 160);
  const packageName = trimText(input.packageName || input.package || input["budget-plan"], 160);
  const budgetLabel = trimText(input.budgetLabel || input.budget || input["budget-plan"], 160);
  const message = trimText(input.message || input["project-details"] || input.timeline, 5000);
  const timeline = trimText(input.timeline, 160);
  const createdAt = options.preserveCreatedAt ? validDateString(input.createdAt) : "";

  return {
    id: trimText(input.id, 120) || crypto.randomUUID(),
    client,
    name,
    company,
    email,
    phone,
    contact,
    service,
    packageName,
    budget: normalizeBudget(input.budget, budgetLabel),
    budgetLabel,
    message,
    timeline,
    status: normalizeStatus(input.status),
    source: trimText(input.source, 120) || leadSourceFromForm(input.formName || input["form-name"]),
    createdAt: options.preserveCreatedAt ? createdAt : now,
    updatedAt: now,
  };
};

export async function onRequest(context) {
  const { request, env } = context;
  const route = new URL(request.url).pathname;

  try {
    if (request.method === "POST" && route === "/api/auth/login") {
      const configError = requireConfiguredAdminStorage(env);
      if (configError) return configError;

      const body = await request.json();
      if (body.username === getAdminUsername(env) && body.password === getAdminPassword(env)) {
        return respond(200, { token: await createToken(env) });
      }

      return respond(401, { error: "Invalid credentials" });
    }

    if (request.method === "GET" && route === "/api/admin/state") {
      const configError = requireConfiguredAdminStorage(env);
      if (configError) return configError;
      if (!(await verifyToken(request, env))) return respond(401, { error: "Unauthorized" });
      if (hasD1(env)) {
        try {
          await initializeDatabase(env.ABSS_DB);
          return respond(200, await readD1State(env.ABSS_DB));
        } catch (error) {
          safeLogError("D1 state read failed", error);
          return respond(500, { error: "Database error" });
        }
      }
      return respond(200, await readState(env));
    }

    if (request.method === "PUT" && route === "/api/admin/state") {
      const configError = requireConfiguredAdminStorage(env);
      if (configError) return configError;
      if (!(await verifyToken(request, env))) return respond(401, { error: "Unauthorized" });
      if (hasD1(env)) {
        try {
          await initializeDatabase(env.ABSS_DB);
          return respond(200, await writeD1State(env.ABSS_DB, await request.json()));
        } catch (error) {
          safeLogError("D1 state write failed", error);
          return respond(500, { error: "Database error" });
        }
      }
      return respond(200, await writeState(env, await request.json()));
    }

    if (request.method === "GET" && route === "/api/admin/storage-status") {
      const configError = requireConfiguredAdminStorage(env);
      if (configError) return configError;
      if (!(await verifyToken(request, env))) return respond(401, { error: "Unauthorized" });
      if (!hasD1(env)) {
        const state = env.ABSS_ADMIN ? await readState(env) : defaultState;
        return respond(200, {
          activeStorage: "KV fallback",
          d1Connected: false,
          kvConnected: Boolean(env.ABSS_ADMIN),
          counts: {
            leads: state.leads.length,
            projects: state.projects.length,
            clients: state.clients.length,
            tickets: state.tickets.length,
          },
          migration: { completed: false },
        });
      }
      try {
        await initializeDatabase(env.ABSS_DB);
        return respond(200, await getStorageStatus(env.ABSS_DB, env.ABSS_ADMIN));
      } catch (error) {
        safeLogError("D1 storage status failed", error);
        return respond(500, { error: "Database error" });
      }
    }

    if (request.method === "POST" && route === "/api/admin/migrate-storage") {
      const configError = requireConfiguredAdminStorage(env);
      if (configError) return configError;
      if (!(await verifyToken(request, env))) return respond(401, { error: "Unauthorized" });
      if (!env.ABSS_DB || !env.ABSS_ADMIN) return respond(503, { error: "D1 database and KV backup binding are required for migration." });
      try {
        await initializeDatabase(env.ABSS_DB);
        return respond(200, await migrateKvStateToD1(env.ABSS_DB, env.ABSS_ADMIN));
      } catch (error) {
        safeLogError("KV to D1 migration failed", error);
        return respond(500, { error: "Database migration failed" });
      }
    }

    if (request.method === "GET" && route === "/api/admin/leads") {
      const configError = requireConfiguredAdminStorage(env);
      if (configError) return configError;
      if (!(await verifyToken(request, env))) return respond(401, { error: "Unauthorized" });
      if (!hasD1(env)) {
        const url = new URL(request.url);
        const state = await readState(env);
        const page = Math.max(Number(url.searchParams.get("page") || 1), 1);
        const pageSize = Math.min(Math.max(Number(url.searchParams.get("pageSize") || 20), 1), 100);
        const search = String(url.searchParams.get("search") || "").toLowerCase();
        const statusFilter = String(url.searchParams.get("status") || "all");
        const filtered = state.leads.filter((lead) => {
          const matchesSearch = !search || JSON.stringify(lead).toLowerCase().includes(search);
          const matchesStatus = statusFilter === "all" || lead.status === statusFilter;
          return matchesSearch && matchesStatus;
        });
        return respond(200, { items: filtered.slice((page - 1) * pageSize, page * pageSize), total: filtered.length, page, pageSize });
      }
      try {
        const url = new URL(request.url);
        await initializeDatabase(env.ABSS_DB);
        return respond(
          200,
          await listLeads(env.ABSS_DB, {
            page: url.searchParams.get("page"),
            pageSize: url.searchParams.get("pageSize"),
            search: url.searchParams.get("search"),
            status: url.searchParams.get("status"),
            service: url.searchParams.get("service"),
            sort: url.searchParams.get("sort"),
          })
        );
      } catch (error) {
        safeLogError("D1 lead list failed", error);
        return respond(500, { error: "Database error" });
      }
    }

    if (request.method === "PUT" && route.startsWith("/api/admin/leads/")) {
      const configError = requireConfiguredAdminStorage(env);
      if (configError) return configError;
      if (!(await verifyToken(request, env))) return respond(401, { error: "Unauthorized" });
      const leadId = decodeURIComponent(route.split("/").pop() || "");
      if (!hasD1(env)) {
        const state = await readState(env);
        const input = await request.json();
        state.leads = state.leads.map((lead) => (lead.id === leadId ? normalizeLead({ ...lead, ...input, id: leadId }, { preserveCreatedAt: true }) : lead));
        return respond(200, await writeState(env, state));
      }
      try {
        await initializeDatabase(env.ABSS_DB);
        const lead = await updateD1Lead(env.ABSS_DB, leadId, await request.json());
        return lead ? respond(200, lead) : respond(404, { error: "Lead not found" });
      } catch (error) {
        safeLogError("D1 lead update failed", error);
        return respond(500, { error: "Database error" });
      }
    }

    if (request.method === "DELETE" && route.startsWith("/api/admin/leads/")) {
      const configError = requireConfiguredAdminStorage(env);
      if (configError) return configError;
      if (!(await verifyToken(request, env))) return respond(401, { error: "Unauthorized" });
      const leadId = decodeURIComponent(route.split("/").pop() || "");
      if (!hasD1(env)) {
        const state = await readState(env);
        state.leads = state.leads.filter((lead) => lead.id !== leadId);
        return respond(200, await writeState(env, state));
      }
      try {
        await initializeDatabase(env.ABSS_DB);
        await deleteD1Lead(env.ABSS_DB, leadId);
        return respond(200, { ok: true });
      } catch (error) {
        safeLogError("D1 lead delete failed", error);
        return respond(500, { error: "Database error" });
      }
    }

    if (request.method === "POST" && route === "/api/leads/contact") {
      if (hasD1(env)) {
        try {
          await initializeDatabase(env.ABSS_DB);
          const input = await request.json();
          if (!String(input.name || input.client || "").trim() || (!String(input.email || "").trim() && !String(input.phone || "").trim())) {
            return respond(400, { error: "Name and contact details are required." });
          }
          const lead = await createD1Lead(env.ABSS_DB, input);
          return respond(201, { ok: true, lead });
        } catch (error) {
          safeLogError("D1 contact lead create failed", error);
          return respond(500, { error: "Database error" });
        }
      }

      if (!env.ABSS_ADMIN) {
        return respond(503, { error: "Cloudflare storage is not configured." });
      }

      const lead = normalizeLead(await request.json());
      if ((!lead.name && !lead.client) || (!lead.email && !lead.phone)) {
        return respond(400, { error: "Name and contact details are required." });
      }

      const state = await readState(env);
      state.leads = [lead, ...(state.leads || [])].slice(0, 500);
      state.activity = [`${lead.client} submitted website inquiry`, ...(state.activity || [])].slice(0, 50);
      await writeState(env, state);
      return respond(201, { ok: true, lead });
    }

    return respond(404, { error: "Not found" });
  } catch (error) {
    return respond(500, { error: "Server error" });
  }
}
