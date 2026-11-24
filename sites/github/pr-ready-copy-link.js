(() => {
  const { toast } = sitemods;
  const PR_PAGE = /^\/([^/]+)\/([^/]+)\/pull\/(\d+)(\/|$)/;

  function isReadyButton(button) {
    const action = button.dataset.ddActionName ?? "";
    const label = (button.textContent || button.getAttribute("aria-label") || "")
      .replace(/\s+/g, " ").trim().toLowerCase();
    return /ready_for_review/.test(action) || label === "ready for review" || label === "mark as ready for review";
  }

  document.addEventListener(
    "click",
    (e) => {
      const button = e.target.closest?.("button");
      if (!button || !isReadyButton(button)) return;
      const m = location.pathname.match(PR_PAGE);
      if (!m) return;

      const link = `${location.origin}/${m[1]}/${m[2]}/pull/${m[3]}`;
      navigator.clipboard.writeText(link).then(
        () => toast(`Copied ${link}`),
        (err) => toast(`Couldn't copy link: ${err.message}`, { error: true })
      );
    },
    true
  );
})();
