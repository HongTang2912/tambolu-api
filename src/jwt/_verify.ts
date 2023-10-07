import { JwtPayload } from "@neo4j/graphql/dist/types/jwt-payload";

const jwt = require("jsonwebtoken");
require("dotenv").config();

export const generateToken = (str: any): JwtPayload => jwt.sign(str, process.env.SECRET_KEY_JWT);

module.exports = {
  generateToken,
};
