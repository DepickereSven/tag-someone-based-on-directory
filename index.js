// Deployments API example
// See: https://developer.github.com/v3/repos/deployments/ to learn more

const request = require("./lib/request");
const tools = require("./lib/tools");
/**
 * This is the main entrypoint to your Probot app
 * @param {import('probot').Probot} app
 */
module.exports = (app) => {
  // Your code here
  app.log.info("Yay, the app was loaded!");
  app.on(
    ["pull_request.opened", "pull_request.synchronize"],
    async (context) => {

      const config = await context.config(`tag-someone-config.yml`);

      // app.log.info(`We are getting information`);
      // app.log.info(`We are getting information, ${JSON.stringify(context)}`);

      if (tools.isPrOpened(context)) {
        const filesThatNeedToBeChecked = await request.checkFiles(context, config);

        await request.createReview(context, config, filesThatNeedToBeChecked);
      }

      const commitsInPr = await request.listCommitsInPr(context);

      const commitsThatNeedToBeCheckedForChanges = tools.getCommitsThatNeedToBeCheckedForChanges(
        commitsInPr.data,
        tools.getPreviousCommitBeforeLastSync(context)
      );

      if (commitsThatNeedToBeCheckedForChanges.length === 1) {

      } else {

      }

      const commentResult = await request.getLastCommentOfBot(context, config);

      // app.log.info(`resultCommitsInPr => ${JSON.stringify(commitsInPr)}`);
      app.log.info(`resultCommitsInPr => ${JSON.stringify(commitsThatNeedToBeCheckedForChanges)}`);

    }
  )
};
