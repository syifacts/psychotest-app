"use client";

import { useState } from "react";
import { Table, TableHead, TableRow, TableCell, TableBody } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface Props {
  allUsers: any[];
  testTypes: any[];
}

export default function UsersTable({ allUsers, testTypes }: Props) {
  const [filter, setFilter] = useState("");

  const filteredUsers = allUsers.filter(u => u.name.toLowerCase().includes(filter.toLowerCase()));

  return (
    <div className="bg-white p-6 rounded-xl shadow overflow-x-auto">
      <div className="flex justify-between mb-4">
        <input
          type="text"
          placeholder="Cari karyawan..."
          className="border rounded px-3 py-1"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nama</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Jenis Pendaftaran</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Tanggal Mulai</TableCell>
            <TableCell>Aksi</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {filteredUsers.map(u => (
            <TableRow key={u.id}>
              <TableCell>{u.fullName}</TableCell>
              <TableCell>{u.email}</TableCell>
              <TableCell>{u.type}</TableCell>
              <TableCell>{u.status}</TableCell>
              <TableCell>{u.startedAt ? new Date(u.startedAt).toLocaleString() : "-"}</TableCell>
              <TableCell>
                <Button variant="destructive" size="sm">Hapus</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
