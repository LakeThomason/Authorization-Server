// Configure dotenv before any other imports
import dotenv from "dotenv-flow";
dotenv.config();
import { IVault, Vault } from "env_helper_ts";

const secretNames: string[] = [
  "LOG_NOTIFICATION_HOST",
  "LOG_NOTIFICATION_PORT",
  "LOG_NOTIFICATION_EMAIL",
  "LOG_LOG_EMAIL_LIST",
  "AUTH_APPLICATION_ID",
  "ALLEN_COMM_CLIENT_ID",
  "ALLEN_COMM_CLIENT_SECRET",
  "AUTH_CODE_LIFE",
  "AUTH_TOKEN_LIFE",
  "AUTH_REFRESH_AUTH_TOKEN_LIFE",
  "AUTH_DB",
  "AUTH_DB_USER_COLLECTION",
  "AUTH_DB_CLIENT_SECRET_COLLECTION",
  "AUTH_DB_AUTH_COLLECTION",
  "AUTH_VALID_CLIENTS",
  "AUTH_REDIRECT_URIS",
  "AUTH_SECRET_LENGTH",
  "AUTH_TOKEN_LENGTH",
  "AUTH_SALT_LENGTH",
  "AUTH_CODE_LENGTH",
  "LOG_TOKEN",
  "AUTH_API",
  "LOG_API",
  "DB_CONNECTION_STRING",
  "ALLEN_COMM_AUTH_API",
  "ALLEN_COMM_LOGIN_URI",
  "NODE_ENV"
];

const myVault: IVault = new Vault();
myVault
  .getAccessToken()
  .then(() => {
    return Promise.all(myVault.getSecretsFromVault(secretNames));
  })
  .then(() => {
    import("./index");
  });
