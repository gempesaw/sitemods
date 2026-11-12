(() => {
  const { register, waitFor, toast } = sitemods;
  const PR_PAGE = /^\/[^/]+\/[^/]+\/pull\/\d+(\/|$)/;
  const OPENER = 'button[data-dd-action-name="pull_requests.review.open"]';

  function findApproveOption() {
    const radio = document.querySelector(
      'input[type="radio"][value="approve" i], input[type="radio"][value="APPROVE"]'
    );
    if (radio) return radio;

    return [...document.querySelectorAll('[role="radio"], [role="menuitemradio"], label, [role="option"]')].find(
      (el) => /^\s*approve\b/i.test(el.textContent)
    );
  }

  function findSubmit(option) {
    const scope =
      option.closest('[role="dialog"], dialog, form, [popover], [class*="Overlay"]') ?? document;
    return [...scope.querySelectorAll("button")].find((b) =>
      /submit/i.test(b.textContent) && !b.matches(OPENER)
    );
  }

  async function approve(button) {
    button.disabled = true;
    try {
      document.querySelector(OPENER).click();
      const option = await waitFor(findApproveOption, { timeout: 5000 });
      option.click();

      const submit = await waitFor(() => findSubmit(option), { timeout: 5000 });
      submit.click();
      toast("Approved");
    } catch (e) {
      toast(`Approve failed: ${e.message}`, { error: true, ms: 8000 });
      throw e;
    } finally {
      button.disabled = false;
    }
  }

  register({
    name: "github one-click approve",
    match: (url) => PR_PAGE.test(url.pathname),

    async run() {
      const opener = await waitFor(() => document.querySelector(OPENER), { timeout: 15000 });
      if (opener.previousElementSibling?.classList.contains("sitemods-approve")) return;

      const button = document.createElement("button");
      button.type = "button";
      button.className = "sitemods-approve";
      button.textContent = "Approve";
      button.title = "Approve this pull request";
      button.addEventListener("click", () => approve(button));
      opener.before(button);
    },
  });
})();
