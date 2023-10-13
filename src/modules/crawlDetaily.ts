const { Browser } = require("./crawler");
const puppeteer = require("puppeteer");
const colorLog = require("./coloringMessage");

class BrowserDetail extends Browser {
  crawl = async (product) => {
    colorLog(`Get detail from ${product.title}...`, "yellow");
    // Launch a headless browser instance
    this.browser = await puppeteer.launch({ headless: this.headless });
    // // Open a new page
    this.page = await this.browser.newPage();

    // Chromium view port settings
    await this.page.setViewport(this.viewPort);

    // Navigate to the URL you want to crawl
    await this.page.goto(product.access_link, {
      //   waitUntil: this.waitUntil,
      timeout: this.timeout,
    });

    // Scroll to the bottom of the page
    // await autoScroll(this.page);

    // Extract data from the page (replace with your specific logic)
    const data = await this.page.evaluate(() => {
      // Example: Extract data from a list of items
      return document.querySelector(".tab-content.current").innerHTML;
    });

    colorLog(`-- Get detail from ${product.title} SUCCESSFULLY! --`, "green");

    return data;
  };
}

// Function to scroll to the bottom of the page
async function autoScroll(page) {
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 100);
    });
  });
}

module.exports = {
  BrowserDetail,
};
