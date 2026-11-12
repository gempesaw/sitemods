(() => {
  const { register, waitFor, toast } = sitemods;
  const PR_PAGE = /^\/[^/]+\/[^/]+\/pull\/\d+(\/|$)/;
  const OPENER = 'button[data-dd-action-name="pull_requests.review.open"]';
  const APPROVE = 'input[type="radio"][data-dd-action-name="pull_requests.review.select_approve"]';
  const SUBMIT = 'button[data-dd-action-name="pull_requests.review.submit"]';
  const CANCEL = 'button[data-dd-action-name="pull_requests.review.cancel"]';

  function disabledReason(radio) {
    const label = document.querySelector(`label[for="${radio.id}"]`);
    return label?.querySelector("span:last-child")?.textContent.trim() || "Approve is disabled";
  }

  async function approve(button) {
    button.disabled = true;
    try {
      document.querySelector(OPENER).click();
      const radio = await waitFor(() => document.querySelector(APPROVE), { timeout: 5000 });
      if (radio.disabled) {
        document.querySelector(CANCEL)?.click();
        throw new Error(disabledReason(radio));
      }
      radio.click();

      const submit = await waitFor(() => {
        const el = document.querySelector(SUBMIT);
        return el && !el.disabled ? el : null;
      }, { timeout: 5000 });
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
