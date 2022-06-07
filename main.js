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

  var last_review_state_by_user = new Map();

  result.sort(sortReviewsBySubmittedDate).forEach(function (v) {
    // As reviews are sorted by ascendant submitted dates, we will have the last review state for each user id in hashmap
    last_review_state_by_user.set(v.user.id, v.state)
  });

  console.log([...last_review_state_by_user.entries()]);

  const reviews = [...last_review_state_by_user.values()].reduce((acc, curr) => (acc[curr] = (acc[curr] || 0) + 1, acc), {});
  console.log(reviews);

  core.setOutput('approved', reviews['APPROVED'] || 0);
  core.setOutput('changes_requested', reviews['CHANGES_REQUESTED'] || 0);
  core.setOutput('commented', reviews['COMMENTED'] || 0);
  core.setOutput('pending', reviews['PENDING'] || 0);
  core.setOutput('dismissed', reviews['DISMISSED'] || 0);
}

function sortReviewsBySubmittedDate(a, b) {
  var dateA = Date.parse(a.submitted_at);
  var dateB = Date.parse(b.submitted_at);
  return dateA - dateB;
};

main().catch(err => core.setFailed(JSON.stringify(err)));
