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
    // Proses komputasi pembuatan Signature (Stempel Digital):
    // 1. Inisialisasi objek HMAC dengan algoritma SHA-256 dan Private Key merchant.
    // 2. Masukkan muatan data mentah (rawBody) ke dalam fungsi hash.
    // 3. Hasilkan output akhir komputasi (digest) dalam format string heksadesimal.
    const calc = crypto
      .createHmac("sha256", privateKey)
      .update(rawBody)
      .digest("hex");

    // Evaluasi komparasi string antara hash komputasi lokal dengan signature eksternal.
    // Dikonversi ke huruf kecil (toLowerCase) untuk mencegah kegagalan akibat case-sensitivity.
    valid = headerSignature.toLowerCase() === calc.toLowerCase();
  }
  // Validasi Jalur Cadangan (Body Payload) menggunakan kombinasi parameter
  else if (bodyJson.sign) {
    // Penggabungan nilai parameter secara sekuensial sesuai standar dokumentasi API Tripay
    const str = `${bodyJson.reference}${bodyJson.merchant_ref}${bodyJson.total_amount}`;

    // Proses hash HMAC-SHA256 yang sama seperti jalur utama, namun menggunakan string gabungan
    const calc = crypto
      .createHmac("sha256", privateKey)
      .update(str)
      .digest("hex");

    valid = calc === bodyJson.sign;
  }

  return valid;
}
