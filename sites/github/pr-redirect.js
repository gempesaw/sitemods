(() => {
  const PR_OVERVIEW = /^\/([^/]+)\/([^/]+)\/pull\/(\d+)\/?$/;
  const STAY = "sitemods=stay";

  function check() {
    const m = location.pathname.match(PR_OVERVIEW);
    if (!m || location.search.includes(STAY)) return;
    location.replace(`${location.pathname.replace(/\/$/, "")}/changes?panel=overview`);
  }

  check();
  setInterval(check, 300);
})();
