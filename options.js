const $ = (id) => document.getElementById(id);

chrome.storage.local.get("githubToken").then(({ githubToken }) => {
  if (githubToken) $("token").placeholder = "saved; paste a new one to replace it";
});

$("save").addEventListener("click", async () => {
  const token = $("token").value.trim();
  if (token) await chrome.storage.local.set({ githubToken: token });
  $("token").value = "";

  const r = await chrome.runtime.sendMessage({ type: "github", path: "/user" });
  $("status").textContent = r?.ok ? `Signed in as ${r.data.login}` : `Not working: ${r?.error}`;
});
