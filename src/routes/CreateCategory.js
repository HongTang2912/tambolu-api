const express = require("express");

const router = express.Router();

const mergeJsonFiles = require("../modules/readFilesInFolder");
const colorLog = require("../modules/coloringMessage");
const { session, driver } = require("../db/Neo4jConnection");
const config = require("../../config.json").NUOC_HOA_BLANC.CATEGORY;

router.get("/create-category", async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  try {
    colorLog(`Start creating categories...`, "yellow");
    const data = [];
    for (let i = 0; i <= config.length; i++) {
      const result = await session.run(
        `MERGE (c:Category {name: $name, url: $url}) RETURN c`,
        {
          name: config[i].name,
          url: config[i].url,
        }
      );

      result.records.forEach((record) => {
        console.log(record.get("c").properties);
        data.push(record.get("c").properties);
      });
      colorLog(`Create category successfully`, "green");
    }
    res.status(200).send(record.get("c").properties);
  } catch (err) {
    res.status(400).send(`Error request`);
    console.log("Server has caused an errror: ", err);
  } finally {
    await session.close();
    // await driver.close();
    colorLog(`END`, "magenta");
  }
});

router.post("/create-product-in-category", async (req, res) => {
  const { path } = req.body;
  res.setHeader("Content-Type", "application/json");
  try {
    colorLog(`Start creating products into categories...`, "yellow");
    const data = [];
    const jsonData = mergeJsonFiles(path);
    for (let i = 0; i <= jsonData?.length; i++) {
      if (jsonData[i]?.title) {
        const [extract_vial_price, price] = [
          jsonData[i]?.prices.split(" - ")[0]?.replace("₫", "") ?? 0,
          jsonData[i]?.prices.split(" - ")[1]?.replace("₫", "") ?? 0,
        ];
        const result = await session.run(
          `MATCH (c:Category {name: $categoryName}) 
          MERGE (p:Product {
              title: $title,
              extract_vial_price: $extract_vial_price,
              price: $price,
              image_url: $image_url,
              description: $description
          })
          MERGE (p)-[:IN_CATEGORY]->(c)
          RETURN p`,
          {
            // Product params
            title: jsonData[i]?.title,
            extract_vial_price: extract_vial_price
              ? parseInt(extract_vial_price?.replace(/\./g, ""))
              : 0,
            price: price ? parseInt(price?.replace(/\./g, "")) : 0,
            image_url: jsonData[i]?.image_url ?? "",
            description: jsonData[i]?.description ?? "",

            // Category params
            categoryName: config.find((field) => field.path == path)?.name,
          }
        );
        result.records.forEach((record) => {
          console.log(
            `${
              record.get("p").properties.length
            } records have been import to "Product" node width Category name: "${
              config.find((field) => field.path == path)?.name
            }"!`
          );
          data.push(record.get("p").properties);
        });

        colorLog(`Create Products successfully`, "green");
      }
    }
    res
      .status(200)
      .send(
        `${
          data.length
        } records have been import to "Product" node width Category name: "${
          config.find((field) => field.path == path)?.name
        }"!`
      );
  } catch (err) {
    res.status(400).send(`Error request`);
    console.log("Server has caused an errror: ", err);
  } finally {
    session.close();
    colorLog(`END`, "magenta");
  }
});

module.exports = router;
