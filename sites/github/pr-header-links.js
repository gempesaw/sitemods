(() => {
  const { register } = sitemods;
  const PR_PAGE = /^\/([^/]+)\/([^/]+)\/pull\/(\d+)(\/([a-z]+))?/;
  const OPENER = 'button[data-dd-action-name="pull_requests.review.open"]';
  const TABS = [
    ["Overview", ""],
    ["Files changed", "changes"],
  ];

  register({
    name: "github pr header links",
    match: (url) => PR_PAGE.test(url.pathname),

    run(url) {
      const [, owner, repo, number, , current = ""] = url.pathname.match(PR_PAGE);
      const opener = document.querySelector(OPENER);
      const actions = opener?.parentElement;
      if (!actions) return;

      const existing = actions.parentElement.querySelector(".sitemods-header-links");
      if (existing?.dataset.path === url.pathname) return;
      existing?.remove();

      const nav = document.createElement("nav");
      nav.className = "sitemods-header-links";
      nav.dataset.path = url.pathname;
      for (const [label, segment] of TABS) {
        const a = document.createElement("a");
        a.className = opener.className;
        a.classList.remove("sitemods-approve");
        a.dataset.size = "small";
        a.dataset.variant = "invisible";
        a.href = `/${owner}/${repo}/pull/${number}${segment ? "/" + segment : ""}`;
        a.textContent = label;
        if (segment === current) a.setAttribute("aria-current", "page");
        nav.append(a);
      }

      (actions.previousElementSibling ?? actions).after(nav);
    },
  });
})();
