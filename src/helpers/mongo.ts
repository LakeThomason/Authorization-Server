import { getRequiredEnv } from "env_helper_ts";
import { IMongoDAL, MongoDAL } from "mongo_dal";
import logger from "./logger";
/******************************************************************************/
/* Define the two database collections used in application
/**************************************************************************** */
const tokenCollection: IMongoDAL = new MongoDAL(
  getRequiredEnv("DB_CONNECTION_STRING"),
  getRequiredEnv("AUTH_DB"),
  getRequiredEnv("AUTH_DB_USER_COLLECTION"),
  logger
);

const clientCollection: IMongoDAL = new MongoDAL(
  getRequiredEnv("DB_CONNECTION_STRING"),
  getRequiredEnv("AUTH_DB"),
  getRequiredEnv("AUTH_DB_CLIENT_SECRET_COLLECTION"),
  logger
);

export { tokenCollection, clientCollection };
