const core = require('@actions/core');
const { Octokit } = require('@octokit/core');
const {
  paginateRest,
  composePaginateRest,
} = require('@octokit/plugin-paginate-rest');

async function main() {

  const owner = core.getInput('owner');
  const repo = core.getInput('repo');
  const token = core.getInput('github-token', { required: true });
  const pull_number = core.getInput('pull_number');

  const MyOctokit = Octokit.plugin(paginateRest);
  const octokit = new MyOctokit({ auth: 'token ' + token });

  const result = await octokit.paginate('GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews', {
    owner: owner,
    repo: repo,
    pull_number: pull_number,
    per_page: 100
  });

  var lastReviewStateByUser = new Map();
  var lastReviewCommentsByUser = new Map();

  result.sort(sortReviewsBySubmittedDate).forEach(function (v) {
    switch (v.state) {
      case 'APPROVED':
      case 'CHANGES_REQUESTED':
      case 'DISMISSED':
      case 'PENDING':
        // As reviews are sorted by ascendant submitted dates, we will have the last review state for each user id in hashmap
        lastReviewStateByUser.set(v.user.id, v.state)
        break;
      case 'COMMENTED':
        // We handle comments differently because we can add comments without affecting approval states above
        // Note : we could use directly a simple counter, but maybe this info by user will be useful for later
        var commentCountForThisUser = (lastReviewCommentsByUser.get(v.user.id) || 0) + 1
        lastReviewCommentsByUser.set(v.user.id, commentCountForThisUser)
        break;
      default:
        console.log(`Unknown ${v.state}.`);
    }
  });

  console.log([...lastReviewStateByUser.entries()]);
  console.log([...lastReviewCommentsByUser.entries()]);

  const reviewApprovalStates = [...lastReviewStateByUser.values()].reduce((acc, curr) => (acc[curr] = (acc[curr] || 0) + 1, acc), {});
  console.log(`Review approval states count : ${JSON.stringify(reviewApprovalStates, null, "  ")}.`);

  const reviewCommentsTotalInitialValue = 0;
  const reviewCommentsTotal = [...lastReviewCommentsByUser.values()].reduce(
    (previousValue, currentValue) => previousValue + currentValue,
    reviewCommentsTotalInitialValue
  );
  console.log(`Review comment total count : ${reviewCommentsTotal}.`);

  core.setOutput('approved', reviewApprovalStates['APPROVED'] || 0);
  core.setOutput('changes_requested', reviewApprovalStates['CHANGES_REQUESTED'] || 0);
  core.setOutput('pending', reviewApprovalStates['PENDING'] || 0);
  core.setOutput('dismissed', reviewApprovalStates['DISMISSED'] || 0);
  core.setOutput('commented', reviewCommentsTotal);
}

function sortReviewsBySubmittedDate(a, b) {
  var dateA = Date.parse(a.submitted_at);
  var dateB = Date.parse(b.submitted_at);
  return dateA - dateB;
};

main().catch(err => core.setFailed(JSON.stringify(err)));
