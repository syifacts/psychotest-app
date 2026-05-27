import nacl from "tweetnacl";
import crypto from "crypto";
import { prisma } from "./lib/prisma";

const AES_KEY = Buffer.from(process.env.KEY_ENCRYPTION_SECRET!, "hex");

// Encrypt private key
function encryptPrivateKey(privateKey: string): string {
  const iv = crypto.randomBytes(16);

  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    AES_KEY,
    iv
  );

  let encrypted = cipher.update(privateKey, "utf8", "hex");
  encrypted += cipher.final("hex");

  return `${iv.toString("hex")}:${encrypted}`;
}

async function generateKeysForExistingUsers() {
  const psikologs = await prisma.user.findMany({
  where: {
    role: "PSIKOLOG"
  }
});

  for (const user of psikologs) {
    const keyPair = nacl.sign.keyPair();

    const publicKey = Buffer.from(
      keyPair.publicKey
    ).toString("base64");

    const privateKey = Buffer.from(
      keyPair.secretKey
    ).toString("base64");

    // Encrypt sebelum simpan
    const encryptedPrivateKey =
      encryptPrivateKey(privateKey);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        PublicKey: publicKey,
        PrivateKey: encryptedPrivateKey
      }
    });
  }

  console.log("✅ Semua psikolog lama sudah punya key");
}

generateKeysForExistingUsers();