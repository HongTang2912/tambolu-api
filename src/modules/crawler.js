const puppeteer = require("puppeteer");
const colorLog = require("./coloringMessage");

class Browser {
  constructor(timeout, headless, waitUntil, viewPort) {
    this.timeout = timeout;
    this.headless = headless;
    this.waitUntil = waitUntil;
    this.viewPort = viewPort;
  }

  crawl = async (url, pageConf, p) => {
    colorLog(
      "-----------------------------------------------------------",
      "red"
    );
    colorLog(`Crawling "${pageConf.name}" at page ${p}...`, "yellow");
    // Launch a headless browser instance
    this.browser = await puppeteer.launch({ headless: this.headless });
    // // Open a new page
    this.page = await this.browser.newPage();

    // Chromium view port settings
    await this.page.setViewport(this.viewPort);

    // Navigate to the URL you want to crawl
    await this.page.goto(url, {
      waitUntil: this.waitUntil,
      timeout: this.timeout,
    });

    // Scroll to the bottom of the page
    await autoScroll(this.page);

    // Extract data from the page (replace with your specific logic)
    const data = await this.page.evaluate(() => {
      const items = [];
      // Example: Extract data from a list of items
      document.querySelectorAll(".product-box").forEach((item) => {
        items.push({
          title: item.querySelector(".product-name").innerText,
          prices: item.querySelector(".price.product-price").innerText,
          access_link: item.querySelector(".product-name a").href,
        });
      });
      return items;
    });

    colorLog(
      `Phase ${p}: ${data.length} products have been crawled successfully!`,
      "green"
    );

    colorLog(
      "-----------------------------------------------------------",
      "red"
    );

    return data;
  };

  closeBrowser = async () => {
    // Close the browser
    await this.browser.close();
  };

  closePage = async () => {
    // Close the browser
    await this.page.close();
  };

  openNewPage = async () => {
    await this.browser.newPage();
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

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = {
  Browser,
};
