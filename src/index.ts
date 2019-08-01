// Other imports
import express from "express";
import * as routes from "./endpoints";
import log from "./helpers/logger";

const app = express();
const port = process.env.PORT || 4004; // It is required by Azure to use "PORT" instead of "SERVER_PORT"
const deadEndpoint = "This endpoint is currently in construction";

/**
 * Redirects caller to Allen Comm's login page
 * Requires a valid redirect_uri header so we know where to return to
 */
app.get("/oauth/login?", (req, res) => {
  // routes.allenCommLogin(req, res);
  res.send(deadEndpoint);
});

/**
 * Allen Comm's servers redirect here after a user logs in
 * This endpoint should not be called by any other user or program, but
 * it's fine if they try
 */
app.get("/oauth/loginRedirect?", (req, res) => {
  // routes.loginRedirect(req, res);
  res.send(deadEndpoint);
});

/**
 * Client ID / Client Secret Authorization flow
 * Requires client_id, client_secret, grant_type headers
 */
app.get("/oauth/secret?", (req, res) => {
  routes.secretAuthorization(req, res);
});

/**
 * Verifies a bearer token provided by the auth_ts_server
 * Requires token, and client_id headers
 */
app.get("/oauth/verifyToken?", (req, res) => {
  routes.verifyToken(req, res);
});

/**
 * Verifies an access_token from Allen Comm
 * Requires access_token header
 */
app.get("/oauth/verifyAllenCommToken", (req, res) => {
  // routes.verifyAllenCommToken(req, res);
  res.send(deadEndpoint);
});

/**
 * Begin running express server, listening on specified port
 */
app.listen(port, () => {
  log.logInfo(`auth_server_ts began running on port ${port}`).catch((err) => {
    // tslint:disable-next-line:no-console
    console.error(`The logger isn't configured properly! Logs may not be stored. Error: ${err}`);
  });
});
