async function github({ method = "GET", path, body, query, variables }) {
  const { githubToken } = await chrome.storage.local.get("githubToken");
  if (!githubToken) {
    chrome.runtime.openOptionsPage();
    throw new Error("Set a GitHub token in the sitemods options");
  }

  const graphql = query !== undefined;
  const res = await fetch(`https://api.github.com${graphql ? "/graphql" : path}`, {
    method: graphql ? "POST" : method,
    headers: {
      Authorization: `Bearer ${githubToken}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(graphql || body ? { "Content-Type": "application/json" } : {}),
    },
    body: graphql ? JSON.stringify({ query, variables }) : body ? JSON.stringify(body) : undefined,
  });

  const text = await res.text();
  let json = null;
  try { json = text ? JSON.parse(text) : null; } catch { json = null; }
  if (!res.ok) throw new Error(json?.message ?? `${res.status} ${res.statusText}`);
  if (json?.errors?.length) throw new Error(json.errors.map((e) => e.message).join("; "));
  return graphql ? json.data : json;
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === "github") {
    github(message)
      .then((data) => sendResponse({ ok: true, data }))
      .catch((e) => sendResponse({ ok: false, error: e.message }));
    return true;
  }

  if (message?.type !== "fetch") return false;

  fetch(message.url, { credentials: "include", redirect: "follow" })
    .then(async (res) => {
      if (!res.ok) throw new Error(`${res.status} ${res.statusText} for ${message.url}`);
      sendResponse({ ok: true, text: await res.text() });
    })
    .catch((e) => sendResponse({ ok: false, error: e.message }));

  return true;
});
