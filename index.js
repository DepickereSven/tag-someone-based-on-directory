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
        const source = 'pull_request';

        const config = await context.config(`tag-someone-config.yml`);
        
        const tagPersonName = config.personToTag;

        const result = await checkFiles(context, source);

        await context.octokit.rest.pulls.createReview({
            ...getRepoSettings(context, source),
            event: 'REQUEST_CHANGES',
            body: createCommentText(result, tagPersonName)
        });

        async function checkFiles(context, source) {
            let per_page = 100

            const fileMatchRegex = new RegExp('(api\/)')

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

        function getRepoSettings(context, source) {
            return {
                owner: context.payload.repository.full_name.split('/')[0],
                repo: context.payload.repository.name,
                pull_number : context.payload[source].number
            }
        }

        function createCommentText(result, tagPersonName) {
            let comment = `@${tagPersonName} would you be so kind to review the following code changes? \n`;
            result.forEach(result => {
                comment = comment.concat(`- [ ] ${result} \n`)
            })
            return comment.slice(0, -1);
        }

    }
  )
};
