// app/api/login/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    // --- LOGIKA SIMULASI ---
    // Di dunia nyata, Anda akan:
    // 1. Mencari user di database berdasarkan email menggunakan Prisma.
    // 2. Jika user ditemukan, bandingkan password yang diinput dengan hash di DB menggunakan bcrypt.
    // 3. Jika cocok, buat sesi login (misalnya dengan Next-Auth).

    console.log('Mencoba login dengan:', { email, password });
    
    // Simulasi loading network
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulasi kredensial yang benar
    if (email === 'user@example.com' && password === 'password123') {
      return NextResponse.json({ message: 'Login berhasil!' }, { status: 200 });
    } else {
      // Simulasi kredensial yang salah
      return NextResponse.json(
        { message: 'Email atau password salah.' },
        { status: 401 } // 401 Unauthorized
      );
    }
  } catch (error) {
    return NextResponse.json(
      { message: 'Terjadi kesalahan pada server.' },
      { status: 500 }
    );
  }
}