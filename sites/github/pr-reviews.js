(() => {
  const { register, fetchText } = sitemods;
  const PR_PAGE = /^\/([^/]+)\/([^/]+)\/pull\/(\d+)(\/|$)/;
  const STATES = [
    ["approved", /approved/i],
    ["changes", /changes/i],
    ["commented", /comment/i],
    ["pending", /pending|awaiting|requested/i],
  ];

  function stateOf(row) {
    const text = [...row.querySelectorAll('[data-component="Tooltip"]')].map((t) => t.textContent).join(" ");
    return STATES.find(([, re]) => re.test(text))?.[0] ?? "pending";
  }

  function parse(root) {
    return [...root.querySelectorAll('[class*="reviewerRow"]')].map((row) => ({
      name: row.querySelector('[class*="reviewerName"]')?.textContent.trim() ?? "?",
      state: stateOf(row),
    }));
  }

  async function reviewers(owner, repo, number, onOverview) {
    if (onOverview && document.querySelector('[class*="reviewerRow"]')) return parse(document);
    const html = await fetchText(`https://github.com/${owner}/${repo}/pull/${number}`);
    return parse(new DOMParser().parseFromString(html, "text/html"));
  }

  function render(list) {
    const el = document.createElement("span");
    el.className = "sitemods-reviews";
    const groups = {
      approved: list.filter((r) => r.state === "approved"),
      changes: list.filter((r) => r.state === "changes"),
      pending: list.filter((r) => r.state === "pending"),
    };

    if (!groups.approved.length && !groups.changes.length) {
      el.append(Object.assign(document.createElement("span"), { className: "sitemods-reviews-none", textContent: "no approvals" }));
    }
    for (const [key, glyph] of [["approved", "✓"], ["changes", "✗"], ["pending", "○"]]) {
      if (!groups[key].length) continue;
      const span = document.createElement("span");
      span.className = `sitemods-reviews-${key}`;
      span.textContent = `${glyph} ${groups[key].map((r) => r.name).join(", ")}`;
      el.append(span);
    }
    return el;
  }

  let refreshToken = 0;

  async function refresh(url) {
    const nav = document.querySelector(".sitemods-header-links");
    const m = url.pathname.match(PR_PAGE);
    if (!nav || !m) return;
    const [, owner, repo, number, rest] = m;
    const token = ++refreshToken;

    const list = await reviewers(owner, repo, number, !rest || rest === "/");
    if (token !== refreshToken) return;

    const fresh = render(list);
    const existing = nav.parentElement.querySelector(".sitemods-reviews");
    if (existing) existing.replaceWith(fresh);
    else nav.after(fresh);
  }

  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) refresh(new URL(location.href));
  });
  document.addEventListener("sitemods:reviews-changed", () => setTimeout(() => refresh(new URL(location.href)), 2500));

  register({
    name: "github pr reviews",
    match: (url) => PR_PAGE.test(url.pathname),

    run(url) {
      const nav = document.querySelector(".sitemods-header-links");
      if (!nav) return;
      const existing = nav.parentElement.querySelector(".sitemods-reviews");
      if (existing?.dataset.path === url.pathname) return;

      const placeholder = document.createElement("span");
      placeholder.className = "sitemods-reviews";
      placeholder.dataset.path = url.pathname;
      placeholder.textContent = "…";
      if (existing) existing.replaceWith(placeholder);
      else nav.after(placeholder);

      return refresh(url).then(() => {
        nav.parentElement.querySelector(".sitemods-reviews").dataset.path = url.pathname;
      });
    },
  });
})();
