import crypto from "crypto";
import { getRequiredEnv, ToNumber } from "env_helper_ts";
import IUserDocument from "../interfaces/databaseModels/IUserDocument";

/**
 * Generates a cryptographically secure string of a specified length
 * @param length The length of the secret to be generated
 * @returns The generated secret
 */
function generateSecret(length: number): string {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString("hex")
    .slice(0, length);
}

/**
 * Generates a mongoDB document that contains token information
 * @param clientID The clientID of the application
 * @param definedRole The role that defines what this TokenDocument is allowed to do
 */
function generateTokenDocument(clientID: string, definedRoles: string[]): IUserDocument {
  // Client is authorized, make the User Document (containing bearer token)
  const tokenLife = getRequiredEnv("AUTH_TOKEN_LIFE", ToNumber);
  const tokenDocument: IUserDocument = {
    _id: undefined,
    client_id: clientID,
    roles: definedRoles,
    token: `${generateSecret(getRequiredEnv("AUTH_TOKEN_LENGTH", ToNumber))}X${definedRoles.join(",")}`,
    token_birth: new Date().getTime(),
    token_death: new Date().getTime() + tokenLife
  };

  // Insert document into user collection
  return tokenDocument;
}

export { generateTokenDocument, generateSecret };
