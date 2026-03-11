import { NextResponse } from "next/server";
import { clearAllMesaiPreferences } from "@/lib/mesaiStore";
import { cookies } from "next/headers";

export async function POST() {
    try {
        const store = await cookies();
        const role = store.get("nt_role")?.value;

        if (role !== "admin") {
            return NextResponse.json({ ok: false, message: "Yetkisiz İşlem" }, { status: 401 });
        }

        await clearAllMesaiPreferences();

        return NextResponse.json({ ok: true, message: "Tüm mesai ve nöbet kayıtları başarıyla sıfırlandı." });
    } catch (error) {
        return NextResponse.json(
            { ok: false, message: "Kayıtlar sıfırlanırken sunucu hatası oluştu." },
            { status: 500 }
        );
    }
}
