(() => {
  const { register, waitFor, toast } = sitemods;
  const PR_PAGE = /^\/([^/]+)\/([^/]+)\/pull\/(\d+)(\/|$)/;
  const CLOSE = 'button[data-dd-action-name="pull_requests.lifecycle.close"]';
  const ACTION = "sitemods_action=close";

  async function closePr(owner, repo, number) {
    if (!confirm(`Close pull request #${number}?`)) return;

    const button = document.querySelector(CLOSE);
    if (button) {
      button.click();
      toast(`Closed #${number}`);
      return;
    }
    location.assign(`/${owner}/${repo}/pull/${number}?sitemods=stay&${ACTION}`);
  }

  register({
    name: "github pr close",
    match: (url) => PR_PAGE.test(url.pathname),

    async run(url) {
      const [, owner, repo, number] = url.pathname.match(PR_PAGE);

      if (url.search.includes(ACTION) && !document.documentElement.dataset.sitemodsClosing) {
        document.documentElement.dataset.sitemodsClosing = number;
        history.replaceState(null, "", url.pathname + "?sitemods=stay");
        const button = await waitFor(() => document.querySelector(CLOSE), { timeout: 15000 });
        button.click();
        toast(`Closed #${number}`);
      }

      const nav = document.querySelector(".sitemods-header-links");
      const bar = nav?.parentElement;
      if (!bar) return;
      const existing = bar.querySelector(".sitemods-close");
      if (existing) {
        if (existing !== bar.lastElementChild) bar.append(existing);
        return;
      }

      const template = nav.querySelector("button");
      const button = template.cloneNode(false);
      button.classList.add("sitemods-close");
      button.dataset.variant = "danger";
      button.title = "Close pull request";
      button.textContent = "Close";
      button.addEventListener("click", () => closePr(owner, repo, number));
      bar.append(button);
    },
  });
})();
