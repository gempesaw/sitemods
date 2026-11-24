(() => {
  const { register, waitFor, toast } = sitemods;
  const PR_PAGE = /^\/[^/]+\/[^/]+\/pull\/\d+(\/|$)/;
  const APPROVE = 'input[type="radio"]:is([data-telemetry-action="pull_requests.review.select_approve"], [data-dd-action-name="pull_requests.review.select_approve"])';
  const SUBMIT = 'button:is([data-telemetry-action="pull_requests.review.submit"], [data-dd-action-name="pull_requests.review.submit"])';
  const CANCEL = 'button:is([data-telemetry-action="pull_requests.review.cancel"], [data-dd-action-name="pull_requests.review.cancel"])';

  function disabledReason(radio) {
    const label = document.querySelector(`label[for="${radio.id}"]`);
    return label?.querySelector("span:last-child")?.textContent.trim() || "Approve is disabled";
  }

  async function approve(button) {
    button.disabled = true;
    try {
      sitemods.reviewOpener().click();
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
      document.dispatchEvent(new CustomEvent("sitemods:reviews-changed"));
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
      const opener = sitemods.reviewOpener();
      if (!opener || opener.parentElement.querySelector(".sitemods-approve")) return;

      const button = opener.cloneNode(true);
      for (const attr of [...button.attributes]) {
        if (/^(data-dd-action-name|data-telemetry-action|aria-.*|id|style)$/.test(attr.name)) button.removeAttribute(attr.name);
      }
      button.querySelector('[data-component="trailingAction"]')?.remove();
      button.querySelector('[data-component="text"]').textContent = "Approve";
      button.classList.add("sitemods-approve");
      button.title = "Approve this pull request";
      button.addEventListener("click", () => approve(button));
      opener.before(button);
    },
  });
})();
