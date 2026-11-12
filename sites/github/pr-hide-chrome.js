(() => {
  const { register } = sitemods;
  const PR_PAGE = /^\/[^/]+\/[^/]+\/pull\/\d+(\/|$)/;

  register({
    name: "github pr hide chrome",
    match: () => true,

    run(url) {
      const html = document.documentElement;
      const hide = PR_PAGE.test(url.pathname) && !html.hasAttribute("data-sitemods-pr-chrome-suspended");
      html.toggleAttribute("data-sitemods-pr-chrome-hidden", hide);
    },
  });
})();
