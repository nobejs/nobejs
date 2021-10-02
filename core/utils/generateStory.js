const fs = require("fs-extra");
const path = require("path");

function camelize(str) {
  return str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
      return word.toUpperCase();
    })
    .replace(/\s+/g, "");
}

const generateStory = (title, folder = "") => {
  const camelCaseStory = camelize(title);
  const storyFolder = path.resolve(`src/stories/${folder}/${camelCaseStory}`);

  console.log("Creating story in:", storyFolder);

  if (!fs.existsSync(storyFolder)) {
    fs.copySync(path.resolve(`core/sampleStory`), storyFolder);
  } else {
    console.log("Story already exists");
  }
};

module.exports = generateStory(process.argv[2], process.argv[3]);
