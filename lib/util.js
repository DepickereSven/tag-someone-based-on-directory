/**
 * Get the comment message that mentions the person
 * @param config The config read from the tag-someone-config.yml file
 * @returns {string} the comment message
 */
function getCommentMessage(config) {
  const tagPersonName = config.personToTag;
  return `@${tagPersonName} ${getMessage(config)}`;
}

/**
 * This function determines whether there is a custom message in the config or we should pick the default one.
 * @param config The config read from the tag-someone-config.yml file
 * @returns {string} The message
 */
function getMessage(config) {
  let message = config['message'];
  if (message === undefined) {
    message = 'would you be so kind to review the following code changes?';
  }
  return message;
}

/**
 * Getting the settings for the pull request that can be
 * reused in other requests
 * @param context
 * @returns {{owner: *, pull_number: any | number, repo}}
 */
function getPullRequestSettings(context) {
  return {
    owner: context.payload.repository.full_name.split('/')[0],
    repo: context.payload.repository.name,
    pull_number: context.payload.pull_request.number
  }
}

/**
 * Get the number on how many results we want to page
 * @returns {{per_page: number}}
 */
function getPagingNumber() {
  return {per_page: 100}
}

module.exports = {
  getCommentMessage,
  getMessage,
  getPullRequestSettings,
  getPagingNumber
}
