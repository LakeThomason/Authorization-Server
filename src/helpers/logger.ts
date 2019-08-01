import { getRequiredEnv, ToNumber, ToStringArray } from "env_helper_ts";
import fs from "fs";
import { ILoggerConstructor, Logger } from "post_ltr_logger";

const json: { name: string } = JSON.parse(fs.readFileSync("package.json", "utf8"));
const packageName: string = json.name;

const config: ILoggerConstructor = {
  applicationName: "Authorization Server",
  emailHost: getRequiredEnv("LOG_NOTIFICATION_HOST"),
  emailList: getRequiredEnv("LOG_LOG_EMAIL_LIST", ToStringArray),
  emailPort: getRequiredEnv("LOG_NOTIFICATION_PORT", ToNumber),
  logAPI: getRequiredEnv("LOG_API"),
  nodeENV: getRequiredEnv("NODE_ENV"),
  senderEmail: getRequiredEnv("LOG_NOTIFICATION_EMAIL"),
  token: getRequiredEnv("LOG_TOKEN"),
  userID: packageName
};

const log = new Logger(config);
export default log;
