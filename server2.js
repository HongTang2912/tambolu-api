const { Neo4jGraphQL } = require("@neo4j/graphql");
const neo4j = require("neo4j-driver");
const { gql, ApolloServer } = require("apollo-server");
const { startStandaloneServer } = require("@apollo/server/standalone");
require("dotenv").config();

const typeDefs = `#graphql
  type Category {
    name: String!
    url: String!

    products: [Product!]! @relationship(type: "IN_CATEGORY", direction: IN)
  }

  type Product {
    title: String!
    description: String
    price: Int!
    extract_vial_price: Int!
    image_url: String
    category: [Category!]! @relationship(type: "IN_CATEGORY", direction: OUT)
  }


`;

const driver = neo4j.driver(
  process.env.DB_URL,
  neo4j.auth.basic(process.env.DB_USERNAME, process.env.DB_PASSWORD)
);

const neoSchema = new Neo4jGraphQL({
  typeDefs,
  driver,
});

const schema = neoSchema.getSchema().then((schema) => schema);
const server = new ApolloServer({
  schema: schema,
});
(async() => {

  const { url } = await startStandaloneServer(server, {
    listen: { port: 4000 },
    context: async ({ req }) => ({
      token: req.headers.authorization,
    }),
  });
})()

