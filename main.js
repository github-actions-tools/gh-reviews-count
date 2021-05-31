const core = require('@actions/core');
const { Octokit } = require('@octokit/core');
const {
  paginateRest,
  composePaginateRest,
} = require('@octokit/plugin-paginate-rest');

async function main() {

    const owner       = core.getInput('owner');
    const repo        = core.getInput('repo');
    const token       = core.getInput('github-token', { required: true });
    const pull_number = core.getInput('pull_number');

    const MyOctokit = Octokit.plugin(paginateRest);
    const octokit = new MyOctokit({ auth: 'token ' + token });

    const result = await octokit.paginate('GET /repos/{owner}/{repo}/pulls/{pull_number}/reviews', {
      owner: owner,
      repo: repo,
      pull_number: pull_number,
      per_page: 100
    });

    let reviews = {};

    result.forEach(function(v) {
      reviews[v.state] = (reviews[v.state] || 0) + 1;
    })

    core.setOutput('approved', reviews['APPROVED'] || 0);
    core.setOutput('changes_requested', reviews['CHANGES_REQUESTED'] || 0);
    core.setOutput('commented', reviews['COMMENTED'] || 0);
    core.setOutput('pending', reviews['PENDING'] || 0);
    core.setOutput('dismissed', reviews['DISMISSED'] || 0);
}

main().catch(err => core.setFailed(JSON.stringify(err)));
