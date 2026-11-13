(() => {
  const { register, waitFor, toast } = sitemods;
  const PR_PAGE = /^\/[^/]+\/[^/]+\/pull\/\d+(\/|$)/;
  const DIALOG = '[role="dialog"][class*="EditHistoryDialogContainer"]';
  const DESCRIPTION_EDIT = 'button[data-dd-action-name="pull_requests.description.edit"]';

  function lineText(line) {
    const clone = line.cloneNode(true);
    for (const el of clone.querySelectorAll('.sr-only, [class*="wordStylingAdded"]')) el.remove();
    return clone.textContent;
  }

  function beforeText(dialog) {
    const lines = [];
    for (const row of dialog.querySelectorAll('[class*="diffContainer"] > div')) {
      if (/StylingAdded/.test(row.className)) continue;
      lines.push(lineText(row.querySelector('[class*="diffLine"]') ?? row));
    }
    return lines.join("\n");
  }

  function setReactValue(textarea, value) {
    textarea.value = value;
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
  }

  async function revert(dialog) {
    const text = beforeText(dialog);
    dialog.querySelector('[data-component="Dialog.CloseButton"]')?.click();

    const before = new Set(document.querySelectorAll("textarea"));
    const edit = document.querySelector(DESCRIPTION_EDIT);
    if (!edit) throw new Error("No description edit button on this page");
    edit.click();

    const textarea = await waitFor(
      () => [...document.querySelectorAll("textarea")].find((t) => !before.has(t)),
      { timeout: 5000 }
    );
    setReactValue(textarea, text);
    textarea.focus();
    toast("Previous version loaded into the editor; review and save");
  }

  register({
    name: "github pr description revert",
    match: (url) => PR_PAGE.test(url.pathname),

    run() {
      const dialog = document.querySelector(DIALOG);
      const header = dialog?.querySelector('[class*="Dialog-HeaderInner"]');
      if (!header || header.querySelector(".sitemods-revert")) return;

      const close = header.querySelector('[data-component="Dialog.CloseButton"]');
      const button = document.createElement("button");
      button.type = "button";
      button.className = close.className.replace(/\S*IconButton\S*/g, "").trim();
      button.classList.add("sitemods-revert");
      button.dataset.size = "small";
      button.dataset.variant = "default";
      button.textContent = "Revert to before this edit";
      button.addEventListener("click", () =>
        revert(dialog).catch((e) => toast(`Revert failed: ${e.message}`, { error: true, ms: 8000 }))
      );
      close.before(button);
    },
  });
})();
