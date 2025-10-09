"use client";

import React, { useState, useEffect } from "react";
import styles from "../../app/tes/msdt/msdt.module.css";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";


import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Props {
  hasAccess: boolean;
  setHasAccess: (val: boolean) => void;
  startAttempt: () => Promise<void>;
  testInfo: {name:string; id: number; duration: number | null; price?: number | null } | null;
  role: "USER" | "PERUSAHAAN" | "GUEST" | "SUPERADMIN";
}

interface User {
  id: number;
  name: string;
  email: string;
  role: "USER" | "PERUSAHAAN" | "GUEST" | "SUPERADMIN";
   phone?: string; // tambahkan ini
}

const paymentMethods = [
  { code: "BRIVA", label: "BRIVA", logo: "/logos/briva.png" },
  { code: "QRIS", label: "QRIS", logo: "/logos/qris.png" },
  { code: "SPAY", label: "ShopeePay", logo: "/logos/spay.png" },
  { code: "DANA", label: "DANA", logo: "/logos/dana.png" },
  { code: "GOPAY", label: "GoPay", logo: "/logos/gopay.png" },
  { code: "MANDIRI", label: "Mandiri", logo: "/logos/mandiri.png" },
  { code: "BCA", label: "BCA", logo: "/logos/bca.png" },
  { code: "BNI", label: "BNI", logo: "/logos/bni.png" },
];

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

const [showForm, setShowForm] = useState(false);
const [showIdentityModal, setShowIdentityModal] = useState(false);
const [open, setOpen] = useState(false); // state untuk dialog



const [formData, setFormData] = useState({
  fullName: "",
  email: "",
  phone: "",
});
const [method, setMethod] = useState("BRIVA"); // default BRIVA

useEffect(() => {
  if (user) {
    setFormData({
      fullName: user.name || "",
      email: user.email || "",
      phone: user.phone || "", // kalau ada field phone di db
    });
  }
}, [user]);
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
  role: "GUEST" as "GUEST", // <-- paksa literal type
};

  setTokenUser(guestUser); // <-- tambahkan ini
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
                phone: dataUser.user.phone || "",   // ⬅️ tambahin ini

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
  // Cek status payment terakhir
  // ---------------------------
  useEffect(() => {
  const checkPayment = async () => {
    if (!user || !testInfo?.id) return;
        if (paymentStatus === "SUCCESS" || hasAccess) return; // ⬅️ tambahin ini


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
          // PERUSAHAAN hanya bisa beli, tidak langsung mengerjakan
          setHasAccess(false);
          setPaymentStatus(data.payment.status);
        } else {
          // USER / GUEST
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
const handleSaveIdentity = async () => {
  try {
    const res = await fetch("/api/user/update-payment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: user?.id,
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
      }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Gagal update user");
    alert("✅ Data identitas berhasil diperbarui");
  } catch (err) {
    console.error(err);
    alert("❌ Gagal menyimpan identitas");
  }
};


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
        setOpen(false);               // ✅ auto-close modal


  // langsung create attempt dari frontend
  await startAttempt();
  return;
}


    if (data.payment?.paymentUrl) {
      window.open(data.payment.paymentUrl, "_blank");
       setOpen(false); // ✅ langsung tutup dialog
  return;
    }
 if (data.payment?.status === "SUCCESS") {
      setHasAccess(true);
      setPaymentStatus("SUCCESS");
      setOpen(false);   
      setFormData({
    fullName: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });
        return;  // ⬅️ tambahkan return supaya tidak ketimpa lagi
            // ✅ auto-close modal
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

// TOKEN valid → langsung Mulai Tes
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

// GUEST yang sudah didaftarkan → Mulai Tes
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

// USER / PERUSAHAAN yang sudah bayar → Mulai Tes
if (hasAccess) {
  return (
    <div>
      <button className={styles.btn} onClick={startAttempt}>
        Mulai Tes
      </button>
    </div>
  );
}

if (hasAccess && user?.role !== "PERUSAHAAN") {
  return (
    <div>
      <button className={styles.btn} onClick={startAttempt}>
        Mulai Tes
      </button>
    </div>
  );
}

// 🔥 STEP BARU: Modal untuk identitas + metode pembayaran
return (
 <Dialog open={open} onOpenChange={setOpen}>
  <DialogTrigger asChild>
    <Button className={styles.btn} disabled={!user || loading}>
      {user?.role === "PERUSAHAAN"
        ? "Beli Tes (dengan Kuantitas)"
        : "Bayar untuk Ikut Tes"}
    </Button>
  </DialogTrigger>


  <DialogContent className="sm:max-w-3xl">
    <DialogHeader>
      <DialogTitle>Data Identitas & Pembayaran</DialogTitle>
    </DialogHeader>

    {/* Info singkat */}
    <p className="mb-4 text-sm text-gray-600">
      Dengan ini kamu akan membeli test{" "}
      <span className="font-semibold text-gray-800">
        {testInfo?.name ? ` ${testInfo.name}` : "yang dipilih"}
      </span>{" "}
      {testInfo?.price ? `(Rp ${testInfo.price.toLocaleString("id-ID")})` : ""}
    </p>

    <div className="p-3 mb-4 rounded bg-yellow-50 border border-yellow-300 text-yellow-700 text-sm">
      ⚠️ Perhatian: Identitas yang Anda ubah akan langsung disimpan dan menggantikan data sebelumnya.
    </div>

    {/* Grid 2 kolom */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Kolom kiri: identitas */}
      <div className="space-y-3">
        <h4 className="font-medium mb-2">Data Identitas</h4>
        <div>
          <label className="block text-sm font-medium">Nama Lengkap</label>
          <input
            type="text"
            className="w-full border rounded p-2"
            value={formData.fullName}
            onChange={(e) =>
              setFormData({ ...formData, fullName: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Email</label>
          <input
            type="email"
            className="w-full border rounded p-2"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
        </div>

        <div>
          <label className="block text-sm font-medium">No. Telepon</label>
          <input
            type="text"
            className="w-full border rounded p-2"
            value={formData.phone}
            onChange={(e) =>
              setFormData({ ...formData, phone: e.target.value })
            }
          />
        </div>

        <Button className={styles.btn} onClick={handleSaveIdentity}>
          Simpan Identitas
        </Button>
      </div>

      {/* Kolom kanan: metode pembayaran */}
      <div className="space-y-4">
        <h4 className="font-medium mb-2">Metode Pembayaran</h4>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {paymentMethods.map((pm) => (
            <div
              key={pm.code}
              className={`cursor-pointer border rounded-lg p-3 flex flex-col items-center justify-center text-center transition hover:border-blue-500 ${
                method === pm.code
                  ? "border-blue-600 ring-2 ring-blue-200"
                  : "border-gray-300"
              }`}
              onClick={() => setMethod(pm.code)}
            >
              <Image
                src={pm.logo}
                alt={pm.label}
                width={40}
                height={40}
                className="mb-2"
              />
              <span className="text-sm font-medium">{pm.label}</span>
            </div>
          ))}
        </div>

        {user?.role === "PERUSAHAAN" && (
          <div>
            <label className="block text-sm font-medium">Jumlah Kuantitas</label>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-32 border rounded p-2"
            />
          </div>
        )}

        <Button
          className={styles.btn + " w-full"}
          onClick={handlePayment}
          disabled={!user || loading}
        >
          Lanjutkan Pembayaran
        </Button>
      </div>
    </div>
  </DialogContent>
</Dialog>

);

};

export default MSDTPaymentButton;
