/**
 * Standardized object to be returned after a verification check
 */
export default interface IVerifyReturn {
  message: string;
  isVerified: boolean;
  statusCode: number;
}
