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
        const config = await context.config(`tag-someone-config.yml`);

        const tagPersonName = config.personToTag;
        let message = config['message'];
        let regexPath = config['regexPath'];

        if (message === undefined) {
            message = 'would you be so kind to review the following code changes?';
        }

        const result = await checkFiles(context, regexPath);

        await context.octokit.rest.pulls.createReview({
            ...getRepoSettings(context),
            event: 'REQUEST_CHANGES',
            body: createCommentText(result, tagPersonName, message)
        });

        async function checkFiles(context, source, regexPath) {
            let per_page = 100

            const fileMatchRegex = new RegExp(regexPath)

            const filesThatNeedReview = [];

            for await (const changedFiles of context.octokit.paginate.iterator(
                context.octokit.pulls.listFiles,
                {...getRepoSettings(context, source), per_page}
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

        function getRepoSettings(context) {
            return {
                owner: context.payload.repository.full_name.split('/')[0],
                repo: context.payload.repository.name,
                pull_number : context.payload.pull_request.number
            }
        }

        function createCommentText(result, tagPersonName) {
            let comment = `@${tagPersonName} ${message} \n`;
            result.forEach(result => {
                comment = comment.concat(`- [ ] ${result} \n`)
            })
            return comment.slice(0, -1);
        }

    }
  )
};
