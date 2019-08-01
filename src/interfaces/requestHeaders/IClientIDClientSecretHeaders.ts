/**
 * Interface that represents an incoming request for ClientID / Client Secret authorization
 */
export default interface IClientIDClientSecretHeaders {
  client_id: string;
  client_secret: string;
  grant_type: string;
}
