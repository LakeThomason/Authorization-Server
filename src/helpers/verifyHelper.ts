import axios from "axios";
import crypto from "crypto";
import { getRequiredEnv } from "env_helper_ts";
import { clientCollection, tokenCollection } from "../helpers/mongo";
import IClientDocument from "../interfaces/databaseModels/IClientDocument";
import IUserDocument from "../interfaces/databaseModels/IUserDocument";
import IVerifyReturn from "../interfaces/IVerifyReturn";
import IClientIDClientSecretHeaders from "../interfaces/requestHeaders/IClientIDClientSecretHeaders";
import log from "./logger";

const clientIDClientSecretGrantType = "token";

/**
 * Sends request to Allen Comm's servers to verify the access_token is legit
 * @param accessToken Bearer token provided by Allen Comm to logged in users
 * @returns User data if the token is legit, error object otherwise
 */
export function verifyAllenCommToken(accessToken: string): Promise<object> {
  return new Promise<object>((resolve, reject) => {
    axios
      .get(getRequiredEnv("ALLEN_COMM_AUTH_API"), {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

/**
 * Verifies the headers of the Client ID / Client Secret authorization flow are valid,
 * then verifies that the supplied secret is valid given the Client ID
 * Returns IVerifyReturn object
 * @param headers Headers expected in the Client ID / Client Secret authorization flow
 * @returns Promise<IVerifyReturn> resolves if db document was found with the ClientID.
 * @throws On database error or invalid headers provided to endpoint.
 */
export function verifyClientIDClientSecret(headers: IClientIDClientSecretHeaders): Promise<IVerifyReturn> {
  // Verify headers are present and the grant type is acceptable
  if (
    headers.grant_type &&
    headers.client_secret &&
    headers.client_id &&
    headers.grant_type === clientIDClientSecretGrantType
  ) {
    // Find the document
    return (
      clientCollection
        .getDocumentByQuery({ client_id: headers.client_id })
        .then((document: IClientDocument) => {
          if (!document) {
            return {
              isVerified: false,
              message: "Client ID not found",
              statusCode: 200
            } as IVerifyReturn;
          }
          // Document was found, verify token provided
          const secretDoc: IClientDocument = document;
          const hash = crypto.createHmac("sha512", secretDoc.salt);
          hash.update(headers.client_secret);
          const hashedSecret = hash.digest("hex");
          const secretIsValid = hashedSecret === secretDoc.hashed_secret;

          return {
            isVerified: secretIsValid,
            message: `Secret is ${secretIsValid ? "" : "not "}valid`,
            statusCode: 200
          } as IVerifyReturn;
        })
        // Database error
        .catch((err) => {
          log.logInfo(`${headers.client_id}: ${err.message}`);

          throw {
            isVerified: false,
            message: err.message,
            statusCode: 500
          } as IVerifyReturn;
        })
    );
  } else {
    // Headers were missing or invalid
    return Promise.resolve({
      isVerified: false,
      message: "Missing headers or incorrect grant type",
      statusCode: 400
    } as IVerifyReturn);
  }
}

/**
 * Verifies the headers exist then searches for the user document in the database
 * Promise resolves found db documents, rejects errors
 * @param headers Object containing bearer token and the client_id
 * @returns Promise<object> of the document found
 * @throws Database error
 */
export function verifySecretDocumentExists(secretKey: string, secretValue: string): Promise<IUserDocument> {
  // QOL check if token was sent with "Bearer " or "bearer " preface
  const fixedSecret = secretValue.split(" ")[1] ? secretValue.split(" ")[1] : secretValue;
  const secretObj: { [key: string]: string } = {};
  secretObj[secretKey] = fixedSecret;
  return tokenCollection
    .getDocumentByQuery(secretObj)
    .then((document: object) => {
      return document as IUserDocument;
    })
    .catch((err) => {
      // Our database messed up :/
      throw {
        isVerified: false,
        message: err.message,
        statusCode: 500
      } as IVerifyReturn;
    });
}

/**
 * Verifies that a token has not expired.. If the token has expired this function
 * attempts to delete the database document.
 * @param userDocument JSON document obtained from the USER_DB users collection
 * @param clientID ClientID of the application calling the endpoint
 * @returns True if token is alive, false if the token is dead
 */
export function verifyTokenIsAlive(userDocument: IUserDocument): boolean {
  // Check if token is expired
  if (new Date().getTime() >= userDocument.token_death) {
    // Token is expired, remove expired token from database
    log.logInfo("Deleting an expired user document");
    tokenCollection.deleteDocumentByID(userDocument._id).catch((err) => {
      log.logError(`Expired token document not deleted when it should be! _id: ${userDocument._id}`, err);
    });
    return false;
  } else {
    // Token is alive and well
    log.logInfo(`${userDocument.client_id}: token is valid, authorizing `);
    return true;
  }
}
