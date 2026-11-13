// =========================================================
// FILE: citizens.js (DATA WARGA, AVATAR KHUSUS & DIALOG MAYOR)
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

// Warna Atap 12 Rumah Subsidi
const houseColors = [
  0x0284c7, 0xe11d48, 0x059669, 0xd97706,
  0x7c3aed, 0xdb2777, 0x0d9488, 0x4f46e5,
  0xdc2626, 0x0891b2, 0x65a30d, 0x9333ea
];

// =========================================================
// INJEKSI AVATAR 3D KHUSUS (SEAL, HU TAO, AKHTAR, COMPUTER)
// =========================================================
window.addEventListener("DOMContentLoaded", () => {
  // Pastikan data warga #1 - #7 langsung aktif meskipun ada cache lama di browser
  Object.keys(defaultCitizens).forEach(id => {
    claimedData[id] = { ...defaultCitizens[id] };
  });

  // Override generator karakter 3D untuk merender wujud unik tiap warga
  window.spawnCitizenAvatarOnHouse = function (houseGroup, username, fallbackColor, avatarType) {
    if (houseGroup.userData.avatarMesh) return;

    const charGroup = new THREE.Group();
    const uLower = (username || "").toLowerCase();
    let legL, legR, armL, armR;
    let isFastMover = false;

    if (avatarType === "seal" || uLower.includes("sealllyx")) {
      // 🦭 1. AVATAR SEAL (@sealllyx): Anjing Laut Putih-Abu Gembul + Kumis + Sirip
      legL = createBlock(0.35, 0.22, 0.45, 0xcbd5e1, -0.22, 0.14, -0.35); // Sirip Belakang Kiri
      legR = createBlock(0.35, 0.22, 0.45, 0xcbd5e1, 0.22, 0.14, -0.35);  // Sirip Belakang Kanan
      const body = createBlock(0.95, 0.72, 1.05, 0xf1f5f9, 0, 0.48, 0);   // Badan Gembul Putih
      const belly = createBlock(0.80, 0.60, 0.90, 0xffffff, 0, 0.42, 0.1);
      armL = createBlock(0.42, 0.16, 0.38, 0xcbd5e1, -0.62, 0.35, 0.15);  // Sirip Depan Kiri
      armR = createBlock(0.42, 0.16, 0.38, 0xcbd5e1, 0.62, 0.35, 0.15);   // Sirip Depan Kanan
      const head = createBlock(0.78, 0.68, 0.75, 0xf8fafc, 0, 1.08, 0.2); // Kepala Bulat Seal
      const snout = createBlock(0.42, 0.28, 0.28, 0xffffff, 0, 0.98, 0.62); // Moncong
      const nose = createBlock(0.16, 0.12, 0.10, 0x0f172a, 0, 1.08, 0.76);  // Hidung Hitam
      const eyeL = createBlock(0.14, 0.14, 0.08, 0x0f172a, -0.22, 1.15, 0.56);
      const eyeR = createBlock(0.14, 0.14, 0.08, 0x0f172a, 0.22, 1.15, 0.56);
      const blushL = createBlock(0.12, 0.08, 0.06, 0xf472b6, -0.28, 1.02, 0.57);
      const blushR = createBlock(0.12, 0.08, 0.06, 0xf472b6, 0.28, 1.02, 0.57);

      charGroup.add(legL, legR, body, belly, armL, armR, head, snout, nose, eyeL, eyeR, blushL, blushR);

    } else if (avatarType === "hutao" || uLower.includes("jejey")) {
      // 🔥 2. AVATAR HU TAO (@Jejey): Jubah Gelap Merah + Topi Bunga Plum + Hantu Boo Tao
      legL = createBlock(0.32, 0.62, 0.32, 0x1c1917, -0.18, 0.31, 0);
      legR = createBlock(0.32, 0.62, 0.32, 0x1c1917, 0.18, 0.31, 0);
      const coat = createBlock(0.78, 0.85, 0.44, 0x292524, 0, 1.04, 0); // Mantel Cokelat Gelap Hu Tao
      const redCollar = createBlock(0.34, 0.55, 0.46, 0xdc2626, 0, 1.12, 0); // Aksen Merah & Emas
      const goldButton = createBlock(0.14, 0.14, 0.48, 0xfacc15, 0, 1.05, 0);
      armL = createBlock(0.28, 0.75, 0.32, 0x292524, -0.54, 1.04, 0);
      armR = createBlock(0.28, 0.75, 0.32, 0x292524, 0.54, 1.04, 0);
      const head = createBlock(0.76, 0.76, 0.76, 0xffedd5, 0, 1.84, 0);
      // Mata Merah Crimson Khas Hu Tao
      const eyeL = createBlock(0.15, 0.15, 0.06, 0xe11d48, -0.18, 1.86, 0.39);
      const eyeR = createBlock(0.15, 0.15, 0.06, 0xe11d48, 0.18, 1.86, 0.39);
      // Rambut Twin-Tails Cokelat Tua
      const hairTwinL = createBlock(0.22, 0.85, 0.24, 0x451a03, -0.48, 1.55, -0.1);
      const hairTwinR = createBlock(0.22, 0.85, 0.24, 0x451a03, 0.48, 1.55, -0.1);
      // Topi Khas Hu Tao + Talisman & Bunga Plum Merah
      const hatBrim = createBlock(1.05, 0.14, 1.05, 0x1c1917, 0, 2.26, 0);
      const hatTop = createBlock(0.82, 0.42, 0.82, 0x292524, 0, 2.50, 0);
      const talisman = createBlock(0.22, 0.32, 0.06, 0xfef08a, 0, 2.52, 0.43);
      const plumBlossom = createBlock(0.24, 0.24, 0.12, 0xef4444, 0.32, 2.48, 0.40);
      // Hantu Kecil "Boo Tao" Melayang di Samping Hu Tao
      const booTao = createBlock(0.42, 0.48, 0.42, 0xffffff, -0.85, 1.95, 0.25, false, false);
      const booEye = createBlock(0.1, 0.1, 0.06, 0x0f172a, -0.85, 2.02, 0.47, false, false);

      charGroup.add(
        legL, legR, coat, redCollar, goldButton, armL, armR,
        head, eyeL, eyeR, hairTwinL, hairTwinR, hatBrim, hatTop, talisman, plumBlossom, booTao, booEye
      );

    } else if (avatarType === "akhtar" || uLower.includes("akhtar")) {
      // ⭐ 3. AVATAR AKHTAR (@Akhtar): Kostum Bintang Emas + Mahkota/Aura Bintang Bersinar
      legL = createBlock(0.32, 0.62, 0.32, 0x0f172a, -0.18, 0.31, 0);
      legR = createBlock(0.32, 0.62, 0.32, 0x0f172a, 0.18, 0.31, 0);
      const body = createBlock(0.78, 0.82, 0.44, 0x1e1b4b, 0, 1.02, 0); // Jaket Kosmik Biru Gelap
      const starEmblem = new THREE.Mesh(
        new THREE.BoxGeometry(0.34, 0.34, 0.48),
        new THREE.MeshBasicMaterial({ color: 0xfacc15 }) // Bintang Menyala di Dada
      );
      starEmblem.position.set(0, 1.08, 0);
      starEmblem.rotation.z = Math.PI / 4;
      armL = createBlock(0.28, 0.75, 0.32, 0xf59e0b, -0.54, 1.02, 0); // Lengan Emas
      armR = createBlock(0.28, 0.75, 0.32, 0xf59e0b, 0.54, 1.02, 0);
      const head = createBlock(0.76, 0.76, 0.76, 0xfde68a, 0, 1.82, 0);
      const eyeL = createBlock(0.14, 0.14, 0.06, 0x0f172a, -0.18, 1.85, 0.39);
      const eyeR = createBlock(0.14, 0.14, 0.06, 0x0f172a, 0.18, 1.85, 0.39);
      const hair = createBlock(0.82, 0.24, 0.82, 0x0f172a, 0, 2.25, 0);
      // Bintang Emas 3D Melayang di Atas Kepala
      const floatingStar1 = new THREE.Mesh(
        new THREE.BoxGeometry(0.45, 0.45, 0.16),
        new THREE.MeshBasicMaterial({ color: 0xfef08a })
      );
      floatingStar1.position.set(0, 2.75, 0);
      const floatingStar2 = floatingStar1.clone();
      floatingStar2.rotation.z = Math.PI / 4;

      charGroup.add(legL, legR, body, starEmblem, armL, armR, head, eyeL, eyeR, hair, floatingStar1, floatingStar2);

    } else if (avatarType === "computer" || uLower.includes("care")) {
      // 💻 4. AVATAR COMPUTER (@Care.): Kepala Monitor PC Retro + Layar Cyan Menyala
      legL = createBlock(0.32, 0.62, 0.32, 0x334155, -0.18, 0.31, 0);
      legR = createBlock(0.32, 0.62, 0.32, 0x334155, 0.18, 0.31, 0);
      const body = createBlock(0.78, 0.82, 0.44, 0x475569, 0, 1.02, 0); // Bodi Casing CPU
      const keyboardChest = createBlock(0.56, 0.28, 0.48, 0xcbd5e1, 0, 1.10, 0);
      const powerLed = new THREE.Mesh(
        new THREE.BoxGeometry(0.14, 0.14, 0.50),
        new THREE.MeshBasicMaterial({ color: 0x10b981 })
      );
      powerLed.position.set(0.2, 0.82, 0);
      armL = createBlock(0.28, 0.75, 0.32, 0x94a3b8, -0.54, 1.02, 0);
      armR = createBlock(0.28, 0.75, 0.32, 0x94a3b8, 0.54, 1.02, 0);
      // Kepala Monitor CRT / Komputer Kotak
      const monitorCase = createBlock(0.96, 0.82, 0.80, 0xe2e8f0, 0, 1.88, 0);
      const screenGlow = new THREE.Mesh(
        new THREE.BoxGeometry(0.78, 0.62, 0.08),
        new THREE.MeshBasicMaterial({ color: 0x06b6d4 }) // Layar Biru Cyan Menyala
      );
      screenGlow.position.set(0, 1.88, 0.39);
      // Wajah Pixel di Layar Monitor (^ _ ^)
      const pxEyeL = createBlock(0.14, 0.18, 0.10, 0x0f172a, -0.18, 1.94, 0.41);
      const pxEyeR = createBlock(0.14, 0.18, 0.10, 0x0f172a, 0.18, 1.94, 0.41);
      const pxSmile = createBlock(0.28, 0.08, 0.10, 0x0f172a, 0, 1.74, 0.41);
      const antenna = createBlock(0.08, 0.35, 0.08, 0x64748b, 0, 2.42, 0);

      charGroup.add(
        legL, legR, body, keyboardChest, powerLed, armL, armR,
        monitorCase, screenGlow, pxEyeL, pxEyeR, pxSmile, antenna
      );

    } else if (avatarType === "naoya" || uLower.includes("godkingters")) {
      // ⚡ 5. AVATAR NAOYA ZENIN (@Godkingters 2.0)
      isFastMover = true;
      legL = createBlock(0.40, 0.68, 0.42, 0xd6d3d1, -0.21, 0.34, 0);
      legR = createBlock(0.40, 0.68, 0.42, 0xd6d3d1, 0.21, 0.34, 0);
      const obi = createBlock(0.84, 0.16, 0.48, 0x090d16, 0, 0.72, 0);
      const body = createBlock(0.80, 0.82, 0.44, 0x1e293b, 0, 1.12, 0);
      const collar = createBlock(0.28, 0.45, 0.46, 0xf8fafc, 0, 1.28, 0);
      armL = createBlock(0.36, 0.78, 0.40, 0x1e293b, -0.58, 1.10, 0);
      armR = createBlock(0.36, 0.78, 0.40, 0x1e293b, 0.58, 1.10, 0);
      const head = createBlock(0.76, 0.76, 0.76, 0xffedd5, 0, 1.90, 0);
      const eyeL = createBlock(0.18, 0.08, 0.06, 0x0f172a, -0.18, 1.94, 0.39);
      const eyeR = createBlock(0.18, 0.08, 0.06, 0x0f172a, 0.18, 1.94, 0.39);
      const hairTop = createBlock(0.84, 0.28, 0.84, 0xfacc15, 0, 2.34, 0);
      const hairBangs = createBlock(0.82, 0.18, 0.24, 0xfde047, 0, 2.16, 0.35);
      const hairDarkSideL = createBlock(0.12, 0.36, 0.78, 0x1e293b, -0.40, 2.05, 0);
      const hairDarkSideR = createBlock(0.12, 0.36, 0.78, 0x1e293b, 0.40, 2.05, 0);

      charGroup.add(legL, legR, obi, body, collar, armL, armR, head, eyeL, eyeR, hairTop, hairBangs, hairDarkSideL, hairDarkSideR);

    } else {
      // 🧱 6. AVATAR STEVE, ALEX & WARGA STANDAR
      let shirtCol = fallbackColor;
      let pantsCol = 0x1e3a8a;
      let hairCol = 0x451a03;
      let skinCol = 0xfde68a;

      if (uLower === "@steve") {
        shirtCol = 0x06b6d4; pantsCol = 0x1d4ed8; hairCol = 0x451a03; skinCol = 0xd97706;
      } else if (uLower === "@alex") {
        shirtCol = 0x16a34a; pantsCol = 0x78350f; hairCol = 0xea580c; skinCol = 0xfed7aa;
      }

      legL = createBlock(0.32, 0.6, 0.32, pantsCol, -0.18, 0.3, 0);
      legR = createBlock(0.32, 0.6, 0.32, pantsCol, 0.18, 0.3, 0);
      const body = createBlock(0.75, 0.8, 0.42, shirtCol, 0, 1.0, 0);
      armL = createBlock(0.28, 0.75, 0.3, shirtCol, -0.52, 1.0, 0);
      armR = createBlock(0.28, 0.75, 0.3, shirtCol, 0.52, 1.0, 0);
      const head = createBlock(0.75, 0.75, 0.75, skinCol, 0, 1.8, 0);
      const hair = createBlock(0.8, 0.24, 0.8, hairCol, 0, 2.22, 0);
      const eyeL = createBlock(0.12, 0.12, 0.06, 0x0f172a, -0.16, 1.82, 0.38);
      const eyeR = createBlock(0.12, 0.12, 0.06, 0x0f172a, 0.16, 1.82, 0.38);

      charGroup.add(legL, legR, body, armL, armR, head, hair, eyeL, eyeR);
    }

    // Payung & Bola Salju Otomatis Sesuai Musim
    const citizenUmbrella = new THREE.Group();
    citizenUmbrella.add(createBlock(0.08, 1.5, 0.08, 0xe2e8f0, 0.55, 1.8, 0.2));
    citizenUmbrella.add(createBlock(1.5, 0.18, 1.5, fallbackColor, 0.55, 2.55, 0.2));
    citizenUmbrella.visible = false;
    charGroup.add(citizenUmbrella);

    const handSnowball = createBlock(0.26, 0.26, 0.26, 0xffffff, 0.55, 1.1, 0.35);
    handSnowball.visible = false;
    charGroup.add(handSnowball);

    charGroup.position.set(0.8, 0.18, 2.65);
    charGroup.userData = {
      legL, legR, armL, armR,
      citizenUmbrella,
      handSnowball,
      isNaoya: isFastMover,
      phase: houseGroup.userData.id * 1.3
    };

    houseGroup.add(charGroup);
    houseGroup.userData.avatarMesh = charGroup;
    citizenAvatars.push(charGroup);
  };

  // Bersihkan mesh awal lalu render ulang dengan Avatar & Label Khusus
  clickableHouses.forEach(h => {
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

  refreshHousesState();

  // Ubah tombol biru di atas agar bisa melompat bergantian ke 4 warga baru saat direkam!
  let tourIndex = 0;
  const newCitizenIds = [4, 5, 6, 7, 3];
  window.focusCitizenById = function () {
    const targetId = newCitizenIds[tourIndex % newCitizenIds.length];
    tourIndex++;
    const h = clickableHouses.find(item => item.userData.id === targetId);
    if (h) {
      focusOnHouse(h);
      showToast(`🎥 Highlighting House #${targetId}: ${h.userData.owner}!`);
    }
  };
});
