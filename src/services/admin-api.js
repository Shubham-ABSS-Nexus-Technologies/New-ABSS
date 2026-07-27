(function () {
  const config = window.AbssAdminConfig || {};
  const storage = config.storage || {};
  const stateKey = storage.stateKey || "abss-admin-dashboard";
  const contactLeadQueueKey = storage.contactLeadQueueKey || "abss-contact-lead-queue";
  const apiBaseUrl = config.apiBaseUrl || "";
  const login = config.login || {};
  const tokenKey = login.tokenKey || "abss-admin-token";

  const clone = (value) => JSON.parse(JSON.stringify(value));

  const readJson = (key, fallback) => {
    try {
      return JSON.parse(localStorage.getItem(key)) || clone(fallback);
    } catch (error) {
      return clone(fallback);
    }
  };

  const writeJson = (key, value) => {
    localStorage.setItem(key, JSON.stringify(value));
  };

  const mergeContactLeads = (state) => {
    const currentState = state || {};
    const queuedLeads = readJson(contactLeadQueueKey, []);
    if (!queuedLeads.length) return currentState;

    const existingIds = new Set((currentState.leads || []).map((lead) => lead.id));
    const freshLeads = queuedLeads.filter((lead) => !existingIds.has(lead.id));
    if (!freshLeads.length) return currentState;

    return {
      ...currentState,
      leads: [...freshLeads, ...(currentState.leads || [])],
      activity: [`${freshLeads.length} website inquiry added`, ...(currentState.activity || [])].slice(0, 8),
    };
  };

  const isApiMode = () => (config.mode || "local") === "api";
  const getToken = () => sessionStorage.getItem(tokenKey) || "";

  const requestJsonSync = (method, path, body) => {
    const request = new XMLHttpRequest();
    request.open(method, `${apiBaseUrl}${path}`, false);
    request.setRequestHeader("Content-Type", "application/json");
    const token = getToken();
    if (token) {
      request.setRequestHeader("Authorization", `Bearer ${token}`);
    }
    request.send(body ? JSON.stringify(body) : null);

    if (request.status < 200 || request.status >= 300) {
      throw new Error(`Request failed: ${request.status}`);
    }

    return request.responseText ? JSON.parse(request.responseText) : null;
  };

  const requestJson = async (method, path, body, options = {}) => {
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    };
    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(`${apiBaseUrl}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    return response.status === 204 ? null : response.json();
  };

  window.AbssAdminApi = {
    getMode() {
      return config.mode || "local";
    },

    loadState(defaultState) {
      if (isApiMode() && getToken()) {
        return mergeContactLeads(requestJsonSync("GET", "/api/admin/state"));
      }

      if (isApiMode()) {
        return mergeContactLeads(clone(defaultState));
      }

      return mergeContactLeads(readJson(stateKey, defaultState));
    },

    saveState(state) {
      if (isApiMode() && getToken()) {
        requestJsonSync("PUT", "/api/admin/state", state);
        writeJson(stateKey, state);
        return;
      }

      if (isApiMode()) {
        throw new Error("Admin session required");
      }

      writeJson(stateKey, state);
    },

    queueContactLead(lead) {
      const queuedLeads = readJson(contactLeadQueueKey, []);
      queuedLeads.unshift(lead);
      writeJson(contactLeadQueueKey, queuedLeads.slice(0, 50));

      if (isApiMode()) {
        return requestJson("POST", "/api/leads/contact", lead);
      }

      return Promise.resolve({ ok: true, lead });
    },

    getLogin() {
      return {
        sessionKey: config.login?.sessionKey || "abss-admin-auth",
        tokenKey,
      };
    },

    async login(username, password) {
      if (isApiMode()) {
        const result = await requestJson("POST", "/api/auth/login", { username, password });
        sessionStorage.setItem(tokenKey, result.token);
        return result;
      }

      throw new Error("Invalid credentials");
    },

    logout() {
      sessionStorage.removeItem(tokenKey);
    },

    async validateSession(defaultState) {
      if (!isApiMode()) {
        return { authenticated: false, state: null };
      }

      if (!getToken()) {
        return { authenticated: false, state: null };
      }

      try {
        const state = await requestJson("GET", "/api/admin/state");
        return { authenticated: true, state: mergeContactLeads(state || defaultState || {}) };
      } catch (error) {
        sessionStorage.removeItem(tokenKey);
        return { authenticated: false, state: null };
      }
    },

    isAuthenticated() {
      return isApiMode() && Boolean(getToken());
    },
  };
})();
