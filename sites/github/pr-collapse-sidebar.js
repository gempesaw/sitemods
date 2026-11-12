(() => {
  const { register } = sitemods;
  const PR_PAGE = /^\/[^/]+\/[^/]+\/pull\/\d+(\/|$)/;
  const KEY = "sitemods.github.pr-sidebar";

  function collapsed() {
    return localStorage.getItem(KEY) !== "open";
  }

  function apply(wrapper, toggle) {
    const closed = collapsed();
    wrapper.classList.toggle("sitemods-sidebar-collapsed", closed);
    toggle.textContent = closed ? "«" : "»";
    toggle.title = closed ? "Show PR details" : "Hide PR details";
  }

  register({
    name: "github pr collapsible sidebar",
    match: (url) => PR_PAGE.test(url.pathname),

    run() {
      const wrapper = document
        .querySelector("[data-testid='sticky-sidebar']")
        ?.closest("[class*='PaneWrapper']");
      if (!wrapper || wrapper.querySelector(".sitemods-sidebar-toggle")) return;

      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "sitemods-sidebar-toggle";
      toggle.addEventListener("click", () => {
        localStorage.setItem(KEY, collapsed() ? "open" : "closed");
        apply(wrapper, toggle);
      });

      wrapper.prepend(toggle);
      apply(wrapper, toggle);
    },
  });
})();
