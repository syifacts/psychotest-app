"use client";
import React from "react";
import styles from "../../app/tes/ist/Ist.module.css";

interface Props {
  fullName: string;
  birthDate: string;
  testDate?: string;
  calculateAge: (dob: string) => number;
  onSave: () => void;
}

const UserProfileForm: React.FC<Props> = ({
  fullName,
  birthDate,
  testDate,
  calculateAge,
  onSave,
}) => {
  return (
    <div className={styles.introContainer}>
      <h2 className={styles.title}>Data Diri Peserta</h2>

      <div className={styles.formGroup}>
        <label>Nama Lengkap</label>
        <input type="text" value={fullName} className={styles.input} readOnly />
      </div>

      <div className={styles.formGroup}>
        <label>Tanggal Lahir</label>
        <input type="date" value={birthDate} className={styles.input} readOnly />
      </div>

      {birthDate && (
        <div className={styles.formGroup}>
          <label>Usia</label>
          <input
            type="text"
            value={`${calculateAge(birthDate)} tahun`}
            className={styles.input}
            readOnly
          />
        </div>
      )}

      {testDate && (
        <div className={styles.formGroup}>
          <label>Tanggal Tes</label>
          <input type="text" value={testDate} className={styles.input} readOnly />
        </div>
      )}

     <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "20px" }}>
  <button
    className={styles.btn}
    onClick={onSave}
  >
    Simpan Data Diri
  </button>

  <button
    className={styles.btn}
    style={{ backgroundColor: "#4CAF50" }}
    onClick={() => {
      window.dispatchEvent(new CustomEvent("startTestAfterProfile"));
    }}
  >
    Mulai Tes
  </button>
</div>


    </div>
  );
};

export default UserProfileForm;
