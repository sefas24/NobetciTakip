import { NextResponse } from "next/server";
import { approveAllWithAutomaticDuty } from "@/lib/mesaiStore";

export async function POST() {
    try {
        const result = await approveAllWithAutomaticDuty();
        if (result.successCount === 0) {
            return NextResponse.json(
                { ok: false, message: "Onaylanacak bekleyen mesai kaydı bulunamadı." },
                { status: 400 }
            );
        }

        return NextResponse.json({
            ok: true,
            message: `${result.successCount} adet öğrencinin mesaisi onaylandı ve her gün (slot) için otomatik nöbetçiler belirlendi!`
        });
    } catch (error) {
        return NextResponse.json(
            { ok: false, message: "Otomatik nöbetçi seçimi sırasında sunucu hatası oluştu." },
            { status: 500 }
        );
    }
}
