import { GraphQLFieldResolverParams } from "@apollo/server";

import { authenticate, isMatchedPassword } from "./funcs/auth/login";
import { generateToken } from "../../src/jwt/_verify";

import { driver } from "../../neo4j/driver";
import { GraphQLSchema } from "graphql";

export const resolvers: any = {
  Query: {
    async login(parent: any, args: { username: any; password: any; }, context: any) {


      const user = await authenticate(
        { username: args.username, password: args.password },
        driver
      ).then((res: GraphQLSchema) => res)
      .catch((err) => {
        console.log(`An error occured: ${err}`);
        return err;
      });

      if (user.status) return user;
    },
  },

  User: {
    async access_token({ username , password, email }: any) {
      const user = await authenticate(
        { username, password },
        driver
      ).then((res: GraphQLSchema) => res) .catch((err) => {
        console.log(`An error occured: ${err}`);
        return err;
      });
      if (user.status)
       return generateToken({ username, password, email });
      else {
        return user;
      }
    },
  },
};


