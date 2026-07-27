(function () {
  const loginPath = "/src/admin/admin-login";
  const defaultAdminPage = "admin-dashboard.html";

  const isAllowedAdminTarget = (target) => /^admin-(dashboard|leads|projects|clients|support|pricing)\.html$/.test(target);

  const getCurrentAdminPage = () => {
    const currentPage = window.location.pathname.split("/").pop() || defaultAdminPage;
    return currentPage.endsWith(".html") ? currentPage : `${currentPage}.html`;
  };

  const getSafeNextPage = (target) => {
    const nextPage = String(target || defaultAdminPage).split("/").pop();
    return isAllowedAdminTarget(nextPage) ? nextPage : defaultAdminPage;
  };

  const redirectToLogin = () => {
    const nextPage = getSafeNextPage(getCurrentAdminPage());
    window.location.replace(`${loginPath}?next=${encodeURIComponent(nextPage)}`);
  };

  window.AbssAdminAuthGuard = {
    getSafeNextPage,

    redirectToLogin,

    async requireAdminSession(defaultState) {
      const result = await window.AbssAdminApi?.validateSession(defaultState);
      if (!result?.authenticated) {
        redirectToLogin();
        return { authenticated: false, state: null };
      }

      return result;
    },

    async redirectAuthenticatedLogin(nextPage) {
      const result = await window.AbssAdminApi?.validateSession();
      if (result?.authenticated) {
        window.location.replace(getSafeNextPage(nextPage));
      }
    },
  };
})();
