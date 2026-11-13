// =========================================================
// FILE: citizens.js (VIBRANT LIGHTING, JOINT FIX & BREAK ANIMATIONS)
// =========================================================

const SUPABASE_URL = "https://rrxgvmnfwzuwespocmpr.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_n3eXwqjlZO-uVUW9ZOirHw_50W-7MkX";

// Daftar Warga Resmi NexatonCity (Rumah #1 - #7)
const defaultCitizens = {
  1: { username: "@steve", tier: "subsidized", decor: null, has_yard: false, avatar: "steve" },
  2: { username: "@alex", tier: "subsidized", decor: null, has_yard: false, avatar: "alex" },
  3: { username: "@Godkingters 2.0", tier: "subsidized", decor: null, has_yard: true, avatar: "naoya" },
  4: { username: "@sealllyx", tier: "subsidized", decor: null, has_yard: true, avatar: "seal" },
  5: { username: "@Jejey", tier: "subsidized", decor: null, has_yard: true, avatar: "hutao" },
  6: { username: "@Akhtar", tier: "subsidized", decor: null, has_yard: true, avatar: "akhtar" },
  7: { username: "@Care.", tier: "subsidized", decor: null, has_yard: true, avatar: "computer" }
};

// Kalimat Bubble Chat Mayor
const mayorPhrases = [
  "\"Welcome @sealllyx (Seal) to House #4! 🦭🌳\"",
  "\"Welcome @Jejey (Hu Tao) to House #5! 🔥👻\"",
  "\"Welcome @Akhtar & @Care. to Houses #6 & #7! ⭐💻\"",
  "\"Look! Citizens are sitting & eating snacks! 🍱🪑\"",
  "\"Only 5 empty houses left on Main Island! 🚨\"",
  "\"Shop decor to upgrade into a VIP Villa! 🏰\""
];

// Warna Atap 12 Rumah Subsidi (Cerah & Hidup)
const houseColors = [
  0x0284c7, 0xe11d48, 0x059669, 0xd97706,
  0x7c3aed, 0xdb2777, 0x0d9488, 0x4f46e5,
  0xdc2626, 0x0891b2, 0x65a30d, 0x9333ea
];

