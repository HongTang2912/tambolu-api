const express = require("express");
// Import and use the routes
const CrawlRouter = require('./src/routes/CrawlMalePerf');
// const apiRouter = require('./routes/api');

process.setMaxListeners(Infinity);

const app = express();




app.use("/crawl", CrawlRouter);


// Start the server
const port = 3000;
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
