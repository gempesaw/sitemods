(() => {
  const { register } = sitemods;
  const PR_PAGE = /^\/([^/]+)\/([^/]+)\/pull\/(\d+)(\/|$)/;

  function mergeStatusButton() {
    return [...document.querySelectorAll("button")].find(
      (b) => b.offsetParent !== null && b.textContent.replace(/\s+/g, " ").trim().toLowerCase() === "merge status"
    );
  }

  function showDescription(url) {
    const [, owner, repo, number] = url.pathname.match(PR_PAGE);
    const target = new URL(`/${owner}/${repo}/pull/${number}/changes`, location.origin);
    target.searchParams.set("panel", "overview");
    location.assign(target);
  }

  register({
    name: "github pr description panel",
    match: (url) => PR_PAGE.test(url.pathname),

    run(url) {
      const status = mergeStatusButton();
      if (!status || document.querySelector(".sitemods-description")) return;

      const button = status.cloneNode(true);
      for (const attr of [...button.attributes]) {
        if (/^(data-telemetry-action|data-dd-action-name|aria-.*|id|style)$/.test(attr.name)) button.removeAttribute(attr.name);
      }
      button.classList.add("sitemods-description");
      const label = [...button.querySelectorAll("*")].reverse()
        .find((el) => !el.children.length && /merge status/i.test(el.textContent));
      if (label) label.textContent = "Description";
      else button.textContent = "Description";
      button.querySelector("svg")?.remove();
      button.title = "Show the description in the sidebar";
      button.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        showDescription(new URL(location.href));
      }, true);
      status.before(button);
    },
  });
})();
