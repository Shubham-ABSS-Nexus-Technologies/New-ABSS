const allowedLeadStatuses = new Set(["New", "Follow Up", "Call Booked", "Proposal Sent", "Converted", "Rejected"]);
const allowedInternshipPrograms = new Set(["Web Development Internship", "Software Development Internship", "UI/UX Design Internship"]);
const allowedInternshipStatuses = new Set(["New", "Under Review", "Shortlisted", "Interview Scheduled", "Selected", "Rejected"]);
const stateKey = "admin-state.json";
const migrationKey = "kv_to_d1_migration_v1";
const staleDemoIds = new Set([
  "lead-1",
  "lead-2",
  "lead-3",
  "lead-4",
  "project-1",
  "project-2",
  "project-3",
  "project-4",
  "client-1",
  "client-2",
  "client-3",
  "ticket-1",
  "ticket-2",
  "ticket-3",
  "price-1",
  "price-2",
  "price-3",
]);
const staleDemoActivity = new Set([
  "Proposal shared with EduSpark Institute",
  "Payment reminder added for Restaurant website",
  "Design review completed for Dashboard UI",
  "Backend database initialized",
  "Admin system connected to local API",
  "Admin function connected",
  "Ready for cloud persistence",
]);

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

const internshipApplicationFromRow = (row = {}) => ({
  id: text(row.id, "", 120),
  fullName: text(row.full_name, "", 160),
  email: text(row.email, "", 254),
  phone: text(row.phone, "", 30),
  college: text(row.college, "", 180),
  course: text(row.course, "", 160),
  graduationYear: text(row.graduation_year, "", 12),
  internshipProgram: text(row.internship_program, "", 80),
  technicalSkills: text(row.technical_skills, "", 2000),
  experienceLevel: text(row.experience_level, "", 40),
  portfolioUrl: text(row.portfolio_url, "", 500),
  githubUrl: text(row.github_url, "", 500),
  linkedinUrl: text(row.linkedin_url, "", 500),
  resumeReference: text(row.resume_reference, "", 500),
  motivation: text(row.motivation, "", 5000),
  status: text(row.status, "New", 40),
  adminNotes: text(row.admin_notes, "", 4000),
  createdAt: dateText(row.created_at),
  updatedAt: dateText(row.updated_at),
});

const normalizeInternshipApplication = (input = {}, options = {}) => {
  const now = new Date().toISOString();
  const program = text(input.internshipProgram || input.internship_program, "", 80);
  const currentStatus = text(input.status, "New", 40);
  const createdAt = options.preserveCreatedAt ? dateText(input.createdAt || input.created_at, now) : now;

  return {
    id: id(input.id, "internship"),
    fullName: text(input.fullName || input.full_name, "", 160),
    email: text(input.email, "", 254).toLowerCase(),
    phone: text(input.phone, "", 30),
    college: text(input.college, "", 180),
    course: text(input.course, "", 160),
    graduationYear: text(input.graduationYear || input.graduation_year, "", 12),
    internshipProgram: allowedInternshipPrograms.has(program) ? program : "",
    technicalSkills: text(input.technicalSkills || input.technical_skills, "", 2000),
    experienceLevel: text(input.experienceLevel || input.experience_level, "", 40),
    portfolioUrl: text(input.portfolioUrl || input.portfolio_url, "", 500),
    githubUrl: text(input.githubUrl || input.github_url, "", 500),
    linkedinUrl: text(input.linkedinUrl || input.linkedin_url, "", 500),
    resumeReference: text(input.resumeReference || input.resume_reference, "", 500),
    motivation: text(input.motivation, "", 5000),
    status: allowedInternshipStatuses.has(currentStatus) ? currentStatus : "New",
    adminNotes: text(input.adminNotes || input.admin_notes, "", 4000),
    createdAt,
    updatedAt: now,
  };
};

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

