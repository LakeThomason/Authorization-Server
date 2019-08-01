/**
 * Interface that represents the data model for token documents
 */
export default interface IUserDocument {
  _id: string;
  client_id: string;
  roles: string[];
  token: string;
  token_birth: number;
  token_death: number;
}
