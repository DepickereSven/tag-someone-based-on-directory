const util = require("./util");
const helper = require("./helper");


async function checkComments(context, config) {
  const appSlugName = await getAppSlugName(context);

  let lastMessage = null;

  for await (const commentsResult of context.octokit.paginate.iterator(
    context.octokit.pulls.listReviews,
    {...util.getPullRequestSettings(context), ...util.getPagingNumber()}
  )) {
    const filteredCommentMessage = commentsResult.data.filter(c => c.user.login === appSlugName.concat(util.botSuffix));
    lastMessage = filteredCommentMessage[filteredCommentMessage.length - 1].body;
  }

  lastMessage = lastMessage.replace(util.getCommentMessage(config), '');
  let message = lastMessage.split('\n')
  message.shift();

  return null;
}

/**
 * This returns the slug name of the app
 * @returns {Promise<string>}
 */
async function getAppSlugName(context) {
  const appDetails = await context.octokit.apps.getAuthenticated();
  return appDetails.data.slug;
}

/**
 *
 * @param context of the probot
 * @param config The config read from the tag-someone-config.yml file
 * @returns {Promise<*[]>} the list of files that need to be checked by the person
 */
async function checkFiles(context, config) {

  const fileMatchRegex = new RegExp(util.getRegexPath(config))

  const fileStatusThatAreValidForComment = util.getFileStatusThatAreValidForComments(config);

  const filesThatNeedReview = [];

  for await (const changedFiles of context.octokit.paginate.iterator(
    context.octokit.pulls.listFiles,
    {...util.getPullRequestSettings(context), ...util.getPagingNumber()}
  )) {
    for (let file of changedFiles.data) {

      // if file isn't in the correct status we don't want to put this file
      // to be reviewed
      if (fileStatusThatAreValidForComment.includes(file.status)) {

        let fileName = file.filename;
        if (fileMatchRegex.test(fileName)) {
          filesThatNeedReview.push(fileName)
        }
      }
    }
  }
  return filesThatNeedReview;
}

async function createReview(context, config, comments) {
  return await context.octokit.rest.pulls.createReview({
    ...util.getPullRequestSettings(context),
    event: 'REQUEST_CHANGES',
    body: helper.createCommentText(comments, config)
  });
}

async function listCommitsInPr(context) {
  return await context.octokit.rest.pulls.listCommits(
    {...util.getPullRequestSettings(context), ...util.getPagingNumber()}
  );
}

module.exports = {
  checkComments,
  checkFiles,
  createReview,
  listCommitsInPr
}
