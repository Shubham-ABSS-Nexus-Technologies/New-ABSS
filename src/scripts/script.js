const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

const localPageRoutes = {
  "/": "/src/pages/index.html",
  "/about": "/src/pages/about.html",
  "/services": "/src/pages/services.html",
  "/services/website-development": "/src/pages/service-website-development.html",
  "/services/ui-ux-design": "/src/pages/service-ui-ux-design.html",
  "/services/website-maintenance": "/src/pages/service-website-maintenance.html",
  "/projects": "/src/pages/projects.html",
  "/contact": "/src/pages/contact.html",
  "/pricing": "/src/pages/pricing.html",
  "/privacy-policy": "/src/pages/privacy-policy.html",
  "/terms-and-conditions": "/src/pages/terms-conditions.html",
  "/disclaimer": "/src/pages/disclaimer.html",
  "/refund-policy": "/src/pages/refund-policy.html",
  "/support-policy": "/src/pages/support-policy.html",
  "/sitemap": "/src/pages/sitemap.html",
};

const isLocalStaticServer =
  ["127.0.0.1", "localhost"].includes(window.location.hostname) &&
  !["3000", "8888"].includes(window.location.port);

if (isLocalStaticServer) {
  document.addEventListener("click", (event) => {
    const link = event.target.closest("a[href]");
    if (!link || link.target || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

    const targetUrl = new URL(link.href, window.location.href);
    const mappedPath = localPageRoutes[targetUrl.pathname.replace(/\/$/, "") || "/"];

    if (targetUrl.origin === window.location.origin && mappedPath) {
      event.preventDefault();
      window.location.href = `${mappedPath}${targetUrl.search}${targetUrl.hash}`;
    }
  });
}

const serviceSelect = document.querySelector('select[name="service"]');
const packageSelect = document.querySelector("#packageSelect");
const queryParams = new URLSearchParams(window.location.search);

if (serviceSelect) {
  const selectedService = queryParams.get("service");
  if (selectedService) {
    const serviceAliases = {
      "Landing Page": "Business Landing Page",
    };
    const normalizedService = serviceAliases[selectedService] || selectedService;
    const matchingOption = [...serviceSelect.options].find((option) => option.value === normalizedService);
    if (matchingOption) {
      serviceSelect.value = normalizedService;
    }
  }
}

if (packageSelect) {
  const selectedPackage = queryParams.get("package") || queryParams.get("service");
  if (selectedPackage) {
    const packageAliases = {
      "Premium Package": "Premium / Custom Package",
      "Website Maintenance": "Maintenance Package",
    };
    const normalizedPackage = packageAliases[selectedPackage] || selectedPackage;
    const matchingOption = [...packageSelect.options].find((option) => option.value === normalizedPackage);
    if (matchingOption) {
      packageSelect.value = normalizedPackage;
    }
  }
}

if (navToggle && navLinks) {
  navToggle.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navLinks.classList.remove("open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const faqToggles = document.querySelectorAll("[data-faq-toggle]");

faqToggles.forEach((button) => {
  button.addEventListener("click", () => {
    const answerId = button.getAttribute("aria-controls");
    const answer = answerId ? document.getElementById(answerId) : null;
    const willOpen = button.getAttribute("aria-expanded") !== "true";

    faqToggles.forEach((item) => {
      const itemAnswerId = item.getAttribute("aria-controls");
      const itemAnswer = itemAnswerId ? document.getElementById(itemAnswerId) : null;
      item.setAttribute("aria-expanded", "false");
      if (itemAnswer) itemAnswer.hidden = true;
    });

    button.setAttribute("aria-expanded", String(willOpen));
    if (answer) answer.hidden = !willOpen;
  });
});

const projectFilterButtons = document.querySelectorAll("[data-project-filter]");
const projectCards = document.querySelectorAll("[data-project-category]");

projectFilterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const filter = button.dataset.projectFilter;
    projectFilterButtons.forEach((item) => item.classList.remove("active"));
    button.classList.add("active");

    projectCards.forEach((card) => {
      const categories = card.dataset.projectCategory.split(" ");
      card.classList.toggle("hidden", filter !== "all" && !categories.includes(filter));
    });
  });
});

const projectModal = document.querySelector(".project-modal");
const projectModalTitle = document.querySelector("#project-modal-title");
const projectModalDescription = document.querySelector("[data-project-modal-description]");
const projectModalType = document.querySelector("[data-project-modal-type]");
const projectModalStatus = document.querySelector("[data-project-modal-status]");
const projectModalTech = document.querySelector("[data-project-modal-tech]");
const projectModalFeatures = document.querySelector("[data-project-modal-features]");
const projectModalDemo = document.querySelector("[data-project-modal-demo]");
const projectModalClose = projectModal?.querySelector(".modal-close");
let previousProjectFocus = null;

const projectDetails = {
  "Personal Portfolio Website": {
    type: "Personal Portfolio Project",
    description:
      "Purpose: Present projects, skills, leadership experience and professional contact information in one responsive personal website.",
    technologies: "HTML, CSS, JavaScript",
    features: "Responsive sections, skills showcase, projects area, contact options, social profile links",
    status: "Completed Demo Project",
    demo: "Live Demo Available",
  },
  "Business Landing Page": {
    type: "Internal Demo Project",
    description:
      "Purpose: Present a business service, benefits, trust-building content and contact actions in a focused page.",
    technologies: "HTML, CSS",
    features: "Hero section, service highlights, benefit blocks, call-to-action areas, contact section",
    status: "Completed — Demo Coming Soon",
    demo: "Demo Coming Soon",
  },
  "College / Institute Website": {
    type: "Internal Demo Project",
    description:
      "Purpose: Organize academic, admission, facilities and institutional information for students and parents.",
    technologies: "HTML, CSS, JavaScript",
    features: "Institute overview, course sections, admission information, facilities, contact form",
    status: "Demo Project In Progress",
    demo: "Demo In Progress",
  },
  "Restaurant Website": {
    type: "Internal Demo Project",
    description:
      "Purpose: Present menu items, services, location information and reservation actions for a restaurant or cafe.",
    technologies: "HTML, CSS",
    features: "Menu presentation, gallery area, restaurant overview, reservation actions, location details",
    status: "Completed — Demo Coming Soon",
    demo: "Demo Coming Soon",
  },
  "E-commerce Website Demo": {
    type: "Internal Demo Project",
    description:
      "Purpose: Show how products, categories, search, cart and customer-account flows can be structured.",
    technologies: "HTML, CSS, JavaScript",
    features: "Product cards, category browsing, search concept, cart action, customer-account flow",
    status: "Demo Project Coming Soon",
    demo: "Coming Soon",
  },
  "Business Dashboard UI": {
    type: "Internal Demo Project",
    description:
      "Purpose: Organize operational information for leads, projects, clients, metrics and management tasks.",
    technologies: "HTML, CSS, JavaScript",
    features: "Sidebar navigation, metric cards, chart area, lead/project sections, management layout",
    status: "Demo Project In Progress",
    demo: "Demo In Progress",
  },
};

