import React from "react";

export const Table: React.FC<React.PropsWithChildren> = ({ children }) => (
  <table className="min-w-full border-collapse text-sm">{children}</table>
);

export const TableHead: React.FC<React.PropsWithChildren> = ({ children }) => (
  <thead className="bg-indigo-50 text-gray-700">{children}</thead>
);

export const TableBody: React.FC<React.PropsWithChildren> = ({ children }) => <tbody>{children}</tbody>;

export const TableRow: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <tr className={`border-b ${className ?? ""}`}>{children}</tr>
);

export const TableCell: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => (
  <td className={`p-4 ${className ?? ""}`}>{children}</td>
);
