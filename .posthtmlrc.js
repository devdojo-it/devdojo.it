const path = require("path");

const youtube = require("./data/youtube.json");

const locals = {
  ...youtube,
  currentYear: new Date().getFullYear(),
};

module.exports = {
  plugins: {
    "posthtml-expressions": { locals },
    "posthtml-extend": { root: "./src", strict: false, locals },
    "posthtml-include": { root: "./src", posthtmlExpressionsOptions: { locals } },
  },
};
