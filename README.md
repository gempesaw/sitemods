# sitemods

Personal per-site browser tweaks, loaded unpacked. Each site gets a
folder under `sites/` with one file per mod; `lib/mods.js` runs the mods
whose `match` fits the current URL and re-runs them when the page
navigates in place.

Load it from `chrome://extensions` → Developer mode → Load unpacked →
this directory. Click the reload icon there after editing.

## GitHub

`sites/github/pr-diff-sidebar.js` — on a PR overview page, fetches the
`.diff` and shows it in a sticky panel to the right of the sidebar, one
collapsible section per file, so the description and changes are
visible together.

`sites/github/pr-hide-chrome.js` — hides the global navigation and the
PR title/tabs block on PR pages, leaving the sticky title bar.

`sites/github/pr-header-links.js` — puts Overview / Files changed links
in the sticky title bar, since the tabs are hidden.

`sites/github/pr-collapse-sidebar.js` — collapses the PR metadata pane
(Reviewers, Labels, …) to a thin strip with a toggle; the choice is
remembered in `localStorage` and defaults to collapsed.

`sites/github/one-click-approve.js` — adds an **Approve** button next to
**Submit review** on the new PR pages. It drives GitHub's own review
dialog (open, pick Approve, submit), so it uses the logged-in session
and needs no token.

## Adding a mod

```js
sitemods.register({
  name: "what it does",
  match: (url) => url.hostname === "example.com",
  async run(url) { ... },
});
```

`run` may be called again on in-page navigation, so guard against
double insertion. Helpers on `sitemods`: `waitFor(fn)`, `byText(selector,
text)`, `toast(message)`, `fetchText(url)` (goes through the background
worker, so cross-origin redirects and cookies work).
