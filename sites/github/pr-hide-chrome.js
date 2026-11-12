(() => {
  const { register } = sitemods;
  const PR_PAGE = /^\/[^/]+\/[^/]+\/pull\/\d+(\/|$)/;

  register({
    name: "github pr hide chrome",
    match: () => true,

    run(url) {
      document.documentElement.toggleAttribute("data-sitemods-pr-chrome-hidden", PR_PAGE.test(url.pathname));
    },
  });
})();
