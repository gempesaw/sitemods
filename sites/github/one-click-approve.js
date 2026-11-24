(() => {
  const { register, toast, github } = sitemods;
  const PR_PAGE = /^\/([^/]+)\/([^/]+)\/pull\/(\d+)(\/|$)/;

  async function approve(button, owner, repo, number) {
    button.disabled = true;
    try {
      await github({
        method: "POST",
        path: `/repos/${owner}/${repo}/pulls/${number}/reviews`,
        body: { event: "APPROVE" },
      });
      toast(`Approved #${number}`);
      document.dispatchEvent(new CustomEvent("sitemods:reviews-changed"));
    } catch (e) {
      toast(`Approve failed: ${e.message}`, { error: true, ms: 8000 });
    } finally {
      button.disabled = false;
    }
  }

  register({
    name: "github one-click approve",
    match: (url) => PR_PAGE.test(url.pathname),

    async run(url) {
      const [, owner, repo, number] = url.pathname.match(PR_PAGE);
      const opener = sitemods.reviewOpener();
      if (!opener || opener.parentElement.querySelector(".sitemods-approve")) return;

      const button = opener.cloneNode(true);
      for (const attr of [...button.attributes]) {
        if (/^(data-dd-action-name|data-telemetry-action|aria-.*|id|style|disabled)$/.test(attr.name)) button.removeAttribute(attr.name);
      }
      button.querySelector('[data-component="trailingAction"]')?.remove();
      button.querySelector('[data-component="trailingVisual"]')?.remove();
      button.querySelector('[data-component="text"]').textContent = "Approve";
      button.classList.add("sitemods-approve");
      button.title = "Approve this pull request";
      button.addEventListener("click", () => approve(button, owner, repo, number));
      opener.before(button);
    },
  });
})();
