const puppeteer = require("puppeteer");
const colorLog = require("./coloringMessage");
const path = require("path");
const fs = require("fs");
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
          image_url:
            "https://" + item.querySelector(".product-thumbnail source").srcset,
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

  downloadImage = async (url, title, destination) => {
    // Launch a browser instance (non-headless)
    const browser = await puppeteer.launch();

    // Open a new page
    const page = await browser.newPage();

    // Navigate to a URL with the image
    const imageUrl = url;
    await page.goto(imageUrl);

    // Get the image's response
    const imageResponse = await page.goto(imageUrl);

    // Extract the image's content and file extension
    const imageContent = await imageResponse.buffer();
    const fileExtension = path.extname(imageUrl);

    const filename = enFile(title);

    // Specify the destination path to save the image
    const imagePath = `${destination}${filename}${fileExtension}`.slice(
      0,
      `${destination}${filename}${fileExtension}`.indexOf("?")
    );

    // Save the image to the specified path
    fs.writeFileSync(imagePath, imageContent);

    console.log("Image downloaded successfully:", imagePath);

    return imagePath;
    // Close the browser
    await browser.close();
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

function enFile(str) {
  const replaceSpace = str.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  let fileString = replaceSpace;
  fileString = fileString.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a");
  fileString = fileString.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e");
  fileString = fileString.replace(/ì|í|ị|ỉ|ĩ/g, "i");
  fileString = fileString.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o");
  fileString = fileString.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u");
  fileString = fileString.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y");
  fileString = fileString.replace(/đ/g, "d");
  // Some system encode vietnamese combining accent as individual utf-8 characters
  fileString = fileString.replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, ""); // Huyền sắc hỏi ngã nặng
  fileString = fileString.replace(/\u02C6|\u0306|\u031B/g, ""); // Â, Ê, Ă, Ơ, Ư

  return fileString;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = {
  Browser,
};
