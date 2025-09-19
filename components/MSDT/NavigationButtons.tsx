"use client";
import React from "react";
import styles from "../../app/tes/msdt/msdt.module.css";

interface NavigationButtonsProps {
  currentIndex: number;
  totalQuestions: number;
  goNext: () => void;
  goBack: () => void;
  onSubmit: () => void;
}

const NavigationButtons: React.FC<NavigationButtonsProps> = ({ currentIndex, totalQuestions, goNext, goBack, onSubmit }) => {
  return (
    <div className={styles.navButtons}>
      <button className={styles.backBtn} onClick={goBack} disabled={currentIndex === 0}>← Back</button>
      {currentIndex < totalQuestions - 1 ? (
        <button className={styles.btn} onClick={goNext}>Next →</button>
      ) : (
        <button className={styles.btn} onClick={onSubmit}>Submit Tes</button>
      )}
    </div>
  );
};

export default NavigationButtons;
