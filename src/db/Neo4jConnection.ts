const neo4j = require("neo4j-driver");
// const config = require("./config.json");
require("dotenv").config();

// console.log(session);
const URL = process.env.DB_URL;
const USERNAME = process.env.DB_USERNAME;
const PASSWORD = process.env.DB_PASSWORD;


const driver = neo4j.driver(URL, neo4j.auth.basic(USERNAME, PASSWORD));

// Check if the connection is successful
driver.verifyConnectivity()
  .then(() => {
    console.log('Connected to Neo4j database successfully!');
  })
  .catch(error => {
    console.error('Error connecting to Neo4j database:', error);
  });

// Close the driver when done


const session = driver.session();

module.exports = {
  session,
  driver,
};