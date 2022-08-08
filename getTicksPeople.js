const puppeteer = require("puppeteer");
const fs = require("fs");
const config = require("./config.json");
const neo4jImport = require("./Neo4jConnection");

const getData = async () => {
  let data = [];

  try {
    neo4jImport.create_categories(config.LAMMUSIC_URL.HOME_PAGE);
    const browser = await puppeteer.launch({
      headless: config.BROWSER_CONFIG.HEADLESS_SETTING,
    });
    for (let index = 0; index < config.LAMMUSIC_URL.HOME_PAGE.length; index++) {
      const page = await browser.newPage();
      for (let i = 1; i <= config.LAMMUSIC_URL.HOME_PAGE[i].limit_page; i++) {
        await page.goto(`${config.LAMMUSIC_URL.HOME_PAGE[index].url}?p=${i}`, {
          waitUntil: config.BROWSER_CONFIG.WAIT_UNTIL,
          timeout: config.BROWSER_CONFIG.TIMEOUT,
        });

        await page.setViewport({
          width: config.BROWSER_CONFIG.VIEWPORT.WIDTH,
          height: config.BROWSER_CONFIG.VIEWPORT.HEIGHT,
        });

        let links = await getLinks(
          page,
          config.LAMMUSIC_URL.HOME_PAGE[index].name
        );

        await data.push(...links);
      }
      console.log(
        `links: ${config.LAMMUSIC_URL.HOME_PAGE[index].url} - ${data.length}`
      );
      await page.close();
    }
    await browser.close();
  } catch (e) {
    console.log("ERR: " + e);
  } finally {
    const filteredData = data.map((obj) => JSON.stringify(obj)).map((str) => JSON.parse(str));
    await neo4jImport.write(filteredData)
    await fs.writeFile('./TWITTER_API/linksProduct.json', data.map((obj) => JSON.stringify(obj.linkTo)), 'utf8');
  }
};

// const saveImgs = async () => {
//   const items = imgLinks;

//   const browser = await puppeteer.launch({
//     headless: config.BROWSER_CONFIG.HEADLESS_SETTING,
//   });
//   await items.forEach(async (item) => {
//     const page = await browser.newPage();
//     if (item.image != "") {
//       await page.goto(item.image, {
//         waitUntil: config.BROWSER_CONFIG.WAIT_UNTIL,
//       });

//       await page.setViewport({
//         width: 240,
//         height: 190,
//       });
//       await page.screenshot({
//         path: `TWITTER_API/trending-links/${item.image.replace(
//           "https://linhkienlammusic.com/thumbs/204x190x2/upload/product/",
//           ""
//         )}`,
//       });
//     }
//   });
// };

const getLinks = async (page, category) => {
  const importValue = {
    config: config,
    category: category,
  };
  const data = await page.evaluate(async (config) => {
    var articles = await new Promise((resolve, reject) => {
      var totalHeight = 0;
      var distance = config.config.SCROLL_HEIGHT;
      var news = [];
      var timer = setInterval(() => {
        const trendEle = document.querySelectorAll(
          ".col-pro".replace(/\s/g, ".")
        );
        const newArray = Array.from(
          new Set(news.map((el) => JSON.stringify(el)))
        ).map((el) => JSON.parse(el));
        window.scrollBy(0, distance);

        var scrollHeight = document.body.scrollHeight;

        totalHeight += distance;

        if (totalHeight >= scrollHeight - window.innerHeight) {
          resolve(newArray);
        } else {
          trendEle.forEach((link) => {
            const imgSrc = link.querySelector("div div a img").src;
            const title = link.querySelector("div div.info div h3 a").innerHTML;
            const linkTo = link.querySelector("div div.info div h3 a").href;
            const price = link.querySelector(
              "div div.info div.price span.ban"
            ).innerHTML;
            const baohanh = link.querySelector(
              "div div.info div.baohanh"
            ).innerHTML;
            if (imgSrc != "" || imgSrc != null || imgSrc != undefined)
              news.push({
                category: config.category == "" ? "main" : config.category,
                link: linkTo,
                imgsrc: imgSrc,
                title: title,
                price: price,
                refund: baohanh,
              });
          });
        }

        if (totalHeight >= 50000) {
          totalHeight = 0;
          window.scrollBy(0, -10000);
        }
        console.log(newArray.length);
      }, config.config.DELAY);
    });
    return articles;
  }, importValue);
  return data;
};

module.exports = {
  getData,
};
