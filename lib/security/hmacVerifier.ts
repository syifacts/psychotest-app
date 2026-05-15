import crypto from "crypto";

interface TripayPayload {
  reference?: string;
  merchant_ref?: string;
  total_amount?: number;
  sign?: string;
  [key: string]: any;
}

function secureCompare(
  signatureInput: string,
  calculatedHmac: string,
): boolean {
  try {
    const inputBuffer = Buffer.from(signatureInput, "hex");
    const calcBuffer = Buffer.from(calculatedHmac, "hex");

    if (inputBuffer.length !== calcBuffer.length) return false;

    return crypto.timingSafeEqual(inputBuffer, calcBuffer);
  } catch (error) {
    return false;
  }
}

export function verifyTripaySignature(
  rawBody: string,
  bodyJson: TripayPayload,
  headerSignature: string | null,
): boolean {
  const privateKey = process.env.TRIPAY_PRIVATE_KEY ?? "";
  if (!privateKey) return false;

  if (headerSignature) {
    const calc = crypto
      .createHmac("sha256", privateKey)
      .update(rawBody)
      .digest("hex");
    return secureCompare(headerSignature.toLowerCase(), calc.toLowerCase());
  }

  // B. Validasi dari Body JSON (Jalur Cadangan)
  if (bodyJson.sign) {
    const str = `${bodyJson.reference}${bodyJson.merchant_ref}${bodyJson.total_amount}`;
    const calc = crypto
      .createHmac("sha256", privateKey)
      .update(str)
      .digest("hex");
    return secureCompare(bodyJson.sign.toLowerCase(), calc.toLowerCase());
  }

  // Tolak otomatis jika tidak ada signature sama sekali (Mitigasi Omission Attack)
  return false;
}