document.querySelectorAll("[data-project-modal]").forEach((button) => {
  button.addEventListener("click", () => {
    if (!projectModal || !projectModalTitle) return;
    const projectName = button.dataset.projectModal;
    const detail = projectDetails[projectName];
    if (!detail) return;

    projectModalTitle.textContent = projectName;
    if (projectModalDescription) projectModalDescription.textContent = detail.description;
    if (projectModalType) projectModalType.textContent = detail.type;
    if (projectModalStatus) projectModalStatus.textContent = detail.status;
    if (projectModalTech) projectModalTech.textContent = detail.technologies;
    if (projectModalFeatures) projectModalFeatures.textContent = detail.features;
    if (projectModalDemo) projectModalDemo.textContent = detail.demo;
    previousProjectFocus = document.activeElement;
    projectModal.showModal();
    projectModalClose?.focus();
  });
});

projectModalClose?.addEventListener("click", () => {
  projectModal?.close();
});

document.querySelector("[data-close-project-modal]")?.addEventListener("click", () => {
  projectModal?.close();
});

projectModal?.addEventListener("close", () => {
  previousProjectFocus?.focus?.();
});

const packageModal = document.querySelector(".package-modal");
const packageModalTitle = document.querySelector("#package-modal-title");
const modalPackageSelect = document.querySelector("#selected-package");
const maintenanceModal = document.querySelector(".maintenance-modal");

document.querySelectorAll("[data-package-form]").forEach((button) => {
  button.addEventListener("click", () => {
    if (!packageModal || !packageModalTitle || !modalPackageSelect) return;
    const packageName = button.dataset.package || "";
    packageModalTitle.textContent = packageName ? `Request ${packageName}` : "Start Your Project";
    modalPackageSelect.value = packageName;
    packageModal.showModal();
  });
});

document.querySelector(".package-modal-close")?.addEventListener("click", () => {
  packageModal?.close();
});

packageModal?.addEventListener("click", (event) => {
  if (event.target === packageModal) {
    packageModal.close();
  }
});

document.querySelector("[data-maintenance-form]")?.addEventListener("click", () => {
  maintenanceModal?.showModal();
});

document.querySelector(".maintenance-modal-close")?.addEventListener("click", () => {
  maintenanceModal?.close();
});

maintenanceModal?.addEventListener("click", (event) => {
  if (event.target === maintenanceModal) {
    maintenanceModal.close();
  }
});

const formToLead = (form) => {
  const formData = new FormData(form);
  const textValue = (...names) => {
    for (const name of names) {
      const value = formData.get(name);
      if (value) return String(value).trim();
    }
    return "";
  };
  const formName = textValue("form-name") || form.getAttribute("name") || "website-inquiry";
  const name = textValue("name");
  const company = textValue("company", "organization");
  const email = textValue("email");
  const phone = textValue("phone");
  const packageName = textValue("package", "budget-plan");
  const budgetLabel = textValue("budget", "budget-plan");
  const firstBudgetNumber = budgetLabel.match(/\d[\d,]*/)?.[0]?.replaceAll(",", "") || "0";
  const service =
    textValue("service") ||
    packageName ||
    textValue("maintenance-type") ||
    textValue("feedback-type") ||
    formName.replaceAll("-", " ");
  const message = textValue("message", "project-details", "maintenance-details");
  const timeline = textValue("timeline");
  const sourceMap = {
    contact: "Contact Form",
    "package-request": "Pricing Form",
    "website-maintenance": "Maintenance Form",
    feedback: "Feedback Form",
  };
  const contact = [email, phone].filter(Boolean).join(" / ");

  return {
    id: `${formName}-${Date.now()}`,
    client: name || company || "Website Inquiry",
    name,
    company,
    email,
    phone,
    contact,
    service,
    packageName,
    budget: Number(firstBudgetNumber),
    budgetLabel,
    message: [message, timeline ? `Timeline: ${timeline}` : ""].filter(Boolean).join("\n\n"),
    timeline,
    status: "New",
    source: sourceMap[formName] || "Contact Form",
    formName,
  };
};

const setFormStatus = (form, type, message) => {
  let status = form.querySelector("[data-form-status]");
  if (!status) {
    status = document.createElement("p");
    status.dataset.formStatus = "";
    status.setAttribute("role", "status");
    status.setAttribute("aria-live", "polite");
    form.append(status);
  }
  status.className = `form-status ${type}`;
  status.textContent = message;
};

document.querySelectorAll("form.contact-form").forEach((form) => {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton = form.querySelector("[type='submit']");
    const originalButtonText = submitButton?.textContent || "";
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Submitting...";
    }

    try {
      await window.AbssAdminApi?.queueContactLead(formToLead(form));
      form.reset();
      setFormStatus(form, "success", "Thank you. Your request has been received and ABSS Nexus Technologies will contact you soon.");
    } catch (error) {
      setFormStatus(form, "error", "Something went wrong. Please try again or contact us on WhatsApp.");
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = originalButtonText;
      }
    }
  });
});

