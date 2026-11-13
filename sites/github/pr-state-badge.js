(() => {
  const { register } = sitemods;
  const PR_PAGE = /^\/[^/]+\/[^/]+\/pull\/\d+(\/|$)/;

  register({
    name: "github pr state badge",
    match: (url) => PR_PAGE.test(url.pathname),

    run() {
      const nav = document.querySelector(".sitemods-header-links");
      const source = document.querySelector('[class*="prc-PageLayout-Header-"] [data-status]');
      if (!nav || !source) return;

      const current = nav.querySelector(".sitemods-state");
      if (current?.dataset.status === source.dataset.status && current.textContent === source.textContent) return;

      const badge = source.cloneNode(true);
      badge.classList.add("sitemods-state");
      badge.removeAttribute("id");
      if (current) current.replaceWith(badge);
      else nav.prepend(badge);
    },
  });
})();
