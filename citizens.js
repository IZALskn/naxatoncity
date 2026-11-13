// =========================================================
// FILE: citizens.js (DATA WARGA + GRAPHICS, SHADER & 3D ROOM UPGRADE)
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

// Kalimat Bubble Chat Mayor (Otomatis Berganti Tiap 4 Detik)
const mayorPhrases = [
  "\"Welcome @sealllyx (Seal) to House #4! 🦭🌳\"",
  "\"Welcome @Jejey (Hu Tao) to House #5! 🔥👻\"",
  "\"Welcome @Akhtar & @Care. to Houses #6 & #7! ⭐💻\"",
  "\"Comment on TikTok for a Free House + Garden! 🏡\"",
  "\"Only 5 empty houses left on Main Island! 🚨\"",
  "\"Shop decor to upgrade into a VIP Villa! 🏰\""
];

// Warna Atap 12 Rumah Subsidi (Lebih Kalem & Tidak Silau)
const houseColors = [
  0x0369a1, 0xbe123c, 0x047857, 0xb45309,
  0x6d28d9, 0xbe185d, 0x0f766e, 0x4338ca,
  0xb91c1c, 0x0e7490, 0x4d7c0f, 0x7e22ce
];

// =========================================================
// GRAPHICS, SHADER, CHARACTER & 3D ROOM OVERHAUL PATCH
// =========================================================
window.addEventListener("DOMContentLoaded", () => {

  // ---------------------------------------------------------
  // 1. FIX SHADER GLITCHING (SHADOW ACNE & Z-FIGHTING) & TOO BRIGHT
  // ---------------------------------------------------------
  if (typeof renderer !== "undefined") {
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.78; // Meredam silau berlebih (anti-overexposure)
    renderer.outputEncoding = THREE.sRGBEncoding;
  }

  if (typeof sunLight !== "undefined") {
    sunLight.intensity = 0.85;
    sunLight.color.setHex(0xfff7ed);
    // Menghilangkan garis-garis hitam berkedip (Shadow Acne)
    sunLight.shadow.bias = -0.0006;
    sunLight.shadow.normalBias = 0.025;
  }

  if (typeof ambientLight !== "undefined") ambientLight.intensity = 0.42;
  if (typeof hemiLight !== "undefined") hemiLight.intensity = 0.25;

  // Hilangkan kedipan (Z-Fighting) pada jalan, marka, dan jendela
  if (typeof cityGroup !== "undefined") {
    cityGroup.traverse((obj) => {
      if (obj.isMesh && obj.material) {
        obj.material.roughness = 0.88;
        obj.material.metalness = 0.05;
        if (obj.geometry && obj.geometry.parameters && obj.geometry.parameters.height < 0.25) {
          obj.material.polygonOffset = true;
          obj.material.polygonOffsetFactor = -1;
          obj.material.polygonOffsetUnits = -1;
        }
      }
    });
  }

  // Override fungsi cuaca agar tidak mengembalikan cahaya yang terlalu terang
  const origUpdateEnv = window.updateGlobalSyncedEnvironment;
  window.updateGlobalSyncedEnvironment = function () {
    lastAppliedSeason = -1;
    origUpdateEnv();
    if (typeof ambientLight !== "undefined") ambientLight.intensity = isNight ? 0.26 : 0.42;
    if (typeof hemiLight !== "undefined") hemiLight.intensity = isNight ? 0.15 : 0.25;
    if (typeof sunLight !== "undefined") {
      const s = seasons[currentSeasonIdx];
      sunLight.intensity = isNight ? 0.28 : (s.id === "rain" ? 0.5 : (s.id === "snow" ? 0.72 : 0.88));
    }
  };
  window.updateGlobalSyncedEnvironment();

  // Helper pembuat blok detail dengan shading lembut dan anti z-fighting
  function part(w, h, d, hex, x, y, z, opts = {}) {
    const geo = new THREE.BoxGeometry(w, h, d);
    const mat = opts.glow
      ? new THREE.MeshBasicMaterial({ color: hex, transparent: Boolean(opts.opacity), opacity: opts.opacity || 1 })
      : new THREE.MeshStandardMaterial({
          color: hex,
          roughness: opts.rough !== undefined ? opts.rough : 0.82,
          metalness: opts.metal !== undefined ? opts.metal : 0.08,
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

  // ---------------------------------------------------------
  // 2. HIGH-DETAIL 3D VOXEL CHARACTER GENERATOR
  // ---------------------------------------------------------
  window.buildDetailedCharacterRig = function (username, fallbackColor, avatarType) {
    const charGroup = new THREE.Group();
    const uLower = (username || "").toLowerCase();
    let legL = new THREE.Group();
    let legR = new THREE.Group();
    let armL = new THREE.Group();
    let armR = new THREE.Group();
    let isFastMover = false;

    // Fungsi pembuat wajah anime/voxel detail (Sclera putih + Iris + Alis + Mulut)
    function addDetailedFace(parent, yCenter, zFront, irisHex, browHex, smug = false) {
      // Putih mata (Sclera)
      parent.add(part(0.20, 0.14, 0.02, 0xffffff, -0.18, yCenter, zFront + 0.01, { offset: -1 }));
      parent.add(part(0.20, 0.14, 0.02, 0xffffff, 0.18, yCenter, zFront + 0.01, { offset: -1 }));
      // Pupil / Iris
      parent.add(part(0.12, 0.14, 0.03, irisHex, -0.16, yCenter, zFront + 0.02, { offset: -2 }));
      parent.add(part(0.12, 0.14, 0.03, irisHex, 0.16, yCenter, zFront + 0.02, { offset: -2 }));
      // Highlight mata putih kecil
      parent.add(part(0.05, 0.05, 0.04, 0xffffff, -0.19, yCenter + 0.03, zFront + 0.03, { glow: true }));
      parent.add(part(0.05, 0.05, 0.04, 0xffffff, 0.15, yCenter + 0.03, zFront + 0.03, { glow: true }));
      // Alis
      const bL = part(0.22, 0.05, 0.03, browHex, -0.18, yCenter + 0.12, zFront + 0.02);
      const bR = part(0.22, 0.05, 0.03, browHex, 0.18, yCenter + 0.12, zFront + 0.02);
      if (smug) { bL.rotation.z = -0.15; bR.rotation.z = 0.15; }
      parent.add(bL, bR);
      // Mulut
      parent.add(part(smug ? 0.18 : 0.12, 0.04, 0.02, 0x9f1239, 0, yCenter - 0.16, zFront + 0.01));
    }

    if (avatarType === "seal" || uLower.includes("sealllyx")) {
      // 🦭 1. HIGH-DETAIL SEAL (@sealllyx)
      legL.add(part(0.36, 0.18, 0.48, 0x94a3b8, -0.24, 0.10, -0.42));
      legR.add(part(0.36, 0.18, 0.48, 0x94a3b8, 0.24, 0.10, -0.42));
      // Badan Berlapis (Chubby Seal)
      const torso = part(0.98, 0.74, 1.08, 0xe2e8f0, 0, 0.46, 0);
      const belly = part(0.84, 0.62, 0.96, 0xf8fafc, 0, 0.40, 0.08);
      // Totol-totol punggung khas anjing laut
      const spot1 = part(0.18, 0.05, 0.18, 0x94a3b8, -0.25, 0.84, -0.15);
      const spot2 = part(0.14, 0.05, 0.14, 0x94a3b8, 0.22, 0.84, -0.28);
      // Syal Merah Leher
      const scarf = part(0.88, 0.14, 0.88, 0xe11d48, 0, 0.82, 0.18);
      const scarfTail = part(0.18, 0.35, 0.12, 0xbe123c, 0.22, 0.68, 0.62);
      // Sirip Depan
      armL.add(part(0.46, 0.14, 0.38, 0xcbd5e1, -0.62, 0.32, 0.15));
      armR.add(part(0.46, 0.14, 0.38, 0xcbd5e1, 0.62, 0.32, 0.15));
      // Kepala Bulat + Moncong + Kumis 3D
      const head = part(0.80, 0.68, 0.76, 0xf1f5f9, 0, 1.12, 0.20);
      const snout = part(0.44, 0.28, 0.26, 0xffffff, 0, 1.02, 0.62);
      const nose = part(0.16, 0.12, 0.10, 0x0f172a, 0, 1.10, 0.75);
      // Kumis Kiri & Kanan
      const wL1 = part(0.22, 0.03, 0.03, 0x475569, -0.28, 1.04, 0.68);
      const wL2 = part(0.20, 0.03, 0.03, 0x475569, -0.26, 0.98, 0.68);
      const wR1 = part(0.22, 0.03, 0.03, 0x475569, 0.28, 1.04, 0.68);
      const wR2 = part(0.20, 0.03, 0.03, 0x475569, 0.26, 0.98, 0.68);
      // Mata Berkilau & Pipi Merona
      const eyeL = part(0.15, 0.16, 0.06, 0x0f172a, -0.22, 1.18, 0.57);
      const eyeR = part(0.15, 0.16, 0.06, 0x0f172a, 0.22, 1.18, 0.57);
      const glintL = part(0.06, 0.06, 0.07, 0xffffff, -0.24, 1.21, 0.58, { glow: true });
      const glintR = part(0.06, 0.06, 0.07, 0xffffff, 0.20, 1.21, 0.58, { glow: true });
      const blushL = part(0.14, 0.08, 0.05, 0xf43f5e, -0.28, 1.05, 0.57);
      const blushR = part(0.14, 0.08, 0.05, 0xf43f5e, 0.28, 1.05, 0.57);
      // Mahkota Kecil Emas di Atas Kepala Seal
      const crown = part(0.32, 0.18, 0.32, 0xf59e0b, 0, 1.52, 0.20);

      charGroup.add(
        legL, legR, torso, belly, spot1, spot2, scarf, scarfTail,
        armL, armR, head, snout, nose, wL1, wL2, wR1, wR2,
        eyeL, eyeR, glintL, glintR, blushL, blushR, crown
      );

    } else if (avatarType === "hutao" || uLower.includes("jejey")) {
      // 🔥 2. HIGH-DETAIL HU TAO (@Jejey)
      // Sepatu Hitam + Kaos Kaki Putih + Celana Pendek
      legL.add(part(0.30, 0.22, 0.36, 0x1c1917, -0.19, 0.11, 0.02));
      legL.add(part(0.28, 0.22, 0.28, 0xf8fafc, -0.19, 0.32, 0));
      legL.add(part(0.32, 0.24, 0.32, 0x292524, -0.19, 0.54, 0));
      legR.add(part(0.30, 0.22, 0.36, 0x1c1917, 0.19, 0.11, 0.02));
      legR.add(part(0.28, 0.22, 0.28, 0xf8fafc, 0.19, 0.32, 0));
      legR.add(part(0.32, 0.24, 0.32, 0x292524, 0.19, 0.54, 0));

      // Mantel Wangsheng Cokelat Gelap + Coattails Belakang + Kerah Merah & Kancing Emas
      const torso = part(0.78, 0.84, 0.44, 0x271c19, 0, 1.06, 0);
      const coatTailL = part(0.34, 0.42, 0.12, 0x271c19, -0.20, 0.55, -0.22);
      const coatTailR = part(0.34, 0.42, 0.12, 0x271c19, 0.20, 0.55, -0.22);
      const redShirt = part(0.32, 0.62, 0.46, 0x991b1b, 0, 1.10, 0, { offset: -1 });
      const goldTrim1 = part(0.12, 0.10, 0.48, 0xf59e0b, 0, 1.22, 0, { offset: -2 });
      const goldTrim2 = part(0.12, 0.10, 0.48, 0xf59e0b, 0, 0.98, 0, { offset: -2 });

      // Lengan & Manset Merah
      armL.add(part(0.28, 0.62, 0.30, 0x271c19, -0.54, 1.12, 0));
      armL.add(part(0.30, 0.14, 0.32, 0x991b1b, -0.54, 0.80, 0));
      armL.add(part(0.24, 0.16, 0.24, 0xffedd5, -0.54, 0.66, 0));
      armR.add(part(0.28, 0.62, 0.30, 0x271c19, 0.54, 1.12, 0));
      armR.add(part(0.30, 0.14, 0.32, 0x991b1b, 0.54, 0.80, 0));
      armR.add(part(0.24, 0.16, 0.24, 0xffedd5, 0.54, 0.66, 0));

      // Kepala & Wajah Detail
      const head = part(0.76, 0.76, 0.76, 0xffedd5, 0, 1.86, 0);
      addDetailedFace(charGroup, 1.84, 0.38, 0xe11d48, 0x451a03, false);

      // Rambut Cokelat Gradasi Merah (3D Bangs + Long Twin-Tails)
      const bangsL = part(0.38, 0.26, 0.14, 0x3b1d14, -0.20, 2.12, 0.36);
      const bangsR = part(0.38, 0.26, 0.14, 0x3b1d14, 0.20, 2.12, 0.36);
      const hairBack = part(0.80, 0.78, 0.20, 0x3b1d14, 0, 1.86, -0.34);
      const twinL = part(0.22, 0.95, 0.22, 0x3b1d14, -0.52, 1.50, -0.10);
      const twinTipL = part(0.24, 0.28, 0.24, 0x991b1b, -0.52, 0.95, -0.10);
      const twinR = part(0.22, 0.95, 0.22, 0x3b1d14, 0.52, 1.50, -0.10);
      const twinTipR = part(0.24, 0.28, 0.24, 0x991b1b, 0.52, 0.95, -0.10);

      // Topi Harmony Hexagonal Hu Tao + Talisman Kuning + Bunga Plum 3D
      const hatBrim = part(1.10, 0.12, 1.10, 0x1c1917, 0, 2.26, 0);
      const hatCrown = part(0.84, 0.44, 0.84, 0x271c19, 0, 2.52, 0);
      const hatBand = part(0.86, 0.10, 0.86, 0x991b1b, 0, 2.36, 0);
      const talisman = part(0.22, 0.34, 0.04, 0xfef08a, 0, 2.52, 0.44);
      const plum1 = part(0.20, 0.20, 0.10, 0xf43f5e, 0.34, 2.52, 0.42);
      const plum2 = part(0.16, 0.16, 0.10, 0xfda4af, 0.44, 2.64, 0.38);

      // Hantu Boo Tao Transparan dengan Ekor
      const boo = new THREE.Group();
      boo.add(part(0.44, 0.46, 0.44, 0xffffff, 0, 0, 0, { glow: true, opacity: 0.88 }));
      boo.add(part(0.26, 0.22, 0.26, 0xf8fafc, 0, -0.28, -0.12, { glow: true, opacity: 0.75 }));
      boo.add(part(0.08, 0.08, 0.06, 0x0f172a, -0.10, 0.05, 0.23, { glow: true }));
      boo.add(part(0.08, 0.08, 0.06, 0x0f172a, 0.10, 0.05, 0.23, { glow: true }));
      boo.add(part(0.12, 0.08, 0.06, 0xef4444, 0, -0.06, 0.23, { glow: true }));
      boo.position.set(-0.88, 2.0, 0.25);

      charGroup.add(
        legL, legR, torso, coatTailL, coatTailR, redShirt, goldTrim1, goldTrim2,
        armL, armR, head, bangsL, bangsR, hairBack, twinL, twinTipL, twinR, twinTipR,
        hatBrim, hatCrown, hatBand, talisman, plum1, plum2, boo
      );

    } else if (avatarType === "naoya" || uLower.includes("godkingters")) {
      // ⚡ 3. HIGH-DETAIL NAOYA ZENIN (@Godkingters 2.0)
      isFastMover = true;
      // Sandal Zori + Kaos Kaki Tabi Putih + Celana Hakama Lipit Lebar
      legL.add(part(0.34, 0.12, 0.42, 0xfef3c7, -0.21, 0.06, 0.02));
      legL.add(part(0.44, 0.62, 0.46, 0xd6d3d1, -0.21, 0.42, 0));
      legL.add(part(0.08, 0.58, 0.48, 0xa8a29e, -0.21, 0.42, 0, { offset: -1 })); // Lipatan Hakama
      legR.add(part(0.34, 0.12, 0.42, 0xfef3c7, 0.21, 0.06, 0.02));
      legR.add(part(0.44, 0.62, 0.46, 0xd6d3d1, 0.21, 0.42, 0));
      legR.add(part(0.08, 0.58, 0.48, 0xa8a29e, 0.21, 0.42, 0, { offset: -1 }));

      // Sabuk Obi Putih-Hitam + Kimono Hitam Zenin
      const obi = part(0.86, 0.16, 0.50, 0xf5f5f4, 0, 0.76, 0);
      const torso = part(0.80, 0.80, 0.44, 0x18181b, 0, 1.18, 0);
      const innerCollar = part(0.28, 0.48, 0.46, 0xfafaf9, 0, 1.32, 0, { offset: -1 });
      const darkV = part(0.14, 0.36, 0.47, 0x18181b, 0, 1.38, 0, { offset: -2 });

      // Lengan Haori Lebar Menggantung
      armL.add(part(0.38, 0.76, 0.44, 0x18181b, -0.58, 1.14, 0));
      armL.add(part(0.24, 0.16, 0.24, 0xffedd5, -0.58, 0.72, 0.05));
      armR.add(part(0.38, 0.76, 0.44, 0x18181b, 0.58, 1.14, 0));
      armR.add(part(0.24, 0.16, 0.24, 0xffedd5, 0.58, 0.72, 0.05));

      // Kepala & Ekspresi Smug Naoya
      const head = part(0.76, 0.76, 0.76, 0xffedd5, 0, 1.94, 0);
      addDetailedFace(charGroup, 1.92, 0.38, 0xb45309, 0x18181b, true);

      // Rambut Pirang Berlapis dengan Ujung Hitam & Undercut Gelap Khas Naoya
      const undercut = part(0.78, 0.50, 0.78, 0x18181b, 0, 1.98, -0.02);
      const blondeCrown = part(0.84, 0.32, 0.84, 0xfacc15, 0, 2.30, 0);
      const bangsCenter = part(0.30, 0.26, 0.16, 0xfde047, 0, 2.14, 0.38);
      const bangsTip = part(0.26, 0.08, 0.17, 0x18181b, 0, 2.00, 0.39);
      const sideLockL = part(0.22, 0.34, 0.18, 0xfacc15, -0.32, 2.10, 0.34);
      const sideLockR = part(0.22, 0.34, 0.18, 0xfacc15, 0.32, 2.10, 0.34);
      // Tindik Telinga Emas (3 Ear Cuffs)
      const earL = part(0.10, 0.24, 0.10, 0xf59e0b, -0.43, 1.94, 0.08);
      const earR = part(0.10, 0.24, 0.10, 0xf59e0b, 0.43, 1.94, 0.08);

      // Efek Panel 24-FPS Projection Sorcery
      const framePanel = part(1.15, 2.1, 0.06, 0x38bdf8, 0, 1.2, -0.42, { glow: true, opacity: 0.22 });

      charGroup.add(
        legL, legR, obi, torso, innerCollar, darkV, armL, armR,
        head, undercut, blondeCrown, bangsCenter, bangsTip, sideLockL, sideLockR,
        earL, earR, framePanel
      );

    } else if (avatarType === "akhtar" || uLower.includes("akhtar")) {
      // ⭐ 4. HIGH-DETAIL AKHTAR (@Akhtar)
      legL.add(part(0.34, 0.20, 0.38, 0xf59e0b, -0.19, 0.10, 0.03)); // Sepatu Emas
      legL.add(part(0.32, 0.50, 0.32, 0x0f172a, -0.19, 0.42, 0));
      legR.add(part(0.34, 0.20, 0.38, 0xf59e0b, 0.19, 0.10, 0.03));
      legR.add(part(0.32, 0.50, 0.32, 0x0f172a, 0.19, 0.42, 0));

      const belt = part(0.82, 0.14, 0.46, 0xf59e0b, 0, 0.72, 0);
      const torso = part(0.78, 0.80, 0.44, 0x1e1b4b, 0, 1.14, 0);
      // Jubah Kosmik Belakang + Pelindung Bahu Emas
      const cape = part(0.84, 1.25, 0.10, 0x312e81, 0, 0.90, -0.26);
      const padL = part(0.36, 0.18, 0.38, 0xf59e0b, -0.54, 1.46, 0);
      const padR = part(0.36, 0.18, 0.38, 0xf59e0b, 0.54, 1.46, 0);

      // Emblem Bintang 8 Sudut di Dada
      const star1 = part(0.32, 0.32, 0.06, 0xfacc15, 0, 1.16, 0.23, { glow: true });
      const star2 = part(0.32, 0.32, 0.06, 0xfef08a, 0, 1.16, 0.24, { glow: true });
      star2.rotation.z = Math.PI / 4;

      armL.add(part(0.28, 0.62, 0.30, 0x1e1b4b, -0.54, 1.10, 0));
      armL.add(part(0.26, 0.18, 0.26, 0xfde68a, -0.54, 0.72, 0));
      armR.add(part(0.28, 0.62, 0.30, 0x1e1b4b, 0.54, 1.10, 0));
      armR.add(part(0.26, 0.18, 0.26, 0xfde68a, 0.54, 0.72, 0));

      const head = part(0.76, 0.76, 0.76, 0xfde68a, 0, 1.90, 0);
      addDetailedFace(charGroup, 1.88, 0.38, 0xd97706, 0x0f172a, false);

      const hair = part(0.82, 0.28, 0.82, 0x0f172a, 0, 2.30, 0);
      const bangs = part(0.78, 0.18, 0.16, 0x0f172a, 0, 2.14, 0.36);

      // Mahkota Bintang Melayang
      const crown1 = part(0.42, 0.42, 0.12, 0xfacc15, 0, 2.82, 0, { glow: true });
      const crown2 = part(0.42, 0.42, 0.12, 0xfef08a, 0, 2.82, 0, { glow: true });
      crown2.rotation.z = Math.PI / 4;

      charGroup.add(
        legL, legR, belt, torso, cape, padL, padR, star1, star2,
        armL, armR, head, hair, bangs, crown1, crown2
      );

    } else if (avatarType === "computer" || uLower.includes("care")) {
      // 💻 5. HIGH-DETAIL COMPUTER (@Care.)
      legL.add(part(0.34, 0.20, 0.38, 0x0f172a, -0.19, 0.10, 0.02));
      legL.add(part(0.32, 0.50, 0.32, 0x334155, -0.19, 0.42, 0));
      legR.add(part(0.34, 0.20, 0.38, 0x0f172a, 0.19, 0.10, 0.02));
      legR.add(part(0.32, 0.50, 0.32, 0x334155, 0.19, 0.42, 0));

      // Bodi Casing PC + Keyboard Mekanikal RGB di Dada
      const torso = part(0.80, 0.82, 0.46, 0x475569, 0, 1.12, 0);
      const kbBase = part(0.62, 0.32, 0.08, 0x1e293b, 0, 1.16, 0.23);
      const rgbStrip1 = part(0.54, 0.06, 0.10, 0xf43f5e, 0, 1.24, 0.24, { glow: true });
      const rgbStrip2 = part(0.54, 0.06, 0.10, 0x38bdf8, 0, 1.14, 0.24, { glow: true });
      const rgbStrip3 = part(0.54, 0.06, 0.10, 0x10b981, 0, 1.04, 0.24, { glow: true });

      armL.add(part(0.28, 0.72, 0.30, 0x94a3b8, -0.54, 1.10, 0));
      armR.add(part(0.28, 0.72, 0.30, 0x94a3b8, 0.54, 1.10, 0));

      // Kepala Monitor CRT Berbingkai + Layar Gelap + Wajah Pixel Cyan Menyala
      const monitorShell = part(0.98, 0.84, 0.82, 0xe2e8f0, 0, 1.94, 0);
      const monitorBack = part(0.76, 0.62, 0.24, 0xcbd5e1, 0, 1.94, -0.48);
      const screenPanel = part(0.82, 0.66, 0.06, 0x090d16, 0, 1.94, 0.40);
      // Mata & Senyum Pixel LED Cyan
      const ledEyeL = part(0.18, 0.22, 0.08, 0x22d3ee, -0.20, 2.00, 0.41, { glow: true });
      const ledEyeR = part(0.18, 0.22, 0.08, 0x22d3ee, 0.20, 2.00, 0.41, { glow: true });
      const ledMouth = part(0.30, 0.08, 0.08, 0x22d3ee, 0, 1.78, 0.41, { glow: true });
      // Antena Pemancar Sinyal
      const antRod = part(0.06, 0.36, 0.06, 0x64748b, 0.24, 2.52, 0);
      const antTip = part(0.14, 0.14, 0.14, 0xef4444, 0.24, 2.72, 0, { glow: true });

      charGroup.add(
        legL, legR, torso, kbBase, rgbStrip1, rgbStrip2, rgbStrip3,
        armL, armR, monitorShell, monitorBack, screenPanel,
        ledEyeL, ledEyeR, ledMouth, antRod, antTip
      );

    } else {
      // 🧱 6. HIGH-DETAIL STEVE, ALEX & CITIZENS
      const isAlex = uLower === "@alex";
      const shirtCol = uLower === "@steve" ? 0x0284c7 : (isAlex ? 0x15803d : fallbackColor);
      const pantsCol = uLower === "@steve" ? 0x1e3a8a : (isAlex ? 0x78350f : 0x1e293b);
      const hairCol = uLower === "@steve" ? 0x451a03 : (isAlex ? 0xc2410c : 0x27272a);
      const skinCol = uLower === "@steve" ? 0xd97706 : 0xfed7aa;

      legL.add(part(0.32, 0.18, 0.36, 0x3f3f46, -0.19, 0.09, 0.02));
      legL.add(part(0.32, 0.50, 0.32, pantsCol, -0.19, 0.42, 0));
      legR.add(part(0.32, 0.18, 0.36, 0x3f3f46, 0.19, 0.09, 0.02));
      legR.add(part(0.32, 0.50, 0.32, pantsCol, 0.19, 0.42, 0));

      const belt = part(0.78, 0.12, 0.44, 0x27272a, 0, 0.72, 0);
      const torso = part(0.76, 0.78, 0.42, shirtCol, 0, 1.14, 0);
      armL.add(part(0.30, 0.32, 0.32, shirtCol, -0.53, 1.32, 0));
      armL.add(part(0.26, 0.42, 0.26, skinCol, -0.53, 0.95, 0));
      armR.add(part(0.30, 0.32, 0.32, shirtCol, 0.53, 1.32, 0));
      armR.add(part(0.26, 0.42, 0.26, skinCol, 0.53, 0.95, 0));

      const head = part(0.76, 0.76, 0.76, skinCol, 0, 1.90, 0);
      addDetailedFace(charGroup, 1.88, 0.38, isAlex ? 0x15803d : 0x1d4ed8, hairCol, false);

      const hairTop = part(0.82, 0.26, 0.82, hairCol, 0, 2.30, 0);
      const hairBangs = part(0.78, 0.18, 0.14, hairCol, 0, 2.14, 0.36);
      const hairBack = part(0.80, 0.65, 0.16, hairCol, 0, 1.95, -0.35);

      charGroup.add(legL, legR, belt, torso, armL, armR, head, hairTop, hairBangs, hairBack);
    }

    // Payung & Bola Salju Otomatis Sesuai Musim
    const citizenUmbrella = new THREE.Group();
    citizenUmbrella.add(part(0.08, 1.5, 0.08, 0xe2e8f0, 0.55, 1.8, 0.2));
    citizenUmbrella.add(part(1.5, 0.18, 1.5, fallbackColor, 0.55, 2.55, 0.2));
    citizenUmbrella.visible = false;
    charGroup.add(citizenUmbrella);

    const handSnowball = part(0.26, 0.26, 0.26, 0xffffff, 0.55, 1.1, 0.35);
    handSnowball.visible = false;
    charGroup.add(handSnowball);

    charGroup.position.set(0.8, 0.18, 2.65);
    charGroup.userData = {
      legL, legR, armL, armR,
      citizenUmbrella,
      handSnowball,
      isNaoya: isFastMover,
      phase: Math.random() * 5
    };

    return charGroup;
  };

  window.spawnCitizenAvatarOnHouse = function (houseGroup, username, fallbackColor, avatarType) {
    if (houseGroup.userData.avatarMesh) return;
    const charGroup = window.buildDetailedCharacterRig(username, fallbackColor, avatarType);
    charGroup.userData.phase = houseGroup.userData.id * 1.3;
    houseGroup.add(charGroup);
    houseGroup.userData.avatarMesh = charGroup;
    citizenAvatars.push(charGroup);
  };

  // ---------------------------------------------------------
  // 3. UPGRADE 3D CUTAWAY ROOM INTERIOR (COZY & SUPER DETAILED)
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
    customRoomScene.background = new THREE.Color(0x0b1120);

    customRoomCamera = new THREE.PerspectiveCamera(36, box.clientWidth / box.clientHeight, 0.1, 100);
    customRoomCamera.position.set(8.2, 6.8, 8.2);
    customRoomCamera.lookAt(0, 1.3, 0);

    customRoomRenderer = new THREE.WebGLRenderer({ antialias: true });
    customRoomRenderer.setSize(box.clientWidth, box.clientHeight);
    customRoomRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    customRoomRenderer.shadowMap.enabled = true;
    customRoomRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
    customRoomRenderer.toneMapping = THREE.ACESFilmicToneMapping;
    customRoomRenderer.toneMappingExposure = 0.85;
    box.appendChild(customRoomRenderer.domElement);

    // Pencahayaan Kamar Hangat & Tidak Silau
    customRoomScene.add(new THREE.AmbientLight(0xffe4e6, 0.45));

    const warmLamp = new THREE.PointLight(0xfde68a, 0.95, 18);
    warmLamp.position.set(0.5, 4.2, 0.5);
    warmLamp.castShadow = true;
    warmLamp.shadow.bias = -0.001;
    customRoomScene.add(warmLamp);

    const pcGlowLight = new THREE.PointLight(0x38bdf8, 0.55, 6);
    pcGlowLight.position.set(1.6, 1.8, -1.8);
    customRoomScene.add(pcGlowLight);

    // 1. LANTAI PAPAN KAYU CHECKERBOARD + DINDING BERTEKSTUR WAINSCOATING
    customRoomScene.add(part(6.4, 0.35, 6.4, 0x451a03, 0, -0.18, 0));
    for (let fx = -2.5; fx <= 2.5; fx += 1.0) {
      for (let fz = -2.5; fz <= 2.5; fz += 1.0) {
        const plankCol = (Math.round(fx + fz) % 2 === 0) ? 0x78350f : 0x92400e;
        customRoomScene.add(part(0.96, 0.08, 0.96, plankCol, fx, 0.02, fz));
      }
    }

    // Dinding Belakang & Kiri + Lis Kayu Bawah (Baseboard)
    customRoomScene.add(part(6.4, 4.2, 0.3, 0xe2e8f0, 0, 2.1, -3.05));
    customRoomScene.add(part(0.3, 4.2, 6.4, 0xcbd5e1, -3.05, 2.1, 0));
    customRoomScene.add(part(6.2, 0.35, 0.08, 0x451a03, 0, 0.22, -2.88)); // Baseboard Belakang
    customRoomScene.add(part(0.08, 0.35, 6.2, 0x451a03, -2.88, 0.22, 0)); // Baseboard Kiri

    // 2. JENDELA BINGKAI KAYU + TIRAI + TANAMAN BONSAI
    customRoomScene.add(part(2.0, 1.7, 0.12, 0x451a03, -0.2, 2.45, -2.88)); // Kusen Jendela
    customRoomScene.add(part(1.75, 1.45, 0.14, 0x0ea5e9, -0.2, 2.45, -2.87, { glow: true, opacity: 0.75 })); // Kaca Biru
    customRoomScene.add(part(0.08, 1.45, 0.16, 0x451a03, -0.2, 2.45, -2.85)); // Palang Tengah
    customRoomScene.add(part(1.75, 0.08, 0.16, 0x451a03, -0.2, 2.45, -2.85));
    // Tirai Kiri & Kanan
    customRoomScene.add(part(0.32, 1.85, 0.18, 0xf43f5e, -1.15, 2.42, -2.82));
    customRoomScene.add(part(0.32, 1.85, 0.18, 0xf43f5e, 0.75, 2.42, -2.82));
    // Ambang Jendela + Tanaman Bonsai Kecil
    customRoomScene.add(part(2.2, 0.12, 0.35, 0x78350f, -0.2, 1.55, -2.78));
    customRoomScene.add(part(0.32, 0.24, 0.26, 0xd97706, -0.5, 1.72, -2.72));
    customRoomScene.add(part(0.42, 0.32, 0.36, 0x16a34a, -0.5, 1.98, -2.72));

    // 3. TEMPAT TIDUR 4 TIANG (FOUR-POSTER VOXEL BED) + BANTAL GANDA & SELIMUT BERLAPIS
    const bedX = -1.75, bedZ = -0.9;
    // Rangka & 4 Tiang Kayu Oak
    customRoomScene.add(part(1.95, 0.38, 2.9, 0x5c2d0c, bedX, 0.25, bedZ));
    customRoomScene.add(part(1.95, 1.35, 0.24, 0x451a03, bedX, 0.72, bedZ - 1.35)); // Sandaran Kepala
    [[-0.9, -1.35], [0.9, -1.35], [-0.9, 1.35], [0.9, 1.35]].forEach(([px, pz]) => {
      customRoomScene.add(part(0.20, 1.55, 0.20, 0x451a03, bedX + px, 0.82, bedZ + pz));
    });
    // Kasur Putih Empuk + 2 Bantal + Selimut Lipat
    customRoomScene.add(part(1.78, 0.28, 2.68, 0xf8fafc, bedX, 0.54, bedZ));
    customRoomScene.add(part(0.72, 0.18, 0.52, 0xffffff, bedX - 0.42, 0.74, bedZ - 0.92)); // Bantal 1
    customRoomScene.add(part(0.72, 0.18, 0.52, 0xffffff, bedX + 0.42, 0.74, bedZ - 0.92)); // Bantal 2
    customBedBlanket = part(1.82, 0.30, 1.75, 0x0284c7, bedX, 0.58, bedZ + 0.42);
    customRoomScene.add(customBedBlanket);
    // Lipatan Putih di Ujung Selimut
    customRoomScene.add(part(1.84, 0.31, 0.26, 0xe2e8f0, bedX, 0.59, bedZ - 0.38));

    // Meja Nakas Samping Kasur + Lampu Tidur Hangat
    customRoomScene.add(part(0.75, 0.68, 0.75, 0x5c2d0c, -0.35, 0.40, -2.45));
    customRoomScene.add(part(0.14, 0.30, 0.14, 0x94a3b8, -0.35, 0.85, -2.45));
    customRoomScene.add(part(0.42, 0.36, 0.42, 0xfef08a, -0.35, 1.12, -2.45, { glow: true }));

    // 4. MEJA PC GAMING DUAL-MONITOR + KURSI GAMING + PAJANGAN VIP SHOPIFY
    // Meja L-Desk Kayu & Kaki Besi Hitam
    customRoomScene.add(part(2.2, 0.12, 1.15, 0x78350f, 1.65, 1.05, -2.2));
    customRoomScene.add(part(0.16, 1.0, 1.05, 0x1e293b, 0.65, 0.55, -2.2));
    customRoomScene.add(part(0.16, 1.0, 1.05, 0x1e293b, 2.65, 0.55, -2.2));
    // Monitor Gaming Utama + Monitor Kedua + Keyboard RGB
    customRoomScene.add(part(0.95, 0.58, 0.08, 0x0f172a, 1.35, 1.48, -2.45));
    customRoomScene.add(part(0.88, 0.50, 0.09, 0x38bdf8, 1.35, 1.48, -2.44, { glow: true }));
    customRoomScene.add(part(0.14, 0.22, 0.14, 0x334155, 1.35, 1.15, -2.45));
    customRoomScene.add(part(0.55, 0.04, 0.22, 0x1e293b, 1.35, 1.12, -1.95));
    customRoomScene.add(part(0.50, 0.05, 0.16, 0xf43f5e, 1.35, 1.13, -1.95, { glow: true }));
    // Kursi Gaming (Merah-Hitam)
    customRoomScene.add(part(0.68, 0.12, 0.68, 0x1e293b, 1.35, 0.62, -1.15));
    customRoomScene.add(part(0.64, 0.85, 0.14, 0xdc2626, 1.35, 1.08, -0.85));
    customRoomScene.add(part(0.14, 0.55, 0.14, 0x0f172a, 1.35, 0.32, -1.15));

    // Pajangan Produk Toko Shopify (Volcano Flame Diffuser / Moon Lamp di Sudut Meja)
    customVipItemGroup = new THREE.Group();
    customVipItemGroup.add(part(0.48, 0.38, 0.48, 0x1e293b, 0, 0.2, 0));
    customVipItemGroup.add(part(0.42, 0.25, 0.42, 0xf97316, 0, 0.5, 0, { glow: true }));
    customVipItemGroup.add(part(0.24, 0.24, 0.24, 0xfef08a, 0, 0.75, 0, { glow: true }));
    customVipItemGroup.position.set(2.35, 1.12, -2.2);
    customRoomScene.add(customVipItemGroup);

    // 5. RAK BUKU TINGGI, LUKISAN DINDING, KARPET BERLAPIS & KUCING TIDUR
    // Rak Buku Kiri
    customRoomScene.add(part(0.75, 2.5, 1.5, 0x5c2d0c, -2.5, 1.3, 1.6));
    [0.6, 1.25, 1.9].forEach((sy, idx) => {
      customRoomScene.add(part(0.78, 0.08, 1.44, 0x451a03, -2.48, sy, 1.6));
      customRoomScene.add(part(0.45, 0.38, 0.22, idx % 2 === 0 ? 0xef4444 : 0x3b82f6, -2.35, sy + 0.22, 1.3));
      customRoomScene.add(part(0.45, 0.35, 0.22, 0x10b981, -2.35, sy + 0.20, 1.6));
      customRoomScene.add(part(0.45, 0.40, 0.22, 0xf59e0b, -2.35, sy + 0.23, 1.9));
    });

    // Lukisan Pixel Art di Dinding Kiri
    customRoomScene.add(part(0.10, 1.1, 1.4, 0x451a03, -2.88, 2.5, -0.5));
    customRoomScene.add(part(0.12, 0.9, 1.2, 0x38bdf8, -2.86, 2.5, -0.5));
    customRoomScene.add(part(0.13, 0.35, 1.2, 0x22c55e, -2.85, 2.22, -0.5));

    // Karpet Bulu Berlapis di Tengah Kamar (Dengan Offset Anti Z-Fighting)
    customRoomScene.add(part(3.0, 0.06, 2.4, 0xfde68a, 0.45, 0.08, 0.65, { offset: -1 }));
    customRoomScene.add(part(2.5, 0.07, 1.9, 0xf59e0b, 0.45, 0.09, 0.65, { offset: -2 }));

    // Kucing Voxel Oranye Tidur Melingkar di Atas Karpet
    const cat = new THREE.Group();
    cat.add(part(0.45, 0.22, 0.38, 0xf97316, 0, 0.12, 0));
    cat.add(part(0.28, 0.24, 0.28, 0xfb923c, 0.18, 0.16, 0.12));
    cat.add(part(0.08, 0.10, 0.08, 0xea580c, 0.12, 0.30, 0.18));
    cat.add(part(0.08, 0.10, 0.08, 0xea580c, 0.24, 0.30, 0.06));
    cat.position.set(1.35, 0.10, 1.15);
    customRoomScene.add(cat);

    // Wadah Karakter Pemilik Rumah di Dalam Kamar
    customOwnerHolder = new THREE.Group();
    customOwnerHolder.position.set(0.25, 0.08, 0.45);
    customRoomScene.add(customOwnerHolder);
  }

  // Override Fungsi Buka Kamar 3D agar Memakai Kamar & Karakter High-Detail
  window.open3DInterior = function (houseData) {
    document.getElementById("roomTitle").textContent = `${houseData.name.toUpperCase()}`;
    document.getElementById("interiorModal").classList.remove("hidden");

    if (!customRoomRenderer) buildUpgradedRoom3D();
    customBedBlanket.material.color.setHex(houseData.roofColor);

    // Bersihkan & masukkan karakter asli pemilik rumah tersebut ke dalam kamar!
    while (customOwnerHolder.children.length > 0) {
      customOwnerHolder.remove(customOwnerHolder.children[0]);
    }

    const actionArea = document.getElementById("roomActionArea");
    document.getElementById("infoYard").textContent = houseData.has_yard ? "Unlocked (Fence + Tree) 🌳" : "Comment on TikTok 💬";
    document.getElementById("roomYardBanner").textContent = houseData.has_yard ? "🌳 Yard & Oak Tree: INSTALLED" : "🌳 Yard: Comment to Unlock";
    document.getElementById("infoDecor").textContent = houseData.decor ? houseData.decor : "Gaming PC + Lamp ✨";

    if (houseData.owner) {
      const charInside = window.buildDetailedCharacterRig(houseData.owner, houseData.roofColor, houseData.avatarType);
      charInside.position.set(0, 0, 0);
      charInside.rotation.y = Math.PI / 6;
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
        av.position.y = Math.abs(Math.sin(tick * 0.08)) * 0.12;
        av.userData.armR.rotation.x = Math.sin(tick * 0.15) * 0.35;
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
  // 4. REFRESH SEMUA RUMAH & KARAKTER DENGAN MODEL BARU
  // ---------------------------------------------------------
  Object.keys(defaultCitizens).forEach(id => {
    claimedData[id] = { ...defaultCitizens[id] };
  });

  clickableHouses.forEach((h, i) => {
    h.userData.roofColor = houseColors[i % houseColors.length];
    if (h.userData.avatarMesh) {
      h.remove(h.userData.avatarMesh);
      const idx = citizenAvatars.indexOf(h.userData.avatarMesh);
      if (idx > -1) citizenAvatars.splice(idx, 1);
      h.userData.avatarMesh = null;
    }
  });

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

  // Tombol Tur Kamera Otomatis ke 5 Warga Terbaru
  let tourIndex = 0;
  const newCitizenIds = [4, 5, 6, 7, 3];
  window.focusCitizenById = function () {
    const targetId = newCitizenIds[tourIndex % newCitizenIds.length];
    tourIndex++;
    const h = clickableHouses.find(item => item.userData.id === targetId);
    if (h) {
      focusOnHouse(h);
      showToast(`🎥 Highlighting House #${targetId}: ${h.userData.owner}! Tap house to inspect 3D Room!`);
    }
  };
});
