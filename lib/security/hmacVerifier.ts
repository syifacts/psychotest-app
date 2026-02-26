import crypto from "crypto";

/**
 * Memverifikasi integritas dan keaslian payload dari Tripay menggunakan HMAC-SHA256.
 * Merupakan mitigasi utama terhadap serangan Webhook Spoofing (Manipulasi Data).
 */
export function verifyTripaySignature(
  rawBody: string,
  bodyJson: any,
  headerSignature: string | null,
): boolean {
  const privateKey = process.env.TRIPAY_PRIVATE_KEY ?? "";
  let valid = false;

  // Validasi Jalur Utama (HTTP Header) menggunakan payload mentah
  if (headerSignature) {
    const calc = crypto
      .createHmac("sha256", privateKey)
      .update(rawBody)
      .digest("hex");
    valid = headerSignature.toLowerCase() === calc.toLowerCase();
  }
  // Validasi Jalur Cadangan (Body Payload) menggunakan kombinasi parameter
  else if (bodyJson.sign) {
    const str = `${bodyJson.reference}${bodyJson.merchant_ref}${bodyJson.total_amount}`;
    const calc = crypto
      .createHmac("sha256", privateKey)
      .update(str)
      .digest("hex");
    valid = calc === bodyJson.sign;
  }

  return valid;
}
