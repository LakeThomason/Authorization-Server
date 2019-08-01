/**
 * Interface that represents the data model for authorization code documents
 */
export default interface IAuthDocuments {
  client_id: string;
  code_challenge: string;
  state: string;
  auth_code: string;
}
