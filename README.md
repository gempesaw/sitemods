# sitemods

Personal per-site browser tweaks, loaded unpacked. Each site gets a
folder under `sites/` with one file per mod; `lib/mods.js` runs the mods
whose `match` fits the current URL and re-runs them when the page
navigates in place.

Load it from `chrome://extensions` → Developer mode → Load unpacked →
this directory. Click the reload icon there after editing.

## GitHub

`sites/github/pr-redirect.js` — a PR's overview URL goes straight to
`/changes?panel=overview`, the files view with the description open on
the side. Append `?sitemods=stay` to see the plain overview.

`sites/github/pr-hide-chrome.js` — hides the global navigation and the
PR title/tabs block on PR subpages (changes, commits, checks), leaving
the sticky title bar. The plain overview is left alone.

`sites/github/pr-header-links.js` — puts Overview / Files changed links
in the sticky title bar, since the tabs are hidden, plus a pencil that
reveals the header and opens GitHub's title editor, re-hiding it when
the editor closes, and a copy button for the bare
`https://github.com/owner/repo/pull/N` link. Overview carries the `?sitemods=stay` opt-out.

`sites/github/one-click-approve.js` — adds an **Approve** button next to
**Submit review** on the new PR pages. It drives GitHub's own review
dialog (open, pick Approve, submit), so it uses the logged-in session
and needs no token.

`sites/github/pr-state-badge.js` — mirrors the PR state badge (Draft,
Open, Merged, Queued, …) from the hidden header into the sticky bar.

`sites/github/pr-reviews.js` — shows who has approved (✓), requested
changes (✗) or is still pending (○) in the sticky bar. Off the overview
page it reads the reviewer list from a background fetch of the overview.

`sites/github/pr-close.js` — a **Close** button at the far right of the
sticky bar, with a confirm; on pages without GitHub's close button it
hops to the overview and clicks it there.

`sites/github/pr-merge.js` — a **Merge** button beside it, with a
confirm. It clicks whichever of GitHub's merge buttons is showing (merge
when ready, add to merge queue, auto-merge, merge) and its confirm step,
hopping to the overview first when the merge box isn't on the page.

`sites/github/pr-description-revert.js` — in the description's edit
history dialog, a **Revert to before this edit** button rebuilds the
earlier text from the diff, opens the description editor, and fills it
in. Saving is left to you.

`sites/github/pr-submit-shortcut.js` — Alt+Shift+Enter in the PR
description editor (or any comment box on a PR page) clicks its
Save/Comment button.

## Slack

`sites/slack/hide-pr-unfurls.js` — hides the unfurled preview card
under GitHub pull request links in other people's messages. Your own
stay visible so you can remove them for everyone.

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
