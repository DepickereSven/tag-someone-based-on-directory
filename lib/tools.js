/**
 * Whether the PR is opened or synced
 *
 * @param context of the probot
 * @returns {boolean} whether the PR is opened, if not than it means it was a synchronized
 */
function isPrOpened(context) {
  return context.payload.action === 'opened';
}

/**
 * Returns the last commit before the last sync
 *
 * @param context of the probot
 * @returns {string} the last commit ID
 */
function getPreviousCommitBeforeLastSync(context) {
  return context.payload.before;
}

/**
 * Returns a list of commits sha that need to be checked for changes
 * @param commitsInPr all commits in the PR
 * @param lastCommitInSync last commit ID of the sync
 * @returns {string[]} return a list of commits sha
 */
function getCommitsThatNeedToBeCheckedForChanges(commitsInPr, lastCommitInSync) {
  let returnAllOtherCommitsTo = false;

  return commitsInPr.filter(commit => {
    const commitEqualsToLastCommitInSync = commit.sha === lastCommitInSync;
    if (commitEqualsToLastCommitInSync) {
      returnAllOtherCommitsTo = true;
    }
    return commitEqualsToLastCommitInSync || returnAllOtherCommitsTo;
  }).map(commitInformation => commitInformation.sha);
}

module.exports = {
  isPrOpened,
  getPreviousCommitBeforeLastSync,
  getCommitsThatNeedToBeCheckedForChanges
}
