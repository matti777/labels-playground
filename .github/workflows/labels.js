const LABEL_IN_REVIEW = "in review";
const LABEL_READY_FOR_REVIEW = "ready for review";
const LABEL_DRAFT = "draft";

async function assigned(github, context) {
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
}

async function opened(github, context) {
  const pr = context.payload.pull_request;
  const repo = context.payload.repository;

  if (pr.state == "open" && !pr.locked) {
    const label = pr.draft ? LABEL_DRAFT : LABEL_READY_FOR_REVIEW;

    await github.issues.addLabels({
      issue_number: pr.number,
      owner: repo.owner.login,
      repo: repo.name,
      labels: [label],
    });
  }
}

module.exports = async ({ github, context }) => {
  console.log(`context is: ${JSON.stringify(context)}`);
  console.log(`action is: ${JSON.stringify(context.payload.action)}`);

  switch (context.payload.action) {
    case "assigned":
      await assigned(github, context);
    case "opened":
      await opened(github, context);
    default:
      break;
  }
};
