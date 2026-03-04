import { NextResponse } from "next/server";
import { updateStudentPassword } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(req: Request) {
    try {
        const cookieStore = await cookies();
        const session = cookieStore.get("nt_session")?.value;
        const email = cookieStore.get("nt_email")?.value;
        const role = cookieStore.get("nt_role")?.value;

        // Sadece giriş yapmış olan öğrenciler şifre değiştirebilir
        if (!session || !email || role !== "student") {
            return NextResponse.json({ ok: false, message: "Yetkisiz işlem." }, { status: 401 });
        }

        const { newPassword } = await req.json();

        if (!newPassword || newPassword.length < 4) {
            return NextResponse.json({ ok: false, message: "Yeni şifre en az 4 karakter olmalıdır." }, { status: 400 });
        }

        // Şifreyi hafızaya (lib/auth içerisindeki Map) kaydet
        updateStudentPassword(email, newPassword);

        return NextResponse.json({ ok: true, message: "Şifre güncellendi." });
    } catch (error) {
        return NextResponse.json(
            { ok: false, message: "Şifre güncellenirken sunucu hatası oluştu." },
            { status: 500 }
        );
    }
}
