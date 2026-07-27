const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");

const localPageRoutes = {
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

const projectDetails = {
  "Personal Portfolio Website": {
    type: "Portfolio Website",
    description:
      "A personal portfolio website created to present skills, projects, leadership experience, contact options, and professional background in a clean responsive layout.",
    technologies: "HTML, CSS, JavaScript",
    features: "Responsive sections, skills and projects showcase, contact form, social profile links",
    status: "Completed Demo Project",
  },
  "Business Landing Page": {
    type: "Landing Page",
    description:
      "A modern landing page concept for startups, agencies, and service businesses that need a focused first impression and clear call to action.",
    technologies: "HTML, CSS",
    features: "Hero section, service highlights, call-to-action areas, contact section, mobile responsive layout",
    status: "Completed — Demo Coming Soon",
  },
  "College / Institute Website": {
    type: "Educational Website",
    description:
      "An in-progress educational website concept for colleges, coaching institutes, and learning organizations.",
    technologies: "HTML, CSS, JavaScript",
    features: "Home, courses, faculty, admissions, institute overview, contact form",
    status: "Demo Project In Progress",
  },
  "Restaurant Website": {
    type: "Business Website",
    description:
      "A responsive restaurant website concept for cafes, restaurants, and food businesses to present menus, atmosphere, booking information, and location details.",
    technologies: "HTML, CSS",
    features: "Menu section, gallery, restaurant overview, booking/contact areas, location section",
    status: "Completed — Demo Coming Soon",
  },
  "E-commerce Website Demo": {
    type: "E-commerce Demo",
    description:
      "A coming-soon e-commerce interface concept for showing products, categories, shopping actions, and responsive product browsing.",
    technologies: "HTML, CSS, JavaScript",
    features: "Product cards, category section, cart button, product filter, responsive layout",
    status: "Demo Project Coming Soon",
  },
  "Business Dashboard UI": {
    type: "Dashboard UI",
    description:
      "An in-progress dashboard interface concept for business analytics, admin panels, management workflows, and overview reporting.",
    technologies: "HTML, CSS, JavaScript",
    features: "Sidebar navigation, dashboard cards, chart section, user management layout",
    status: "Demo Project In Progress",
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
    projectModal.showModal();
  });
});

document.querySelector(".modal-close")?.addEventListener("click", () => {
  projectModal?.close();
});

