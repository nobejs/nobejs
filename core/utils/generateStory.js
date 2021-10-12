const fs = require("fs-extra");
const path = require("path");

function camelize(str) {
  const upperCase = str
    .replace(/(?:^\w|[A-Z]|\b\w)/g, function (word, index) {
      return word.toUpperCase();
    })
    .replace(/\s+/g, "");

  return upperCase;
}

const generateStory = (title) => {
  const camelCaseStory = camelize(title);
  const storyFolder = path.resolve(`src/stories/${camelCaseStory}`);

  console.log("Creating story in:", storyFolder);

  if (!fs.existsSync(storyFolder)) {
    fs.copySync(path.resolve(`core/StoryTemplate`), storyFolder);

    let testFileContents = fs.readFileSync(
      `${storyFolder}/tests.spec.js`,
      "utf8"
    );

    testFileContents = testFileContents.replace(
      /StoryTemplate/g,
      camelCaseStory
    );

    fs.writeFile(`${storyFolder}/tests.spec.js`, testFileContents);

    let endpointFileContents = fs.readFileSync(
      `${storyFolder}/endpoint.spec.js`,
      "utf8"
    );

    endpointFileContents = endpointFileContents.replace(
      /StoryTemplate/g,
      camelCaseStory
    );

    fs.writeFile(`${storyFolder}/endpoint.spec.js`, endpointFileContents);
  } else {
    console.log("Story already exists");
  }
};

module.exports = generateStory(process.argv[2]);
