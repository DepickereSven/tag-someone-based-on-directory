/**
 *
 * @param context of the probot
 * @returns {boolean} whether the PR is opened, if not than it means it was a synchronized
 */
function isPrOpened(context) {
  return context.payload.action === 'opened';
}

module.exports = {
  isPrOpened
}
