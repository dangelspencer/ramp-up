// Mock for expo-crypto module
export function randomUUID(): string {
  return 'test-uuid-' + Math.random().toString(36).substr(2, 9);
}

export function getRandomBytes(byteCount: number): Uint8Array {
  const bytes = new Uint8Array(byteCount);
  for (let i = 0; i < byteCount; i++) {
    bytes[i] = Math.floor(Math.random() * 256);
  }
  return bytes;
}

export function getRandomBytesAsync(byteCount: number): Promise<Uint8Array> {
  return Promise.resolve(getRandomBytes(byteCount));
}

export async function digestStringAsync(
  _algorithm: string,
  data: string
): Promise<string> {
  // Simple hash simulation for testing
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16).padStart(64, '0');
}

export const CryptoDigestAlgorithm = {
  SHA1: 'SHA-1',
  SHA256: 'SHA-256',
  SHA384: 'SHA-384',
  SHA512: 'SHA-512',
  MD5: 'MD5',
};

export const CryptoEncoding = {
  HEX: 'hex',
  BASE64: 'base64',
};
