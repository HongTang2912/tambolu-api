import { Neo4jGraphQL } from "@neo4j/graphql";
// const neo4j = require("neo4j-driver");
import { ApolloServer } from "@apollo/server";
import { startStandaloneServer } from "@apollo/server/standalone";

import { typeDefs } from "./graphql/typeDefs.define";

//export cumstomization
import { resolvers } from "./graphql/customization/resolver";
import { driver } from "./neo4j/driver";

import dotenv from "dotenv";
import { GraphQLSchema } from "graphql/type/schema";
dotenv.config();

// Define a type for your environment variables

// Export the environment variables with the defined type
export const env: any = process.env;


const neoSchema = new Neo4jGraphQL({
  typeDefs,
  driver,
  resolvers,
  features: {
    authorization: {
      key: env.SECRET_KEY_JWT,
    },
  },
});

(async () => {
  const server = new ApolloServer({
    schema: await neoSchema
      .getSchema()
      .then((res: GraphQLSchema) => res)
      .catch((err) => {
        console.log(`An error occured: ${err}`);
        return err;
      }),
  });

  const { url } = await startStandaloneServer(server, {
    listen: { port: env.PORT },
  })
    .then((res) => res)
    .catch((err) => {
      console.log("An error occured ");
      return err;
    });

  console.log(`🚀 Server ready at ${url}`);
})();
