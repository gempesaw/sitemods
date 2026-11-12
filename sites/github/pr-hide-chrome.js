(() => {
  const { register } = sitemods;
  const PR_SUBPAGE = /^\/[^/]+\/[^/]+\/pull\/\d+\/[a-z]+/;

  register({
    name: "github pr hide chrome",
    match: () => true,

    run(url) {
      const html = document.documentElement;
      const hide = PR_SUBPAGE.test(url.pathname) && !html.hasAttribute("data-sitemods-pr-chrome-suspended");
      html.toggleAttribute("data-sitemods-pr-chrome-hidden", hide);
    },
  });
})();
