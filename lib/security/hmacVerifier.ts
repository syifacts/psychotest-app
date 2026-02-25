import crypto from "crypto";

export function verifyTripaySignature(
  rawBody: string,
  bodyJson: any,
  headerSignature: string | null,
): boolean {
  const privateKey = process.env.TRIPAY_PRIVATE_KEY ?? "";
  let valid = false;

  // Cek jalur Header (Jalur Utama Webhook Tripay)
  if (headerSignature) {
    const calc = crypto
      .createHmac("sha256", privateKey)
      .update(rawBody)
      .digest("hex");
    valid = headerSignature.toLowerCase() === calc.toLowerCase();
  }
  // Cek jalur Body (Jalur Cadangan / Redirect)
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
