import { GraphQLFieldResolverParams } from "@apollo/server";

import { authenticate } from "./funcs/auth/login";
import { generateToken } from "../../src/jwt/_verify";

import { driver } from "../../neo4j/driver";

export const resolvers: any = {
  Query: {
    async login(parent: any, args: { username: any; password: any; }, context: any) {
      return await authenticate(
        { username: args.username, password: args.password },
        driver
      );
    },
  },

  User: {
    access_token({ username , password, email }: any) {
      return generateToken({ username, password, email });
    },
  },
};


