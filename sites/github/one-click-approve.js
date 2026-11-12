(() => {
  const { register, waitFor, byText, toast } = sitemods;
  const PR_PAGE = /^\/[^/]+\/[^/]+\/pull\/\d+(\/|$)/;

  function findSubmitReview() {
    return byText("button", "Submit review");
  }

  function findDialog() {
    return [...document.querySelectorAll("[role='dialog'], dialog[open]")].find((d) =>
      byText("button", "Submit review", d) && byText("label, span", "Approve", d)
    );
  }

  async function approve(button) {
    button.disabled = true;
    try {
      findSubmitReview().click();
      const dialog = await waitFor(findDialog, { timeout: 5000 });

      const approveLabel = byText("label, span", "Approve", dialog);
      const radio = approveLabel.closest("label")?.querySelector("input[type='radio']")
        ?? dialog.querySelector("input[type='radio'][value='approve' i], input[type='radio'][value='APPROVE']");
      (radio ?? approveLabel).click();

      byText("button", "Submit review", dialog).click();
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
      const submit = await waitFor(findSubmitReview, { timeout: 15000 });
      const group = submit.closest("[class*='ButtonGroup']") ?? submit;
      if (group.parentElement.querySelector(".sitemods-approve")) return;

      const button = document.createElement("button");
      button.type = "button";
      button.className = "sitemods-approve";
      button.textContent = "Approve";
      button.title = "Approve this pull request";
      button.addEventListener("click", () => approve(button));
      group.before(button);
    },
  });
})();
