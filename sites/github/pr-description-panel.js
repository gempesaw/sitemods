(() => {
  const { register, waitFor } = sitemods;
  const PR_PAGE = /^\/([^/]+)\/([^/]+)\/pull\/(\d+)(\/|$)/;
  const PANELS = new Set(["description", "merge status"]);

  function label(el) {
    return el.textContent.replace(/\s+/g, " ").trim().toLowerCase();
  }

  function topBar() {
    return sitemods.reviewOpener()?.parentElement ?? null;
  }

  function topMergeStatus(bar) {
    return [...bar.querySelectorAll("button")].find((b) => label(b) === "merge status");
  }

  function panelSwitcher(bar) {
    return [...document.querySelectorAll("button")].find(
      (b) =>
        b.offsetParent !== null &&
        !bar.contains(b) &&
        !b.closest(".sitemods-header-links") &&
        PANELS.has(label(b))
    );
  }

  function fallback(url) {
    const [, owner, repo, number] = url.pathname.match(PR_PAGE);
    const target = new URL(`/${owner}/${repo}/pull/${number}/changes`, location.origin);
    target.searchParams.set("panel", "overview");
    location.assign(target);
  }

  async function showDescription(bar) {
    const switcher = panelSwitcher(bar);
    if (!switcher) return fallback(new URL(location.href));
    if (label(switcher) === "description") return;

    switcher.click();
    const item = await waitFor(
      () =>
        [...document.querySelectorAll('[role^="menuitem"], [role="option"]')].find(
          (el) => el.offsetParent !== null && label(el).startsWith("description")
        ),
      { timeout: 2000 }
    ).catch(() => null);
    if (item) item.click();
    else fallback(new URL(location.href));
  }

  register({
    name: "github pr description panel",
    match: (url) => PR_PAGE.test(url.pathname),

    run() {
      const bar = topBar();
      const status = bar && topMergeStatus(bar);
      if (!status || bar.querySelector(".sitemods-description")) return;
      document.querySelectorAll(".sitemods-description").forEach((stray) => stray.remove());

      const button = status.cloneNode(true);
      for (const attr of [...button.attributes]) {
        if (/^(data-telemetry-action|data-dd-action-name|aria-.*|id|style)$/.test(attr.name)) button.removeAttribute(attr.name);
      }
      button.classList.add("sitemods-description");
      button.querySelector("svg")?.remove();
      const text = [...button.querySelectorAll("*")].reverse()
        .find((el) => !el.children.length && /merge status/i.test(el.textContent));
      if (text) text.textContent = "Description";
      else button.textContent = "Description";
      button.title = "Show the description in the sidebar";
      button.addEventListener(
        "click",
        (e) => {
          e.preventDefault();
          e.stopPropagation();
          showDescription(bar);
        },
        true
      );
      status.before(button);
    },
  });
})();
