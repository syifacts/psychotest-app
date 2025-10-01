"use client";

import React, { useState, useEffect } from "react";
import styles from "../../app/tes/msdt/msdt.module.css";
import { useSearchParams } from "next/navigation";

interface Props {
  hasAccess: boolean;
  setHasAccess: (val: boolean) => void;
  startAttempt: () => Promise<void>;
  testInfo: { id: number; duration: number | null; price?: number | null } | null;
  role: "USER" | "PERUSAHAAN" | "GUEST" | "SUPERADMIN";
}

interface User {
  id: number;
  name: string;
  email: string;
  role: "USER" | "PERUSAHAAN" | "GUEST" | "SUPERADMIN";
}

const MSDTPaymentButton: React.FC<Props> = ({
  hasAccess,
  setHasAccess,
  startAttempt,
  testInfo,
  role,
}) => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [quantity, setQuantity] = useState(1);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [tokenCompleted, setTokenCompleted] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<"PENDING" | "FREE" | "SUCCESS" | null>(null);
  const [tokenUser, setTokenUser] = useState<User | null>(null);

  // ---------------------------
  // Ambil info user / token
  // ---------------------------
  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (token) {
          const resToken = await fetch(`/api/token/info?token=${token}`);
          const dataToken = await resToken.json();

          if (!resToken.ok) {
            setTokenCompleted(true);
            setCheckingToken(false);
            return;
          }

          const guestUser: User = {
            id: dataToken.userId ?? 0,
            name: dataToken.companyName ?? "Guest",
            email: "",
            role: "GUEST",
          };

          setTokenUser(guestUser);
          setUser(guestUser);

          const completed = Boolean(dataToken.isCompleted) || Boolean(dataToken.used);
          setTokenCompleted(completed);
          if (!completed) setHasAccess(true);
          setCheckingToken(false);
          return;
        }

        const resUser = await fetch("/api/auth/me", { credentials: "include" });
        const dataUser = await resUser.json();

        if (resUser.ok && dataUser.user) {
          setUser({
            id: dataUser.user.id,
            name: dataUser.user.fullName || "",
            email: dataUser.user.email,
            role: dataUser.user.role === "PERUSAHAAN" ? "PERUSAHAAN" : "USER",
          });
        } else {
          setUser({ id: 0, name: "Guest", email: "", role: "GUEST" });
        }
      } catch (err) {
        console.error("Gagal fetch user/token info:", err);
        setUser({ id: 0, name: "Guest", email: "", role: "GUEST" });
      } finally {
        setCheckingToken(false);
      }
    };

    fetchUser();
  }, [token, setHasAccess]);

  // ---------------------------
  // Cek status payment terakhir
  // ---------------------------
  useEffect(() => {
    const checkPayment = async () => {
      if (!user || !testInfo?.id) return;

      try {
        const res = await fetch(
          `/api/payment/latest?testTypeId=${testInfo.id}&userId=${user.id}`
        );
        const data = await res.json();

        if (data.payment) {
          const hasReservedAttempt = data.payment.attempts?.some(
            (a: any) => a.status === "RESERVED"
          );

          if (user.role === "PERUSAHAAN") {
            setHasAccess(false);
            setPaymentStatus(data.payment.status);
          } else {
            if (!data.payment.attemptUsed || hasReservedAttempt || data.payment.status === "FREE") {
              setHasAccess(true);
              setPaymentStatus(data.payment.status);
            } else {
              setHasAccess(false);
              setPaymentStatus(null);
            }
          }
        }
      } catch (err) {
        console.error("Gagal cek payment terakhir:", err);
      }
    };

    checkPayment();
  }, [user, testInfo, setHasAccess]);

  // ---------------------------
  // Handle pembayaran
  // ---------------------------
  const handlePayment = async () => {
    if (role === "SUPERADMIN") return;

    if (!user || user.role === "GUEST") {
      alert("Silakan login terlebih dahulu untuk membeli tes!");
      window.location.href = "/login";
      return;
    }

    if (!testInfo?.id) return;

    setLoading(true);
    try {
      const res = await fetch("/api/payment/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          testTypeId: testInfo.id,
          quantity: user.role === "PERUSAHAAN" ? quantity : 1,
        }),
      });

      if (res.status === 401) {
        alert("Silakan login terlebih dahulu untuk membeli tes!");
        window.location.href = "/login";
        return;
      }

      const data = await res.json();

      if (!res.ok || !data.success) {
        return alert(data.error || "❌ Pembayaran gagal!");
      }

      if (data.startTest || data.payment?.status === "FREE") {
        setHasAccess(true);
        setPaymentStatus(data.payment.status);
        if (data.attempt?.id) {
          return startAttempt();
        }
      }

      if (data.payment?.paymentUrl) {
        window.open(data.payment.paymentUrl, "_blank");
      }

      setPaymentStatus(data.payment.status);
    } catch (err) {
      console.error(err);
      alert("❌ Terjadi kesalahan saat pembayaran.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------
  // Render
  // ---------------------------
  if (checkingToken) return <p>Memeriksa status tes...</p>;

  if (role === "SUPERADMIN") {
    return (
      <p style={{ fontWeight: 500, color: "#555" }}>
        Anda login sebagai Superadmin. Hanya bisa melihat status tes.
      </p>
    );
  }

  if (tokenCompleted) {
    return (
      <p style={{ color: "red", fontWeight: 500 }}>
        ✅ Tes sudah selesai, tidak bisa mengerjakan lagi.
      </p>
    );
  }

  if (tokenUser && !tokenCompleted) {
    return (
      <div>
        <p>
          ✅ Sudah didaftarkan oleh perusahaan: <b>{tokenUser.name}</b>
        </p>
        <button className={styles.btn} onClick={startAttempt}>
          Mulai Tes
        </button>
      </div>
    );
  }

  if (user?.role === "GUEST" && hasAccess) {
    return (
      <div>
        <p>
          ✅ Sudah didaftarkan oleh perusahaan: <b>{user.name}</b>
        </p>
        <button className={styles.btn} onClick={startAttempt}>
          Mulai Tes
        </button>
      </div>
    );
  }

  if (hasAccess) {
    return (
      <div>
        <button className={styles.btn} onClick={startAttempt}>
          Mulai Tes
        </button>
      </div>
    );
  }

  return (
    <div>
      {user?.role === "PERUSAHAAN" && (
        <div style={{ marginBottom: "12px" }}>
          <label style={{ display: "block", marginBottom: "4px", fontWeight: 500 }}>
            Jumlah Kuantitas
          </label>
          <input
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className={styles.input}
            style={{ padding: "8px", border: "1px solid #ccc", borderRadius: "6px", width: "120px" }}
          />
        </div>
      )}

      <button className={styles.btn} onClick={handlePayment} disabled={!user || loading}>
        {user?.role === "PERUSAHAAN" ? "Beli Tes (dengan Kuantitas)" : "Bayar untuk Ikut Tes"}
      </button>
    </div>
  );
};

export default MSDTPaymentButton;
