"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import PaymentLoading from "@/components/payment/PaymentLoading";
import PaymentNotFound from "@/components/payment/PaymentNotFound";
import PaymentSuccess from "@/components/payment/PaymentSuccess";
import PaymentInvoice from "@/components/payment/PaymentInvoice";

export default function PembayaranPage() {
  const params = useParams();
  const reference = params.reference as string;

  const [paymentData, setPaymentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isPaid, setIsPaid] = useState(false);

  const fetchPaymentDetail = async (isPolling = false) => {
    try {
      if (!isPolling) setLoading(true);

      const res = await fetch(`/api/payment/detail?reference=${reference}`);
      const data = await res.json();
      const mergedData = { ...data.payment, ...data.data };

      setPaymentData(mergedData);

      if (mergedData?.status === "PAID" || mergedData?.status === "SUCCESS") {
        setIsPaid(true);
      }
    } catch (err) {
      console.error("Gagal ambil data pembayaran:", err);
    } finally {
      if (!isPolling) setLoading(false);
    }
  };

  useEffect(() => {
    if (reference) fetchPaymentDetail();
  }, [reference]);

  useEffect(() => {
    if (isPaid || (timeLeft !== null && timeLeft <= 0) || !paymentData) return;

    const interval = setInterval(() => {
      fetchPaymentDetail(true);
    }, 5000);

    return () => clearInterval(interval);
  }, [isPaid, timeLeft, paymentData]);

  useEffect(() => {
    if (!paymentData?.expired_time || isPaid) return;

    const expiredDate = new Date(paymentData.expired_time * 1000).getTime();
    const timer = setInterval(() => {
      const distance = expiredDate - new Date().getTime();
      if (distance <= 0) {
        clearInterval(timer);
        setTimeLeft(0);
      } else {
        setTimeLeft(Math.floor(distance / 1000));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [paymentData, isPaid]);

  const formatTime = (seconds: number) => {
    if (seconds <= 0) return "Kedaluwarsa";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, "0")} : ${m.toString().padStart(2, "0")} : ${s.toString().padStart(2, "0")}`;
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCheckStatus = async () => {
    setIsChecking(true);
    await fetchPaymentDetail(true);
    setIsChecking(false);
  };

  if (loading) return <PaymentLoading />;

  if (!paymentData) return <PaymentNotFound />;

  if (isPaid) {
    const totalAmount = paymentData?.total_amount || paymentData?.amount || 0;
    const methodName =
      paymentData?.payment_method || paymentData?.method || "Pembayaran";

    return (
      <PaymentSuccess
        totalAmount={totalAmount}
        methodName={methodName}
        reference={reference}
      />
    );
  }

  return (
    <PaymentInvoice
      paymentData={paymentData}
      reference={reference}
      timeLeft={timeLeft}
      formatTime={formatTime}
      isChecking={isChecking}
      handleCheckStatus={handleCheckStatus}
      handleCopy={handleCopy}
      copied={copied}
    />
  );
}
