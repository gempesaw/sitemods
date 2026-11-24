(() => {
  const { register, toast, github } = sitemods;
  const PR_PAGE = /^\/([^/]+)\/([^/]+)\/pull\/(\d+)(\/|$)/;

  async function closePr(owner, repo, number) {
    if (!confirm(`Close pull request #${number}?`)) return;
    try {
      await github({
        method: "PATCH",
        path: `/repos/${owner}/${repo}/pulls/${number}`,
        body: { state: "closed" },
      });
      toast(`Closed #${number}`);
      setTimeout(() => location.reload(), 800);
    } catch (e) {
      toast(`Close failed: ${e.message}`, { error: true, ms: 8000 });
    }
  }

  register({
    name: "github pr close",
    match: (url) => PR_PAGE.test(url.pathname),

    run(url) {
      const [, owner, repo, number] = url.pathname.match(PR_PAGE);
      const nav = document.querySelector(".sitemods-header-links");
      const bar = nav?.parentElement;
      if (!bar) return;
      const existing = bar.querySelector(".sitemods-close");
      if (existing) {
        if (existing !== bar.lastElementChild) bar.append(existing);
        return;
      }

      const button = nav.querySelector("button").cloneNode(false);
      button.classList.add("sitemods-close");
      button.dataset.variant = "danger";
      button.title = "Close pull request";
      button.textContent = "Close";
      button.addEventListener("click", () => closePr(owner, repo, number));
      bar.append(button);
    },
  });
})();
