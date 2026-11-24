(() => {
  const { register, toast, github } = sitemods;
  const PR_PAGE = /^\/([^/]+)\/([^/]+)\/pull\/(\d+)(\/|$)/;
  const QUERY = `query($owner: String!, $repo: String!, $number: Int!) {
    viewer { login }
    repository(owner: $owner, name: $repo) {
      pullRequest(number: $number) { id isDraft author { login } }
    }
  }`;
  const cache = new Map();

  function lookup(owner, repo, number) {
    const key = `${owner}/${repo}#${number}`;
    if (!cache.has(key)) {
      cache.set(
        key,
        github({ query: QUERY, variables: { owner, repo, number: Number(number) } }).catch(() => null)
      );
    }
    return cache.get(key);
  }

  async function markReady(button, owner, repo, number, id) {
    const link = `${location.origin}/${owner}/${repo}/pull/${number}`;
    const copied = navigator.clipboard.writeText(link).then(() => true, () => false);
    button.disabled = true;
    try {
      await github({
        query: `mutation($id: ID!) { markPullRequestReadyForReview(input: { pullRequestId: $id }) { clientMutationId } }`,
        variables: { id },
      });
      cache.delete(`${owner}/${repo}#${number}`);
      toast((await copied) ? `Ready for review; copied ${link}` : `Ready for review: #${number}`);
      setTimeout(() => location.reload(), 800);
    } catch (e) {
      button.disabled = false;
      toast(`Ready for review failed: ${e.message}`, { error: true, ms: 8000 });
    }
  }

  register({
    name: "github pr ready for review",
    match: (url) => PR_PAGE.test(url.pathname),

    async run(url) {
      const [, owner, repo, number] = url.pathname.match(PR_PAGE);
      if (document.querySelector(".sitemods-ready")) return;

      const data = await lookup(owner, repo, number);
      const pr = data?.repository?.pullRequest;
      if (!pr?.isDraft || pr.author?.login !== data.viewer.login) return;

      const nav = document.querySelector(".sitemods-header-links");
      const actions = sitemods.reviewOpener()?.parentElement;
      if (!nav || !actions || document.querySelector(".sitemods-ready")) return;

      const button = nav.querySelector("button").cloneNode(false);
      button.classList.add("sitemods-ready");
      button.dataset.variant = "primary";
      button.title = "Mark ready for review and copy the PR link";
      button.textContent = "Ready for review";
      button.addEventListener("click", () => markReady(button, owner, repo, number, pr.id));
      actions.prepend(button);
    },
  });
})();
