const util = require("./util");

/**
 *
 * @param fileList list of files that need to be checked
 * @param config The config read from the tag-someone-config.yml file
 * @returns {string} the comment that will be placed on the PR review
 */
function createCommentText(fileList, config) {
  let comment = `${util.getCommentMessage(config)} \n`;
  fileList.forEach(file => {
    comment = comment.concat(`- [ ] ${file} \n`)
  })
  return comment.slice(0, -1);
}

module.exports = {
  createCommentText,
}
