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
      const configError = requireConfiguredAdmin(env);
      if (configError) return configError;

      const body = await request.json();
      if (body.username === getAdminUsername(env) && body.password === getAdminPassword(env)) {
        return respond(200, { token: await createToken(env) });
      }

      return respond(401, { error: "Invalid credentials" });
    }

    if (request.method === "GET" && route === "/api/admin/state") {
      const configError = requireConfiguredAdmin(env);
      if (configError) return configError;
      if (!(await verifyToken(request, env))) return respond(401, { error: "Unauthorized" });
      return respond(200, await readState(env));
    }

    if (request.method === "PUT" && route === "/api/admin/state") {
      const configError = requireConfiguredAdmin(env);
      if (configError) return configError;
      if (!(await verifyToken(request, env))) return respond(401, { error: "Unauthorized" });
      return respond(200, await writeState(env, await request.json()));
    }

    if (request.method === "POST" && route === "/api/leads/contact") {
      if (!env.ABSS_ADMIN) {
        return respond(503, { error: "Cloudflare KV binding ABSS_ADMIN is not configured." });
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
