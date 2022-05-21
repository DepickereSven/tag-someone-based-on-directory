// Deployments API example
// See: https://developer.github.com/v3/repos/deployments/ to learn more

const util = require("./lib/util");
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

      const botSuffix = '[bot]';

      const config = await context.config(`tag-someone-config.yml`);

      let regexPath = config['regexPath'];

      const commentResult = await checkComments(context, config);

      const resultCommtisPR = await context.octokit.rest.pulls.listCommits({...util.getPullRequestSettings(context), ...util.getPagingNumber()});


      const result = await checkFiles(context, regexPath);

      await context.octokit.rest.pulls.createReview({
        ...util.getPullRequestSettings(context),
        event: 'REQUEST_CHANGES',
        body: createCommentText(result, config)
      });

      async function checkFiles(context, regexPath) {

        const fileMatchRegex = new RegExp(regexPath)

        const filesThatNeedReview = [];

        for await (const changedFiles of context.octokit.paginate.iterator(
          context.octokit.pulls.listFiles,
          {...util.getPullRequestSettings(context), ...util.getPagingNumber()}
        )) {
          for (let file of changedFiles.data) {

            app.log.info(`file name => ${file.filename}, file status => ${file.status}`);

            let fileName = file.filename;
            if (fileMatchRegex.test(fileName)) {
              filesThatNeedReview.push(fileName)
            }
          }
        }
        return filesThatNeedReview;
      }

      function createCommentText(result, config) {
        let comment = `${util.getCommentMessage(config)} \n`;
        result.forEach(result => {
          comment = comment.concat(`- [ ] ${result} \n`)
        })
        return comment.slice(0, -1);
      }

      async function checkComments(context, config) {
        const appSlugName = await getAppSlugName();

        let lastMessage = null;

        for await (const commentsResult of context.octokit.paginate.iterator(
          context.octokit.pulls.listReviews,
          {...util.getPullRequestSettings(context), ...util.getPagingNumber()}
        )) {
          const filteredCommentMessage = commentsResult.data.filter(c => c.user.login === appSlugName.concat(botSuffix));
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
      async function getAppSlugName() {
        const appDetails = await context.octokit.apps.getAuthenticated();
        return appDetails.data.slug;
      }
    }
  )
};
