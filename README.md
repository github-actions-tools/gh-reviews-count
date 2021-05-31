# gh-reviews-count

This action tries to get the pull request reviews count by state kind.

## Usage

```yaml
    steps:
      - uses: actions/checkout@v2
      # Get the reviews count by state kind.
      - uses: github-actions-tools/gh-reviews-count@v0.0.1
        id: reviewsCount
      - run: echo "The approved reviews count is ${REVIEWS}"
        if: success() && steps.reviewsCount.outputs.approved
        env:
          REVIEWS: ${{ steps.reviewsCount.outputs.approved }}
```

## Inputs

|      NAME      |                                         DESCRIPTION                                          | REQUIRED |                DEFAULT                |
|----------------|----------------------------------------------------------------------------------------------|----------|---------------------------------------|
| `github-token` | The GitHub token used to create an authenticated client.  Defaults to github provided token. | `false`  | `${{ github.token }}`                 |
| `owner`        | The GitHub repo owner.  Defaults to github current repo owner.                               | `false`  | `${{ github.repository_owner }}`      |
| `pull_number`  | The GitHub pull request number.  Defaults to github current pull request number.             | `false`  | `${{ github.event.issue.number }}`    |
| `repo`         | The GitHub repo name.  Defaults to github current repo name.                                 | `false`  | `${{ github.event.repository.name }}` |

## Outputs

|        NAME         |                                            DESCRIPTION                                             | REQUIRED |                DEFAULT                |
|---------------------|----------------------------------------------------------------------------------------------------|----------|---------------------------------------|
| `approved`          | Changes proposed in the pull request are approved to merge.                                        |
| `changes_requested` | Feedbacks has been submited must be addressed before the pull request can be merged.               |
| `commented`         | General feedbacks without explicitly approving the changes or requesting additional changes.       |
| `pending`           | Reviews have been requested which is pending.                                                      |
| `dismissed`         | Pull request reviews dismissed.                                                                    |
