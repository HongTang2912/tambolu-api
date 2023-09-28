const { Neo4jGraphQL } = require("@neo4j/graphql");
const neo4j = require("neo4j-driver");
const { gql, ApolloServer } = require("apollo-server");
require("dotenv").config();

const typeDefs = `
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

const neoSchema = new Neo4jGraphQL({ typeDefs, driver });

neoSchema.getSchema().then((schema) => {
  const server = new ApolloServer({
    schema: schema,
  });

  server.listen().then(({ url }) => {
    console.log(`GraphQL server ready on ${url}`);
  });
});
