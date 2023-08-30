const express = require("express");

const router = express.Router();

const mergeJsonFiles = require("../modules/readFilesInFolder");
const colorLog = require("../modules/coloringMessage");
const { session, driver } = require("../db/Neo4jConnection");
const config = require("../../config.json").NUOC_HOA_BLANC.CATEGORY;

router.get("/create-category", async (req, res) => {
  res.set("Content-Type", "application/json");
  try {
    for (let i = 0; i <= config.length; i++) {
      colorLog(`Start creating categories...`, "yellow");
      const result = await session.run(
        `MERGE (c:Category {name: $name, url: $url}) RETURN c`,
        {
          name: config[i].name,
          url: config[i].url,
        }
      );
      result.records.forEach((record) => {
        console.log(record.get("c").properties);
        res.send(record.get("c").properties);
      });

      colorLog(`Create category successfully`, "green");
    }
  } catch (err) {
    res.status(400).send(`Error request`);
    console.log("Server has caused an errror: ", err);
  } finally {
    await session.close();
    await driver.close();
    colorLog(`END`, "magenta");
  }
});

router.post("/create-product-in-category", async (req, res) => {
  const { category_name } = req.body;
  res.set("Content-Type", "application/json");
  try {
    for (let i = 0; i <= mergeJsonFiles().length; i++) {
      colorLog(`Start creating products into categories...`, "yellow");
      const [extract_vial_price, price] = [
        mergeJsonFiles()[i].prices.split(" - ")[0].replace("₫", ""),
        mergeJsonFiles()[i].prices.split(" - ")[1].replace("₫", ""),
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
          title: mergeJsonFiles()[i].title,
          extract_vial_price: extract_vial_price,
          price: price,
          image_url: mergeJsonFiles()[i].image_url,
          description: mergeJsonFiles()[i].description,

          // Category params
          categoryName: category_name,
        }
      );
      result.records.forEach((record) => {
        console.log(
          `${
            record.get("p").properties.length
          } records have been import to "Product" node width Category name: "${category_name}"!`
        );
        res
          .status(200)
          .send(
            `${
              record.get("p").properties.length
            } records have been import to "Product" node width Category name: "${category_name}"!`
          );
      });
      session.close();
      driver.close();

      colorLog(`Create Products successfully`, "green");
    }
  } catch (err) {
    res.status(400).send(`Error request`);
    console.log("Server has caused an errror: ", err);
  } finally {
    colorLog(`END`, "magenta");
  }
});

module.exports = router;
