const LABEL_IN_REVIEW = "in review";

module.exports = async ({ github, context }) => {
  console.log(`CONSOLE: context is: ${JSON.stringify(context)}`);

  const comment = context.payload.comment;
  // const issue = context.payload.issue;
  const pr = context.payload.pull_request;
  const repo = context.payload.repository;

  if (
    pr.state == "open" &&
    !pr.locked &&
    !pr.draft &&
    !pr.merged &&
    (pr.assignee != null || pr.assignees.length > 0)
  ) {
    console.log(
      `ADDING LABEL; PR number: ${pr.number}, repo: ${repo.name}, owner: ${repo.owner.login}`
    );
    await github.issues.addLabels({
      issue_number: pr.number,
      owner: repo.owner.login,
      repo: repo.name,
      labels: [LABEL_IN_REVIEW],
    });
  } else {
    console.log("TODO REMOVE: not adding label");
    return;
  }
};
