"use client";

import React, { useState, useEffect } from "react";
import styles from "../../app/tes/cpmi/cpmi.module.css";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster"


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
  testInfo: {name:string; id: number; duration: number | null; price?: number | null ;   customPrice?: number | null;  // <- tambahkan ini
  discountNominal?: number | null; // optional kalau nanti pakai diskon
  discountNote?: string | null;   } | null;
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

const CPMIPaymentButton: React.FC<Props> = ({
  hasAccess,
  setHasAccess,
  startAttempt,
  testInfo,
  role,
}) => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
const { toast } = useToast();

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
// const displayPrice = (() => {
//   if (!testInfo) return 0;

//   if (testInfo.customPrice != null) return testInfo.customPrice;

//   if (testInfo.discountNominal != null) {
//     const basePrice = testInfo.price ?? 0;
//     return Math.round(basePrice * (1 - testInfo.discountNominal / 100));
//   }

//   return testInfo.price ?? 0;
// })();
const getFinalPrice = (testInfo: any) => {
  if (!testInfo) return 0;

  const { price, customPrice, discountNominal, priceDiscount, percentDiscount } = testInfo;

  // 1️⃣ Prioritas: customPrice
  if (customPrice != null && customPrice > 0) return customPrice;

  // 2️⃣ Jika ada discountNominal (penanda harga sudah final)
  // ❌ jangan dikurangi lagi, pakai price apa adanya
  if (discountNominal != null && price != null) return price;

  // 3️⃣ Jika ada priceDiscount dari backend
  if (priceDiscount != null && priceDiscount > 0 && priceDiscount < (price ?? 0)) return priceDiscount;

  // 4️⃣ Jika ada percentDiscount dari database
  if (percentDiscount != null && percentDiscount > 0 && price != null) return Math.round(price - (price * percentDiscount) / 100);

  // 5️⃣ Default: harga normal
  return price ?? 0;
};

// const displayPrice = (() => {
//   if (!testInfo) return 0;

//   const {
//     price,
//     customPrice,
//     discountNominal,
//     priceDiscount,
//     percentDiscount,
//   } = testInfo as any;

//   // ✅ 1. Prioritas: custom price
//   if (customPrice != null) return customPrice;

//   // ✅ 2. Jika ada discountNominal (penanda harga sudah final) → tampilkan price apa adanya
//   if (discountNominal != null && price != null) {
//     return price; // ✅ jangan dikurangin lagi
//   }

//   // ✅ 3. Jika ada harga diskon langsung dari backend
//   if (priceDiscount != null && priceDiscount < (price ?? 0)) {
//     return priceDiscount;
//   }

//   // ✅ 4. Jika ada diskon persen dari database
//   if (percentDiscount != null && price != null) {
//     const discounted = price - (price * percentDiscount) / 100;
//     return Math.round(discounted);
//   }

//   // ✅ 5. Default harga normal
//   return price ?? 0;
// })();

// const unitPrice = testInfo?.customPrice != null
//   ? testInfo.customPrice
//   : testInfo?.discountNominal != null
//     ? Math.round((testInfo.price ?? 0) * (1 - testInfo.discountNominal / 100))
//     : testInfo?.price ?? 0;

// const totalPrice = unitPrice * quantity;

// const unitPrice = testInfo?.price ?? 0;  // ✅ harga final langsung dari backend
// const totalPrice = unitPrice * quantity;

const displayPrice = getFinalPrice(testInfo);
const unitPrice = displayPrice;
const totalPrice = displayPrice * quantity;


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
    toast({
      title: "Login diperlukan",
      description: "Silakan login terlebih dahulu untuk membeli test!",
      variant: "error",
      duration: 8000,
    });

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
      toast({
        title: "Login diperlukan",
        description: "Silakan login terlebih dahulu untuk membeli test!",
        variant: "error",
        duration: 8000,
      });

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
    <div className="text-center mt-4">
      <motion.p
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-sm bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 px-4 py-3 rounded-xl mb-6 border border-blue-200 flex items-center gap-2 justify-center"
      >
        <span className="text-xl">🏢</span>
        <span>Sudah didaftarkan oleh perusahaan ({tokenUser.name})</span>
      </motion.p>
      <button
        className={`${styles.btn} mt-1`}
        onClick={startAttempt}
      >
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
// if (hasAccess) {
//   return (
//     <div>
//       <button className={styles.btn} onClick={startAttempt}>
//         Mulai Tes
//       </button>
//     </div>
//   );
// }

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
    {testInfo?.name ?? "yang dipilih"}
  </span>{" "}
  (Rp {displayPrice.toLocaleString("id-ID")})
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
  <div className="mb-4">
    <label className="block text-sm font-medium mb-1 text-gray-700">
      Jumlah Kuantitas
    </label>
    <input
      type="number"
      min={1}
      value={quantity}
      onChange={(e) => setQuantity(Number(e.target.value))}
      className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition"
    />
  </div>
)}

        {/* Ringkasan Harga */}
<div className="p-4 mb-4 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 text-blue-900 text-sm shadow-sm">
  <h4 className="font-medium mb-2">Ringkasan Pembayaran</h4>
  <div className="flex justify-between mb-1">
    <span>Harga Satuan:</span>
    <span>Rp {displayPrice.toLocaleString("id-ID")}</span>
  </div>

  {user?.role === "PERUSAHAAN" && (
    <div className="flex justify-between mb-1">
      <span>Kuantitas:</span>
      <span>{quantity}</span>
    </div>
  )}

  <div className="flex justify-between mt-2 pt-2 border-t border-blue-200 font-semibold text-blue-800">
    <span>Total:</span>
    <span>Rp {(displayPrice * quantity).toLocaleString("id-ID")}</span>
  </div>
</div>



        <Button
          className={styles.btn + " w-full"}
          onClick={handlePayment}
          disabled={!user || loading}
        >
          Lanjutkan Pembayaran
        </Button>
      </div>
      <Toaster />
    </div>
  </DialogContent>
</Dialog>



);

};

export default CPMIPaymentButton;
