const allowedLeadStatuses = new Set(["New", "Follow Up", "Call Booked", "Proposal Sent", "Converted", "Rejected"]);
const stateKey = "admin-state.json";
const migrationKey = "kv_to_d1_migration_v1";

const text = (value, fallback = "", maxLength = 500) => String(value ?? fallback).trim().slice(0, maxLength);
const number = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? Math.round(parsed) : 0;
};
const dateText = (value, fallback = new Date().toISOString()) => {
  const parsed = text(value, "", 40);
  return parsed && !Number.isNaN(Date.parse(parsed)) ? parsed : fallback;
};
const status = (value, fallback = "New") => {
  const normalized = text(value, fallback, 40);
  return allowedLeadStatuses.has(normalized) ? normalized : fallback;
};
const id = (value, prefix) => text(value, "", 120) || `${prefix}-${crypto.randomUUID()}`;
const parseContact = (contact = "") => {
  const [email = "", phone = ""] = String(contact).split(" / ");
  return { email: email.trim(), phone: phone.trim() };
};
const firstBudgetValue = (value) => {
  const first = text(value, "", 160).match(/\d[\d,]*/)?.[0]?.replaceAll(",", "");
  return first ? Number(first) : 0;
};

const run = (db, sql, ...params) => db.prepare(sql).bind(...params).run();
const first = (db, sql, ...params) => db.prepare(sql).bind(...params).first();
const all = async (db, sql, ...params) => (await db.prepare(sql).bind(...params).all()).results || [];

