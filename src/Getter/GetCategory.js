const { session, driver } = require("./Neo4jConnection");

const getCategory = async () => {
  const result = await session.run("MATCH (n:Category) RETURN n LIMIT 5");
  result.records.forEach((record) => {
    console.log(record.get("n").properties);
  });
  session.close();
  driver.close();
};

getCategory();
