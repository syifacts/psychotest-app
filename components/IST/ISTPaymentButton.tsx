"use client";

import React, { useState, useEffect } from "react";
import styles from "../../app/tes/msdt/msdt.module.css";

interface Props {
  hasAccess: boolean;
  setHasAccess: (val: boolean) => void;
  startTest: () => void;
  testInfo: { id: number; price: number | null; duration: number } | null;
  role: "USER" | "PERUSAHAAN" | "GUEST" | "SUPERADMIN";
}

interface User {
  id: number;
  name: string;
  email: string;
  role: "USER" | "PERUSAHAAN" | "GUEST" | "SUPERADMIN";
}

const ISTPaymentButton: React.FC<Props> = ({
  hasAccess,
  setHasAccess,
  startTest,
  testInfo,
  role,
}) => {
  const [quantity, setQuantity] = useState(1);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  // 1️⃣ Fetch user
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me", { credentials: "include" });
        const data = await res.json();
        if (res.ok && data.user) {
          setUser({
            id: data.user.id,
            name: data.user.fullName || "",
            email: data.user.email,
            role: data.user.role === "PERUSAHAAN" ? "PERUSAHAAN" : "USER",
          });
        } else {
          setUser({ id: 0, name: "Guest", email: "", role: "GUEST" });
        }
      } catch (err) {
        console.error("Gagal fetch user:", err);
        setUser({ id: 0, name: "Guest", email: "", role: "GUEST" });
      }
    };
    fetchUser();
  }, []);

  // 2️⃣ Cek akses kalau user sudah ada
  useEffect(() => {
    if (!user || user.role === "GUEST") return;

    const checkAccess = async () => {
      try {
        const res = await fetch(`/api/tes/check-access?userId=${user.id}&type=IST`);
        const data = await res.json();
        if (res.ok && data.nextSubtest) {
          setHasAccess(true);
        }
      } catch (err) {
        console.error(err);
      }
    };

    checkAccess();
  }, [user]);

  // 3️⃣ Handle payment / start test
const handlePayment = async () => {
  if (!user || user.role === "GUEST") {
    alert("Silahkan login terlebih dahulu!");
    window.location.href = "/login";
    return;
  }

  if (!testInfo?.price || testInfo.price <= 0) {
    setHasAccess(true);
    startTest();
    return;
  }

  // request payment hanya untuk user valid
  setLoading(true);
  try {
    const res = await fetch("/api/payment/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user.id,
        testTypeId: testInfo!.id,
        quantity: user.role === "PERUSAHAAN" ? quantity : 1,
      }),
    });
    const data = await res.json();
    if (res.ok && data.success) {
      alert("✅ Pembayaran berhasil!");
      setHasAccess(true);
      startTest();
    } else {
      alert("❌ Pembayaran gagal");
    }
  } catch (err) {
    console.error(err);
    alert("Terjadi kesalahan pembayaran.");
  } finally {
    setLoading(false);
  }
};
<button
  className={styles.btn}
  onClick={handlePayment}
  disabled={!user || user.role === "GUEST" || loading || hasAccess}
>
  {user?.role === "PERUSAHAAN" ? "Beli Tes untuk Karyawan" : "Bayar untuk Ikut Tes"}
</button>



  if (role === "SUPERADMIN") {
    return (
      <p style={{ fontWeight: 500, color: "#555" }}>
        Anda login sebagai Superadmin. Hanya bisa melihat status tes.
      </p>
    );
  }

  if (hasAccess) {
    return (
      <button className={styles.btn} onClick={startTest} disabled={!user}>
        Mulai Tes
      </button>
    );
  }

  return (
    <div>
      {user?.role === "PERUSAHAAN" && (
        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", marginBottom: "4px", fontWeight: 500 }}>
            Jumlah Karyawan
          </label>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className={styles.input}
            style={{
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "6px",
              width: "120px",
            }}
          />
        </div>
      )}

      <button className={styles.btn} onClick={handlePayment} disabled={!user || loading}>
        {user?.role === "PERUSAHAAN" ? "Beli Tes untuk Karyawan" : "Bayar untuk Ikut Tes"}
      </button>
    </div>
  );
};

export default ISTPaymentButton;
