// Deployments API example
// See: https://developer.github.com/v3/repos/deployments/ to learn more

const request = require("./lib/request");
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

      const commentResult = await request.checkComments(context, config);

      const resultCommitsInPr = await request.listCommitsInPr(context);

      const comments = await request.checkFiles(context, config, app);

      await request.createReview(context, config, comments);

    }
  )
};
