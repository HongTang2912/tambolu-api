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
  const { category_name } = req.body;
  res.setHeader("Content-Type", "application/json");
  try {
    colorLog(`Start creating products into categories...`, "yellow");
    const data = [];
    for (let i = 0; i <= mergeJsonFiles().length; i++) {
      if (mergeJsonFiles()[i]?.title) {
        const [extract_vial_price, price] = [
          mergeJsonFiles()[i]?.prices.split(" - ")[0]?.replace("₫", "") ?? 0,
          mergeJsonFiles()[i]?.prices.split(" - ")[1]?.replace("₫", "") ?? 0,
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
            title: mergeJsonFiles()[i]?.title,
            extract_vial_price: extract_vial_price,
            price: price,
            image_url: mergeJsonFiles()[i]?.image_url ?? "",
            description: mergeJsonFiles()[i]?.description ?? "",

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
          data.push(record.get("p").properties);
        });

        colorLog(`Create Products successfully`, "green");
      }
    }
    res
      .status(200)
      .send(
        `${data.length} records have been import to "Product" node width Category name: "${category_name}"!`
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
