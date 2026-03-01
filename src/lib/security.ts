/**
 * Security Utilities
 * RSA signing, signature verification, and encryption for Paylabs integration
 */

import { createSign, createVerify, randomBytes, createHash } from "crypto";

/**
 * RSA Sign payload with private key
 * Used for Paylabs API request signing
 */
export function signPayload(payload: string, privateKey: string): string {
  const sign = createSign("SHA256");
  sign.update(payload, "utf8");
  sign.end();
  const signature = sign.sign(privateKey, "base64");
  return signature;
}

/**
 * Verify signature with public key
 * Used for Paylabs webhook signature verification
 */
export function verifySignature(
  payload: string,
  signature: string,
  publicKey: string
): boolean {
  try {
    const verify = createVerify("SHA256");
    verify.update(payload, "utf8");
    verify.end();
    return verify.verify(publicKey, signature, "base64");
  } catch (error) {
    console.error("Signature verification failed:", error);
    return false;
  }
}

/**
 * Generate SHA256 hash of data
 */
export function sha256(data: string): string {
  return createHash("sha256").update(data).digest("hex");
}

/**
 * Generate HMAC signature
 */
export function hmacSHA256(data: string, secret: string): string {
  const hmac = createHash("sha256");
  hmac.update(data);
  hmac.update(secret);
  return hmac.digest("hex");
}

/**
 * Generate random nonce for API requests
 */
export function generateNonce(): string {
  return randomBytes(16).toString("hex");
}

/**
 * Generate timestamp in ISO 8601 format
 */
export function generateTimestamp(): string {
  return new Date().toISOString();
}

/**
 * Build Paylabs signature string for Payin API v2.1
 */
export function buildPaylabsSignatureString(params: {
  merchantId: string;
  transactionId: string;
  amount: number;
  timestamp: string;
  nonce: string;
}): string {
  const { merchantId, transactionId, amount, timestamp, nonce } = params;
  // Paylabs v2.1 signature format
  return `${merchantId}|${transactionId}|${amount.toFixed(2)}|${timestamp}|${nonce}`;
}

/**
 * Build Paylabs signature string for Remit API v1.2
 */
export function buildRemitSignatureString(params: {
  merchantId: string;
  beneficiaryId: string;
  amount: number;
  timestamp: string;
  nonce: string;
}): string {
  const { merchantId, beneficiaryId, amount, timestamp, nonce } = params;
  // Paylabs v1.2 remit signature format
  return `${merchantId}|${beneficiaryId}|${amount.toFixed(2)}|${timestamp}|${nonce}`;
}

/**
 * Sign Paylabs Payin request
 */
export function signPaylabsPayinRequest(params: {
  merchantId: string;
  transactionId: string;
  amount: number;
  privateKey: string;
}): { signature: string; timestamp: string; nonce: string } {
  const timestamp = generateTimestamp();
  const nonce = generateNonce();
  
  const signatureString = buildPaylabsSignatureString({
    merchantId: params.merchantId,
    transactionId: params.transactionId,
    amount: params.amount,
    timestamp,
    nonce,
  });
  
  const signature = signPayload(signatureString, params.privateKey);
  
  return { signature, timestamp, nonce };
}

/**
 * Sign Paylabs Remit request
 */
export function signPaylabsRemitRequest(params: {
  merchantId: string;
  beneficiaryId: string;
  amount: number;
  privateKey: string;
}): { signature: string; timestamp: string; nonce: string } {
  const timestamp = generateTimestamp();
  const nonce = generateNonce();
  
  const signatureString = buildRemitSignatureString({
    merchantId: params.merchantId,
    beneficiaryId: params.beneficiaryId,
    amount: params.amount,
    timestamp,
    nonce,
  });
  
  const signature = signPayload(signatureString, params.privateKey);
  
  return { signature, timestamp, nonce };
}

/**
 * Verify Paylabs webhook signature
 */
export function verifyPaylabsWebhook(params: {
  payload: string;
  signature: string;
  publicKey: string;
}): boolean {
  return verifySignature(params.payload, params.signature, params.publicKey);
}

/**
 * Mask sensitive data for logging
 */
export function maskSensitiveData(data: string, visibleChars: number = 4): string {
  if (data.length <= visibleChars) {
    return "*".repeat(data.length);
  }
  return "*".repeat(data.length - visibleChars) + data.slice(-visibleChars);
}

/**
 * Validate RSA private key format
 */
export function isValidPrivateKey(key: string): boolean {
  return key.includes("BEGIN RSA PRIVATE KEY") || key.includes("BEGIN PRIVATE KEY");
}

/**
 * Validate RSA public key format
 */
export function isValidPublicKey(key: string): boolean {
  return key.includes("BEGIN PUBLIC KEY") || key.includes("BEGIN RSA PUBLIC KEY");
}
