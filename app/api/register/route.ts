// app/api/register/route.ts (Versi Simulasi Tanpa Database)
// APUS KALO UDAH DIBIKIN DB

import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    // 1. Ambil data dari frontend
    const { name, email, password } = await request.json();

    // 2. Tampilkan data di terminal (sebagai ganti menyimpan ke DB)
    console.log('✅ DATA REGISTRASI DITERIMA (SIMULASI):');
    console.log('   Nama:', name);
    console.log('   Email:', email);
    console.log('   Password:', password); // Ingat, ini hanya untuk development

    // 3. (Opsional) Simulasi validasi sederhana
    if (email === 'sudahada@example.com') {
      return NextResponse.json(
        { message: 'Simulasi: Email ini sudah terdaftar.' },
        { status: 409 } // 409 Conflict
      );
    }
    
    // 4. Simulasi loading selama 1.5 detik agar terlihat realistis
    await new Promise(resolve => setTimeout(resolve, 1500));

    // 5. Kirim respons sukses palsu seolah-olah berhasil
    return NextResponse.json(
      { message: 'Registrasi berhasil! (Simulasi)' },
      { status: 201 } // 201 Created
    );

  } catch (error) {
    console.error('SIMULATION_ERROR:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan pada server. (Simulasi)' },
      { status: 500 }
    );
  }
}
