const express = require("express");
const bodyParser = require("body-parser");
// Import and use the routes
const CrawlRouter = require('./src/routes/CrawlMalePerf');
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


// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
