/**
 * Implementation of index.ts routes for authorization and verification
 */
import { Request, Response } from "express";
import { types } from "util";
import postLogger from "./helpers/logger";
import { tokenCollection } from "./helpers/mongo";
import { generateTokenDocument } from "./helpers/secrets";
import * as verifyHelper from "./helpers/verifyHelper";
import IUserDocument from "./interfaces/databaseModels/IUserDocument";
import IVerifyReturn from "./interfaces/IVerifyReturn";
import IClientIDClientSecretHeaders from "./interfaces/requestHeaders/IClientIDClientSecretHeaders";

const deadTokenResponse: IVerifyReturn = {
  isVerified: false,
  message: "Token is dead",
  statusCode: 401
};

const tokenIsVerifiedResponse: IVerifyReturn = {
  isVerified: true,
  message: "Token is verified",
  statusCode: 200
};

/**
 * /oauth/secret
 * Performs Client ID / Client Secret authorization flow
 * res.sends() either an IUserDocument on successful authentication or
 * res.sends() IVerifyReturn on errors
 */
export function secretAuthorization(req: Request, res: Response): void {
  const clientID = req.query.client_id;
  if (clientID) {
    let tokenDocument: IUserDocument;
    postLogger.logInfo(`Began ClientID/Client Secret authorization flow on Client ID: ${clientID}`);

    // Verify the Client ID / Client Secret are valid
    verifyHelper
      .verifyClientIDClientSecret(req.query as IClientIDClientSecretHeaders)
      .then((response: IVerifyReturn) => {
        if (!response.isVerified) {
          // Unauthorized
          postLogger.logInfo(`${clientID} provided an incorrect client secret`);
          res.status(response.statusCode).send(response);
          return;
        } else {
          // Check if the document exists in the DB
          return verifyHelper.verifySecretDocumentExists("client_id", clientID).then((document: IUserDocument) => {
            if (document && verifyHelper.verifyTokenIsAlive(document)) {
              // Document already exists and is still valid
              postLogger.logInfo("Document already exists, checking document life");
              tokenDocument = document;
            } else {
              // Document doesn't exist.. create a new document
              postLogger.logInfo(`Generating a new token document for ${clientID}`);
              tokenDocument = generateTokenDocument(clientID, ["app"]);
              return tokenCollection.insertDocument(tokenDocument);
            }
          });
        }
      })
      .then(() => {
        if (tokenDocument) {
          postLogger.logInfo(`${clientID}: sending document, ID: ${tokenDocument._id}`);
          // Send the token information to the caller
          res.send(tokenDocument);
        }
      })
      .catch((err) => {
        postLogger.logError(err.message, err);
        res.sendStatus(500);
      });
  } else {
    res.sendStatus(400);
  }
}

/**
 * Verifies a bearer token against the database
 * Checks if the mongo document holding the token exists and the token is alive. Attempts to relay specific failure information back
 * to caller
 */
export function verifyToken(req: Request, res: Response): void {
  postLogger.logInfo("Began verifying a secret...");
  // Verifies a db document exists with bearer token and client_id
  if (req.query.token) {
    verifyHelper
      .verifySecretDocumentExists("token", req.query.token)
      .then((document: IUserDocument) => {
        // if the document is exists
        if (document) {
          // check if the token is alive
          const tokenIsAlive = verifyHelper.verifyTokenIsAlive(document);
          return tokenIsAlive ? tokenIsVerifiedResponse : deadTokenResponse;
        } else {
          postLogger.logInfo("Token not found in DB");
          return {
            isVerified: false,
            message: "Could not find token in database",
            statusCode: 200
          } as IVerifyReturn;
        }
      })
      .then((response: IVerifyReturn) => {
        // Secret document exists and is alive
        // Send results back to caller
        res.status(response.statusCode).send(response as IVerifyReturn);
      })
      // Bad headers, document was not found in DB, or the token had expired
      .catch((err) => {
        // Catch unexpected error
        if (types.isNativeError(err)) {
          postLogger.logError(err.message, err);
          res.sendStatus(500);
        } else {
          postLogger.logInfo(err.message);
          res.status(err.statusCode).send(err.message);
        }
      });
  } else {
    res.status(400).send("Missing token header");
  }
}
