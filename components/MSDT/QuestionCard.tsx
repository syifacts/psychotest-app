import React from "react";
import styles from "../../app/tes/msdt/msdt.module.css";

interface Question {
  id: number;
  code: string;
  content: string;
  options: string[];
  type: "single";
}

interface QuestionCardProps {
  question: Question;
  selected?: string;
  onSelect: (choice: string) => void | Promise<void>;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, selected, onSelect }) => {
  return (
    <div className={styles.questionSection}>
      <p className={styles.questionContent}><b>{question.content}</b></p>
      <ul className={styles.optionsList}>
        {question.options.map((opt) => (
          <li key={opt}>
            <label className={`${styles.optionLabel} ${selected === opt ? styles.optionSelected : ""}`}>
              <input
                type="radio"
                value={opt}
                checked={selected === opt}
                onChange={() => onSelect(opt)}
              />
              <span>{opt}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default QuestionCard;
