(() => {
  const { register, waitFor, byText, toast } = sitemods;
  const PR_PAGE = /^\/([^/]+)\/([^/]+)\/pull\/(\d+)(\/|$)/;
  const ACTION = "sitemods_action=merge";
  const LABELS = [
    "merge when ready",
    "add to merge queue",
    "enable auto-merge",
    "merge pull request",
    "squash and merge",
    "rebase and merge",
  ];

  function mergeButton() {
    for (const label of LABELS) {
      const button = byText("button", label);
      if (button && button.offsetParent !== null) return button;
    }
    return null;
  }

  function confirmButton() {
    const button = [...document.querySelectorAll("button")].find(
      (b) => !b.disabled && b.offsetParent !== null && /^confirm\b/i.test(b.textContent.trim())
    );
    return button ?? null;
  }

  async function clickMerge(number) {
    const button = mergeButton();
    if (!button) throw new Error("GitHub shows no merge button for this PR");
    if (button.disabled || button.getAttribute("aria-disabled") === "true")
      throw new Error(`"${button.textContent.trim()}" isn't available yet`);

    const label = button.textContent.trim();
    button.click();
    const confirm = await waitFor(confirmButton, { timeout: 3000 }).catch(() => null);
    confirm?.click();
    toast(`${confirm ? confirm.textContent.trim() : label}: #${number}`);
  }

  async function merge(owner, repo, number) {
    if (!confirm(`Merge pull request #${number}?`)) return;
    if (mergeButton()) return clickMerge(number);
    location.assign(`/${owner}/${repo}/pull/${number}?sitemods=stay&${ACTION}`);
  }

  register({
    name: "github pr merge",
    match: (url) => PR_PAGE.test(url.pathname),

    async run(url) {
      const [, owner, repo, number] = url.pathname.match(PR_PAGE);

      if (url.search.includes(ACTION) && !document.documentElement.dataset.sitemodsMerging) {
        document.documentElement.dataset.sitemodsMerging = number;
        history.replaceState(null, "", url.pathname + "?sitemods=stay");
        await waitFor(mergeButton, { timeout: 15000 })
          .then(() => clickMerge(number))
          .catch((e) => toast(`Merge failed: ${e.message}`, { error: true, ms: 8000 }));
      }

      const nav = document.querySelector(".sitemods-header-links");
      const bar = nav?.parentElement;
      if (!bar || bar.querySelector(".sitemods-merge")) return;

      const button = nav.querySelector("button").cloneNode(false);
      button.classList.add("sitemods-merge");
      button.dataset.variant = "primary";
      button.title = "Merge, or add to the merge queue";
      button.textContent = "Merge";
      button.addEventListener("click", () =>
        merge(owner, repo, number).catch((e) => toast(`Merge failed: ${e.message}`, { error: true, ms: 8000 }))
      );
      const close = bar.querySelector(".sitemods-close");
      if (close) close.before(button);
      else bar.append(button);
    },
  });
})();
