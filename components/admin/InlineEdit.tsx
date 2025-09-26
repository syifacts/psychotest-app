"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";

interface InlineEditProps {
  value: string | number;
  onSave: (newValue: string | number) => void;
  type?: "text" | "number" | "textarea";
  className?: string;
}

export default function InlineEdit({ value, onSave, type = "text", className }: InlineEditProps) {
  const [editing, setEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);

  const handleSave = () => {
    onSave(tempValue);
    setEditing(false);
  };

  if (editing) {
    if (type === "textarea") {
      return (
        <textarea
          value={tempValue as string}
          onChange={(e) => setTempValue(e.target.value)}
          onBlur={handleSave}
          autoFocus
          className={`border rounded px-2 py-1 ${className || ""}`}
        />
      );
    }

    return (
      <input
        type={type}
        value={tempValue}
        onChange={(e) => setTempValue(type === "number" ? Number(e.target.value) : e.target.value)}
        onBlur={handleSave}
        onKeyDown={(e) => e.key === "Enter" && handleSave()}
        autoFocus
        className={`border rounded px-2 py-1 ${className || ""}`}
      />
    );
  }

  return (
    <div className="flex items-center gap-1">
      <span className={className}>{value}</span>
      <button onClick={() => setEditing(true)}>
        <Pencil size={16} className="text-gray-500 hover:text-gray-800" />
      </button>
    </div>
  );
}
