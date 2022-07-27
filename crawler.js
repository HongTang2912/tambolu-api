// const writeData = require('./getTicksPeople')

// async function Run() {
//     console.log('RELOAD RUNNING.....');
//     await writeData.getData();
// }

// module.exports ={

//     run: Run()
// }
const puppeteer = require("puppeteer");
const fs = require("fs");
const makeDir = require("make-dir");
const config = require("./config.json");

const neo4j = require("neo4j-driver");
const Neo4j = require("./Neo4jConnection");

// console.log(session);
const PATH = config.NEO4J_DB_CONFIG.PATH;
const USERNAME = config.NEO4J_DB_CONFIG.USERNAME;
const PASSWORD = config.NEO4J_DB_CONFIG.PASSWORD;

async function writeData() {
  const driver = neo4j.driver(PATH, neo4j.auth.basic(USERNAME, PASSWORD));
  const session = driver.session();

  let d = [];
  try {
    Neo4j.read().then(async (res) => {
      await d.push(...res);
      for (var i = 0; i < d.length; i++) {
        if (d[i].imgsrc != "" && !d.some((a) => a.link == d[i].link)) {
          await session.run(
            "CREATE (a:ProductReview {id: $id, comment_id: $cid, rating_point: $rating_point, views: $views})",
            {
              id: i.toString(16),
              cid: [],
              rating_point: [0, 0, 0, 0, 0],
              views: 0,
            }
          );

          await session.run(
            `MATCH (a:Product {id: $id, link: $link, imgSrc: $imgSrc, title: $title, price: $price, refund: $refund}), 
            (b:ProductReview {id: $id, comment_id: $cid, rating_point: $rating_point, views: $views})
            CREATE (a) <-[r:REVIEW_OF]- (b)`,
            {
              id: i.toString(16),
              link: product[i].link,
              imgSrc: product[i].imgsrc,
              title: product[i].title,
              price: product[i].price,
              refund: product[i].refund,
              cid: [],
              rating_point: [0, 0, 0, 0, 0],
              views: 0,
            }
          );
        }
        await console.log(d[i]);
      }

      await console.log("writing done");
    });
  } catch (err) {
    await console.error(err);
  } finally {
    await session.close();
  }

  // on application exit:
  await driver.close();
}

const getData = async () => {
  const path = "TWITTER_API/trending-links";
  await makeDir(path);
  let data = [];

  try {
    Neo4j.create_categories(config.LAMMUSIC_URL.HOME_PAGE);
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

        // await page.waitForSelector('input');
        // await page.type('input', config.TWITTER_URL.USER.USERNAME);
        // await page.click('.css-18t94o4.css-1dbjc4n.r-sdzlij.r-1phboty.r-rs99b7.r-ywje51.r-usiww2.r-2yi16.r-1qi8awa.r-1ny4l3l.r-ymttw5.r-o7ynqc.r-6416eg.r-lrvibr.r-13qz1uu');

        // var loginButton = ".css-1dbjc4n r-pw2am6"
        // await page.waitForSelector('input');
        // await page.type('input', config.TWITTER_URL.USER.PASSWORD);
        // await page.click(loginButton.replace(/\s/g, "."));

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
    await writeData(data);
  }
};
writeData();
