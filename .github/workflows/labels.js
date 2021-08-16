const LABEL_IN_REVIEW = "in review";
const LABEL_READY_FOR_REVIEW = "ready for review";
const LABEL_DRAFT = "draft";
const LABEL_APPROVED = "approved";

async function getCurrentLabels(github, context) {
  const pr = context.payload.pull_request;
  const repo = context.payload.repository;

  const response = await github.issues.listLabelsOnIssue({
    issue_number: pr.number,
    owner: repo.owner.login,
    repo: repo.name,
  });

  return response.data.map((x) => x.name);
}

async function setLabels(github, context, labels) {
  const pr = context.payload.pull_request;
  const repo = context.payload.repository;

  console.log(`Setting labels: ${labels}`);

  await github.issues.setLabels({
    issue_number: pr.number,
    owner: repo.owner.login,
    repo: repo.name,
    labels: labels,
  });
}

async function assigned(github, context, currentLabels) {
  const pr = context.payload.pull_request;

  if (
    pr.state === "open" &&
    !pr.locked &&
    !pr.draft &&
    !pr.merged &&
    (pr.assignee != null || pr.assignees.length > 0)
  ) {
    if (!currentLabels.includes(LABEL_IN_REVIEW)) {
      await setLabels(github, context, [...currentLabels, LABEL_IN_REVIEW]);
    }
  }
}

async function opened(github, context, currentLabels) {
  const pr = context.payload.pull_request;

  if (pr.state === "open" && !pr.locked) {
    const addLabel = pr.draft ? LABEL_DRAFT : LABEL_READY_FOR_REVIEW;
    const removeLabel = pr.draft ? LABEL_READY_FOR_REVIEW : LABEL_DRAFT;

    let labels = currentLabels.filter((x) => x !== removeLabel);
    if (!labels.includes(addLabel)) {
      labels.push(addLabel);
    }

    await setLabels(github, context, labels);
  }
}

async function closed(github, context) {
  const pr = context.payload.pull_request;

  if (pr.state === "closed" && !pr.locked && pr.merged) {
    console.log("Deleting all labels");

    await setLabels(github, context, []);
  }
}

async function submitted(github, context, currentLabels) {
  const pr = context.payload.pull_request;
  const review = context.payload.review;

  if (
    pr.state === "closed" &&
    !pr.locked &&
    !pr.merged &&
    review.state === "approved"
  ) {
    if (!currentLabels.includes(LABEL_APPROVED)) {
      await setLabels(github, context, [...currentLabels, LABEL_APPROVED]);
    }
  }
}

module.exports = async ({ github, context }) => {
  console.log(`context is: ${JSON.stringify(context)}`);
  // console.log(`action is: ${JSON.stringify(context.payload.action)}`);

  const currentLabels = await getCurrentLabels(github, context);

  switch (context.payload.action) {
    case "assigned":
      await assigned(github, context, currentLabels);
      break;
    case "opened":
    case "ready_for_review":
      await opened(github, context, currentLabels);
      break;
    case "closed":
      await closed(github, context);
      break;
    case "submitted":
      await submitted(github, context, currentLabels);
      break;
    default:
      break;
  }
};
