const fs = require("fs");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
// Import and use the routes
const CrawlRouter = require("./src/routes/CrawlMalePerf");
// const apiRouter = require('./routes/api');

const CategoryRouter = require("./src/routes/CreateCategory");

process.setMaxListeners(Infinity);

const app = express();

app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(
  bodyParser.urlencoded({
    // to support URL-encoded bodies
    extended: true,
  })
);
app.use("/crawl", CrawlRouter);
app.use("/category", CategoryRouter);


// Send images from upload dir API
app.get("/upload/images/:title", function (req, res) {
  const { title } = req.params;
  res.sendFile(path.join(__dirname, '/upload/images', title));
});

// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
