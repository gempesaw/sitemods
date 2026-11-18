(() => {
  const { register } = sitemods;
  const PR_LINK = 'a.c-message_attachment__title_link[href*="github.com/"][href*="/pull/"]';

  function myUserId() {
    try {
      const teamId = location.pathname.match(/\/client\/(T[A-Z0-9]+)/)?.[1];
      const config = JSON.parse(localStorage.getItem("localConfig_v2"));
      return config.teams[teamId]?.user_id ?? null;
    } catch {
      return null;
    }
  }

  function senderOf(attachment) {
    let item = attachment.closest(".c-virtual_list__item, [data-qa='message_container'], .c-message_kit__message");
    while (item) {
      const sender = item.querySelector("[data-message-sender]");
      if (sender) return sender.dataset.messageSender;
      item = item.previousElementSibling;
    }
    return null;
  }

  register({
    name: "slack hide others' PR unfurls",
    match: (url) => url.hostname === "app.slack.com",

    run() {
      const me = myUserId();
      for (const link of document.querySelectorAll(PR_LINK)) {
        const attachment = link.closest(".c-message_attachment");
        if (!attachment || attachment.dataset.sitemods) continue;
        const sender = senderOf(attachment);
        attachment.dataset.sitemods = sender && sender === me ? "mine" : "hidden";
      }
    },
  });
})();
