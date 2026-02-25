"use client";

import React, { useState, useEffect, Suspense } from "react";
import styles from "../../app/tes/msdt/msdt.module.css";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import Image from "next/image";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface Props {
  hasAccess: boolean;
  setHasAccess: (val: boolean) => void;
  startAttempt: () => Promise<void>;
  testInfo: {
    name: string;
    id: number;
    duration: number | null;
    price?: number | null;
    customPrice?: number | null;
    discountNominal?: number | null;
    priceDiscount?: number | null;
    percentDiscount?: number | null;
  } | null;
  role: "USER" | "PERUSAHAAN" | "GUEST" | "SUPERADMIN";
  userData: User | null;
  savedStage?: string | null;
}

interface User {
  id: number;
  name: string;
  email: string;
  role: "USER" | "PERUSAHAAN" | "GUEST" | "SUPERADMIN";
  phone?: string;
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

const getFinalPrice = (testInfo: any) => {
  if (!testInfo) return 0;
  const {
    price,
    customPrice,
    discountNominal,
    priceDiscount,
    percentDiscount,
  } = testInfo;

  if (customPrice != null && customPrice > 0) return customPrice;
  if (discountNominal != null && price != null) return price;
  if (
    priceDiscount != null &&
    priceDiscount > 0 &&
    priceDiscount < (price ?? 0)
  )
    return priceDiscount;
  if (percentDiscount != null && percentDiscount > 0 && price != null)
    return Math.round(price - (price * percentDiscount) / 100);

  return price ?? 0;
};

const MSDTPaymentInner: React.FC<Props> = ({
  hasAccess,
  setHasAccess,
  startAttempt,
  testInfo,
  role,
  userData,
  savedStage,
}) => {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [quantity, setQuantity] = useState(1);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [tokenCompleted, setTokenCompleted] = useState(false);
  const [checkingToken, setCheckingToken] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState<
    "PENDING" | "FREE" | "SUCCESS" | null
  >(null);
  const [tokenUser, setTokenUser] = useState<User | null>(null);

  const [open, setOpen] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
  });
  const [method, setMethod] = useState("BRIVA");

  const [promoCodeInput, setPromoCodeInput] = useState("");
  const [activePromo, setActivePromo] = useState<any>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState("");

  const buttonText = savedStage === "questions" ? "Lanjutkan Tes" : "Mulai Tes";
  const router = useRouter();

  const basePrice = getFinalPrice(testInfo);
  const totalPriceBeforePromo = basePrice * quantity;
  const finalPriceToPay = activePromo
    ? activePromo.finalPrice
    : totalPriceBeforePromo;

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (token) {
          setCheckingToken(false);
          return;
        }

        setUser(userData);
      } catch (err) {
        console.error("Gagal fetch token info:", err);
      } finally {
        setCheckingToken(false);
      }
    };

    fetchUser();
  }, [token, setHasAccess, userData]);

  useEffect(() => {
    const checkPayment = async () => {
      if (!user || !testInfo?.id) return;
      if (paymentStatus === "SUCCESS" || hasAccess) return;

      try {
        const res = await fetch(
          `/api/payment/latest?testTypeId=${testInfo.id}&userId=${user.id}`,
        );
        const data = await res.json();

        if (data.payment) {
          const hasReservedAttempt = data.payment.attempts?.some(
            (a: any) => a.status === "RESERVED",
          );

          if (user.role === "PERUSAHAAN") {
            setHasAccess(false);
            setPaymentStatus(data.payment.status);
          } else {
            if (
              !data.payment.attemptUsed ||
              hasReservedAttempt ||
              data.payment.status === "FREE"
            ) {
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
  }, [user, testInfo, setHasAccess, paymentStatus, hasAccess]);

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

  const handleApplyPromo = async () => {
    setPromoError("");
    setPromoLoading(true);
    try {
      const res = await fetch("/api/promo/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: promoCodeInput,
          currentTotal: totalPriceBeforePromo,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.valid) {
        setPromoError(data.error);
        setActivePromo(null);
      } else {
        setActivePromo(data);
      }
    } catch (err) {
      setPromoError("Gagal mengecek promo.");
    } finally {
      setPromoLoading(false);
    }
  };

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
          method,
          promoId: activePromo?.promoId,
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
        setOpen(false);
        await startAttempt();
        return;
      }

      if (data.payment?.reference) {
        router.push(`/pembayaran/${data.payment.reference}`);
        setOpen(false);
        return;
      }

      if (data.payment?.status === "SUCCESS") {
        setHasAccess(true);
        setPaymentStatus("SUCCESS");
        setOpen(false);
        setFormData({
          fullName: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
        });
        return;
      }

      setPaymentStatus(data.payment.status);
    } catch (err) {
      console.error(err);
      alert("❌ Terjadi kesalahan saat pembayaran.");
    } finally {
      setLoading(false);
    }
  };

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
        <p className="mb-4">
          ✅ Sudah didaftarkan oleh perusahaan: <b>{tokenUser.name}</b>
        </p>
        <button className={styles.btn} onClick={startAttempt}>
          {buttonText}
        </button>
      </div>
    );
  }

  if (user?.role === "GUEST" && hasAccess) {
    return (
      <div>
        <p className="mb-4">
          ✅ Sudah didaftarkan oleh perusahaan: <b>{user.name}</b>
        </p>
        <button className={styles.btn} onClick={startAttempt}>
          {buttonText}
        </button>
      </div>
    );
  }

  if (hasAccess) {
    return (
      <div>
        <button className={styles.btn} onClick={startAttempt}>
          {buttonText}
        </button>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className={styles.btn} disabled={!user || loading}>
          {user?.role === "PERUSAHAAN"
            ? "Beli Tes (dengan Kuantitas)"
            : "Bayar untuk Ikut Tes"}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Data Identitas & Pembayaran</DialogTitle>
        </DialogHeader>

        <p className="mb-4 text-sm text-gray-600">
          Dengan ini kamu akan membeli test{" "}
          <span className="font-semibold text-gray-800">
            {testInfo?.name ? ` ${testInfo.name}` : "yang dipilih"}
          </span>
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Identitas */}
          <div className="space-y-3">
            <h4 className="font-medium mb-2 border-b pb-2 text-blue-700">
              Data Identitas
            </h4>
            <div>
              <label className="block text-sm font-medium mb-1">
                Nama Lengkap
              </label>
              <input
                type="text"
                className="w-full border rounded-lg p-2 bg-gray-50 focus:ring-2 focus:ring-blue-400 outline-none transition"
                value={formData.fullName}
                onChange={(e) =>
                  setFormData({ ...formData, fullName: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                className="w-full border rounded-lg p-2 bg-gray-50 focus:ring-2 focus:ring-blue-400 outline-none transition"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                No. Telepon
              </label>
              <input
                type="text"
                className="w-full border rounded-lg p-2 bg-gray-50 focus:ring-2 focus:ring-blue-400 outline-none transition"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>
            <Button
              variant="outline"
              className="w-full mt-2"
              onClick={handleSaveIdentity}
            >
              Simpan Identitas
            </Button>
          </div>

          {/* Metode pembayaran */}
          <div className="space-y-4">
            <h4 className="font-medium mb-2 border-b pb-2 text-blue-700">
              Metode Pembayaran
            </h4>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {paymentMethods.map((pm) => (
                <div
                  key={pm.code}
                  className={`cursor-pointer border rounded-lg p-2 flex flex-col items-center justify-center text-center transition hover:border-blue-500 ${
                    method === pm.code
                      ? "border-blue-600 bg-blue-50 ring-1 ring-blue-200"
                      : "border-gray-200"
                  }`}
                  onClick={() => setMethod(pm.code)}
                >
                  <Image
                    src={pm.logo}
                    alt={pm.label}
                    width={36}
                    height={36}
                    className="mb-1 object-contain"
                  />
                  <span className="text-[10px] font-medium hidden sm:block">
                    {pm.label}
                  </span>
                </div>
              ))}
            </div>

            {user?.role === "PERUSAHAAN" && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Jumlah Kuantitas
                </label>
                <input
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-blue-400 outline-none"
                />
              </div>
            )}

            {/* ✅ FORM PROMO CODE */}
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Punya Kode Promo?
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  className="flex-1 border rounded-lg p-2 uppercase text-sm font-mono focus:ring-2 focus:ring-blue-400 outline-none transition"
                  placeholder="Masukkan kode"
                  value={promoCodeInput}
                  onChange={(e) =>
                    setPromoCodeInput(e.target.value.toUpperCase())
                  }
                  disabled={!!activePromo}
                />
                {!activePromo ? (
                  <Button
                    onClick={handleApplyPromo}
                    disabled={!promoCodeInput || promoLoading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {promoLoading ? "Cek..." : "Pakai"}
                  </Button>
                ) : (
                  <Button
                    variant="destructive"
                    onClick={() => {
                      setActivePromo(null);
                      setPromoCodeInput("");
                    }}
                  >
                    Batal
                  </Button>
                )}
              </div>
              {promoError && (
                <p className="text-red-500 text-xs mt-2">{promoError}</p>
              )}
            </div>

            {/* ✅ RINGKASAN PEMBAYARAN */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 space-y-2 text-sm shadow-sm">
              <div className="flex justify-between text-gray-600">
                <span>Harga Satuan:</span>
                <div className="text-right">
                  {testInfo?.price && testInfo.price > basePrice && (
                    <span className="line-through text-gray-400 mr-2 text-xs">
                      Rp {testInfo.price.toLocaleString("id-ID")}
                    </span>
                  )}
                  <span className="font-semibold">
                    Rp {basePrice.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {user?.role === "PERUSAHAAN" && (
                <div className="flex justify-between text-gray-600">
                  <span>Kuantitas:</span>
                  <span>x {quantity}</span>
                </div>
              )}

              {activePromo && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Diskon Promo:</span>
                  <span>
                    - Rp {activePromo.discountAmount.toLocaleString("id-ID")}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center mt-2 pt-3 border-t border-blue-200">
                <span className="text-gray-700 font-medium">Total Bayar:</span>
                <div className="flex flex-col items-end">
                  {activePromo && (
                    <span className="text-xs text-gray-400 line-through decoration-red-400 decoration-2">
                      Rp {totalPriceBeforePromo.toLocaleString("id-ID")}
                    </span>
                  )}
                  <span className="text-xl font-bold text-blue-800">
                    Rp {finalPriceToPay.toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </div>

            <Button
              className="w-full py-6 text-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-lg transition-transform hover:-translate-y-0.5 mt-2"
              onClick={handlePayment}
              disabled={!user || loading}
            >
              {loading ? "Memproses..." : "Lanjutkan Pembayaran"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const MSDTPaymentButton: React.FC<Props> = (props) => {
  return (
    <Suspense fallback={<p>Memuat tombol pembayaran...</p>}>
      <MSDTPaymentInner {...props} />
    </Suspense>
  );
};

export default MSDTPaymentButton;
