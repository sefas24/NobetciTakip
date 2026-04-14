// =============================================================================
// lib/supabase.ts
//
// Supabase istemcisinin tek oluşturulduğu yer.
// Ortam değişkenleri eksikse uygulama başlamadan hata fırlatır —
// "placeholder" ile sessizce devam etmek yerine erken ve net hata vermek
// üretimde çok daha güvenlidir.
// =============================================================================

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    "Supabase ortam değişkenleri eksik.\n" +
    "Lütfen .env.local dosyasında şu değerleri tanımlayın:\n" +
    "  NEXT_PUBLIC_SUPABASE_URL\n" +
    "  NEXT_PUBLIC_SUPABASE_ANON_KEY"
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey);