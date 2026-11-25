# sitemods

Personal per-site browser tweaks, loaded unpacked. Each site gets a
folder under `sites/` with one file per mod; `lib/mods.js` runs the mods
whose `match` fits the current URL and re-runs them when the page
navigates in place.

Load it from `chrome://extensions` → Developer mode → Load unpacked →
this directory. Click the reload icon there after editing.

## GitHub

Approve, Merge and Close call the GitHub API with a token you paste into
the extension's options (`chrome://extensions` → sitemods → Details →
Extension options): a classic token with the `repo` scope, authorized for
SSO on your org. It's kept in `chrome.storage.local`.

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

`sites/github/one-click-approve.js` — an **Approve** button next to
**Submit review** that approves through the API in one click.

`sites/github/pr-state-badge.js` — mirrors the PR state badge (Draft,
Open, Merged, Queued, …) from the hidden header into the sticky bar.

`sites/github/pr-reviews.js` — shows who has approved (✓), requested
changes (✗) or is still pending (○) in the sticky bar. Off the overview
page it reads the reviewer list from a background fetch of the overview.

`sites/github/pr-close.js` — a **Close** button at the far right of the
sticky bar, with a confirm.

`sites/github/pr-merge.js` — a **Merge** button ahead of Submit review. It adds the PR to the merge queue when the base branch
has one, merges right away when GitHub says it can, and otherwise turns
on auto-merge.

`sites/github/pr-ready-copy-link.js` — clicking **Ready for review**
copies the bare `https://github.com/owner/repo/pull/N` link.

`sites/github/pr-ready.js` — on your own draft PRs, a **Ready for
review** button in the sticky bar that marks it ready through the API
and copies the bare PR link.

`sites/github/pr-description-panel.js` — a **Description** button beside
GitHub's Merge status button that brings the description back into the
sidebar.

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
