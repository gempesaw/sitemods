(() => {
  const { register, waitFor, toast } = sitemods;
  const PR_PAGE = /^\/([^/]+)\/([^/]+)\/pull\/(\d+)(\/([a-z]+))?/;
  const OPENER = 'button[data-dd-action-name="pull_requests.review.open"]';
  const TITLE_EDIT = 'button[data-dd-action-name="pull_requests.title.edit"]';
  const TABS = [
    ["Overview", "?sitemods=stay"],
    ["Files changed", "/changes?panel=overview"],
  ];

  async function editTitle() {
    const html = document.documentElement;
    html.setAttribute("data-sitemods-pr-chrome-suspended", "");
    html.removeAttribute("data-sitemods-pr-chrome-hidden");
    window.scrollTo({ top: 0 });

    const edit = document.querySelector(TITLE_EDIT);
    if (!edit) {
      toast("No title editor on this page; header shown instead", { error: true });
      return;
    }
    edit.click();

    try {
      await waitFor(() => !document.querySelector(TITLE_EDIT), { timeout: 3000 });
      await waitFor(() => document.querySelector(TITLE_EDIT), { timeout: 10 * 60 * 1000, interval: 300 });
    } finally {
      html.removeAttribute("data-sitemods-pr-chrome-suspended");
      html.setAttribute("data-sitemods-pr-chrome-hidden", "");
    }
  }

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
      for (const [label, suffix] of TABS) {
        const a = document.createElement("a");
        a.className = opener.className;
        a.classList.remove("sitemods-approve");
        a.dataset.size = "small";
        a.dataset.variant = "invisible";
        a.href = `/${owner}/${repo}/pull/${number}${suffix}`;
        a.textContent = label;
        if (suffix.startsWith("/" + current) || (!current && !suffix.startsWith("/"))) a.setAttribute("aria-current", "page");
        nav.append(a);
      }

      const pencil = document.createElement("button");
      pencil.type = "button";
      pencil.className = opener.className;
      pencil.classList.remove("sitemods-approve");
      pencil.dataset.size = "small";
      pencil.dataset.variant = "invisible";
      pencil.title = "Edit title";
      pencil.textContent = "✎";
      pencil.addEventListener("click", editTitle);
      nav.append(pencil);

      (actions.previousElementSibling ?? actions).after(nav);
    },
  });
})();
