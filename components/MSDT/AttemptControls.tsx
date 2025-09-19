import React from "react";

interface AttemptControlsProps {
  currentIndex: number;
  total: number;
  onNext: () => void;
  onBack: () => void;
  onSubmit: () => void | Promise<void>;
}

const AttemptControls: React.FC<AttemptControlsProps> = ({ currentIndex, total, onNext, onBack, onSubmit }) => {
  return (
    <div style={{ marginTop: 20 }}>
      <button onClick={onBack} disabled={currentIndex === 0}>← Back</button>
      {currentIndex < total - 1 ? (
        <button onClick={onNext}>Next →</button>
      ) : (
        <button onClick={onSubmit}>Submit</button>
      )}
    </div>
  );
};

export default AttemptControls;
