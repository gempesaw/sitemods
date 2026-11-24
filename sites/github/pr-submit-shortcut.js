(() => {
  const { toast } = sitemods;
  const PR_PAGE = /^\/[^/]+\/[^/]+\/pull\/\d+(\/|$)/;
  const SUBMIT_WORDS = ["save", "update comment", "comment", "reply", "submit"];

  function label(button) {
    return (button.textContent || button.getAttribute("aria-label") || "").replace(/\s+/g, " ").trim().toLowerCase();
  }

  function isSubmit(button) {
    if (button.disabled || button.offsetParent === null) return false;
    const action = button.dataset.telemetryAction ?? button.dataset.ddActionName ?? "";
    if (/cancel|close|discard/.test(action) || /^cancel/.test(label(button))) return false;
    return /\.(save|submit|update)$/.test(action) || SUBMIT_WORDS.includes(label(button)) || button.type === "submit";
  }

  function nearestSubmit(field) {
    for (let node = field.parentElement; node && node !== document.body; node = node.parentElement) {
      const button = [...node.querySelectorAll("button")].find(isSubmit);
      if (button) return button;
    }
    return null;
  }

  document.addEventListener(
    "keydown",
    (e) => {
      if (e.key !== "Enter" || !e.altKey || !e.shiftKey || e.metaKey || e.ctrlKey) return;
      if (!PR_PAGE.test(location.pathname)) return;
      const field = e.target.closest?.("textarea, [contenteditable='true']");
      if (!field) return;

      e.preventDefault();
      e.stopPropagation();
      const button = nearestSubmit(field);
      if (button) button.click();
      else toast("No save button found for this field", { error: true });
    },
    true
  );
})();
