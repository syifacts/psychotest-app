"use client";

import React, { useState, useEffect } from "react";
import styles from "../../app/tes/msdt/msdt.module.css";
import { useSearchParams } from "next/navigation";

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
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [quantity, setQuantity] = useState(1);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [tokenCompleted, setTokenCompleted] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<"PENDING" | "FREE" | "SUCCESS" | null>(null);
  const [attemptStatus, setAttemptStatus] = useState<string | null>(null);
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
            role: "GUEST" as "GUEST",
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
        }
      } catch (err) {
        console.error("Gagal fetch user/token info:", err);
      } finally {
        setCheckingToken(false);
      }
    };

    fetchUser();
  }, [token, setHasAccess]);

  // ---------------------------
  // Cek payment terakhir dan status attempt
  // ---------------------------
  useEffect(() => {
    const checkPaymentAndAttempt = async () => {
      if (!user || !testInfo?.id) return;

      try {
        const res = await fetch(`/api/payment/latest?testTypeId=${testInfo.id}&userId=${user.id}`);
        const data = await res.json();

        if (data.payment) {
          setPaymentStatus(data.payment.status);

          if (data.payment.attempt) {
            setAttemptStatus(data.payment.attempt.status);
            if (
              data.payment.status === "SUCCESS" &&
              ["RESERVED", "STARTED"].includes(data.payment.attempt.status)
            ) {
              setHasAccess(true);
            } else if (
              data.payment.status === "SUCCESS" &&
              data.payment.attempt.status === "FINISHED"
            ) {
              setHasAccess(false);
            } else {
              setHasAccess(false);
            }
          } else {
            setAttemptStatus(null);
            setHasAccess(data.payment.status === "SUCCESS");
          }
        } else {
          setPaymentStatus(null);
          setAttemptStatus(null);
          setHasAccess(false);
        }
      } catch (err) {
        console.error("❌ Gagal cek payment/attempt:", err);
        setHasAccess(false);
      }
    };

    checkPaymentAndAttempt();
  }, [user, testInfo, setHasAccess]);

  // ---------------------------
  // Handle pembayaran
  // ---------------------------
  const handlePayment = async () => {
    if (role === "SUPERADMIN") return;

    if (!user || user.role === "GUEST") {
      alert("Silakan login terlebih dahulu untuk membeli test!");
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
        alert("Silakan login terlebih dahulu untuk membeli test!");
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
          return startTest();
        }
      }

      if (data.payment?.paymentUrl) {
        window.open(data.payment.paymentUrl, "_blank");
      }
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
        <button className={styles.btn} onClick={startTest}>
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
        <button className={styles.btn} onClick={startTest}>
          Mulai Tes
        </button>
      </div>
    );
  }

  if (hasAccess && attemptStatus && ["RESERVED", "STARTED"].includes(attemptStatus)) {
    return (
      <div>
        <button className={styles.btn} onClick={startTest}>
          Mulai Tes
        </button>
      </div>
    );
  }

  if (attemptStatus === "FINISHED") {
    return (
      <button className={styles.btn} onClick={handlePayment}>
        Bayar Lagi
      </button>
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
            style={{
              padding: "8px",
              border: "1px solid #ccc",
              borderRadius: "6px",
              width: "120px",
            }}
          />
        </div>
      )}

      <button
        className={styles.btn}
        onClick={handlePayment}
        disabled={!user || loading}
      >
        {user?.role === "PERUSAHAAN"
          ? "Beli Tes (dengan Kuantitas)"
          : "Bayar untuk Ikut Tes"}
      </button>
    </div>
  );
};

export default ISTPaymentButton;
