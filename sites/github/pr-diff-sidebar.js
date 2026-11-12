(() => {
  const { register, waitFor, fetchText } = sitemods;
  const PR_OVERVIEW = /^\/([^/]+)\/([^/]+)\/pull\/(\d+)\/?$/;

  function escapeHtml(s) {
    return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]));
  }

  function splitFiles(diff) {
    return diff.split(/^(?=diff --git )/m).filter((chunk) => chunk.startsWith("diff --git"));
  }

  function lineClass(line) {
    if (line.startsWith("+++") || line.startsWith("---")) return "meta";
    if (line.startsWith("@@")) return "hunk";
    if (line.startsWith("+")) return "add";
    if (line.startsWith("-")) return "del";
    if (line.startsWith("diff ") || line.startsWith("index ")) return "meta";
    return "ctx";
  }

  function render(fileDiff) {
    const header = fileDiff.match(/^diff --git a\/(.*?) b\/(.*)$/m);
    const name = header ? header[2] : "(unknown file)";
    const body = fileDiff
      .split("\n")
      .filter((line) => !/^(diff --git|index |--- |\+\+\+ )/.test(line))
      .map((line) => `<div class="sitemods-diff-${lineClass(line)}">${escapeHtml(line) || " "}</div>`)
      .join("");

    const panel = document.createElement("aside");
    panel.className = "sitemods-diff-panel";
    panel.innerHTML = `<div class="sitemods-diff-file">${escapeHtml(name)}</div><pre class="sitemods-diff-body">${body}</pre>`;
    return panel;
  }

  register({
    name: "github pr diff sidebar",
    match: (url) => PR_OVERVIEW.test(url.pathname),

    async run(url) {
      const [, owner, repo, number] = url.pathname.match(PR_OVERVIEW);
      const root = await waitFor(() => document.querySelector("[data-testid='sticky-sidebar']")?.closest(".prc-PageLayout-PageLayoutContent-BneH9, [class*='PageLayoutContent']"));
      if (root.dataset.sitemodsDiff === url.pathname) return;
      root.dataset.sitemodsDiff = url.pathname;
      root.querySelector(".sitemods-diff-panel")?.remove();

      const diff = await fetchText(`https://github.com/${owner}/${repo}/pull/${number}.diff`);
      const files = splitFiles(diff);
      if (files.length !== 1) return;

      root.append(render(files[0]));
      document.documentElement.dataset.sitemodsDiffOpen = "";
    },
  });
})();
