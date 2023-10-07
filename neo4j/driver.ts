import { Driver } from "neo4j-driver";
import neo4j from "neo4j-driver";

import dotenv from "dotenv";

// Load environment variables from a .env file
dotenv.config();
const env: any = process.env;


export const driver: Driver = neo4j.driver(
  env.DB_URL,
  neo4j.auth.basic(env.DB_USERNAME, env.DB_PASSWORD)
);

