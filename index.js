// Deployments API example
// See: https://developer.github.com/v3/repos/deployments/ to learn more

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

      const tagPersonName = config.personToTag;
      let message = config['message'];
      let regexPath = config['regexPath'];

      if (message === undefined) {
        message = 'would you be so kind to review the following code changes?';
      }

      const commentResult = await checkComments(context);

      const result = await checkFiles(context, regexPath);

      await context.octokit.rest.pulls.createReview({
        ...getPullRequestSettings(context),
        event: 'REQUEST_CHANGES',
        body: createCommentText(result, tagPersonName, message)
      });

      async function checkFiles(context, regexPath) {

        const fileMatchRegex = new RegExp(regexPath)

        const filesThatNeedReview = [];

        for await (const changedFiles of context.octokit.paginate.iterator(
          context.octokit.pulls.listFiles,
          {...getPullRequestSettings(context), ...getPagingNumber()}
        )) {
          for (let file of changedFiles.data) {

            let fileName = file.filename;
            if (fileMatchRegex.test(fileName)) {
              filesThatNeedReview.push(fileName)
            }
          }
        }
        return filesThatNeedReview;
      }

      function createCommentText(result, tagPersonName) {
        let comment = `@${tagPersonName} ${message} \n`;
        result.forEach(result => {
          comment = comment.concat(`- [ ] ${result} \n`)
        })
        return comment.slice(0, -1);
      }

      async function checkComments(context) {
        const appSlugName = await getAppSlugName();

        let lastMessage = null;

        for await (const commentsResult of context.octokit.paginate.iterator(
          context.octokit.pulls.listReviews,
          {...getPullRequestSettings(context), ...getPagingNumber()}
        )) {
          const filteredCommentMessage = commentsResult.data.filter(c => c.user.login === appSlugName.concat(botSuffix));
          lastMessage = filteredCommentMessage[filteredCommentMessage.length - 1].body;
          app.log.info('lastMessage => ' + lastMessage);
        }

        return null;
      }

      async function getAppSlugName() {
        const appDetails = await context.octokit.apps.getAuthenticated();
        return appDetails.data.slug;
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

    }
  )
};
