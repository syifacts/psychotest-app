"use client";
import React from "react";
import styles from "../../app/tes/ist/Ist.module.css";

interface Props {
  subtest: { name: string; description: string; durationMinutes: number };
  onStart: () => void;
}

const SubtestDetail: React.FC<Props> = ({ subtest, onStart }) => {
  return (
   <div className={styles.introContainer}>
  <h2 className={styles.title}>Subtest {subtest.name}</h2>
  <p className={styles.desc}>{subtest.description}</p>
  <p>
    <b>⏳ Durasi subtest:</b> {subtest.durationMinutes} menit
  </p>
  <button className={styles.btn} onClick={onStart}>
    Mulai Mengerjakan
  </button>
</div>

  );
};

export default SubtestDetail;
