chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== "fetch") return false;

  fetch(message.url, { credentials: "include", redirect: "follow" })
    .then(async (res) => {
      if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${message.url}`);
      sendResponse({ ok: true, text: await res.text() });
    })
    .catch((e) => sendResponse({ ok: false, error: e.message }));

  return true;
});
