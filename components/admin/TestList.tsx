"use client";

import React from "react";
import TestCard from "./TestCard";

interface TestItem {
  id: number;
  name: string;
  price?: number;
  desc?: string;
  img?: string;
}

interface Props {
  tests: TestItem[];
  role?: "admin" | "user";
}

export default function TestList({ tests, role = "user" }: Props) {
  if (!tests || tests.length === 0) return <p className="text-gray-500 text-center">Belum ada test tersedia</p>;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
      {tests.map((test) => (
        <TestCard key={test.id} test={test} role={role} />
      ))}
    </div>
  );
}
