const $ = (id) => document.getElementById(id);

chrome.storage.local.get("githubToken").then(({ githubToken }) => {
  if (githubToken) $("token").placeholder = "saved; paste a new one to replace it";
});

$("save").addEventListener("click", async () => {
  const token = $("token").value.trim();
  if (token) await chrome.storage.local.set({ githubToken: token });
  $("token").value = "";

  const user = await chrome.runtime.sendMessage({ type: "github", path: "/user" });
  if (!user?.ok) {
    $("status").textContent = `Not working: ${user?.error}`;
    return;
  }

  const org = await chrome.runtime.sendMessage({ type: "github", path: "/repos/modularml/infra" });
  $("status").textContent = org?.ok
    ? `Signed in as ${user.data.login}, with access to modularml`
    : `Signed in as ${user.data.login}, but modularml refuses it: ${org?.error}`;
});