const adminLoginPage = document.querySelector("[data-admin-login-page]");
const adminApp = document.querySelector("[data-admin-app]");

if (adminLoginPage) {
  const loginForm = document.querySelector("[data-login-form]");
  const nextPage = new URLSearchParams(window.location.search).get("next") || "admin-dashboard.html";
  const safeNextPage = window.AbssAdminAuthGuard?.getSafeNextPage(nextPage) || "admin-dashboard.html";

  window.AbssAdminAuthGuard?.redirectAuthenticatedLogin(safeNextPage);

  loginForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const username = String(formData.get("username") || "").trim();
    const password = String(formData.get("password") || "").trim();
    const message = document.querySelector("[data-login-message]");

    try {
      await window.AbssAdminApi?.login(username, password);
      window.location.href = safeNextPage;
      return;
    } catch (error) {
      if (message) {
        message.textContent = "Wrong username or password.";
      }
    }
  });
}

if (adminApp) {
  const adminApi = window.AbssAdminApi;
  const adminShell = document.querySelector("[data-admin-shell]");
  const adminModal = document.querySelector("[data-admin-modal]");
  const adminForm = document.querySelector("[data-admin-form]");
  const leadDetailsModal = document.querySelector("[data-lead-details-modal]");
  const leadDetails = document.querySelector("[data-lead-details]");

  const defaults = {
    leads: [],
    projects: [],
    clients: [],
    tickets: [],
    pricing: [],
    activity: [],
  };

  const clone = (value) => JSON.parse(JSON.stringify(value));
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
  const sanitizeState = (state = {}) => ({
    ...state,
    leads: (state.leads || []).filter((item) => !staleDemoIds.has(item.id)),
    projects: (state.projects || []).filter((item) => !staleDemoIds.has(item.id)),
    clients: (state.clients || []).filter((item) => !staleDemoIds.has(item.id)),
    tickets: (state.tickets || []).filter((item) => !staleDemoIds.has(item.id)),
    pricing: (state.pricing || []).filter((item) => !staleDemoIds.has(item.id)),
    activity: (state.activity || []).filter((item) => !staleDemoActivity.has(item)),
    metrics: state.metrics || {},
    leadsTotal: Number(state.leadsTotal || 0),
    leadsPage: Number(state.leadsPage || 1),
    leadsPageSize: Number(state.leadsPageSize || 20),
  });
  const readState = () => {
    return sanitizeState(adminApi?.loadState(defaults) || clone(defaults));
  };
  let adminState = clone(defaults);
  let activeFilters = { leadsSearch: "", leadsStatus: "all", leadsPage: 1, leadsPageSize: 20 };
  let storageStatus = null;

  const saveState = () => {
    adminApi?.saveState(adminState);
  };

  const addActivity = (message) => {
    adminState.activity.unshift(message);
    adminState.activity = adminState.activity.slice(0, 8);
    saveState();
  };

  const escapeHtml = (value) =>
    String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#39;");

  const leadStatuses = ["New", "Follow Up", "Call Booked", "Proposal Sent", "Converted", "Rejected"];
  const formatMoney = (value) => `Rs ${Number(value || 0).toLocaleString("en-IN")}`;
  const makeId = (prefix) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const emptyState = (message) => `<div class="admin-empty-state">${escapeHtml(message)}</div>`;
  const emptyRow = (message, columns) => `<tr><td colspan="${columns}"><div class="admin-empty-state">${escapeHtml(message)}</div></td></tr>`;
  const textField = (value, fallback = "") => String(value || fallback).trim();
  const parseContact = (contact = "") => {
    const [email = "", phone = ""] = String(contact).split(" / ");
    return { email: email.trim(), phone: phone.trim() };
  };
  const leadName = (lead) => textField(lead.name || lead.client, "Website Inquiry");
  const leadEmail = (lead) => textField(lead.email || parseContact(lead.contact).email);
  const leadPhone = (lead) => textField(lead.phone || parseContact(lead.contact).phone);
  const leadBudgetLabel = (lead) => textField(lead.budgetLabel, lead.budget ? formatMoney(lead.budget) : "Not specified");
  const leadMessage = (lead) => textField(lead.message, "No project message was provided.");
  const leadCreatedAt = (lead) => textField(lead.createdAt);
  const formatLeadDate = (value) => {
    if (!value) return "Legacy lead";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "Legacy lead";
    return date.toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
  };
  const leadSource = (lead) => textField(lead.source, "Contact Form");
  const sortLeadsNewestFirst = (leads) =>
    [...leads].sort((left, right) => {
      const rightTime = Date.parse(right.createdAt || "") || 0;
      const leftTime = Date.parse(left.createdAt || "") || 0;
      return rightTime - leftTime;
    });
  const csvCell = (value) => `"${String(value ?? "").replaceAll('"', '""').replaceAll("\r", " ").replaceAll("\n", " ")}"`;
  const getLeadById = (id) => adminState.leads.find((lead) => String(lead.id) === String(id));
  const normalizedLeadStatus = (status) => (leadStatuses.includes(status) ? status : "New");
  const updateLeadStatus = async (id, status) => {
    const lead = getLeadById(id);
    const nextStatus = normalizedLeadStatus(status);
    if (!lead) return;
    if (adminApi?.isAuthenticated?.()) {
      await adminApi.updateLead(id, { status: nextStatus });
      lead.status = nextStatus;
      lead.updatedAt = new Date().toISOString();
      return;
    }
    lead.status = nextStatus;
    lead.updatedAt = new Date().toISOString();
    addActivity(`${leadName(lead)} lead moved to ${nextStatus}`);
    renderAdmin();
  };

  const statusClass = (status) => {
    if (["Converted", "Proposal Sent", "Done", "Closed"].includes(status)) return "completed";
    if (["Follow Up", "Call Booked", "Active", "In Progress"].includes(status)) return "progress";
    if (["Rejected"].includes(status)) return "rejected";
    if (["New", "Open", "High"].includes(status)) return "upcoming";
    return "neutral";
  };

  const refreshStorageStatus = async () => {
    try {
      storageStatus = await adminApi?.getStorageStatus();
    } catch (error) {
      storageStatus = null;
    }
  };

  const refreshLeadsFromServer = async () => {
    if (!document.querySelector("[data-leads-table]") || !adminApi?.listLeads || !adminApi?.isAuthenticated?.()) return;
    try {
      const result = await adminApi.listLeads({
        page: activeFilters.leadsPage,
        pageSize: activeFilters.leadsPageSize,
        search: activeFilters.leadsSearch,
        status: activeFilters.leadsStatus,
        sort: "newest",
      });
      adminState.leads = result.items || [];
      adminState.leadsTotal = Number.isFinite(Number(result.total)) ? Number(result.total) : adminState.leads.length;
      adminState.leadsPage = result.page || activeFilters.leadsPage;
      adminState.leadsPageSize = result.pageSize || activeFilters.leadsPageSize;
    } catch (error) {
      console.error("Lead pagination failed", error);
    }
  };

  const showAdmin = async () => {
    const session = await window.AbssAdminAuthGuard?.requireAdminSession(defaults);
    if (!session?.authenticated) {
      return;
    }

    adminState = sanitizeState(session.state || readState());
    await refreshLeadsFromServer();
    if (adminApi?.getMode?.() !== "api") {
      saveState();
    }

    if (adminShell) {
      adminShell.hidden = false;
    }
    await refreshStorageStatus();
    renderAdmin();
  };

  document.querySelector("[data-logout]")?.addEventListener("click", () => {
    adminApi?.logout();
    window.location.href = "admin-login.html";
  });

  document.querySelector("[data-reset-admin]")?.addEventListener("click", () => {
    adminState = clone(defaults);
    saveState();
    renderAdmin();
  });

  document.querySelector("[data-migrate-storage]")?.addEventListener("click", async (event) => {
    const button = event.currentTarget;
    const message = document.querySelector("[data-storage-message]");
    const confirmed = window.confirm("Migrate existing KV data into D1? Existing KV data will remain unchanged as a backup.");
    if (!confirmed) return;
    button.disabled = true;
    if (message) {
      message.className = "form-status";
      message.textContent = "Migration is running...";
    }
    try {
      const result = await adminApi?.migrateStorage();
      await refreshStorageStatus();
      const migrated =
        Number(result.leadsMigrated || 0) +
        Number(result.projectsMigrated || 0) +
        Number(result.clientsMigrated || 0) +
        Number(result.ticketsMigrated || 0) +
        Number(result.pricingMigrated || 0) +
        Number(result.activityMigrated || 0);
      if (message) {
        message.className = "form-status success";
        message.textContent = `Migration completed. ${migrated} records migrated, ${Number(result.skippedRecords || 0)} skipped.`;
      }
      adminState = sanitizeState(adminApi?.loadState(defaults) || clone(defaults));
      renderAdmin();
    } catch (error) {
      if (message) {
        message.className = "form-status error";
        message.textContent = "Migration failed. Check Cloudflare D1 binding and migration status.";
      }
    } finally {
      button.disabled = false;
    }
  });

  document.querySelector("[data-export-csv]")?.addEventListener("click", async () => {
    let exportLeads = adminState.leads;
    if (adminApi?.isAuthenticated?.() && adminApi?.listLeads) {
      const result = await adminApi.listLeads({ page: 1, pageSize: 500, sort: "newest" });
      exportLeads = result.items || [];
    }
    const rows = [
      ["ID", "Name", "Company", "Email", "Phone", "Service", "Package", "Budget Value", "Budget Label", "Message", "Timeline", "Status", "Source", "Created At", "Updated At"],
    ];
    sortLeadsNewestFirst(exportLeads).forEach((lead) => {
      rows.push([
        lead.id,
        leadName(lead),
        lead.company,
        leadEmail(lead),
        leadPhone(lead),
        lead.service,
        lead.packageName,
        Number(lead.budget || 0),
        leadBudgetLabel(lead),
        leadMessage(lead),
        lead.timeline,
        normalizedLeadStatus(lead.status),
        leadSource(lead),
        lead.createdAt || "",
        lead.updatedAt || "",
      ]);
    });
    const csv = rows.map((row) => row.map(csvCell).join(",")).join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    link.download = "abss-leads-export.csv";
    link.click();
    URL.revokeObjectURL(link.href);
  });

  document.querySelectorAll("[data-admin-tab]").forEach((button) => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-admin-tab]").forEach((tab) => tab.classList.remove("active"));
      document.querySelectorAll("[data-admin-panel]").forEach((panel) => panel.classList.remove("active"));
      button.classList.add("active");
      document.querySelector(`[data-admin-panel="${button.dataset.adminTab}"]`)?.classList.add("active");
      renderCharts();
    });
  });

  document.querySelector("[data-search='leads']")?.addEventListener("input", async (event) => {
    activeFilters.leadsSearch = event.target.value.toLowerCase();
    activeFilters.leadsPage = 1;
    await refreshLeadsFromServer();
    renderLeads();
  });

  document.querySelector("[data-filter='leads']")?.addEventListener("change", async (event) => {
    activeFilters.leadsStatus = event.target.value;
    activeFilters.leadsPage = 1;
    await refreshLeadsFromServer();
    renderLeads();
  });

  document.querySelectorAll("[data-open-modal]").forEach((button) => {
    button.addEventListener("click", () => openEntryModal(button.dataset.openModal));
  });

  document.querySelector("[data-close-admin-modal]")?.addEventListener("click", () => adminModal?.close());
  adminModal?.addEventListener("click", (event) => {
    if (event.target === adminModal) adminModal.close();
  });
  document.querySelector("[data-close-lead-details]")?.addEventListener("click", () => leadDetailsModal?.close());
  leadDetailsModal?.addEventListener("click", (event) => {
    if (event.target === leadDetailsModal) leadDetailsModal.close();
  });
  leadDetailsModal?.addEventListener("change", async (event) => {
    const select = event.target.closest("[data-lead-status-select]");
    if (!select) return;
    await updateLeadStatus(select.dataset.id, select.value);
    openLeadDetails(select.dataset.id);
  });

  adminApp.addEventListener("click", async (event) => {
    const actionButton = event.target.closest("[data-admin-action]");
    if (!actionButton) return;
    const { adminAction, id } = actionButton.dataset;

    if (adminAction === "delete-lead") {
      if (adminApi?.isAuthenticated?.()) {
        await adminApi.deleteLead(id);
        await refreshLeadsFromServer();
        await refreshStorageStatus();
        renderAdmin();
        return;
      } else {
        adminState.leads = adminState.leads.filter((lead) => lead.id !== id);
        addActivity("Lead removed from queue");
      }
    }

    if (adminAction === "view-lead") {
      openLeadDetails(id);
      return;
    }

    if (adminAction === "cycle-lead") {
      const lead = adminState.leads.find((item) => item.id === id);
      if (lead) {
        const currentIndex = leadStatuses.indexOf(normalizedLeadStatus(lead.status));
        await updateLeadStatus(id, leadStatuses[(currentIndex + 1) % leadStatuses.length]);
        if (adminApi?.isAuthenticated?.()) {
          await refreshLeadsFromServer();
          await refreshStorageStatus();
          renderAdmin();
          return;
        }
      }
    }

    if (adminAction === "delete-project") {
      adminState.projects = adminState.projects.filter((project) => project.id !== id);
      addActivity("Project removed from tracker");
    }

    if (adminAction === "project-progress") {
      const project = adminState.projects.find((item) => item.id === id);
      if (project) {
        project.progress = Math.min(100, Number(project.progress) + 10);
        project.status = project.progress >= 100 ? "Done" : "Active";
        addActivity(`${project.name} progress updated`);
      }
    }

    if (adminAction === "delete-client") {
      adminState.clients = adminState.clients.filter((client) => client.id !== id);
      addActivity("Client removed from database");
    }

    if (adminAction === "delete-ticket") {
      adminState.tickets = adminState.tickets.filter((ticket) => ticket.id !== id);
      addActivity("Support ticket removed");
    }

    if (adminAction === "cycle-ticket") {
      const order = ["Open", "In Progress", "Closed"];
      const ticket = adminState.tickets.find((item) => item.id === id);
      if (ticket) {
        ticket.status = order[(order.indexOf(ticket.status) + 1) % order.length];
        addActivity(`${ticket.client} ticket moved to ${ticket.status}`);
      }
    }

    saveState();
    renderAdmin();
  });

  document.querySelector("[data-save-pricing]")?.addEventListener("click", () => {
    document.querySelectorAll("[data-pricing-card]").forEach((card, index) => {
      const packageItem = adminState.pricing[index];
      if (!packageItem) return;
      packageItem.name = card.querySelector("[name='name']").value.trim();
      packageItem.price = Number(card.querySelector("[name='price']").value || 0);
      packageItem.timeline = card.querySelector("[name='timeline']").value.trim();
      packageItem.details = card.querySelector("[name='details']").value.trim();
    });
    addActivity("Pricing packages updated");
    renderAdmin();
  });

  adminForm?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const formData = new FormData(adminForm);
    const type = adminForm.dataset.entryType;

    if (type === "lead") {
      const now = new Date().toISOString();
      const email = textField(formData.get("email"));
      const phone = textField(formData.get("phone"));
      const budgetLabel = textField(formData.get("budgetLabel"), formData.get("budget"));
      const lead = {
        id: makeId("lead"),
        client: formData.get("client"),
        name: formData.get("client"),
        company: formData.get("company"),
        email,
        phone,
        contact: [email, phone].filter(Boolean).join(" / "),
        service: formData.get("service"),
        packageName: formData.get("packageName"),
        budget: Number(formData.get("budget") || 0),
        budgetLabel,
        message: formData.get("message"),
        status: normalizedLeadStatus(formData.get("status")),
        source: "Admin",
        createdAt: now,
        updatedAt: now,
      };
      if (adminApi?.isAuthenticated?.()) {
        await adminApi.createLead(lead);
        await refreshLeadsFromServer();
        await refreshStorageStatus();
        adminModal?.close();
        renderAdmin();
        return;
      } else {
        adminState.leads.unshift(lead);
        addActivity(`${formData.get("client")} lead added`);
      }
    }

    if (type === "project") {
      adminState.projects.unshift({
        id: makeId("project"),
        name: formData.get("name"),
        client: formData.get("client"),
        value: Number(formData.get("value") || 0),
        progress: Number(formData.get("progress") || 0),
        status: "Active",
      });
      addActivity(`${formData.get("name")} project added`);
    }

    if (type === "client") {
      adminState.clients.unshift({
        id: makeId("client"),
        name: formData.get("name"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        service: formData.get("service"),
      });
      addActivity(`${formData.get("name")} added to clients`);
    }

    if (type === "ticket") {
      adminState.tickets.unshift({
        id: makeId("ticket"),
        client: formData.get("client"),
        issue: formData.get("issue"),
        priority: formData.get("priority"),
        status: "Open",
      });
      addActivity(`${formData.get("client")} support ticket added`);
    }

    saveState();
    adminModal?.close();
    renderAdmin();
  });

  const openEntryModal = (type) => {
    const titles = {
      lead: "Add Lead",
      project: "Add Project",
      client: "Add Client",
      ticket: "Add Support Ticket",
    };

    const fields = {
      lead: `
        <p class="eyebrow">Lead</p><h2>${titles.lead}</h2>
        <div class="admin-form-grid">
          <label>Client<input name="client" required /></label>
          <label>Company<input name="company" /></label>
          <label>Email<input name="email" type="email" /></label>
          <label>Phone<input name="phone" /></label>
          <label>Service<input name="service" required /></label>
          <label>Package<input name="packageName" /></label>
          <label>Budget<input name="budget" type="number" min="0" required /></label>
          <label>Budget Label<input name="budgetLabel" placeholder="₹5,000 - ₹10,000" /></label>
          <label>Status<select name="status"><option>New</option><option>Follow Up</option><option>Call Booked</option><option>Proposal Sent</option><option>Converted</option><option>Rejected</option></select></label>
          <label class="full-field">Message<textarea name="message" rows="4"></textarea></label>
          <button class="btn primary" type="submit">Save Lead</button>
        </div>`,
      project: `
        <p class="eyebrow">Project</p><h2>${titles.project}</h2>
        <div class="admin-form-grid">
          <label>Project Name<input name="name" required /></label>
          <label>Client<input name="client" required /></label>
          <label>Value<input name="value" type="number" min="0" required /></label>
          <label>Progress %<input name="progress" type="number" min="0" max="100" value="10" required /></label>
          <button class="btn primary" type="submit">Save Project</button>
        </div>`,
      client: `
        <p class="eyebrow">Client</p><h2>${titles.client}</h2>
        <div class="admin-form-grid">
          <label>Name<input name="name" required /></label>
          <label>Email<input name="email" type="email" required /></label>
          <label>Phone<input name="phone" required /></label>
          <label>Service<input name="service" required /></label>
          <button class="btn primary" type="submit">Save Client</button>
        </div>`,
      ticket: `
        <p class="eyebrow">Support</p><h2>${titles.ticket}</h2>
        <div class="admin-form-grid">
          <label>Client<input name="client" required /></label>
          <label>Priority<select name="priority"><option>Low</option><option>Medium</option><option>High</option></select></label>
          <label class="full-field">Issue<textarea name="issue" rows="4" required></textarea></label>
          <button class="btn primary" type="submit">Save Ticket</button>
        </div>`,
    };

    adminForm.dataset.entryType = type;
    adminForm.innerHTML = fields[type];
    adminModal?.showModal();
  };

  const renderMetrics = () => {
    const activeProjects = adminState.projects.filter((project) => project.status !== "Done");
    const openTickets = adminState.tickets.filter((ticket) => ticket.status !== "Closed");
    const revenue = activeProjects.reduce((total, project) => total + Number(project.value || 0), 0);
    const metrics = adminState.metrics || {};
    const leadMetric = document.querySelector("[data-metric='leads']");
    const projectMetric = document.querySelector("[data-metric='projects']");
    const revenueMetric = document.querySelector("[data-metric='revenue']");
    const supportMetric = document.querySelector("[data-metric='support']");
    const lastUpdated = document.querySelector("[data-last-updated]");
    const totalLeadCount = storageStatus?.counts?.leads ?? metrics.totalLeads ?? (adminState.leadsTotal || adminState.leads.length);
    if (leadMetric) leadMetric.textContent = totalLeadCount;
    if (projectMetric) projectMetric.textContent = metrics.activeProjects ?? activeProjects.length;
    if (revenueMetric) revenueMetric.textContent = formatMoney(metrics.openProjectValue ?? revenue);
    if (supportMetric) supportMetric.textContent = metrics.openSupportTickets ?? openTickets.length;
    if (lastUpdated) {
      lastUpdated.textContent = `Updated ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    }
  };

  const renderStorageStatus = () => {
    const panel = document.querySelector("[data-storage-panel]");
    if (!panel) return;
    const counts = storageStatus?.counts || {};
    const migration = storageStatus?.migration || {};
    const setField = (name, value) => {
      const field = panel.querySelector(`[data-storage-field="${name}"]`);
      if (field) field.textContent = value;
    };
    const activeBadge = panel.querySelector("[data-storage-active]");
    const migrationNote = panel.querySelector("[data-storage-migration]");
    const migrateButton = panel.querySelector("[data-migrate-storage]");

    setField("activeStorage", storageStatus?.activeStorage || "Unavailable");
    setField("d1Connected", storageStatus?.d1Connected ? "Connected" : "Not connected");
    setField("leads", counts.leads ?? 0);
    setField("projects", counts.projects ?? 0);
    setField("clients", counts.clients ?? 0);
    setField("tickets", counts.tickets ?? 0);
    if (activeBadge) activeBadge.textContent = storageStatus?.activeStorage || "Unavailable";
    if (migrationNote) {
      migrationNote.textContent = migration.completed
        ? `Last migration completed at ${formatLeadDate(migration.updatedAt || migration.details?.migrationCompletedAt)}.`
        : "Migration has not run yet. KV data will remain unchanged when migrated.";
    }
    if (migrateButton) {
      migrateButton.hidden = Boolean(migration.completed) || !storageStatus?.d1Connected;
    }
  };

  const openLeadDetails = (id) => {
    const lead = getLeadById(id);
    if (!leadDetails || !lead) return;
    const email = leadEmail(lead);
    const phone = leadPhone(lead);
    const whatsappPhone = phone.replace(/[^\d]/g, "");
    const status = normalizedLeadStatus(lead.status);

    leadDetails.innerHTML = `
      <div class="lead-details">
        <p class="eyebrow">Lead Details</p>
        <h2>${escapeHtml(leadName(lead))}</h2>
        <div class="lead-detail-grid">
          <article><span>Full Name</span><strong>${escapeHtml(leadName(lead))}</strong></article>
          <article><span>Company/Organization</span><strong>${escapeHtml(textField(lead.company, "Not provided"))}</strong></article>
          <article><span>Email</span><strong>${escapeHtml(email || "Not provided")}</strong></article>
          <article><span>Phone</span><strong>${escapeHtml(phone || "Not provided")}</strong></article>
          <article><span>Service</span><strong>${escapeHtml(textField(lead.service, "Website Inquiry"))}</strong></article>
          <article><span>Package</span><strong>${escapeHtml(textField(lead.packageName, "Not selected"))}</strong></article>
          <article><span>Budget Range</span><strong>${escapeHtml(leadBudgetLabel(lead))}</strong></article>
          <article><span>Timeline</span><strong>${escapeHtml(textField(lead.timeline, "Not provided"))}</strong></article>
          <article><span>Source</span><strong>${escapeHtml(leadSource(lead))}</strong></article>
          <article><span>Submitted Date and Time</span><strong>${escapeHtml(formatLeadDate(lead.createdAt))}</strong></article>
          <article>
            <span>Current Status</span>
            <select data-lead-status-select data-id="${escapeHtml(lead.id)}">
              ${leadStatuses.map((item) => `<option value="${escapeHtml(item)}" ${item === status ? "selected" : ""}>${escapeHtml(item)}</option>`).join("")}
            </select>
          </article>
          <article class="full-field"><span>Project Message</span><p>${escapeHtml(leadMessage(lead))}</p></article>
        </div>
        <div class="lead-action-row">
          ${email ? `<a class="row-action" href="mailto:${escapeHtml(email)}">Email</a>` : ""}
          ${phone ? `<a class="row-action" href="tel:${escapeHtml(phone)}">Phone</a>` : ""}
          ${whatsappPhone ? `<a class="row-action" href="https://wa.me/${escapeHtml(whatsappPhone)}" target="_blank" rel="noopener noreferrer">WhatsApp</a>` : ""}
        </div>
      </div>`;
    leadDetailsModal?.showModal();
  };

  const renderLeads = () => {
    const table = document.querySelector("[data-leads-table]");
    if (!table) return;
    const countNote = document.querySelector("[data-leads-count-note]");
    const rows = sortLeadsNewestFirst(adminState.leads).filter((lead) => {
      const searchText = [
        leadName(lead),
        lead.company,
        leadEmail(lead),
        leadPhone(lead),
        lead.service,
        lead.packageName,
        leadMessage(lead),
        normalizedLeadStatus(lead.status),
      ]
        .join(" ")
        .toLowerCase();
      const matchesSearch = searchText.includes(activeFilters.leadsSearch);
      const matchesStatus = activeFilters.leadsStatus === "all" || normalizedLeadStatus(lead.status) === activeFilters.leadsStatus;
      return matchesSearch && matchesStatus;
    });
    const displayedCount = rows.length;
    const filteredTotal = adminState.leadsTotal || rows.length;
    if (countNote) {
      countNote.textContent = `Showing ${displayedCount} of ${filteredTotal} inquiries`;
    }
    if (!rows.length) {
      table.innerHTML = emptyRow("No leads yet. New website inquiries will appear here.", 6);
      return;
    }
    table.innerHTML = rows
      .map(
        (lead) => `
          <tr>
            <td>${escapeHtml(leadName(lead))}</td>
            <td>${escapeHtml(textField(lead.service, "Website Inquiry"))}</td>
            <td>${escapeHtml(leadBudgetLabel(lead))}</td>
            <td><span class="status-badge ${statusClass(normalizedLeadStatus(lead.status))}">${escapeHtml(normalizedLeadStatus(lead.status))}</span></td>
            <td>${escapeHtml(formatLeadDate(lead.createdAt))}</td>
            <td>
              <button type="button" class="row-action" data-admin-action="view-lead" data-id="${escapeHtml(lead.id)}">View Details</button>
              <button type="button" class="row-action" data-admin-action="cycle-lead" data-id="${escapeHtml(lead.id)}">Status</button>
              <button type="button" class="row-action danger" data-admin-action="delete-lead" data-id="${escapeHtml(lead.id)}">Delete</button>
            </td>
          </tr>`
      )
      .join("");
  };

  const renderProjects = () => {
    const list = document.querySelector("[data-project-list]");
    if (!list) return;
    if (!adminState.projects.length) {
      list.innerHTML = emptyState("No projects yet. Add real projects when work starts.");
      return;
    }
    list.innerHTML = adminState.projects
      .map(
        (project) => `
          <article class="admin-mini-card">
            <span class="status-badge ${statusClass(project.status)}">${escapeHtml(project.status)}</span>
            <h3>${escapeHtml(project.name)}</h3>
            <p>${escapeHtml(project.client)} - ${formatMoney(project.value)}</p>
            <div class="pipeline-list">
              <div>
                <span>Progress</span>
                <strong>${Number(project.progress)}%</strong>
                <progress value="${Number(project.progress)}" max="100"></progress>
              </div>
            </div>
            <div class="admin-mini-card-actions">
              <button type="button" class="row-action" data-admin-action="project-progress" data-id="${project.id}">+10%</button>
              <button type="button" class="row-action danger" data-admin-action="delete-project" data-id="${project.id}">Delete</button>
            </div>
          </article>`
      )
      .join("");
  };

  const renderClients = () => {
    const list = document.querySelector("[data-client-list]");
    if (!list) return;
    if (!adminState.clients.length) {
      list.innerHTML = emptyState("No clients yet. Converted customers will appear here.");
      return;
    }
    list.innerHTML = adminState.clients
      .map(
        (client) => `
          <article class="admin-mini-card">
            <h3>${escapeHtml(client.name)}</h3>
            <p>${escapeHtml(client.service)}</p>
            <small>${escapeHtml(client.email)}</small>
            <small>${escapeHtml(client.phone)}</small>
            <div class="admin-mini-card-actions">
              <button type="button" class="row-action danger" data-admin-action="delete-client" data-id="${client.id}">Delete</button>
            </div>
          </article>`
      )
      .join("");
  };

  const renderTickets = () => {
    const table = document.querySelector("[data-support-table]");
    if (!table) return;
    if (!adminState.tickets.length) {
      table.innerHTML = emptyRow("No support tickets yet.", 5);
      return;
    }
    table.innerHTML = adminState.tickets
      .map(
        (ticket) => `
          <tr>
            <td>${escapeHtml(ticket.client)}</td>
            <td>${escapeHtml(ticket.issue)}</td>
            <td><span class="status-badge ${statusClass(ticket.priority)}">${escapeHtml(ticket.priority)}</span></td>
            <td><span class="status-badge ${statusClass(ticket.status)}">${escapeHtml(ticket.status)}</span></td>
            <td>
              <button type="button" class="row-action" data-admin-action="cycle-ticket" data-id="${ticket.id}">Status</button>
              <button type="button" class="row-action danger" data-admin-action="delete-ticket" data-id="${ticket.id}">Delete</button>
            </td>
          </tr>`
      )
      .join("");
  };

  const renderPricing = () => {
    const editor = document.querySelector("[data-pricing-editor]");
    if (!editor) return;
    if (!adminState.pricing.length) {
      editor.innerHTML = emptyState("No pricing packages configured yet.");
      return;
    }
    editor.innerHTML = adminState.pricing
      .map(
        (item) => `
          <article class="admin-mini-card" data-pricing-card>
            <label>Package<input name="name" value="${escapeHtml(item.name)}" /></label>
            <label>Price<input name="price" type="number" min="0" value="${Number(item.price)}" /></label>
            <label>Timeline<input name="timeline" value="${escapeHtml(item.timeline)}" /></label>
            <label>Details<textarea name="details">${escapeHtml(item.details)}</textarea></label>
          </article>`
      )
      .join("");
  };

  const renderDemand = () => {
    const demand = document.querySelector("[data-service-demand]");
    if (!demand) return;
    const counts = adminState.leads.reduce((items, lead) => {
      const service = textField(lead.service, "Website Inquiry");
      items[service] = (items[service] || 0) + 1;
      return items;
    }, {});
    const total = Math.max(adminState.leads.length, 1);
    const entries = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 4);
    if (!entries.length) {
      demand.innerHTML = emptyState("No service demand data yet.");
      return;
    }
    demand.innerHTML = entries
      .map(([service, count]) => `<div><span>${escapeHtml(service)}</span><strong>${Math.round((count / total) * 100)}%</strong></div>`)
      .join("");
  };

  const renderActivity = () => {
    const list = document.querySelector("[data-activity-list]");
    if (!list) return;
    if (!adminState.activity.length) {
      list.innerHTML = emptyState("No admin activity yet.");
      return;
    }
    list.innerHTML = adminState.activity
      .slice(0, 5)
      .map((item, index) => `<div><strong>${escapeHtml(item)}</strong><span>${index === 0 ? "Just now" : `${index} update ago`}</span></div>`)
      .join("");
  };

  const drawBarChart = (canvas, labels, values) => {
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const width = canvas.width;
    const height = canvas.height;
    context.clearRect(0, 0, width, height);
    context.fillStyle = "#f5f7fa";
    context.fillRect(0, 0, width, height);
    if (!values.some((value) => Number(value) > 0)) {
      context.fillStyle = "#4b5563";
      context.font = "800 16px Inter, Arial";
      context.fillText("No data yet", 44, height / 2);
      return;
    }
    const max = Math.max(...values, 1);
    const barWidth = (width - 80) / values.length;
    values.forEach((value, index) => {
      const barHeight = (value / max) * 170;
      const x = 44 + index * barWidth;
      const y = height - 52 - barHeight;
      context.fillStyle = "#0077ff";
      context.fillRect(x, y, barWidth - 18, barHeight);
      context.fillStyle = "#0d1b2a";
      context.font = "700 13px Inter, Arial";
      context.fillText(String(value), x, y - 8);
      context.fillStyle = "#4b5563";
      context.font = "700 11px Inter, Arial";
      context.fillText(labels[index], x - 2, height - 24);
    });
  };

  const drawDemandChart = (canvas) => {
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;
    const counts = adminState.leads.reduce((items, lead) => {
      const service = textField(lead.service, "Website Inquiry");
      items[service] = (items[service] || 0) + 1;
      return items;
    }, {});
    const entries = Object.entries(counts).slice(0, 4);
    const total = entries.reduce((sum, item) => sum + item[1], 0) || 1;
    const colors = ["#0077ff", "#00c2ff", "#10b981", "#f59e0b"];
    let start = -Math.PI / 2;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#f5f7fa";
    context.fillRect(0, 0, canvas.width, canvas.height);
    if (!entries.length) {
      context.fillStyle = "#4b5563";
      context.font = "800 16px Inter, Arial";
      context.fillText("No data yet", 44, canvas.height / 2);
      return;
    }
    entries.forEach(([, count], index) => {
      const angle = (count / total) * Math.PI * 2;
      context.beginPath();
      context.moveTo(110, 132);
      context.arc(110, 132, 82, start, start + angle);
      context.closePath();
      context.fillStyle = colors[index];
      context.fill();
      start += angle;
    });
    entries.forEach(([label, count], index) => {
      context.fillStyle = colors[index];
      context.fillRect(220, 58 + index * 42, 14, 14);
      context.fillStyle = "#0d1b2a";
      context.font = "700 12px Inter, Arial";
      context.fillText(`${label.slice(0, 18)} ${Math.round((count / total) * 100)}%`, 244, 70 + index * 42);
    });
  };

  const renderCharts = () => {
    const labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const base = adminState.leads.length;
    const values = base ? [0, 0, 0, 0, Math.max(0, base - 2), base] : [0, 0, 0, 0, 0, 0];
    drawBarChart(document.querySelector("#leadChart"), labels, values);
    drawDemandChart(document.querySelector("#serviceChart"));
  };

  const renderAdmin = () => {
    renderMetrics();
    renderLeads();
    renderProjects();
    renderClients();
    renderTickets();
    renderPricing();
    renderDemand();
    renderActivity();
    renderStorageStatus();
    renderCharts();
  };

  showAdmin();
}
