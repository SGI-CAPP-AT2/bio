const redirects = require("../pages/redirects.json");

const showdown = require("showdown");
const converter = new showdown.Converter();
const express = require("express");
const serverless = require("serverless-http");
const app = express();
const fs = require("fs");
const path = require("path");
// Use the correct path to the pages directory (one level up from functions)
const pagesDir = path.join(process.cwd(), "pages");
app.use((req, res, next) => {
  console.log(
    `Received request for: ${req.path} + ${JSON.stringify(redirects)}`
  );
  const redirectUrl = redirects[req.path];
  if (redirectUrl) {
    res.redirect(301, redirectUrl);
  } else {
    next();
  }
});

app.use((req, res, next) => {
  let filePath;
  if (req.path === "/") {
    filePath = path.join(pagesDir, "(root).md");
  } else {
    filePath = path.join(pagesDir, req.path + ".md");
  }

  fs.readFile(filePath, "utf8", (err, data) => {
    if (!err) {
      const html = converter.makeHtml(data);
      res.send(html);
    } else if (req.path !== "/") {
      const subRootPath = path.join(pagesDir, req.path, "(root).md");
      fs.readFile(subRootPath, "utf8", (err2, data2) => {
        if (!err2) {
          const html = converter.makeHtml(data2);
          res.send(html);
        } else {
          res.status(404).send("Page not found");
        }
      });
    } else {
      res.status(404).send("Page not found");
    }
  });
});

module.exports.handler = serverless(app);
