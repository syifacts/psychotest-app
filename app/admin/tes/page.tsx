"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/layout/navbar";
import TestList from "@/components/admin/TestList";
import { useSearchParams } from "next/navigation";

interface TestItem {
  id: number;
  name: string;
  price?: number;
  desc?: string;
  img?: string;
}

export default function TestPage() {
  const [tests, setTests] = useState<TestItem[]>([]);
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search")?.toLowerCase() || "";

  useEffect(() => {
    fetch("/api/testtypes")
      .then((res) => res.json())
      .then((data) => setTests(data))
      .catch(console.error);
  }, []);

  const filteredTests = tests.filter((t) =>
    t.name.toLowerCase().includes(searchQuery)
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar />

      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-6">
          Daftar Tes Psikologi
        </h1>

        <TestList tests={filteredTests} role="admin" />
      </div>
    </div>
  );
}
