const redirects = require("./pages/redirects.json");
const showdown = require("showdown");
const converter = new showdown.Converter();
const express = require("express");
const serverless = require("serverless-http");
const app = express();
const port = 3000;

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
  const fs = require("fs");
  const path = require("path");
  const filePath = path.join(__dirname, "pages", req.path + ".md");
  fs.readFile(filePath, "utf8", (err, data) => {
    if (err) {
      console.error(err);
      fs.readFile(
        path.join(__dirname, "pages", path.join(req.path, "(root).md")),
        "utf8",
        (err2, data2) => {
          if (err2) {
            console.error(err2);
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

export const handler = serverless(app);
