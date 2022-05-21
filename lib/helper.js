const util = require("./util");


function createCommentText(result, config) {
  let comment = `${util.getCommentMessage(config)} \n`;
  result.forEach(result => {
    comment = comment.concat(`- [ ] ${result} \n`)
  })
  return comment.slice(0, -1);
}

module.exports = {
  createCommentText,
}
