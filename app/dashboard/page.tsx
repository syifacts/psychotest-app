"use client";

import React from "react";
import styles from "./Dashboard.module.css";
import Link from "next/link";

const BerandaPage = () => {
  const daftarTes = [
    "Tes IST",
    "Tes Kraepelin",
    "Tes Wartegg",
    "Tes Pauli",
    "Tes MBTI",
    "Tes DISC",
    "Tes Big Five",
    "Tes EQ",
  ];

  function slugify(tes: string): string {
    // Ambil kata kedua, misal "Tes IST" -> "ist"
    const parts = tes.split(" ");
    return parts.length > 1 ? parts[1].toLowerCase() : tes.toLowerCase();
  }

  return (
    <div className={styles.container}>
      {/* Header */}

      {/* Konten */}
      <main className={styles.main}>
        <h2>Daftar Tes Psikologi</h2>
        <div className={styles.grid}>
          {daftarTes.map((tes, i) => (
            <div key={i} className={styles.card}>
              <h3>{tes}</h3>
              <Link href={`/tes/${slugify(tes)}`}>
                <button>Ikuti Tes</button>
              </Link>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default BerandaPage;
