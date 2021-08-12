const LABEL_IN_REVIEW = "in review";

module.exports = async ({ github, context }) => {
  // console.log(`CONSOLE: context is: ${JSON.stringify(context)}`);

  if (context.payload.action !== "assigned") {
    return;
  }

  const pr = context.payload.pull_request;
  const repo = context.payload.repository;

  if (
    pr.state == "open" &&
    !pr.locked &&
    !pr.draft &&
    !pr.merged &&
    (pr.assignee != null || pr.assignees.length > 0)
  ) {
    await github.issues.addLabels({
      issue_number: pr.number,
      owner: repo.owner.login,
      repo: repo.name,
      labels: [LABEL_IN_REVIEW],
    });
  }
};