const leadFromRow = (row = {}) => ({
  id: row.id,
  client: row.client,
  name: row.name || "",
  company: row.company || "",
  email: row.email || "",
  phone: row.phone || "",
  contact: row.contact || "",
  service: row.service || "",
  packageName: row.package_name || "",
  budget: Number(row.budget || 0),
  budgetLabel: row.budget_label || "",
  message: row.message || "",
  timeline: row.timeline || "",
  status: row.status || "New",
  source: row.source || "Contact Form",
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const normalizeLead = (input = {}, migrationTimestamp = "") => {
  const now = migrationTimestamp || new Date().toISOString();
  const parsedContact = parseContact(input.contact);
  const name = text(input.name || input.client, "", 160);
  const company = text(input.company || input.organization, "", 160);
  const email = text(input.email || parsedContact.email, "", 254);
  const phone = text(input.phone || parsedContact.phone, "", 30);
  const budgetLabel = text(input.budgetLabel || input.budget_label || input.budget || input["budget-plan"], "", 160);
  const createdAt = dateText(input.createdAt || input.created_at, now);
  return {
    id: id(input.id, "lead"),
    client: text(input.client || name || company || "Website Inquiry", "Website Inquiry", 180),
    name: name || text(input.client, "", 160),
    company,
    email,
    phone,
    contact: text(input.contact || [email, phone].filter(Boolean).join(" / "), "", 320),
    service: text(input.service || input["maintenance-type"] || input["feedback-type"] || "Website Inquiry", "Website Inquiry", 160),
    packageName: text(input.packageName || input.package_name || input.package || input["budget-plan"], "", 160),
    budget: number(input.budget) || firstBudgetValue(budgetLabel),
    budgetLabel,
    message: text(input.message || input["project-details"] || "No project message was provided.", "No project message was provided.", 5000),
    timeline: text(input.timeline, "", 160),
    status: status(input.status),
    source: text(input.source || (migrationTimestamp ? "Legacy KV Lead" : "Contact Form"), "Contact Form", 120),
    createdAt,
    updatedAt: dateText(input.updatedAt || input.updated_at, createdAt),
  };
};

const projectFromRow = (row = {}) => ({
  id: row.id,
  name: row.name,
  client: row.client_name || "",
  service: row.service || "",
  value: Number(row.value || 0),
  status: row.status || "Active",
  startDate: row.start_date || "",
  deadline: row.deadline || "",
  description: row.description || "",
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const clientFromRow = (row = {}) => ({
  id: row.id,
  name: row.name,
  company: row.company || "",
  email: row.email || "",
  phone: row.phone || "",
  status: row.status || "Active",
  notes: row.notes || "",
  service: row.notes || "",
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const ticketFromRow = (row = {}) => ({
  id: row.id,
  client: row.client_name || "",
  email: row.email || "",
  issue: row.subject || "",
  message: row.message || "",
  priority: row.priority || "Normal",
  status: row.status || "Open",
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const pricingFromRow = (row = {}) => ({
  id: row.id,
  name: row.name,
  price: Number(row.starting_price || 0),
  startingPrice: Number(row.starting_price || 0),
  description: row.description || "",
  details: row.description || "",
  features: row.features_json ? JSON.parse(row.features_json) : [],
  status: row.status || "Active",
  timeline: "",
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const normalizeProject = (input = {}) => {
  const now = new Date().toISOString();
  const createdAt = dateText(input.createdAt || input.created_at, now);
  return {
    id: id(input.id, "project"),
    name: text(input.name, "Project", 180),
    client: text(input.client || input.clientName || input.client_name, "", 180),
    service: text(input.service, "", 160),
    value: number(input.value),
    status: text(input.status, "Active", 80),
    startDate: text(input.startDate || input.start_date, "", 80),
    deadline: text(input.deadline, "", 80),
    description: text(input.description, "", 2000),
    createdAt,
    updatedAt: dateText(input.updatedAt || input.updated_at, createdAt),
  };
};

const normalizeClient = (input = {}) => {
  const now = new Date().toISOString();
  const createdAt = dateText(input.createdAt || input.created_at, now);
  return {
    id: id(input.id, "client"),
    name: text(input.name, "Client", 180),
    company: text(input.company, "", 180),
    email: text(input.email, "", 254),
    phone: text(input.phone, "", 30),
    status: text(input.status, "Active", 80),
    notes: text(input.notes || input.service, "", 2000),
    createdAt,
    updatedAt: dateText(input.updatedAt || input.updated_at, createdAt),
  };
};

const normalizeTicket = (input = {}) => {
  const now = new Date().toISOString();
  const createdAt = dateText(input.createdAt || input.created_at, now);
  return {
    id: id(input.id, "ticket"),
    client: text(input.client || input.clientName || input.client_name, "", 180),
    email: text(input.email, "", 254),
    subject: text(input.subject || input.issue, "Support request", 220),
    message: text(input.message || input.issue, "", 5000),
    priority: text(input.priority, "Normal", 80),
    status: text(input.status, "Open", 80),
    createdAt,
    updatedAt: dateText(input.updatedAt || input.updated_at, createdAt),
  };
};

const normalizePricing = (input = {}) => {
  const now = new Date().toISOString();
  const createdAt = dateText(input.createdAt || input.created_at, now);
  return {
    id: id(input.id, "price"),
    name: text(input.name, "Package", 180),
    startingPrice: number(input.startingPrice || input.starting_price || input.price),
    description: text(input.description || input.details, "", 4000),
    featuresJson: JSON.stringify(input.features || []),
    status: text(input.status, "Active", 80),
    createdAt,
    updatedAt: dateText(input.updatedAt || input.updated_at, createdAt),
  };
};

export const initializeDatabase = async (db) => {
  await run(db, "PRAGMA foreign_keys = ON");
};

export const listLeads = async (db, options = {}) => {
  const page = Math.max(Number(options.page || 1), 1);
  const pageSize = Math.min(Math.max(Number(options.pageSize || 20), 1), 500);
  const filters = [];
  const params = [];
  if (options.status && options.status !== "all") {
    filters.push("status = ?");
    params.push(text(options.status, "", 40));
  }
  if (options.service) {
    filters.push("service = ?");
    params.push(text(options.service, "", 160));
  }
  if (options.search) {
    filters.push("(name LIKE ? OR company LIKE ? OR email LIKE ? OR phone LIKE ? OR service LIKE ? OR package_name LIKE ? OR message LIKE ? OR status LIKE ?)");
    const search = `%${text(options.search, "", 120)}%`;
    params.push(search, search, search, search, search, search, search, search);
  }
  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
  const order = options.sort === "oldest" ? "ASC" : "DESC";
  const rows = await all(db, `SELECT * FROM leads ${where} ORDER BY created_at ${order} LIMIT ? OFFSET ?`, ...params, pageSize, (page - 1) * pageSize);
  const countRow = await first(db, `SELECT COUNT(*) AS total FROM leads ${where}`, ...params);
  return { items: rows.map(leadFromRow), total: Number(countRow?.total || 0), page, pageSize };
};

export const getLead = async (db, leadId) => {
  const row = await first(db, "SELECT * FROM leads WHERE id = ?", text(leadId, "", 120));
  return row ? leadFromRow(row) : null;
};

const saveLead = async (db, lead) =>
  run(
    db,
    "INSERT OR REPLACE INTO leads (id, client, name, company, email, phone, contact, service, package_name, budget, budget_label, message, timeline, status, source, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    lead.id,
    lead.client,
    lead.name,
    lead.company,
    lead.email,
    lead.phone,
    lead.contact,
    lead.service,
    lead.packageName,
    lead.budget,
    lead.budgetLabel,
    lead.message,
    lead.timeline,
    lead.status,
    lead.source,
    lead.createdAt,
    lead.updatedAt
  );

export const createLead = async (db, input) => {
  const lead = normalizeLead(input);
  await saveLead(db, lead);
  await addActivity(db, { type: "lead", message: `${lead.client} submitted website inquiry`, entityId: lead.id });
  return lead;
};

export const updateLead = async (db, leadId, input) => {
  const existing = await getLead(db, leadId);
  if (!existing) return null;
  const lead = normalizeLead({ ...existing, ...input, id: leadId, createdAt: existing.createdAt });
  lead.updatedAt = new Date().toISOString();
  await run(
    db,
    "UPDATE leads SET client = ?, name = ?, company = ?, email = ?, phone = ?, contact = ?, service = ?, package_name = ?, budget = ?, budget_label = ?, message = ?, timeline = ?, status = ?, source = ?, updated_at = ? WHERE id = ?",
    lead.client,
    lead.name,
    lead.company,
    lead.email,
    lead.phone,
    lead.contact,
    lead.service,
    lead.packageName,
    lead.budget,
    lead.budgetLabel,
    lead.message,
    lead.timeline,
    lead.status,
    lead.source,
    lead.updatedAt,
    lead.id
  );
  await addActivity(db, { type: "lead", message: `${lead.client} lead moved to ${lead.status}`, entityId: lead.id });
  return lead;
};

export const deleteLead = async (db, leadId) => run(db, "DELETE FROM leads WHERE id = ?", text(leadId, "", 120));

export const listProjects = async (db) => (await all(db, "SELECT * FROM projects ORDER BY created_at DESC")).map(projectFromRow);
export const createProject = async (db, input) => {
  const project = normalizeProject(input);
  await run(db, "INSERT OR REPLACE INTO projects (id, name, client_name, service, value, status, start_date, deadline, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", project.id, project.name, project.client, project.service, project.value, project.status, project.startDate, project.deadline, project.description, project.createdAt, project.updatedAt);
  return project;
};
export const updateProject = createProject;
export const deleteProject = async (db, projectId) => run(db, "DELETE FROM projects WHERE id = ?", text(projectId, "", 120));

export const listClients = async (db) => (await all(db, "SELECT * FROM clients ORDER BY created_at DESC")).map(clientFromRow);
export const createClient = async (db, input) => {
  const client = normalizeClient(input);
  await run(db, "INSERT OR REPLACE INTO clients (id, name, company, email, phone, status, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", client.id, client.name, client.company, client.email, client.phone, client.status, client.notes, client.createdAt, client.updatedAt);
  return client;
};
export const updateClient = createClient;
export const deleteClient = async (db, clientId) => run(db, "DELETE FROM clients WHERE id = ?", text(clientId, "", 120));

export const listTickets = async (db) => (await all(db, "SELECT * FROM tickets ORDER BY created_at DESC")).map(ticketFromRow);
export const createTicket = async (db, input) => {
  const ticket = normalizeTicket(input);
  await run(db, "INSERT OR REPLACE INTO tickets (id, client_name, email, subject, message, priority, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", ticket.id, ticket.client, ticket.email, ticket.subject, ticket.message, ticket.priority, ticket.status, ticket.createdAt, ticket.updatedAt);
  return ticket;
};
export const updateTicket = createTicket;
export const deleteTicket = async (db, ticketId) => run(db, "DELETE FROM tickets WHERE id = ?", text(ticketId, "", 120));

export const listPricing = async (db) => (await all(db, "SELECT * FROM pricing ORDER BY created_at DESC")).map(pricingFromRow);
export const createPricingItem = async (db, input) => {
  const item = normalizePricing(input);
  await run(db, "INSERT OR REPLACE INTO pricing (id, name, starting_price, description, features_json, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", item.id, item.name, item.startingPrice, item.description, item.featuresJson, item.status, item.createdAt, item.updatedAt);
  return item;
};
export const updatePricingItem = createPricingItem;
export const deletePricingItem = async (db, itemId) => run(db, "DELETE FROM pricing WHERE id = ?", text(itemId, "", 120));

export const listActivity = async (db) => (await all(db, "SELECT * FROM activity ORDER BY created_at DESC LIMIT 50")).map((item) => item.message);
export const addActivity = async (db, input) => {
  const now = new Date().toISOString();
  return run(db, "INSERT INTO activity (id, type, message, entity_id, created_at) VALUES (?, ?, ?, ?, ?)", id(input.id, "activity"), text(input.type, "admin", 80), text(input.message, "Admin activity", 500), text(input.entityId || input.entity_id, "", 120), dateText(input.createdAt || input.created_at, now));
};

export const getDashboardMetrics = async (db) => {
  const [leads, activeProjects, openValue, openTickets, convertedLeads, migration] = await Promise.all([
    first(db, "SELECT COUNT(*) AS total FROM leads"),
    first(db, "SELECT COUNT(*) AS total FROM projects WHERE status != 'Done'"),
    first(db, "SELECT COALESCE(SUM(value), 0) AS total FROM projects WHERE status != 'Done'"),
    first(db, "SELECT COUNT(*) AS total FROM tickets WHERE status != 'Closed'"),
    first(db, "SELECT COUNT(*) AS total FROM leads WHERE status = 'Converted'"),
    first(db, "SELECT value, updated_at FROM app_metadata WHERE key = ?", migrationKey),
  ]);
  const [byStatus, byService, recentActivity, monthLeads] = await Promise.all([
    all(db, "SELECT status, COUNT(*) AS total FROM leads GROUP BY status"),
    all(db, "SELECT service, COUNT(*) AS total FROM leads GROUP BY service ORDER BY total DESC"),
    all(db, "SELECT message, created_at FROM activity ORDER BY created_at DESC LIMIT 8"),
    first(db, "SELECT COUNT(*) AS total FROM leads WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')"),
  ]);
  return {
    totalLeads: Number(leads?.total || 0),
    activeProjects: Number(activeProjects?.total || 0),
    openProjectValue: Number(openValue?.total || 0),
    openSupportTickets: Number(openTickets?.total || 0),
    convertedLeadCount: Number(convertedLeads?.total || 0),
    newLeadsThisMonth: Number(monthLeads?.total || 0),
    leadsByStatus: byStatus,
    leadsByService: byService,
    recentActivity: recentActivity.map((item) => item.message),
    migrationStatus: migration || null,
  };
};

export const readD1State = async (db) => ({
  leads: (await listLeads(db, { page: 1, pageSize: 20 })).items,
  projects: await listProjects(db),
  clients: await listClients(db),
  tickets: await listTickets(db),
  pricing: await listPricing(db),
  activity: await listActivity(db),
  metrics: await getDashboardMetrics(db),
});

export const writeD1State = async (db, state = {}) => {
  const syncIds = async (table, ids) => {
    const safeIds = ids.map((itemId) => text(itemId, "", 120)).filter(Boolean);
    if (!safeIds.length) {
      await run(db, `DELETE FROM ${table}`);
      return;
    }
    const placeholders = safeIds.map(() => "?").join(", ");
    await run(db, `DELETE FROM ${table} WHERE id NOT IN (${placeholders})`, ...safeIds);
  };

  await syncIds("leads", (state.leads || []).map((item) => item.id));
  await syncIds("projects", (state.projects || []).map((item) => item.id));
  await syncIds("clients", (state.clients || []).map((item) => item.id));
  await syncIds("tickets", (state.tickets || []).map((item) => item.id));
  await syncIds("pricing", (state.pricing || []).map((item) => item.id));
  await run(db, "DELETE FROM activity");

  for (const lead of state.leads || []) await saveLead(db, normalizeLead(lead));
  for (const project of state.projects || []) await createProject(db, project);
  for (const client of state.clients || []) await createClient(db, client);
  for (const ticket of state.tickets || []) await createTicket(db, ticket);
  for (const item of state.pricing || []) await createPricingItem(db, item);
  for (const message of (state.activity || []).slice(0, 50)) await addActivity(db, { message });
  return readD1State(db);
};

export const migrateKvStateToD1 = async (db, kv) => {
  const startedAt = new Date().toISOString();
  const state = (await kv?.get(stateKey, "json")) || {};
  const counts = { leadsMigrated: 0, projectsMigrated: 0, clientsMigrated: 0, ticketsMigrated: 0, pricingMigrated: 0, activityMigrated: 0, skippedRecords: 0, migrationCompletedAt: startedAt };

  for (const item of state.leads || []) {
    const lead = normalizeLead(item, startedAt);
    const result = await run(db, "INSERT OR IGNORE INTO leads (id, client, name, company, email, phone, contact, service, package_name, budget, budget_label, message, timeline, status, source, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", lead.id, lead.client, lead.name, lead.company, lead.email, lead.phone, lead.contact, lead.service, lead.packageName, lead.budget, lead.budgetLabel, lead.message, lead.timeline, lead.status, lead.source, lead.createdAt, lead.updatedAt);
    counts.leadsMigrated += Number(result.meta?.changes || 0);
    if (!result.meta?.changes) counts.skippedRecords += 1;
  }
  for (const item of state.projects || []) {
    const project = normalizeProject(item);
    const result = await run(db, "INSERT OR IGNORE INTO projects (id, name, client_name, service, value, status, start_date, deadline, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", project.id, project.name, project.client, project.service, project.value, project.status, project.startDate, project.deadline, project.description, project.createdAt, project.updatedAt);
    counts.projectsMigrated += Number(result.meta?.changes || 0);
    if (!result.meta?.changes) counts.skippedRecords += 1;
  }
  for (const item of state.clients || []) {
    const client = normalizeClient(item);
    const result = await run(db, "INSERT OR IGNORE INTO clients (id, name, company, email, phone, status, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", client.id, client.name, client.company, client.email, client.phone, client.status, client.notes, client.createdAt, client.updatedAt);
    counts.clientsMigrated += Number(result.meta?.changes || 0);
    if (!result.meta?.changes) counts.skippedRecords += 1;
  }
  for (const item of state.tickets || []) {
    const ticket = normalizeTicket(item);
    const result = await run(db, "INSERT OR IGNORE INTO tickets (id, client_name, email, subject, message, priority, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", ticket.id, ticket.client, ticket.email, ticket.subject, ticket.message, ticket.priority, ticket.status, ticket.createdAt, ticket.updatedAt);
    counts.ticketsMigrated += Number(result.meta?.changes || 0);
    if (!result.meta?.changes) counts.skippedRecords += 1;
  }
  for (const item of state.pricing || []) {
    const price = normalizePricing(item);
    const result = await run(db, "INSERT OR IGNORE INTO pricing (id, name, starting_price, description, features_json, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", price.id, price.name, price.startingPrice, price.description, price.featuresJson, price.status, price.createdAt, price.updatedAt);
    counts.pricingMigrated += Number(result.meta?.changes || 0);
    if (!result.meta?.changes) counts.skippedRecords += 1;
  }
  for (const item of state.activity || []) {
    await addActivity(db, { message: String(item || "Legacy admin activity"), type: "migration", createdAt: startedAt });
    counts.activityMigrated += 1;
  }
  await run(db, "INSERT OR REPLACE INTO app_metadata (key, value, updated_at) VALUES (?, ?, ?)", migrationKey, JSON.stringify(counts), startedAt);
  return counts;
};

export const getStorageStatus = async (db, kv) => {
  const [leadCount, projectCount, clientCount, ticketCount, migration] = await Promise.all([
    first(db, "SELECT COUNT(*) AS total FROM leads"),
    first(db, "SELECT COUNT(*) AS total FROM projects"),
    first(db, "SELECT COUNT(*) AS total FROM clients"),
    first(db, "SELECT COUNT(*) AS total FROM tickets"),
    first(db, "SELECT value, updated_at FROM app_metadata WHERE key = ?", migrationKey),
  ]);
  return {
    activeStorage: "D1",
    d1Connected: true,
    kvConnected: Boolean(kv),
    counts: {
      leads: Number(leadCount?.total || 0),
      projects: Number(projectCount?.total || 0),
      clients: Number(clientCount?.total || 0),
      tickets: Number(ticketCount?.total || 0),
    },
    migration: migration ? { completed: true, updatedAt: migration.updated_at, details: JSON.parse(migration.value || "{}") } : { completed: false },
  };
};
