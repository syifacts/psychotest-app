import Link from "next/link";

export default function FloatingVerifyButton() {
  return (
    <Link
      href="/verify-file"
      target="_blank"
      rel="noopener noreferrer"
      className="verify-floating-btn"
    >
      <span>🔍</span>
      <span>Verifikasi Dokumen</span>
    </Link>
  );
}