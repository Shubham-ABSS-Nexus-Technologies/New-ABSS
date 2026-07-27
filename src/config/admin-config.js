window.AbssAdminConfig = {
  mode: "api",
  apiBaseUrl: "",
  login: {
    sessionKey: "abss-admin-auth",
    tokenKey: "abss-admin-token",
  },
  storage: {
    stateKey: "abss-admin-dashboard",
    contactLeadQueueKey: "abss-contact-lead-queue",
  },
  backend: {
    provider: "cloudflare-pages-functions",
  },
};
