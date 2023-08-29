const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

(async (url) => {
  // Launch a browser instance (non-headless)
  const browser = await puppeteer.launch();

  // Open a new page
  const page = await browser.newPage();

  // Navigate to a URL with the image
  const imageUrl =
    "https://phongkhambenhxahoitiengiang.vn/upload/hinhanh/bxh-tiengiang-3.jpg";
  await page.goto(imageUrl);

  // Get the image's response
  const imageResponse = await page.goto(imageUrl);

  // Extract the image's content and file extension
  const imageContent = await imageResponse.buffer();
  const fileExtension = path.extname(imageUrl);

  // Specify the destination path to save the image
  const imagePath = path.join(__dirname, "downloaded-image" + fileExtension);

  // Save the image to the specified path
  fs.writeFileSync(imagePath, imageContent);

  console.log("Image downloaded successfully:", imagePath);

  // Close the browser
  await browser.close();
})();
