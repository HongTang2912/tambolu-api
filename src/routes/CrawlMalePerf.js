const express = require("express");
const colorLog = require("../modules/coloringMessage");
const fs = require("fs");

const { Browser } = require("../modules/crawler");
const { BrowserDetail } = require("../modules/crawlDetaily");
// Configuration file
const browserConfig = require("../../config.json").BROWSER_CONFIG;
const pageConfig = require("../../config.json").NUOC_HOA_BLANC.HOME_PAGE[0];

const router = express.Router();

const browser = new Browser(
  browserConfig.TIMEOUT,
  browserConfig.HEADLESS_SETTING,
  browserConfig.WAIT_UNTIL,
  browserConfig.VIEWPORT
);

const browserDetail = new BrowserDetail(
  browserConfig.TIMEOUT,
  browserConfig.HEADLESS_SETTING,
  browserConfig.WAIT_UNTIL,
  browserConfig.VIEWPORT
);

router.get("/men-perfume", async (req, res) => {
  let data = [];
  const { from, to } = req.query;
  if (from <= 0 || to > pageConfig.limit_page) {
    res.status(400).send("Bad request");
  }
  try {
    for (let i = from * 1; i <= to * 1; i++) {
      const products = await browser
        .crawl(
          `${pageConfig.url}?q=${pageConfig.query.q}&page=${i}&view=${pageConfig.query.view}`,
          pageConfig,
          i
        )
        .then((res) => res);

      for (let j = 0; j < products.length; j++) {
        
        products[j] = {
          ...products[j],
          image_url: await browser.downloadImage(products[j].image_url, products[j].title, 'upload/images/'),
          description: await browserDetail.crawl(products[j]),
        };
      }
      data.push(...products);
    }
  } catch (err) {
    console.log("Server has caused an errror: ", err);
  } finally {
  
    await browser.closeBrowser();

    res.status(200).send(data);

    fs.writeFileSync(
      `data/men_perfume_${formatDate()}.json`,
      JSON.stringify(data),
      "utf-8"
    );
    colorLog(`END`, "magenta");
  }
});

const formatDate = () => {
    const dt = new Date();
    const padL = (nr, len = 2, chr = `0`) => `${nr}`.padStart(2, chr);

    return `${padL(dt.getMonth() + 1)}-${padL(
      dt.getDate()
    )}-${dt.getFullYear()}_${padL(dt.getHours())}-${padL(
      dt.getMinutes()
    )}-${padL(dt.getSeconds())}`;
}

module.exports = router;
