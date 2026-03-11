import { NextResponse } from "next/server";
import { clearDemoPasswords } from "@/lib/auth";

export async function POST() {
    try {
        // Sadece demo ve test amacıyladır, gerçek prod sisteminde bu kaldırılmalıdır veya admin iznine bağlanmalıdır.
        await clearDemoPasswords();
        return NextResponse.json({ ok: true, message: "Tüm öğrenci şifreleri sıfırlandı." });
    } catch (error) {
        return NextResponse.json(
            { ok: false, message: "Sıfırlama sırasında sunucu hatası oluştu." },
            { status: 500 }
        );
    }
}
