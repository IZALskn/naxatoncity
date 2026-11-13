// =========================================================
// FILE: citizens.js (DATA WARGA, SUPABASE & DIALOG MAYOR)
// =========================================================

const SUPABASE_URL = "https://rrxgvmnfwzuwespocmpr.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_n3eXwqjlZO-uVUW9ZOirHw_50W-7MkX";

// Daftar Warga Tetap & Komentar TikTok
// Ketik avatar: "naoya", "steve", "alex", atau "citizen"
// Ketik has_yard: true jika warga berkomentar di TikTok (Dapat Pagar + Pohon Oak)
const defaultCitizens = {
  1: { username: "@steve", tier: "subsidized", decor: null, has_yard: false, avatar: "steve" },
  2: { username: "@alex", tier: "subsidized", decor: null, has_yard: false, avatar: "alex" },
  3: { username: "@Godkingters 2.0", tier: "subsidized", decor: null, has_yard: true, avatar: "naoya" }
  // Tambahkan warga Episode 2 di baris bawah ini (contoh: 4: { ... })
};

// Kalimat Bubble Chat Mayor yang Berganti Otomatis Tiap 4 Detik
const mayorPhrases = [
  "\"Welcome @Godkingters 2.0 to House #3! 🎉\"",
  "\"He got a Naoya Zenin avatar & Free Yard! 🌳\"",
  "\"Follow @mayorofnexatoncity...\"",
  "\"...and comment to get YOUR free house! 🏠\"",
  "\"Look at the citizens enjoying the season! ✨\"",
  "\"Shop decor to unlock a 2-Story VIP Villa! 🏰\""
];

// Warna Atap 12 Rumah Subsidi
const houseColors = [
  0x0284c7, 0xe11d48, 0x059669, 0xd97706,
  0x7c3aed, 0xdb2777, 0x0d9488, 0x4f46e5,
  0xdc2626, 0x0891b2, 0x65a30d, 0x9333ea
];
