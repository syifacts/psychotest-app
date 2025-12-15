"use client";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Props {
  companyId: number | null;
  packagePurchases: any[];
  singlePayments: any[];
  fetchDashboard: () => void;
}

export default function UserRegisterDialog({ companyId, packagePurchases, singlePayments, fetchDashboard }: Props) {
  const [openDialog, setOpenDialog] = useState(false);

  return (
    <div className="mb-6 flex justify-end">
      <Button className="bg-indigo-600 text-white hover:bg-indigo-700" onClick={() => setOpenDialog(true)}>
        Daftarkan Karyawan
      </Button>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Daftarkan Karyawan</DialogTitle>
          </DialogHeader>
          {/* Form bisa kamu masukkan di sini */}
          <DialogFooter>
            <Button variant="secondary" onClick={() => setOpenDialog(false)}>Batal</Button>
            <Button onClick={() => { /* submit logic */ }}>Daftar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