document.querySelector("[data-close-project-modal]")?.addEventListener("click", () => {
  projectModal?.close();
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
  const formName = String(formData.get("form-name") || form.getAttribute("name") || "website-inquiry");
  const budgetLabel = String(formData.get("budget") || formData.get("budget-plan") || "");
  const firstBudgetNumber = budgetLabel.match(/\d[\d,]*/)?.[0]?.replaceAll(",", "") || "0";
  const service =
    formData.get("service") ||
    formData.get("package") ||
    formData.get("maintenance-type") ||
    formData.get("feedback-type") ||
    formName.replaceAll("-", " ");
  const contact = [formData.get("email"), formData.get("phone")].filter(Boolean).join(" / ");
  const company = formData.get("company");
  const name = formData.get("name");

  return {
    id: `${formName}-${Date.now()}`,
    client: company ? `${name || "Website Inquiry"} (${company})` : name || "Website Inquiry",
    service,
    budget: Number(firstBudgetNumber),
    status: "New",
    contact,
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
  const sanitizeState = (state) => ({
    leads: (state.leads || []).filter((item) => !staleDemoIds.has(item.id)),
    projects: (state.projects || []).filter((item) => !staleDemoIds.has(item.id)),
    clients: (state.clients || []).filter((item) => !staleDemoIds.has(item.id)),
    tickets: (state.tickets || []).filter((item) => !staleDemoIds.has(item.id)),
    pricing: (state.pricing || []).filter((item) => !staleDemoIds.has(item.id)),
    activity: (state.activity || []).filter((item) => !staleDemoActivity.has(item)),
  });
  const readState = () => {
    return sanitizeState(adminApi?.loadState(defaults) || clone(defaults));
  };
  let adminState = clone(defaults);
  let activeFilters = { leadsSearch: "", leadsStatus: "all" };

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
      .replaceAll('"', "&quot;");

  const formatMoney = (value) => `Rs ${Number(value || 0).toLocaleString("en-IN")}`;
  const makeId = (prefix) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const emptyState = (message) => `<div class="admin-empty-state">${escapeHtml(message)}</div>`;
  const emptyRow = (message, columns) => `<tr><td colspan="${columns}"><div class="admin-empty-state">${escapeHtml(message)}</div></td></tr>`;

  const statusClass = (status) => {
    if (["Converted", "Proposal Sent", "Done", "Closed"].includes(status)) return "completed";
    if (["Follow Up", "Call Booked", "Active", "In Progress"].includes(status)) return "progress";
    if (["Rejected"].includes(status)) return "rejected";
    if (["New", "Open", "High"].includes(status)) return "upcoming";
    return "neutral";
  };

  const showAdmin = async () => {
    const session = await window.AbssAdminAuthGuard?.requireAdminSession(defaults);
    if (!session?.authenticated) {
      return;
    }

    adminState = sanitizeState(session.state || readState());
    saveState();

    if (adminShell) {
      adminShell.hidden = false;
    }
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

  document.querySelector("[data-export-csv]")?.addEventListener("click", () => {
    const rows = [["Type", "Client/Name", "Service/Issue", "Value", "Status"]];
    adminState.leads.forEach((lead) => rows.push(["Lead", lead.client, lead.service, lead.budget, lead.status]));
    adminState.projects.forEach((project) => rows.push(["Project", project.client, project.name, project.value, project.status]));
    adminState.tickets.forEach((ticket) => rows.push(["Ticket", ticket.client, ticket.issue, ticket.priority, ticket.status]));
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(",")).join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    link.download = "abss-admin-export.csv";
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

  document.querySelector("[data-search='leads']")?.addEventListener("input", (event) => {
    activeFilters.leadsSearch = event.target.value.toLowerCase();
    renderLeads();
  });

  document.querySelector("[data-filter='leads']")?.addEventListener("change", (event) => {
    activeFilters.leadsStatus = event.target.value;
    renderLeads();
  });

  document.querySelectorAll("[data-open-modal]").forEach((button) => {
    button.addEventListener("click", () => openEntryModal(button.dataset.openModal));
  });

  document.querySelector("[data-close-admin-modal]")?.addEventListener("click", () => adminModal?.close());
  adminModal?.addEventListener("click", (event) => {
    if (event.target === adminModal) adminModal.close();
  });

  adminApp.addEventListener("click", (event) => {
    const actionButton = event.target.closest("[data-admin-action]");
    if (!actionButton) return;
    const { adminAction, id } = actionButton.dataset;

    if (adminAction === "delete-lead") {
      adminState.leads = adminState.leads.filter((lead) => lead.id !== id);
      addActivity("Lead removed from queue");
    }

    if (adminAction === "cycle-lead") {
      const order = ["New", "Follow Up", "Call Booked", "Proposal Sent", "Converted", "Rejected"];
      const lead = adminState.leads.find((item) => item.id === id);
      if (lead) {
        lead.status = order[(order.indexOf(lead.status) + 1) % order.length];
        addActivity(`${lead.client} lead moved to ${lead.status}`);
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

  adminForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    const formData = new FormData(adminForm);
    const type = adminForm.dataset.entryType;

    if (type === "lead") {
      adminState.leads.unshift({
        id: makeId("lead"),
        client: formData.get("client"),
        service: formData.get("service"),
        budget: Number(formData.get("budget") || 0),
        status: formData.get("status"),
        contact: formData.get("contact"),
      });
      addActivity(`${formData.get("client")} lead added`);
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
          <label>Service<input name="service" required /></label>
          <label>Budget<input name="budget" type="number" min="0" required /></label>
          <label>Status<select name="status"><option>New</option><option>Follow Up</option><option>Call Booked</option><option>Proposal Sent</option></select></label>
          <label class="full-field">Contact<input name="contact" required /></label>
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
    const leadMetric = document.querySelector("[data-metric='leads']");
    const projectMetric = document.querySelector("[data-metric='projects']");
    const revenueMetric = document.querySelector("[data-metric='revenue']");
    const supportMetric = document.querySelector("[data-metric='support']");
    const lastUpdated = document.querySelector("[data-last-updated]");
    if (leadMetric) leadMetric.textContent = adminState.leads.length;
    if (projectMetric) projectMetric.textContent = activeProjects.length;
    if (revenueMetric) revenueMetric.textContent = formatMoney(revenue);
    if (supportMetric) supportMetric.textContent = openTickets.length;
    if (lastUpdated) {
      lastUpdated.textContent = `Updated ${new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
    }
  };

  const renderLeads = () => {
    const table = document.querySelector("[data-leads-table]");
    if (!table) return;
    const rows = adminState.leads.filter((lead) => {
      const searchText = `${lead.client} ${lead.service} ${lead.contact}`.toLowerCase();
      const matchesSearch = searchText.includes(activeFilters.leadsSearch);
      const matchesStatus = activeFilters.leadsStatus === "all" || lead.status === activeFilters.leadsStatus;
      return matchesSearch && matchesStatus;
    });
    if (!rows.length) {
      table.innerHTML = emptyRow("No leads yet. New website inquiries will appear here.", 6);
      return;
    }
    table.innerHTML = rows
      .map(
        (lead) => `
          <tr>
            <td>${escapeHtml(lead.client)}</td>
            <td>${escapeHtml(lead.service)}</td>
            <td>${formatMoney(lead.budget)}</td>
            <td><span class="status-badge ${statusClass(lead.status)}">${escapeHtml(lead.status)}</span></td>
            <td>${escapeHtml(lead.contact)}</td>
            <td>
              <button type="button" class="row-action" data-admin-action="cycle-lead" data-id="${lead.id}">Status</button>
              <button type="button" class="row-action danger" data-admin-action="delete-lead" data-id="${lead.id}">Delete</button>
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
      items[lead.service] = (items[lead.service] || 0) + 1;
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
      items[lead.service] = (items[lead.service] || 0) + 1;
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
    renderCharts();
  };

  showAdmin();
}