const DB_SCHEMA_STATEMENTS = [
  "PRAGMA foreign_keys = ON",

  `CREATE TABLE IF NOT EXISTS leads (
    id TEXT PRIMARY KEY,
    client TEXT NOT NULL,
    name TEXT,
    company TEXT,
    email TEXT,
    phone TEXT,
    contact TEXT,
    service TEXT,
    package_name TEXT,
    budget INTEGER NOT NULL DEFAULT 0,
    budget_label TEXT,
    message TEXT,
    timeline TEXT,
    status TEXT NOT NULL DEFAULT 'New',
    source TEXT NOT NULL DEFAULT 'Contact Form',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads (created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_leads_status ON leads (status)`,
  `CREATE INDEX IF NOT EXISTS idx_leads_service ON leads (service)`,
  `CREATE INDEX IF NOT EXISTS idx_leads_email ON leads (email)`,

  `CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    client_name TEXT,
    service TEXT,
    value INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'Active',
    start_date TEXT,
    deadline TEXT,
    description TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,

  `CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    company TEXT,
    email TEXT,
    phone TEXT,
    status TEXT NOT NULL DEFAULT 'Active',
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,

  `CREATE TABLE IF NOT EXISTS tickets (
    id TEXT PRIMARY KEY,
    client_name TEXT,
    email TEXT,
    subject TEXT NOT NULL,
    message TEXT,
    priority TEXT NOT NULL DEFAULT 'Normal',
    status TEXT NOT NULL DEFAULT 'Open',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,

  `CREATE TABLE IF NOT EXISTS pricing (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    starting_price INTEGER NOT NULL DEFAULT 0,
    description TEXT,
    features_json TEXT,
    status TEXT NOT NULL DEFAULT 'Active',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,

  `CREATE TABLE IF NOT EXISTS activity (
    id TEXT PRIMARY KEY,
    type TEXT,
    message TEXT NOT NULL,
    entity_id TEXT,
    created_at TEXT NOT NULL
  )`,

  `CREATE TABLE IF NOT EXISTS app_metadata (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at TEXT NOT NULL
  )`,

  `CREATE TABLE IF NOT EXISTS internship_applications (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    college TEXT,
    course TEXT,
    graduation_year TEXT,
    internship_program TEXT NOT NULL,
    technical_skills TEXT,
    experience_level TEXT,
    portfolio_url TEXT,
    github_url TEXT,
    linkedin_url TEXT,
    resume_reference TEXT,
    motivation TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'New',
    admin_notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_internship_email ON internship_applications (email)`,
  `CREATE INDEX IF NOT EXISTS idx_internship_program ON internship_applications (internship_program)`,
  `CREATE INDEX IF NOT EXISTS idx_internship_status ON internship_applications (status)`,
  `CREATE INDEX IF NOT EXISTS idx_internship_created_at ON internship_applications (created_at)`
];

let dbInitialized = false;

export const initializeDatabase = async (db) => {
  if (dbInitialized) return;
  for (const statement of DB_SCHEMA_STATEMENTS) {
    try {
      await run(db, statement);
    } catch (error) {
      console.warn("Schema initialization statement warning:", error?.message || error);
    }
  }
  dbInitialized = true;
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

export const listInternshipApplications = async (db, options = {}) => {
  const page = Math.max(Number(options.page || 1), 1);
  const pageSize = Math.min(Math.max(Number(options.pageSize || 20), 1), 100);
  const filters = [];
  const params = [];
  if (options.status && options.status !== "all") {
    filters.push("status = ?");
    params.push(text(options.status, "", 40));
  }
  if (options.program && options.program !== "all") {
    filters.push("internship_program = ?");
    params.push(text(options.program, "", 80));
  }
  if (options.search) {
    filters.push("(full_name LIKE ? OR email LIKE ? OR phone LIKE ? OR college LIKE ? OR course LIKE ? OR internship_program LIKE ? OR technical_skills LIKE ?)");
    const search = `%${text(options.search, "", 120)}%`;
    params.push(search, search, search, search, search, search, search);
  }
  const where = filters.length ? `WHERE ${filters.join(" AND ")}` : "";
  const order = options.sort === "oldest" ? "ASC" : "DESC";
  const rows = await all(db, `SELECT * FROM internship_applications ${where} ORDER BY created_at ${order} LIMIT ? OFFSET ?`, ...params, pageSize, (page - 1) * pageSize);
  const countRow = await first(db, `SELECT COUNT(*) AS total FROM internship_applications ${where}`, ...params);
  return { items: rows.map(internshipApplicationFromRow), total: Number(countRow?.total || 0), page, pageSize };
};

export const getInternshipApplication = async (db, applicationId) => {
  const row = await first(db, "SELECT * FROM internship_applications WHERE id = ?", text(applicationId, "", 120));
  return row ? internshipApplicationFromRow(row) : null;
};

export const findInternshipApplication = async (db, email, internshipProgram) => {
  const row = await first(
    db,
    "SELECT * FROM internship_applications WHERE email = ? AND internship_program = ? LIMIT 1",
    text(email, "", 254).toLowerCase(),
    text(internshipProgram, "", 80)
  );
  return row ? internshipApplicationFromRow(row) : null;
};

const saveInternshipApplication = async (db, application) =>
  run(
    db,
    "INSERT OR REPLACE INTO internship_applications (id, full_name, email, phone, college, course, graduation_year, internship_program, technical_skills, experience_level, portfolio_url, github_url, linkedin_url, resume_reference, motivation, status, admin_notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    application.id,
    application.fullName,
    application.email,
    application.phone,
    application.college,
    application.course,
    application.graduationYear,
    application.internshipProgram,
    application.technicalSkills,
    application.experienceLevel,
    application.portfolioUrl,
    application.githubUrl,
    application.linkedinUrl,
    application.resumeReference,
    application.motivation,
    application.status,
    application.adminNotes,
    application.createdAt,
    application.updatedAt
  );

export const createInternshipApplication = async (db, input) => {
  const application = normalizeInternshipApplication(input);
  await saveInternshipApplication(db, application);
  await addActivity(db, { type: "internship", message: `${application.fullName} submitted an internship application`, entityId: application.id });
  return application;
};

export const updateInternshipApplication = async (db, applicationId, input) => {
  const existing = await getInternshipApplication(db, applicationId);
  if (!existing) return null;
  const application = normalizeInternshipApplication({ ...existing, ...input, id: applicationId, createdAt: existing.createdAt }, { preserveCreatedAt: true });
  await saveInternshipApplication(db, application);
  await addActivity(db, { type: "internship", message: `${application.fullName} application moved to ${application.status}`, entityId: application.id });
  return application;
};

export const deleteInternshipApplication = async (db, applicationId) =>
  run(db, "DELETE FROM internship_applications WHERE id = ?", text(applicationId, "", 120));

export const listProjects = async (db) => {
  try {
    return (await all(db, "SELECT * FROM projects ORDER BY created_at DESC")).map(projectFromRow);
  } catch (error) {
    console.warn("listProjects query warning:", error?.message || error);
    return [];
  }
};
export const createProject = async (db, input) => {
  const project = normalizeProject(input);
  await run(db, "INSERT OR REPLACE INTO projects (id, name, client_name, service, value, status, start_date, deadline, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", project.id, project.name, project.client, project.service, project.value, project.status, project.startDate, project.deadline, project.description, project.createdAt, project.updatedAt);
  return project;
};
export const updateProject = createProject;
export const deleteProject = async (db, projectId) => run(db, "DELETE FROM projects WHERE id = ?", text(projectId, "", 120));

export const listClients = async (db) => {
  try {
    return (await all(db, "SELECT * FROM clients ORDER BY created_at DESC")).map(clientFromRow);
  } catch (error) {
    console.warn("listClients query warning:", error?.message || error);
    return [];
  }
};
export const createClient = async (db, input) => {
  const client = normalizeClient(input);
  await run(db, "INSERT OR REPLACE INTO clients (id, name, company, email, phone, status, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", client.id, client.name, client.company, client.email, client.phone, client.status, client.notes, client.createdAt, client.updatedAt);
  return client;
};
export const updateClient = createClient;
export const deleteClient = async (db, clientId) => run(db, "DELETE FROM clients WHERE id = ?", text(clientId, "", 120));

export const listTickets = async (db) => {
  try {
    return (await all(db, "SELECT * FROM tickets ORDER BY created_at DESC")).map(ticketFromRow);
  } catch (error) {
    console.warn("listTickets query warning:", error?.message || error);
    return [];
  }
};
export const createTicket = async (db, input) => {
  const ticket = normalizeTicket(input);
  await run(db, "INSERT OR REPLACE INTO tickets (id, client_name, email, subject, message, priority, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", ticket.id, ticket.client, ticket.email, ticket.subject, ticket.message, ticket.priority, ticket.status, ticket.createdAt, ticket.updatedAt);
  return ticket;
};
export const updateTicket = createTicket;
export const deleteTicket = async (db, ticketId) => run(db, "DELETE FROM tickets WHERE id = ?", text(ticketId, "", 120));

export const listPricing = async (db) => {
  try {
    return (await all(db, "SELECT * FROM pricing ORDER BY created_at DESC")).map(pricingFromRow);
  } catch (error) {
    console.warn("listPricing query warning:", error?.message || error);
    return [];
  }
};
export const createPricingItem = async (db, input) => {
  const item = normalizePricing(input);
  await run(db, "INSERT OR REPLACE INTO pricing (id, name, starting_price, description, features_json, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", item.id, item.name, item.startingPrice, item.description, item.featuresJson, item.status, item.createdAt, item.updatedAt);
  return item;
};
export const updatePricingItem = createPricingItem;
export const deletePricingItem = async (db, itemId) => run(db, "DELETE FROM pricing WHERE id = ?", text(itemId, "", 120));

export const listActivity = async (db) => {
  try {
    return (await all(db, "SELECT * FROM activity ORDER BY created_at DESC LIMIT 50")).map((item) => item.message);
  } catch (error) {
    console.warn("listActivity query warning:", error?.message || error);
    return [];
  }
};
export const addActivity = async (db, input) => {
  const now = new Date().toISOString();
  return run(db, "INSERT INTO activity (id, type, message, entity_id, created_at) VALUES (?, ?, ?, ?, ?)", id(input.id, "activity"), text(input.type, "admin", 80), text(input.message, "Admin activity", 500), text(input.entityId || input.entity_id, "", 120), dateText(input.createdAt || input.created_at, now));
};

export const getDashboardMetrics = async (db) => {
  const safeFirst = async (sql, ...params) => {
    try {
      return await first(db, sql, ...params);
    } catch {
      return null;
    }
  };
  const safeAll = async (sql, ...params) => {
    try {
      return await all(db, sql, ...params);
    } catch {
      return [];
    }
  };

  const [leads, activeProjects, openValue, openTickets, convertedLeads, migration] = await Promise.all([
    safeFirst("SELECT COUNT(*) AS total FROM leads"),
    safeFirst("SELECT COUNT(*) AS total FROM projects WHERE status != 'Done'"),
    safeFirst("SELECT COALESCE(SUM(value), 0) AS total FROM projects WHERE status != 'Done'"),
    safeFirst("SELECT COUNT(*) AS total FROM tickets WHERE status != 'Closed'"),
    safeFirst("SELECT COUNT(*) AS total FROM leads WHERE status = 'Converted'"),
    safeFirst("SELECT value, updated_at FROM app_metadata WHERE key = ?", migrationKey),
  ]);
  const [byStatus, byService, recentActivity, monthLeads] = await Promise.all([
    safeAll("SELECT status, COUNT(*) AS total FROM leads GROUP BY status"),
    safeAll("SELECT service, COUNT(*) AS total FROM leads GROUP BY service ORDER BY total DESC"),
    safeAll("SELECT message, created_at FROM activity ORDER BY created_at DESC LIMIT 8"),
    safeFirst("SELECT COUNT(*) AS total FROM leads WHERE strftime('%Y-%m', created_at) = strftime('%Y-%m', 'now')"),
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

export const readD1State = async (db) => {
  const safeListLeads = async () => {
    try {
      return (await listLeads(db, { page: 1, pageSize: 20 })).items;
    } catch (e) {
      console.warn("readD1State listLeads warning:", e?.message || e);
      return [];
    }
  };
  const safeListInternships = async () => {
    try {
      return (await listInternshipApplications(db, { page: 1, pageSize: 20 })).items;
    } catch (e) {
      console.warn("readD1State listInternshipApplications warning:", e?.message || e);
      return [];
    }
  };

  const [leads, projects, clients, tickets, pricing, activity, internshipApplications, metrics] = await Promise.all([
    safeListLeads(),
    listProjects(db),
    listClients(db),
    listTickets(db),
    listPricing(db),
    listActivity(db),
    safeListInternships(),
    getDashboardMetrics(db),
  ]);

  return {
    leads,
    projects,
    clients,
    tickets,
    pricing,
    activity,
    internshipApplications,
    metrics,
  };
};

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
    if (staleDemoIds.has(text(item.id, "", 120))) {
      counts.skippedRecords += 1;
      continue;
    }
    const lead = normalizeLead(item, startedAt);
    const result = await run(db, "INSERT OR IGNORE INTO leads (id, client, name, company, email, phone, contact, service, package_name, budget, budget_label, message, timeline, status, source, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", lead.id, lead.client, lead.name, lead.company, lead.email, lead.phone, lead.contact, lead.service, lead.packageName, lead.budget, lead.budgetLabel, lead.message, lead.timeline, lead.status, lead.source, lead.createdAt, lead.updatedAt);
    counts.leadsMigrated += Number(result.meta?.changes || 0);
    if (!result.meta?.changes) counts.skippedRecords += 1;
  }
  for (const item of state.projects || []) {
    if (staleDemoIds.has(text(item.id, "", 120))) {
      counts.skippedRecords += 1;
      continue;
    }
    const project = normalizeProject(item);
    const result = await run(db, "INSERT OR IGNORE INTO projects (id, name, client_name, service, value, status, start_date, deadline, description, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", project.id, project.name, project.client, project.service, project.value, project.status, project.startDate, project.deadline, project.description, project.createdAt, project.updatedAt);
    counts.projectsMigrated += Number(result.meta?.changes || 0);
    if (!result.meta?.changes) counts.skippedRecords += 1;
  }
  for (const item of state.clients || []) {
    if (staleDemoIds.has(text(item.id, "", 120))) {
      counts.skippedRecords += 1;
      continue;
    }
    const client = normalizeClient(item);
    const result = await run(db, "INSERT OR IGNORE INTO clients (id, name, company, email, phone, status, notes, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", client.id, client.name, client.company, client.email, client.phone, client.status, client.notes, client.createdAt, client.updatedAt);
    counts.clientsMigrated += Number(result.meta?.changes || 0);
    if (!result.meta?.changes) counts.skippedRecords += 1;
  }
  for (const item of state.tickets || []) {
    if (staleDemoIds.has(text(item.id, "", 120))) {
      counts.skippedRecords += 1;
      continue;
    }
    const ticket = normalizeTicket(item);
    const result = await run(db, "INSERT OR IGNORE INTO tickets (id, client_name, email, subject, message, priority, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", ticket.id, ticket.client, ticket.email, ticket.subject, ticket.message, ticket.priority, ticket.status, ticket.createdAt, ticket.updatedAt);
    counts.ticketsMigrated += Number(result.meta?.changes || 0);
    if (!result.meta?.changes) counts.skippedRecords += 1;
  }
  for (const item of state.pricing || []) {
    if (staleDemoIds.has(text(item.id, "", 120))) {
      counts.skippedRecords += 1;
      continue;
    }
    const price = normalizePricing(item);
    const result = await run(db, "INSERT OR IGNORE INTO pricing (id, name, starting_price, description, features_json, status, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)", price.id, price.name, price.startingPrice, price.description, price.featuresJson, price.status, price.createdAt, price.updatedAt);
    counts.pricingMigrated += Number(result.meta?.changes || 0);
    if (!result.meta?.changes) counts.skippedRecords += 1;
  }
  for (const item of state.activity || []) {
    const message = String(item || "Legacy admin activity");
    if (staleDemoActivity.has(message)) {
      counts.skippedRecords += 1;
      continue;
    }
    await addActivity(db, { message, type: "migration", createdAt: startedAt });
    counts.activityMigrated += 1;
  }
  await run(db, "INSERT OR REPLACE INTO app_metadata (key, value, updated_at) VALUES (?, ?, ?)", migrationKey, JSON.stringify(counts), startedAt);
  return counts;
};

export const getStorageStatus = async (db, kv) => {
  let leadCount = 0;
  let projectCount = 0;
  let clientCount = 0;
  let ticketCount = 0;
  let internshipCount = 0;
  let migration = null;

  try { leadCount = Number((await first(db, "SELECT COUNT(*) AS total FROM leads"))?.total || 0); } catch {}
  try { projectCount = Number((await first(db, "SELECT COUNT(*) AS total FROM projects"))?.total || 0); } catch {}
  try { clientCount = Number((await first(db, "SELECT COUNT(*) AS total FROM clients"))?.total || 0); } catch {}
  try { ticketCount = Number((await first(db, "SELECT COUNT(*) AS total FROM tickets"))?.total || 0); } catch {}
  try { internshipCount = Number((await first(db, "SELECT COUNT(*) AS total FROM internship_applications"))?.total || 0); } catch {}
  try { migration = await first(db, "SELECT value, updated_at FROM app_metadata WHERE key = ?", migrationKey); } catch {}

  return {
    activeStorage: "D1",
    d1Connected: true,
    kvConnected: Boolean(kv),
    counts: {
      leads: leadCount,
      projects: projectCount,
      clients: clientCount,
      tickets: ticketCount,
      internshipApplications: internshipCount,
    },
    migration: migration ? { completed: true, updatedAt: migration.updated_at, details: JSON.parse(migration.value || "{}") } : { completed: false },
  };
};
