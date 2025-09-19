"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

export default function ValidateTTDPage() {
  const params = useParams();
  const hash = params?.hash as string | undefined;
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!hash) return;
    fetch(`/api/validate-ttd/${hash}`)
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, [hash]);

  if (!data) return <p>Loading...</p>;

  if (data.error) return <p style={{ color: "red" }}>{data.error}</p>;

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Validasi TTD Psikolog</h2>
      <p>Ditandatangani oleh: <b>{data.user.fullName}</b></p>
      <img src={data.user.ttdUrl} alt="TTD" width={250} />
      <p>Status: ✅ {data.message}</p>
    </div>
  );
}
