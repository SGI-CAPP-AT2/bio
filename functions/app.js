const redirects = require("../pages/redirects.json");

const showdown = require("showdown");
const converter = new showdown.Converter();
const express = require("express");
const serverless = require("serverless-http");
const app = express();
const fs = require("fs");
const path = require("path");
// Use the correct path to the pages directory (one level up from functions)
const pagesDir = path.join(__dirname, "..", "pages");
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
  const filePath = path.join(pagesDir, req.path + ".md");
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      fs.readFile(
        path.join(pagesDir, req.path, "(root).md"),
        "utf8",
        (err2, data2) => {
          if (err2) {
            res.status(404).send("Page not found");
          } else {
            const html = converter.makeHtml(data2);
            res.send(html);
          }
        }
      );
    } else {
      const html = converter.makeHtml(data);
      res.send(html);
    }
  });
});

module.exports.handler = serverless(app);
