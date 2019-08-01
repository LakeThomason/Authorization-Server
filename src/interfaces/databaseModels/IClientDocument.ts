/**
 * Interface that represents the data model for ClientID / Client Secret documents
 */
export default interface IClientDocument {
  client_id: string;
  hashed_secret: string;
  salt: string;
}
