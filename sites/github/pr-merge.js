(() => {
  const { register, toast, github } = sitemods;
  const PR_PAGE = /^\/([^/]+)\/([^/]+)\/pull\/(\d+)(\/|$)/;
  const MERGE_NOW = new Set(["CLEAN", "HAS_HOOKS", "UNSTABLE"]);

  const PR_QUERY = `query($owner: String!, $repo: String!, $number: Int!) {
    repository(owner: $owner, name: $repo) {
      squashMergeAllowed mergeCommitAllowed rebaseMergeAllowed
      pullRequest(number: $number) {
        id state isDraft baseRefName mergeStateStatus isInMergeQueue
        autoMergeRequest { enabledAt }
      }
    }
  }`;

  const QUEUE_QUERY = `query($owner: String!, $repo: String!, $branch: String!) {
    repository(owner: $owner, name: $repo) { mergeQueue(branch: $branch) { id } }
  }`;

  function mergeMethod(repo) {
    if (repo.squashMergeAllowed) return "SQUASH";
    if (repo.mergeCommitAllowed) return "MERGE";
    return "REBASE";
  }

  async function merge(owner, repo, number) {
    const vars = { owner, repo, number: Number(number) };
    const { repository } = await github({ query: PR_QUERY, variables: vars });
    const pr = repository.pullRequest;

    if (pr.state !== "OPEN") throw new Error(`#${number} is ${pr.state.toLowerCase()}`);
    if (pr.isDraft) throw new Error(`#${number} is still a draft`);
    if (pr.isInMergeQueue) return toast(`#${number} is already in the merge queue`);
    if (!confirm(`Merge pull request #${number}?`)) return;

    const queue = await github({ query: QUEUE_QUERY, variables: { owner, repo, branch: pr.baseRefName } });
    if (queue.repository.mergeQueue) {
      const r = await github({
        query: `mutation($id: ID!) { enqueuePullRequest(input: { pullRequestId: $id }) { mergeQueueEntry { position } } }`,
        variables: { id: pr.id },
      });
      return toast(`Queued #${number} at position ${r.enqueuePullRequest.mergeQueueEntry.position}`);
    }

    const method = mergeMethod(repository);
    if (MERGE_NOW.has(pr.mergeStateStatus)) {
      await github({
        method: "PUT",
        path: `/repos/${owner}/${repo}/pulls/${number}/merge`,
        body: { merge_method: method.toLowerCase() },
      });
      toast(`Merged #${number}`);
      setTimeout(() => location.reload(), 800);
      return;
    }

    if (pr.autoMergeRequest) return toast(`Auto-merge is already on for #${number}`);
    await github({
      query: `mutation($id: ID!, $method: PullRequestMergeMethod!) {
        enablePullRequestAutoMerge(input: { pullRequestId: $id, mergeMethod: $method }) { clientMutationId }
      }`,
      variables: { id: pr.id, method },
    });
    toast(`Auto-merge on for #${number}; it merges once requirements pass`);
  }

  register({
    name: "github pr merge",
    match: (url) => PR_PAGE.test(url.pathname),

    run(url) {
      const [, owner, repo, number] = url.pathname.match(PR_PAGE);
      const nav = document.querySelector(".sitemods-header-links");
      const actions = sitemods.reviewOpener()?.parentElement;
      if (!nav || !actions || actions.querySelector(".sitemods-merge")) return;

      const button = nav.querySelector("button").cloneNode(false);
      button.classList.add("sitemods-merge");
      button.dataset.variant = "primary";
      button.title = "Merge, add to the merge queue, or turn on auto-merge";
      button.textContent = "Merge";
      button.addEventListener("click", async () => {
        button.disabled = true;
        try {
          await merge(owner, repo, number);
        } catch (e) {
          toast(`Merge failed: ${e.message}`, { error: true, ms: 8000 });
        } finally {
          button.disabled = false;
        }
      });
      actions.prepend(button);
    },
  });
})();
