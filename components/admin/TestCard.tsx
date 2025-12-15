"use client";

import React from "react";
import { useRouter } from "next/navigation";

interface TestItem {
  id: number;
  name: string;
  price?: number;
  desc?: string;
  img?: string;
}

interface Props {
  test: TestItem;
  role?: "admin" | "user";
}

export default function TestCard({ test, role = "user" }: Props) {
  const router = useRouter();

  const handleClick = () => {
    if (role === "admin") {
      // redirect ke halaman dinamis: /tes/{slug}
      const slug = encodeURIComponent(test.name.toLowerCase().replace(/\s+/g, "-"));
      router.push(`/tes/${slug}`);
    }
  };

  return (
    <div
      className="border rounded-lg shadow p-4 flex flex-col cursor-pointer hover:shadow-lg transition"
      onClick={handleClick}
    >
      {test.img && <img src={test.img} alt={test.name} className="rounded mb-4" />}
      <h2 className="text-lg font-bold mb-2">{test.name}</h2>
      <p className="text-gray-600 flex-1">{test.desc}</p>
      <span className="text-gray-800 font-semibold mt-2">
        Rp {test.price?.toLocaleString("id-ID") || "-"}
      </span>
    </div>
  );
}
