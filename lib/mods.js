globalThis.sitemods = (() => {
  const mods = [];
  let lastHref = null;

  function register(mod) {
    mods.push(mod);
  }

  function run() {
    const url = new URL(location.href);
    for (const mod of mods) {
      if (!mod.match(url)) continue;
      Promise.resolve(mod.run(url)).catch((e) =>
        console.error(`sitemods: ${mod.name} failed`, e)
      );
    }
  }

  function tick() {
    if (location.href === lastHref) return;
    lastHref = location.href;
    run();
  }

  function waitFor(predicate, { timeout = 10000, interval = 100 } = {}) {
    return new Promise((resolve, reject) => {
      const started = Date.now();
      const poll = () => {
        const found = predicate();
        if (found) return resolve(found);
        if (Date.now() - started > timeout) return reject(new Error("sitemods: timed out waiting"));
        setTimeout(poll, interval);
      };
      poll();
    });
  }

  function normalize(s) {
    return (s ?? "").replace(/\s+/g, " ").trim().toLowerCase();
  }

  function byText(selector, text, root = document) {
    const wanted = normalize(text);
    const candidates = [...root.querySelectorAll(selector)];
    return (
      candidates.find((el) => normalize(el.textContent) === wanted) ??
      candidates.find((el) => normalize(el.getAttribute("aria-label")) === wanted) ??
      candidates.find((el) => normalize(el.textContent).startsWith(wanted))
    );
  }

  function toast(message, { error = false, ms = 4000 } = {}) {
    const el = document.createElement("div");
    el.className = `sitemods-toast${error ? " sitemods-toast-error" : ""}`;
    el.textContent = message;
    document.body.append(el);
    setTimeout(() => el.remove(), ms);
  }

  function fetchText(url) {
    return chrome.runtime.sendMessage({ type: "fetch", url }).then((r) => {
      if (!r?.ok) throw new Error(r?.error ?? `fetch failed: ${url}`);
      return r.text;
    });
  }

  setInterval(tick, 300);
  tick();

  return { register, waitFor, byText, toast, fetchText };
})();
