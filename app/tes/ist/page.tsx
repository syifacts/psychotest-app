"use client";

import React from "react";
import styles from "./Ist.module.css";
import Link from "next/link";

const TesISTPage = () => {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Tes IST (Intelligence Structure Test)</h1>
      <p className={styles.description}>
        Tes ini bertujuan untuk mengukur inteligensi berdasarkan 9 komponen utama,
        yaitu:
      </p>
      <ul className={styles.list}>
        <li><b>Satzerganzung (SE)</b> → melengkapi kalimat</li>
        <li><b>Wortauswahl (WA)</b> → melengkapi kata</li>
        <li><b>Analogien (AN)</b> → persamaan kata</li>
        <li><b>Gemeinsamkeiten (GE)</b> → sifat yang dimiliki bersama</li>
        <li><b>Rechhenaufgaben (RA)</b> → kemampuan berhitung</li>
        <li><b>Zahlenreihen (SR)</b> → deret angka</li>
        <li><b>Figurenauswahl (FA)</b> → memilih bentuk</li>
        <li><b>Wurfelaufgaben (WU)</b> → latihan balok</li>
        <li><b>Merkaufgaben (ME)</b> → latihan simbol</li>
      </ul>

      <div className={styles.infoBox}>
        <p><b>💰 Harga:</b> Rp 150.000</p>
        <p><b>⏳ Durasi:</b> 60 menit</p>
        <button className={styles.btn}>Ikuti Tes</button>
      </div>

      {/* Tombol kembali */}
      <div className={styles.backWrapper}>
        <Link href="/dashboard">
          <button className={styles.backBtn}>← Kembali</button>
        </Link>
      </div>
    </div>
  );
};

export default TesISTPage;
