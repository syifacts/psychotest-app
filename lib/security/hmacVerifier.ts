import crypto from "crypto";

// 1. [CLEAN CODE] Interface Payload Tripay
interface TripayPayload {
  reference?: string;
  merchant_ref?: string;
  total_amount?: number;
  sign?: string;
  [key: string]: any;
}

// 2. [ADVANCED SECURITY] Helper: Secure Constant-Time Compare
// Fungsi low-level ini yang membedakan kode Skripsi lu dengan kode tutorial biasa
function secureCompare(
  signatureInput: string,
  calculatedHmac: string,
): boolean {
  try {
    // Membaca signature di level Memory Byte (Hexadecimal murni)
    const inputBuffer = Buffer.from(signatureInput, "hex");
    const calcBuffer = Buffer.from(calculatedHmac, "hex");

    // [MITIGASI DENIAL OF SERVICE (DoS)]
    // Mencegah server Node.js crash (Fatal Error) jika hacker mengirim
    // signature palsu dengan panjang karakter yang tidak valid.
    if (inputBuffer.length !== calcBuffer.length) {
      return false;
    }

    // [MITIGASI TIMING ATTACK]
    // Komparasi konstan: waktu eksekusi selalu sama persis meskipun tebakan hacker salah,
    // sehingga penyerang tidak bisa menganalisis selisih waktu respon server.
    return crypto.timingSafeEqual(inputBuffer, calcBuffer);
  } catch (error) {
    // Tangkap error jika hacker mengirim karakter non-hex berbahaya (misal emoji/unicode aneh)
    return false;
  }
}

export function verifyTripaySignature(
  rawBody: string,
  bodyJson: TripayPayload,
  headerSignature: string | null,
): boolean {
  const privateKey = process.env.TRIPAY_PRIVATE_KEY ?? "";

  if (!privateKey) {
    console.error(
      "⚠️ [System Critical] TRIPAY_PRIVATE_KEY tidak ditemukan di environment!",
    );
    return false;
  }

  // A. Validasi Jalur Utama (HTTP Header X-Callback-Signature)
  if (headerSignature) {
    const calc = crypto
      .createHmac("sha256", privateKey)
      .update(rawBody)
      .digest("hex");

    // Ganti '===' dengan secureCompare
    return secureCompare(headerSignature.toLowerCase(), calc.toLowerCase());
  }

  // B. Validasi Jalur Cadangan (Parameter 'sign' di dalam Body JSON)
  if (bodyJson.sign) {
    const str = `${bodyJson.reference}${bodyJson.merchant_ref}${bodyJson.total_amount}`;
    const calc = crypto
      .createHmac("sha256", privateKey)
      .update(str)
      .digest("hex");

    // Ganti '===' dengan secureCompare
    return secureCompare(bodyJson.sign.toLowerCase(), calc.toLowerCase());
  }

  // Jika header dan body tidak memiliki signature, otomatis blokir
  return false;
}