// =========================================================
// PATCH UTAMA: WARNA CERAH, SENDI PRESISI & ANIMASI BREAK
// =========================================================
window.addEventListener("DOMContentLoaded", () => {

  // ---------------------------------------------------------
  // 1. KEMBALIKAN WARNA CERAH (ANTI-ABU-ABU) + BEBAS GLITCH
  // ---------------------------------------------------------
  if (typeof renderer !== "undefined") {
    renderer.toneMapping = THREE.NoToneMapping; // Warna asli cerah 100% tanpa kabut abu-abu
    renderer.outputEncoding = THREE.sRGBEncoding;
  }

  if (typeof sunLight !== "undefined") {
    sunLight.intensity = 1.18;
    sunLight.color.setHex(0xfffbeb);
    sunLight.shadow.bias = -0.0005;
    sunLight.shadow.normalBias = 0.02;
  }

  if (typeof ambientLight !== "undefined") ambientLight.intensity = 0.72;
  if (typeof hemiLight !== "undefined") hemiLight.intensity = 0.42;

  if (typeof cityGroup !== "undefined") {
    cityGroup.traverse((obj) => {
      if (obj.isMesh && obj.material) {
        obj.material.roughness = 0.75;
        obj.material.metalness = 0.04;
        if (obj.geometry && obj.geometry.parameters && obj.geometry.parameters.height < 0.25) {
          obj.material.polygonOffset = true;
          obj.material.polygonOffsetFactor = -1;
          obj.material.polygonOffsetUnits = -1;
        }
      }
    });
  }

  const origUpdateEnv = window.updateGlobalSyncedEnvironment;
  window.updateGlobalSyncedEnvironment = function () {
    lastAppliedSeason = -1;
    origUpdateEnv();
    if (typeof ambientLight !== "undefined") ambientLight.intensity = isNight ? 0.35 : 0.72;
    if (typeof hemiLight !== "undefined") hemiLight.intensity = isNight ? 0.22 : 0.42;
    if (typeof sunLight !== "undefined") {
      const s = seasons[currentSeasonIdx];
      sunLight.intensity = isNight ? 0.38 : (s.id === "rain" ? 0.75 : 1.18);
    }
  };
  window.updateGlobalSyncedEnvironment();

  function part(w, h, d, hex, x, y, z, opts = {}) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mat = opts.glow
      ? new THREE.MeshBasicMaterial({ color: hex, transparent: Boolean(opts.opacity), opacity: opts.opacity || 1 })
      : new THREE.MeshStandardMaterial({
          color: hex,
          roughness: opts.rough !== undefined ? opts.rough : 0.72,
          metalness: opts.metal !== undefined ? opts.metal : 0.05,
          transparent: Boolean(opts.opacity),
          opacity: opts.opacity || 1,
          polygonOffset: true,
          polygonOffsetFactor: opts.offset || 0,
          polygonOffsetUnits: opts.offset || 0
        });
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = opts.cast !== undefined ? opts.cast : !opts.glow;
    m.receiveShadow = opts.receive !== undefined ? opts.receive : true;
    return m;
  }

  // Pembuat Makanan / Minuman 3D di Tangan Kanan Saat Istirahat Makan
  function createFoodProp(avatarType, uLower) {
    const food = new THREE.Group();
    if (avatarType === "seal" || uLower.includes("sealllyx")) {
      // 🐟 Ikan Salmon Segar untuk Seal
      food.add(part(0.16, 0.14, 0.42, 0x38bdf8, 0, 0, 0));
      food.add(part(0.18, 0.12, 0.20, 0xfb7185, 0, 0, 0.05));
      food.add(part(0.08, 0.22, 0.14, 0x0284c7, 0, 0, -0.24));
    } else if (avatarType === "hutao" || uLower.includes("jejey")) {
      // 🍡 Tusuk Sate Dango 3 Warna (Pink, Putih, Hijau)
      food.add(part(0.04, 0.45, 0.04, 0xd97706, 0, 0.1, 0));
      food.add(part(0.16, 0.14, 0.16, 0x4ade80, 0, 0.02, 0));
      food.add(part(0.16, 0.14, 0.16, 0xffffff, 0, 0.16, 0));
      food.add(part(0.16, 0.14, 0.16, 0xf472b6, 0, 0.30, 0));
    } else if (avatarType === "naoya" || uLower.includes("godkingters")) {
      // ☕ Cangkir Matcha / Kopi Hangat
      food.add(part(0.22, 0.26, 0.22, 0xf8fafc, 0, 0.05, 0));
      food.add(part(0.18, 0.06, 0.18, 0x16a34a, 0, 0.16, 0));
    } else if (avatarType === "akhtar" || uLower.includes("akhtar")) {
      // 🍎 Golden Apple Minecraft Berkilau
      food.add(part(0.24, 0.24, 0.24, 0xfacc15, 0, 0.05, 0, { glow: true }));
      food.add(part(0.05, 0.10, 0.05, 0x78350f, 0, 0.20, 0));
    } else if (avatarType === "computer" || uLower.includes("care")) {
      // 🍕 Sepotong Pizza Keju Pepperoni
      food.add(part(0.28, 0.06, 0.32, 0xfacc15, 0, 0, 0.05));
      food.add(part(0.30, 0.08, 0.08, 0xd97706, 0, 0.02, -0.10));
      food.add(part(0.08, 0.08, 0.08, 0xef4444, -0.05, 0.03, 0.05));
      food.add(part(0.08, 0.08, 0.08, 0xef4444, 0.06, 0.03, 0.10));
    } else {
      // 🥩 Steak / Roti Minecraft untuk Steve, Alex & Warga
      food.add(part(0.26, 0.14, 0.30, 0x9a3412, 0, 0.02, 0));
      food.add(part(0.18, 0.15, 0.20, 0xfed7aa, 0, 0.03, 0.02));
    }
    return food;
  }

  // ---------------------------------------------------------
  // 2. GENERATOR KARAKTER DENGAN SENDI BAHU & PINGGUL ASLI
  // ---------------------------------------------------------
  const customAnimatedCitizens = [];

  window.buildDetailedCharacterRig = function (username, fallbackColor, avatarType) {
    const charGroup = new THREE.Group();
    const uLower = (username || "").toLowerCase();

    // Wadah Tubuh Utama (Bisa Turun Saat Duduk)
    const rigRoot = new THREE.Group();
    charGroup.add(rigRoot);

    // Bangku Kayu Kecil (Muncul Otomatis di Bawah Warga Saat Istirahat Duduk)
    const sitStool = new THREE.Group();
    sitStool.add(part(0.75, 0.10, 0.55, 0x92400e, 0, 0.34, -0.08));
    sitStool.add(part(0.12, 0.34, 0.45, 0x78350f, -0.28, 0.17, -0.08));
    sitStool.add(part(0.12, 0.34, 0.45, 0x78350f, 0.28, 0.17, -0.08));
    sitStool.visible = false;
    charGroup.add(sitStool);

    const isSeal = avatarType === "seal" || uLower.includes("sealllyx");
    const isNaoya = avatarType === "naoya" || uLower.includes("godkingters");

    // SENDI PINGGUL (HIP JOINTS) & SENDI BAHU (SHOULDER JOINTS)
    const legL = new THREE.Group();
    const legR = new THREE.Group();
    const armL = new THREE.Group();
    const armR = new THREE.Group();
    const headGroup = new THREE.Group();

    if (isSeal) {
      legL.position.set(-0.24, 0.16, -0.36);
      legR.position.set(0.24, 0.16, -0.36);
      armL.position.set(-0.48, 0.36, 0.15);
      armR.position.set(0.48, 0.36, 0.15);
      headGroup.position.set(0, 0.88, 0.18);
    } else {
      // Titik Putar Pinggul di y = 0.66, Titik Putar Bahu di y = 1.44
      legL.position.set(-0.19, 0.66, 0);
      legR.position.set(0.19, 0.66, 0);
      armL.position.set(-0.52, 1.44, 0);
      armR.position.set(0.52, 1.44, 0);
      headGroup.position.set(0, 1.54, 0);
    }

    rigRoot.add(legL, legR, armL, armR, headGroup);

    // Fungsi Wajah Anime/Voxel di dalam headGroup
    function addFaceToHead(irisHex, browHex, smug = false) {
      headGroup.add(part(0.20, 0.14, 0.02, 0xffffff, -0.18, 0.34, 0.39, { offset: -1 }));
      headGroup.add(part(0.20, 0.14, 0.02, 0xffffff, 0.18, 0.34, 0.39, { offset: -1 }));
      headGroup.add(part(0.12, 0.14, 0.03, irisHex, -0.16, 0.34, 0.40, { offset: -2 }));
      headGroup.add(part(0.12, 0.14, 0.03, irisHex, 0.16, 0.34, 0.40, { offset: -2 }));
      headGroup.add(part(0.05, 0.05, 0.04, 0xffffff, -0.19, 0.37, 0.41, { glow: true }));
      headGroup.add(part(0.05, 0.05, 0.04, 0xffffff, 0.15, 0.37, 0.41, { glow: true }));
      const bL = part(0.22, 0.05, 0.03, browHex, -0.18, 0.46, 0.40);
      const bR = part(0.22, 0.05, 0.03, browHex, 0.18, 0.46, 0.40);
      if (smug) { bL.rotation.z = -0.15; bR.rotation.z = 0.15; }
      headGroup.add(bL, bR);
      headGroup.add(part(smug ? 0.18 : 0.12, 0.04, 0.02, 0x9f1239, 0, 0.18, 0.39));
    }

    if (isSeal) {
      // 🦭 1. SEAL (@sealllyx) - Poros Sirip Presisi
      legL.add(part(0.34, 0.16, 0.44, 0xcbd5e1, 0, -0.06, -0.12));
      legR.add(part(0.34, 0.16, 0.44, 0xcbd5e1, 0, -0.06, -0.12));
      armL.add(part(0.42, 0.14, 0.36, 0xcbd5e1, -0.14, -0.04, 0));
      armR.add(part(0.42, 0.14, 0.36, 0xcbd5e1, 0.14, -0.04, 0));

      rigRoot.add(part(0.96, 0.72, 1.06, 0xf1f5f9, 0, 0.44, 0));
      rigRoot.add(part(0.82, 0.60, 0.94, 0xffffff, 0, 0.38, 0.08));
      rigRoot.add(part(0.86, 0.14, 0.86, 0xf43f5e, 0, 0.80, 0.16)); // Syal Merah Cerah

      headGroup.add(part(0.78, 0.66, 0.74, 0xffffff, 0, 0.24, 0));
      headGroup.add(part(0.42, 0.26, 0.26, 0xf8fafc, 0, 0.14, 0.44));
      headGroup.add(part(0.16, 0.12, 0.10, 0x0f172a, 0, 0.22, 0.56));
      headGroup.add(part(0.15, 0.16, 0.06, 0x0f172a, -0.22, 0.30, 0.38));
      headGroup.add(part(0.15, 0.16, 0.06, 0x0f172a, 0.22, 0.30, 0.38));
      headGroup.add(part(0.06, 0.06, 0.07, 0xffffff, -0.24, 0.33, 0.39, { glow: true }));
      headGroup.add(part(0.06, 0.06, 0.07, 0xffffff, 0.20, 0.33, 0.39, { glow: true }));
      headGroup.add(part(0.14, 0.08, 0.05, 0xfb7185, -0.28, 0.18, 0.38));
      headGroup.add(part(0.14, 0.08, 0.05, 0xfb7185, 0.28, 0.18, 0.38));
      headGroup.add(part(0.32, 0.18, 0.32, 0xfacc15, 0, 0.64, 0)); // Mahkota Kecil

    } else if (avatarType === "hutao" || uLower.includes("jejey")) {
      // 🔥 2. HU TAO (@Jejey) - Poros Pinggul & Bahu Presisi
      legL.add(part(0.32, 0.24, 0.32, 0x292524, 0, -0.12, 0));
      legL.add(part(0.28, 0.22, 0.28, 0xffffff, 0, -0.34, 0));
      legL.add(part(0.30, 0.20, 0.36, 0x1c1917, 0, -0.55, 0.02));

      legR.add(part(0.32, 0.24, 0.32, 0x292524, 0, -0.12, 0));
      legR.add(part(0.28, 0.22, 0.28, 0xffffff, 0, -0.34, 0));
      legR.add(part(0.30, 0.20, 0.36, 0x1c1917, 0, -0.55, 0.02));

      rigRoot.add(part(0.78, 0.84, 0.44, 0x271c19, 0, 1.08, 0));
      rigRoot.add(part(0.32, 0.62, 0.46, 0xdc2626, 0, 1.12, 0, { offset: -1 }));
      rigRoot.add(part(0.12, 0.10, 0.48, 0xfacc15, 0, 1.24, 0, { offset: -2 }));
      rigRoot.add(part(0.12, 0.10, 0.48, 0xfacc15, 0, 1.00, 0, { offset: -2 }));

      armL.add(part(0.28, 0.56, 0.30, 0x271c19, 0, -0.26, 0));
      armL.add(part(0.30, 0.12, 0.32, 0xdc2626, 0, -0.56, 0));
      armL.add(part(0.24, 0.16, 0.24, 0xffedd5, 0, -0.68, 0));

      armR.add(part(0.28, 0.56, 0.30, 0x271c19, 0, -0.26, 0));
      armR.add(part(0.30, 0.12, 0.32, 0xdc2626, 0, -0.56, 0));
      armR.add(part(0.24, 0.16, 0.24, 0xffedd5, 0, -0.68, 0));

      headGroup.add(part(0.76, 0.76, 0.76, 0xffedd5, 0, 0.36, 0));
      addFaceToHead(0xe11d48, 0x451a03, false);
      headGroup.add(part(0.38, 0.26, 0.14, 0x451a03, -0.20, 0.62, 0.36));
      headGroup.add(part(0.38, 0.26, 0.14, 0x451a03, 0.20, 0.62, 0.36));
      headGroup.add(part(0.22, 0.90, 0.22, 0x451a03, -0.52, 0.05, -0.10));
      headGroup.add(part(0.22, 0.90, 0.22, 0x451a03, 0.52, 0.05, -0.10));
      headGroup.add(part(1.10, 0.12, 1.10, 0x1c1917, 0, 0.76, 0));
      headGroup.add(part(0.84, 0.44, 0.84, 0x271c19, 0, 1.02, 0));
      headGroup.add(part(0.22, 0.34, 0.04, 0xfef08a, 0, 1.02, 0.44));
      headGroup.add(part(0.22, 0.22, 0.10, 0xf43f5e, 0.34, 1.00, 0.42));

      // Hantu Boo Tao
      const boo = new THREE.Group();
      boo.add(part(0.42, 0.44, 0.42, 0xffffff, 0, 0, 0, { glow: true, opacity: 0.9 }));
      boo.add(part(0.08, 0.08, 0.06, 0x0f172a, -0.10, 0.05, 0.22, { glow: true }));
      boo.add(part(0.08, 0.08, 0.06, 0x0f172a, 0.10, 0.05, 0.22, { glow: true }));
      boo.position.set(-0.85, 2.0, 0.25);
      rigRoot.add(boo);

    } else if (isNaoya) {
      // ⚡ 3. NAOYA ZENIN (@Godkingters 2.0) - Poros Pinggul & Bahu Presisi
      legL.add(part(0.42, 0.56, 0.44, 0xe7e5e4, 0, -0.28, 0));
      legL.add(part(0.34, 0.12, 0.42, 0xfef3c7, 0, -0.60, 0.02));
      legR.add(part(0.42, 0.56, 0.44, 0xe7e5e4, 0, -0.28, 0));
      legR.add(part(0.34, 0.12, 0.42, 0xfef3c7, 0, -0.60, 0.02));

      rigRoot.add(part(0.84, 0.16, 0.48, 0xfafaf9, 0, 0.74, 0));
      rigRoot.add(part(0.80, 0.80, 0.44, 0x1e293b, 0, 1.16, 0));
      rigRoot.add(part(0.28, 0.48, 0.46, 0xffffff, 0, 1.30, 0, { offset: -1 }));

      armL.add(part(0.36, 0.64, 0.42, 0x1e293b, 0, -0.30, 0));
      armL.add(part(0.24, 0.16, 0.24, 0xffedd5, 0, -0.66, 0));
      armR.add(part(0.36, 0.64, 0.42, 0x1e293b, 0, -0.30, 0));
      armR.add(part(0.24, 0.16, 0.24, 0xffedd5, 0, -0.66, 0));

      headGroup.add(part(0.76, 0.76, 0.76, 0xffedd5, 0, 0.36, 0));
      addFaceToHead(0xd97706, 0x1e293b, true);
      headGroup.add(part(0.84, 0.30, 0.84, 0xfacc15, 0, 0.74, 0));
      headGroup.add(part(0.78, 0.22, 0.16, 0xfde047, 0, 0.60, 0.38));
      headGroup.add(part(0.12, 0.38, 0.78, 0x1e293b, -0.40, 0.46, 0));
      headGroup.add(part(0.12, 0.38, 0.78, 0x1e293b, 0.40, 0.46, 0));
      headGroup.add(part(0.10, 0.22, 0.10, 0xf59e0b, -0.43, 0.38, 0.08));
      headGroup.add(part(0.10, 0.22, 0.10, 0xf59e0b, 0.43, 0.38, 0.08));

    } else if (avatarType === "akhtar" || uLower.includes("akhtar")) {
      // ⭐ 4. AKHTAR (@Akhtar) - Poros Pinggul & Bahu Presisi
      legL.add(part(0.32, 0.48, 0.32, 0x1e1b4b, 0, -0.24, 0));
      legL.add(part(0.34, 0.18, 0.38, 0xf59e0b, 0, -0.57, 0.02));
      legR.add(part(0.32, 0.48, 0.32, 0x1e1b4b, 0, -0.24, 0));
      legR.add(part(0.34, 0.18, 0.38, 0xf59e0b, 0, -0.57, 0.02));

      rigRoot.add(part(0.80, 0.14, 0.46, 0xf59e0b, 0, 0.72, 0));
      rigRoot.add(part(0.78, 0.80, 0.44, 0x312e81, 0, 1.14, 0));
      const star = part(0.32, 0.32, 0.06, 0xfacc15, 0, 1.16, 0.24, { glow: true });
      star.rotation.z = Math.PI / 4;
      rigRoot.add(star);

      armL.add(part(0.28, 0.56, 0.30, 0xf59e0b, 0, -0.26, 0));
      armL.add(part(0.26, 0.18, 0.26, 0xfde68a, 0, -0.62, 0));
      armR.add(part(0.28, 0.56, 0.30, 0xf59e0b, 0, -0.26, 0));
      armR.add(part(0.26, 0.18, 0.26, 0xfde68a, 0, -0.62, 0));

      headGroup.add(part(0.76, 0.76, 0.76, 0xfde68a, 0, 0.36, 0));
      addFaceToHead(0xd97706, 0x0f172a, false);
      headGroup.add(part(0.82, 0.28, 0.82, 0x0f172a, 0, 0.74, 0));
      const crown = part(0.40, 0.40, 0.12, 0xfef08a, 0, 1.18, 0, { glow: true });
      crown.rotation.z = Math.PI / 4;
      headGroup.add(crown);

    } else if (avatarType === "computer" || uLower.includes("care")) {
      // 💻 5. COMPUTER (@Care.) - Poros Pinggul & Bahu Presisi
      legL.add(part(0.32, 0.48, 0.32, 0x475569, 0, -0.24, 0));
      legL.add(part(0.34, 0.18, 0.38, 0x0f172a, 0, -0.57, 0.02));
      legR.add(part(0.32, 0.48, 0.32, 0x475569, 0, -0.24, 0));
      legR.add(part(0.34, 0.18, 0.38, 0x0f172a, 0, -0.57, 0.02));

      rigRoot.add(part(0.80, 0.82, 0.46, 0x64748b, 0, 1.12, 0));
      rigRoot.add(part(0.56, 0.28, 0.08, 0x0f172a, 0, 1.16, 0.24));
      rigRoot.add(part(0.48, 0.06, 0.10, 0x38bdf8, 0, 1.20, 0.25, { glow: true }));
      rigRoot.add(part(0.48, 0.06, 0.10, 0xf43f5e, 0, 1.10, 0.25, { glow: true }));

      armL.add(part(0.28, 0.68, 0.30, 0x94a3b8, 0, -0.32, 0));
      armR.add(part(0.28, 0.68, 0.30, 0x94a3b8, 0, -0.32, 0));

      headGroup.add(part(0.96, 0.82, 0.80, 0xf1f5f9, 0, 0.38, 0));
      headGroup.add(part(0.80, 0.64, 0.06, 0x090d16, 0, 0.38, 0.39));
      headGroup.add(part(0.16, 0.20, 0.08, 0x22d3ee, -0.18, 0.44, 0.40, { glow: true }));
      headGroup.add(part(0.16, 0.20, 0.08, 0x22d3ee, 0.18, 0.44, 0.40, { glow: true }));
      headGroup.add(part(0.28, 0.08, 0.08, 0x22d3ee, 0, 0.24, 0.40, { glow: true }));

    } else {
      // 🧱 6. STEVE, ALEX & WARGA - Poros Pinggul & Bahu Presisi
      const isAlex = uLower === "@alex";
      const shirtCol = uLower === "@steve" ? 0x0ea5e9 : (isAlex ? 0x22c55e : fallbackColor);
      const pantsCol = uLower === "@steve" ? 0x1d4ed8 : (isAlex ? 0x78350f : 0x1e3a8a);
      const hairCol = uLower === "@steve" ? 0x451a03 : (isAlex ? 0xea580c : 0x27272a);
      const skinCol = uLower === "@steve" ? 0xd97706 : 0xfed7aa;

      legL.add(part(0.32, 0.48, 0.32, pantsCol, 0, -0.24, 0));
      legL.add(part(0.32, 0.18, 0.36, 0x3f3f46, 0, -0.57, 0.02));
      legR.add(part(0.32, 0.48, 0.32, pantsCol, 0, -0.24, 0));
      legR.add(part(0.32, 0.18, 0.36, 0x3f3f46, 0, -0.57, 0.02));

      rigRoot.add(part(0.76, 0.80, 0.42, shirtCol, 0, 1.12, 0));

      armL.add(part(0.28, 0.30, 0.30, shirtCol, 0, -0.14, 0));
      armL.add(part(0.26, 0.40, 0.26, skinCol, 0, -0.48, 0));
      armR.add(part(0.28, 0.30, 0.30, shirtCol, 0, -0.14, 0));
      armR.add(part(0.26, 0.40, 0.26, skinCol, 0, -0.48, 0));

      headGroup.add(part(0.76, 0.76, 0.76, skinCol, 0, 0.36, 0));
      addFaceToHead(isAlex ? 0x16a34a : 0x1d4ed8, hairCol, false);
      headGroup.add(part(0.82, 0.26, 0.82, hairCol, 0, 0.74, 0));
      headGroup.add(part(0.78, 0.18, 0.14, hairCol, 0, 0.58, 0.36));
    }

    // Makanan / Minuman di Ujung Tangan Kanan (Muncul Saat Istirahat Makan!)
    const foodProp = createFoodProp(avatarType, uLower);
    foodProp.position.set(0, isSeal ? -0.05 : -0.68, 0.22);
    foodProp.visible = false;
    armR.add(foodProp);

    // Payung & Bola Salju Musiman (Menempel di Tangan Kiri)
    const citizenUmbrella = new THREE.Group();
    citizenUmbrella.add(part(0.08, 1.4, 0.08, 0xe2e8f0, 0, 0.4, 0.2));
    citizenUmbrella.add(part(1.45, 0.18, 1.45, fallbackColor, 0, 1.1, 0.2));
    citizenUmbrella.visible = false;
    armL.add(citizenUmbrella);

    const handSnowball = part(0.24, 0.24, 0.24, 0xffffff, 0, -0.65, 0.25);
    handSnowball.visible = false;
    armL.add(handSnowball);

    charGroup.position.set(0.8, 0.18, 2.65);
    charGroup.userData = {
      rigRoot,
      sitStool,
      headGroup,
      legL, legR, armL, armR,
      foodProp,
      citizenUmbrella,
      handSnowball,
      isSeal,
      isNaoya,
      baseLabel: "",
      phase: Math.random() * 10
    };

    return charGroup;
  };

  window.spawnCitizenAvatarOnHouse = function (houseGroup, username, fallbackColor, avatarType) {
    if (houseGroup.userData.avatarMesh) return;
    const charGroup = window.buildDetailedCharacterRig(username, fallbackColor, avatarType);
    charGroup.userData.phase = houseGroup.userData.id * 2.3;
    charGroup.userData.houseRef = houseGroup;
    houseGroup.add(charGroup);
    houseGroup.userData.avatarMesh = charGroup;
    customAnimatedCitizens.push(charGroup);
    // Kosongkan citizenAvatars bawaan world.js agar animasinya tidak bentrok
    citizenAvatars.length = 0;
  };

  // ---------------------------------------------------------
  // 3. SISTEM ANIMASI HIDUP & ISTIRAHAT (JALAN, DUDUK, MAKAN, SAPA)
  // ---------------------------------------------------------
  function updateCustomCitizensAnimation() {
    requestAnimationFrame(updateCustomCitizensAnimation);
    citizenAvatars.length = 0; // Pastikan loop lama di world.js tetap nonaktif

    const nowSec = Date.now() / 1000;
    const activeSeasonId = (typeof seasons !== "undefined" && seasons[currentSeasonIdx])
      ? seasons[currentSeasonIdx].id
      : "sakura";

    customAnimatedCitizens.forEach((av) => {
      const u = av.userData;
      const cycleTime = (nowSec + u.phase * 3.5) % 20; // Siklus 20 detik per warga

      u.citizenUmbrella.visible = (activeSeasonId === "rain");
      u.handSnowball.visible = (activeSeasonId === "snow" && cycleTime < 9);

      if (cycleTime < 9) {
        // ===================================================
        // STATE 1: JALAN SANTAI (0 - 9 Detik) - Sendi Normal
        // ===================================================
        u.sitStool.visible = false;
        u.foodProp.visible = false;
        u.rigRoot.position.y = 0;

        const speed = u.isNaoya ? 2.4 : 1.35;
        const walkWave = Math.sin((nowSec + u.phase) * speed);
        const walkDir = Math.cos((nowSec + u.phase) * speed);

        av.position.x = walkWave * 1.15;
        av.position.y = 0.18 + Math.abs(Math.sin((nowSec + u.phase) * 7)) * 0.06;
        av.rotation.y = walkDir >= 0 ? Math.PI / 2.2 : -Math.PI / 2.2;

        // Ayunan Kaki dari Pinggul & Tangan dari Bahu
        const swing = Math.sin((nowSec + u.phase) * 7.5) * (u.isSeal ? 0.25 : 0.48);
        u.legL.rotation.x = swing;
        u.legR.rotation.x = -swing;
        u.armL.rotation.x = -swing * 0.85;
        u.armR.rotation.x = swing * 0.85;
        u.armR.rotation.z = 0;
        u.headGroup.rotation.y = Math.sin(nowSec * 2 + u.phase) * 0.15;
        u.headGroup.rotation.x = 0;

      } else if (cycleTime < 14) {
        // ===================================================
        // STATE 2: ISTIRAHAT MAKAN / MINUM SNACK (9 - 14 Detik)
        // ===================================================
        u.sitStool.visible = false;
        u.foodProp.visible = true;
        u.rigRoot.position.y = 0;

        av.position.y = 0.18;
        av.rotation.y = 0; // Menghadap ke depan (ke arah penonton)

        // Kaki berdiri tenang
        u.legL.rotation.x = 0;
        u.legR.rotation.x = 0;
        u.armL.rotation.x = 0.1;

        // Tangan kanan mengangkat makanan ke mulut & mengunyah (Nom Nom!)
        const chew = Math.sin(nowSec * 10 + u.phase);
        u.armR.rotation.x = u.isSeal ? -0.4 + chew * 0.15 : -1.85 + chew * 0.18;
        u.armR.rotation.z = -0.25;
        u.headGroup.rotation.x = 0.12 + Math.abs(chew) * 0.10;
        u.headGroup.rotation.y = 0;

      } else if (cycleTime < 18) {
        // ===================================================
        // STATE 3: DUDUK SANTAI DI BANGKU (14 - 18 Detik)
        // ===================================================
        u.sitStool.visible = !u.isSeal;
        u.foodProp.visible = false;

        av.position.y = 0.18;
        av.rotation.y = 0;

        // Badan turun ke posisi duduk & kaki menekuk 90 derajat di pinggul!
        u.rigRoot.position.y = u.isSeal ? -0.05 : -0.26;
        const dangle = Math.sin(nowSec * 5 + u.phase) * 0.12;
        u.legL.rotation.x = u.isSeal ? 0.2 : -Math.PI / 2.1 + dangle;
        u.legR.rotation.x = u.isSeal ? 0.2 : -Math.PI / 2.1 - dangle;

        // Tangan bersandar santai di lutut & kepala menoleh menikmati pemandangan
        u.armL.rotation.x = -0.35;
        u.armR.rotation.x = -0.35;
        u.armR.rotation.z = 0;
        u.headGroup.rotation.y = Math.sin(nowSec * 1.8 + u.phase) * 0.35;
        u.headGroup.rotation.x = 0;

      } else {
        // ===================================================
        // STATE 4: MENYAPA PENONTON / MELAMBAI (18 - 20 Detik)
        // ===================================================
        u.sitStool.visible = false;
        u.foodProp.visible = false;
        u.rigRoot.position.y = 0;

        av.position.y = 0.18 + Math.abs(Math.sin(nowSec * 8)) * 0.14;
        av.rotation.y = 0;

        u.legL.rotation.x = 0;
        u.legR.rotation.x = 0;
        u.armL.rotation.x = 0;
        // Tangan kanan diangkat tinggi melambai kiri-kanan
        u.armR.rotation.x = -2.6;
        u.armR.rotation.z = Math.sin(nowSec * 12) * 0.35;
        u.headGroup.rotation.y = 0;
        u.headGroup.rotation.x = -0.08;
      }
    });
  }
  updateCustomCitizensAnimation();

  // ---------------------------------------------------------
  // 4. INTERIOR KAMAR 3D CERAH & NYAMAN (DENGAN WARGA ISTIRAHAT)
  // ---------------------------------------------------------
  let customRoomScene = null;
  let customRoomCamera = null;
  let customRoomRenderer = null;
  let customBedBlanket = null;
  let customOwnerHolder = null;
  let customVipItemGroup = null;
  let customRoomAnimId = null;

  function buildUpgradedRoom3D() {
    const box = document.getElementById("room3dContainer");
    box.innerHTML = "";

    customRoomScene = new THREE.Scene();
    customRoomScene.background = new THREE.Color(0x1e293b);

    customRoomCamera = new THREE.PerspectiveCamera(36, box.clientWidth / box.clientHeight, 0.1, 100);
    customRoomCamera.position.set(8.2, 6.8, 8.2);
    customRoomCamera.lookAt(0, 1.3, 0);

    customRoomRenderer = new THREE.WebGLRenderer({ antialias: true });
    customRoomRenderer.setSize(box.clientWidth, box.clientHeight);
    customRoomRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    customRoomRenderer.shadowMap.enabled = true;
    customRoomRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
    customRoomRenderer.outputEncoding = THREE.sRGBEncoding;
    box.appendChild(customRoomRenderer.domElement);

    // Pencahayaan Kamar Cerah & Hangat
    customRoomScene.add(new THREE.AmbientLight(0xffffff, 0.78));

    const warmLamp = new THREE.DirectionalLight(0xfffbeb, 0.95);
    warmLamp.position.set(6, 10, 6);
    warmLamp.castShadow = true;
    warmLamp.shadow.bias = -0.001;
    customRoomScene.add(warmLamp);

    // Lantai Papan Kayu Cerah
    customRoomScene.add(part(6.4, 0.35, 6.4, 0x78350f, 0, -0.18, 0));
    for (let fx = -2.5; fx <= 2.5; fx += 1.0) {
      for (let fz = -2.5; fz <= 2.5; fz += 1.0) {
        const plankCol = (Math.round(fx + fz) % 2 === 0) ? 0xb45309 : 0x92400e;
        customRoomScene.add(part(0.96, 0.08, 0.96, plankCol, fx, 0.02, fz));
      }
    }

    // Dinding Krem Cerah
    customRoomScene.add(part(6.4, 4.2, 0.3, 0xf8fafc, 0, 2.1, -3.05));
    customRoomScene.add(part(0.3, 4.2, 6.4, 0xf1f5f9, -3.05, 2.1, 0));
    customRoomScene.add(part(6.2, 0.35, 0.08, 0x78350f, 0, 0.22, -2.88));
    customRoomScene.add(part(0.08, 0.35, 6.2, 0x78350f, -2.88, 0.22, 0));

    // Jendela & Bonsai
    customRoomScene.add(part(2.0, 1.7, 0.12, 0x78350f, -0.2, 2.45, -2.88));
    customRoomScene.add(part(1.75, 1.45, 0.14, 0x38bdf8, -0.2, 2.45, -2.87, { glow: true }));
    customRoomScene.add(part(0.32, 1.85, 0.18, 0xf43f5e, -1.15, 2.42, -2.82));
    customRoomScene.add(part(0.32, 1.85, 0.18, 0xf43f5e, 0.75, 2.42, -2.82));

    // Tempat Tidur 4 Tiang
    const bedX = -1.75, bedZ = -0.9;
    customRoomScene.add(part(1.95, 0.38, 2.9, 0x78350f, bedX, 0.25, bedZ));
    customRoomScene.add(part(1.95, 1.35, 0.24, 0x5c2d0c, bedX, 0.72, bedZ - 1.35));
    [[-0.9, -1.35], [0.9, -1.35], [-0.9, 1.35], [0.9, 1.35]].forEach(([px, pz]) => {
      customRoomScene.add(part(0.20, 1.55, 0.20, 0x5c2d0c, bedX + px, 0.82, bedZ + pz));
    });
    customRoomScene.add(part(1.78, 0.28, 2.68, 0xffffff, bedX, 0.54, bedZ));
    customRoomScene.add(part(0.72, 0.18, 0.52, 0xf8fafc, bedX - 0.42, 0.74, bedZ - 0.92));
    customRoomScene.add(part(0.72, 0.18, 0.52, 0xf8fafc, bedX + 0.42, 0.74, bedZ - 0.92));
    customBedBlanket = part(1.82, 0.30, 1.75, 0x0284c7, bedX, 0.58, bedZ + 0.42);
    customRoomScene.add(customBedBlanket);

    // Meja PC Gaming + Kursi Gaming
    customRoomScene.add(part(2.2, 0.12, 1.15, 0x92400e, 1.65, 1.05, -2.2));
    customRoomScene.add(part(0.16, 1.0, 1.05, 0x1e293b, 0.65, 0.55, -2.2));
    customRoomScene.add(part(0.16, 1.0, 1.05, 0x1e293b, 2.65, 0.55, -2.2));
    customRoomScene.add(part(0.95, 0.58, 0.08, 0x0f172a, 1.35, 1.48, -2.45));
    customRoomScene.add(part(0.88, 0.50, 0.09, 0x38bdf8, 1.35, 1.48, -2.44, { glow: true }));
    customRoomScene.add(part(0.68, 0.12, 0.68, 0x1e293b, 1.35, 0.62, -1.15));
    customRoomScene.add(part(0.64, 0.85, 0.14, 0xef4444, 1.35, 1.08, -0.85));

    customVipItemGroup = new THREE.Group();
    customVipItemGroup.add(part(0.48, 0.38, 0.48, 0x1e293b, 0, 0.2, 0));
    customVipItemGroup.add(part(0.42, 0.25, 0.42, 0xf97316, 0, 0.5, 0, { glow: true }));
    customVipItemGroup.add(part(0.24, 0.24, 0.24, 0xfef08a, 0, 0.75, 0, { glow: true }));
    customVipItemGroup.position.set(2.35, 1.12, -2.2);
    customRoomScene.add(customVipItemGroup);

    // Rak Buku & Karpet Cerah
    customRoomScene.add(part(0.75, 2.5, 1.5, 0x78350f, -2.5, 1.3, 1.6));
    [0.6, 1.25, 1.9].forEach((sy, idx) => {
      customRoomScene.add(part(0.78, 0.08, 1.44, 0x5c2d0c, -2.48, sy, 1.6));
      customRoomScene.add(part(0.45, 0.38, 0.22, idx % 2 === 0 ? 0xef4444 : 0x3b82f6, -2.35, sy + 0.22, 1.3));
      customRoomScene.add(part(0.45, 0.35, 0.22, 0x10b981, -2.35, sy + 0.20, 1.6));
      customRoomScene.add(part(0.45, 0.40, 0.22, 0xfacc15, -2.35, sy + 0.23, 1.9));
    });

    customRoomScene.add(part(3.0, 0.06, 2.4, 0xfef08a, 0.45, 0.08, 0.65, { offset: -1 }));
    customRoomScene.add(part(2.5, 0.07, 1.9, 0xf59e0b, 0.45, 0.09, 0.65, { offset: -2 }));

    customOwnerHolder = new THREE.Group();
    customOwnerHolder.position.set(0.35, 0.08, 0.55);
    customRoomScene.add(customOwnerHolder);
  }

  window.open3DInterior = function (houseData) {
    document.getElementById("roomTitle").textContent = `${houseData.name.toUpperCase()}`;
    document.getElementById("interiorModal").classList.remove("hidden");

    if (!customRoomRenderer) buildUpgradedRoom3D();
    customBedBlanket.material.color.setHex(houseData.roofColor);

    while (customOwnerHolder.children.length > 0) {
      customOwnerHolder.remove(customOwnerHolder.children[0]);
    }

    const actionArea = document.getElementById("roomActionArea");
    document.getElementById("infoYard").textContent = houseData.has_yard ? "Unlocked (Fence + Tree) 🌳" : "Comment on TikTok 💬";
    document.getElementById("roomYardBanner").textContent = houseData.has_yard ? "🌳 Yard & Oak Tree: INSTALLED" : "🌳 Yard: Comment to Unlock";
    document.getElementById("infoDecor").textContent = houseData.decor ? houseData.decor : "Gaming PC + Snack 🍱";

    if (houseData.owner) {
      const charInside = window.buildDetailedCharacterRig(houseData.owner, houseData.roofColor, houseData.avatarType);
      charInside.position.set(0, 0, 0);
      charInside.rotation.y = Math.PI / 8;
      // Di dalam kamar, warga sedang santai makan camilan favoritnya!
      charInside.userData.foodProp.visible = true;
      customOwnerHolder.add(charInside);

      document.getElementById("roomOwnerBanner").textContent = `👤 Citizen: ${houseData.owner}`;
      document.getElementById("infoCitizen").textContent = houseData.owner;
      actionArea.innerHTML = `
        <button onclick="closeInterior(); openShopGateway('${houseData.owner}');"
           class="mc-btn-gold w-full py-3 rounded-xl text-center text-slate-950 font-black text-xs sm:text-sm block">
          🛒 BUY DECOR TO UPGRADE ${houseData.owner.toUpperCase()} TO A VILLA!
        </button>`;
    } else {
      document.getElementById("roomOwnerBanner").textContent = `🔑 Unclaimed Subsidized House`;
      document.getElementById("infoCitizen").textContent = "Available (Free)";
      actionArea.innerHTML = `
        <button onclick="closeInterior(); openClaimModal(${houseData.id});"
           class="mc-btn-emerald w-full py-3 rounded-xl text-center text-slate-950 font-black text-xs sm:text-sm block">
          🏠 CLAIM THIS HOUSE FOR FREE (FOLLOW MAYOR)
        </button>`;
    }

    function renderCustomRoomLoop() {
      customRoomAnimId = requestAnimationFrame(renderCustomRoomLoop);
      customRoomScene.rotation.y = Math.sin(tick * 0.012) * 0.22;
      if (customVipItemGroup) customVipItemGroup.rotation.y += 0.03;
      if (customOwnerHolder.children.length > 0) {
        const av = customOwnerHolder.children[0];
        const u = av.userData;
        const chew = Math.sin(tick * 0.18);
        u.armR.rotation.x = u.isSeal ? -0.4 + chew * 0.15 : -1.8 + chew * 0.18;
        u.headGroup.rotation.x = 0.1 + Math.abs(chew) * 0.1;
      }
      customRoomRenderer.render(customRoomScene, customRoomCamera);
    }

    if (customRoomAnimId) cancelAnimationFrame(customRoomAnimId);
    renderCustomRoomLoop();
  };

  window.closeInterior = function () {
    document.getElementById("interiorModal").classList.add("hidden");
    if (customRoomAnimId) cancelAnimationFrame(customRoomAnimId);
  };

  // ---------------------------------------------------------
  // 5. REFRESH WARGA & TERAPKAN RIG BARU
  // ---------------------------------------------------------
  Object.keys(defaultCitizens).forEach(id => {
    claimedData[id] = { ...defaultCitizens[id] };
  });

  clickableHouses.forEach((h, i) => {
    h.userData.roofColor = houseColors[i % houseColors.length];
    if (h.userData.avatarMesh) {
      h.remove(h.userData.avatarMesh);
      h.userData.avatarMesh = null;
    }
  });
  customAnimatedCitizens.length = 0;

  const origRefresh = window.refreshHousesState;
  window.refreshHousesState = function () {
    origRefresh();
    const avatarBadges = {
      naoya: "⚡ @Godkingters 2.0 (Naoya + Garden 🌳)",
      seal: "🦭 @sealllyx (Seal + Garden 🌳)",
      hutao: "🔥 @Jejey (Hu Tao + Garden 🌳)",
      akhtar: "⭐ @Akhtar (Star + Garden 🌳)",
      computer: "💻 @Care. (PC + Garden 🌳)"
    };
    clickableHouses.forEach(h => {
      const av = h.userData.avatarType;
      if (avatarBadges[av] && h.userData.tier !== "villa") {
        h.userData.labelEl.textContent = avatarBadges[av];
        h.userData.labelEl.className = "house-label bg-sky-400 text-slate-950 border-slate-900 px-2.5 py-0.5 rounded-md text-[10px] font-black shadow-lg";
      }
    });
  };

  window.refreshHousesState();

  let tourIndex = 0;
  const newCitizenIds = [4, 5, 6, 7, 3];
  window.focusCitizenById = function () {
    const targetId = newCitizenIds[tourIndex % newCitizenIds.length];
    tourIndex++;
    const h = clickableHouses.find(item => item.userData.id === targetId);
    if (h) {
      focusOnHouse(h);
      showToast(`🎥 Highlighting House #${targetId}: ${h.userData.owner}! Watch them walk, sit & eat snacks!`);
    }
  };
});
