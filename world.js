// =========================================================
// FILE: world.js (ENGINE 3D THREE.JS, MUSIM & LOGIKA KOTA)
// =========================================================

let supabaseClient = null;
try {
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
} catch (e) {
  console.warn("Supabase fallback:", e);
}

const container = document.getElementById("webgl-container");
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x7dd3fc);
scene.fog = new THREE.FogExp2(0x7dd3fc, 0.0055);

const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 32, 44);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
container.appendChild(renderer.domElement);

const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.maxPolarAngle = Math.PI / 2.05;
controls.minDistance = 8;
controls.maxDistance = 115;
controls.target.set(0, 0, 2);
controls.mouseButtons = { LEFT: THREE.MOUSE.PAN, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.ROTATE };
controls.touches = { ONE: THREE.TOUCH.PAN, TWO: THREE.TOUCH.DOLLY_ROTATE };

const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
scene.add(ambientLight);

const hemiLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.35);
hemiLight.position.set(0, 50, 0);
scene.add(hemiLight);

const sunLight = new THREE.DirectionalLight(0xfffbeb, 1.25);
sunLight.position.set(36, 55, 30);
sunLight.castShadow = true;
sunLight.shadow.mapSize.width = 2048;
sunLight.shadow.mapSize.height = 2048;
const d = 58;
sunLight.shadow.camera.left = -d; sunLight.shadow.camera.right = d;
sunLight.shadow.camera.top = d; sunLight.shadow.camera.bottom = -d;
scene.add(sunLight);

const cityGroup = new THREE.Group();
scene.add(cityGroup);

const smokeParticles = [];
const fountainDrops = [];
const nightWindows = [];
const trafficLightsList = [];
const clickableHouses = [];
const citizenAvatars = [];
const birdsList = [];
const firefliesList = [];
const owlsList = [];
const cloudsList = [];
const weatherDrops = [];
const treeFoliageMaterials = [];
const islandTopMeshes = [];

const snowballsList = [];
const beachBallsList = [];
const campfireFlamesList = [];
const rainSplashRingsList = [];

const seasonGroups = {
  sakura: new THREE.Group(),
  summer: new THREE.Group(),
  autumn: new THREE.Group(),
  rain: new THREE.Group(),
  snow: new THREE.Group()
};
Object.values(seasonGroups).forEach(g => {
  g.visible = false;
  cityGroup.add(g);
});
const seasonalAnimals = [];

let turbineBlades = null;
let mayorGroup = null;
let mayorHatGroup = null;
let mayorLeftLeg = null, mayorRightLeg = null, mayorLeftArm = null, mayorRightArm = null;
let bananaPeelMesh = null;
let tick = 0;
let isNight = false;
let currentSeasonIdx = 0;
let preselectedHouseId = null;
let spawnedExpansionIslands = 0;

function createBlock(w, h, d, hexColor, x, y, z, cast = true, receive = true) {
  const geo = new THREE.BoxGeometry(w, h, d);
  const mat = new THREE.MeshStandardMaterial({ color: hexColor, roughness: 0.8, metalness: 0.08 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y, z);
  mesh.castShadow = cast;
  mesh.receiveShadow = receive;
  return mesh;
}

function createCylinderVoxel(radiusTop, radiusBottom, height, segments, hexColor, x, y, z, receive = true) {
  const geo = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, segments);
  const mat = new THREE.MeshStandardMaterial({ color: hexColor, roughness: 0.85, metalness: 0.05 });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.set(x, y, z);
  mesh.receiveShadow = receive;
  return mesh;
}

function buildFloatingIslandBase(width, depth, centerX, centerZ) {
  const isl = new THREE.Group();
  const topGrass = createBlock(width, 1.2, depth, 0x22c55e, 0, -0.6, 0, false, true);
  isl.add(topGrass);
  islandTopMeshes.push(topGrass);

  isl.add(createBlock(width * 0.94, 2.2, depth * 0.94, 0x78350f, 0, -2.3, 0, false, false));
  isl.add(createBlock(width * 0.82, 3.0, depth * 0.82, 0x64748b, 0, -4.9, 0, false, false));
  isl.add(createBlock(width * 0.64, 3.5, depth * 0.64, 0x475569, 0, -8.1, 0, false, false));
  isl.add(createBlock(width * 0.42, 4.0, depth * 0.42, 0x334155, 0, -11.8, 0, false, false));
  isl.add(createBlock(width * 0.20, 3.5, depth * 0.20, 0x1e293b, 0, -15.5, 0, false, false));

  isl.position.set(centerX, 0, centerZ);
  cityGroup.add(isl);
}

function createSingleHousePlot(houseId, x, z, rot) {
  const hGroup = new THREE.Group();
  const roofCol = houseColors[(houseId - 1) % houseColors.length];

  hGroup.add(createBlock(5.6, 0.2, 5.6, 0xcbd5e1, 0, 0.1, 0));
  hGroup.add(createBlock(1.2, 0.15, 2.4, 0x94a3b8, 0, 0.08, 3.4));

  const yardGroup = new THREE.Group();
  yardGroup.add(createBlock(5.8, 0.24, 6.2, 0x4ade80, 0, 0.12, 0.4, false, true));
  yardGroup.add(createBlock(1.1, 0.26, 2.6, 0xe2e8f0, 0, 0.13, 2.4, false, true));
  for (let fx = -2.7; fx <= 2.7; fx += 0.9) {
    if (Math.abs(fx) > 0.6) yardGroup.add(createBlock(0.18, 0.75, 0.18, 0x92400e, fx, 0.5, 3.35));
  }
  for (let fz = -2.4; fz <= 3.3; fz += 0.95) {
    yardGroup.add(createBlock(0.18, 0.75, 0.18, 0x92400e, -2.75, 0.5, fz));
    yardGroup.add(createBlock(0.18, 0.75, 0.18, 0x92400e, 2.75, 0.5, fz));
  }
  yardGroup.add(createBlock(1.9, 0.12, 0.1, 0xb45309, -1.8, 0.65, 3.35));
  yardGroup.add(createBlock(1.9, 0.12, 0.1, 0xb45309, 1.8, 0.65, 3.35));
  yardGroup.add(createBlock(0.1, 0.12, 5.8, 0xb45309, -2.75, 0.65, 0.4));
  yardGroup.add(createBlock(0.1, 0.12, 5.8, 0xb45309, 2.75, 0.65, 0.4));

  yardGroup.add(createBlock(0.45, 1.6, 0.45, 0x78350f, -2.0, 0.9, 2.4));
  const yLeaf1 = createBlock(1.7, 1.1, 1.7, 0x15803d, -2.0, 2.0, 2.4);
  const yLeaf2 = createBlock(1.1, 0.85, 1.1, 0x22c55e, -2.0, 2.8, 2.4);
  treeFoliageMaterials.push(yLeaf1.material, yLeaf2.material);
  yardGroup.add(yLeaf1, yLeaf2);
  yardGroup.add(createBlock(1.1, 0.3, 0.7, 0x78350f, 1.8, 0.26, 2.6));
  yardGroup.add(createBlock(0.25, 0.45, 0.25, 0xf43f5e, 1.55, 0.45, 2.6));
  yardGroup.add(createBlock(0.25, 0.45, 0.25, 0xfacc15, 2.0, 0.45, 2.6));

  yardGroup.visible = false;
  hGroup.add(yardGroup);

  const subMesh = new THREE.Group();
  subMesh.add(createBlock(4.0, 2.6, 3.8, 0xffffff, 0, 1.4, 0));
  subMesh.add(createBlock(1.6, 0.25, 1.0, 0x78350f, 0, 0.22, 2.2));
  subMesh.add(createBlock(4.6, 0.5, 4.4, roofCol, 0, 2.9, 0));
  subMesh.add(createBlock(3.8, 0.5, 3.6, roofCol, 0, 3.4, 0));
  subMesh.add(createBlock(2.8, 0.45, 2.8, roofCol, 0, 3.85, 0));
  subMesh.add(createBlock(0.75, 2.2, 0.75, 0x991b1b, 1.35, 3.6, -0.8));
  subMesh.add(createBlock(0.9, 0.25, 0.9, 0x7f1d1d, 1.35, 4.65, -0.8));
  subMesh.add(createBlock(1.1, 1.8, 1.1, 0x475569, -1.6, 1.0, -1.6));
  subMesh.add(createBlock(1.0, 1.2, 1.0, 0x0284c7, -1.6, 2.5, -1.6));
  subMesh.add(createBlock(0.6, 0.2, 0.6, 0x0f172a, -1.6, 3.15, -1.6));
  subMesh.add(createBlock(1.0, 1.8, 0.15, roofCol, 0, 1.1, 1.92));
  [-1.25, 1.25].forEach(wx => {
    const win = createBlock(0.85, 0.85, 0.15, 0xbae6fd, wx, 1.5, 1.92);
    subMesh.add(win);
    nightWindows.push(win.material);
    subMesh.add(createBlock(0.95, 0.25, 0.35, 0x9a3412, wx, 0.95, 2.05));
    subMesh.add(createBlock(0.75, 0.25, 0.25, 0x16a34a, wx, 1.15, 2.05));
  });
  hGroup.add(subMesh);

  const villaMesh = new THREE.Group();
  villaMesh.add(createBlock(3.4, 2.6, 3.8, 0xf8fafc, -0.7, 1.4, 0));
  villaMesh.add(createBlock(3.2, 2.2, 3.2, 0x1e293b, -0.7, 3.8, -0.2));
  villaMesh.add(createBlock(3.8, 0.35, 3.8, 0xf59e0b, -0.7, 5.05, -0.2));
  const glassBalcony = createBlock(2.8, 1.5, 0.2, 0x38bdf8, -0.7, 3.7, 1.45);
  villaMesh.add(glassBalcony);
  nightWindows.push(glassBalcony.material);
  villaMesh.add(createBlock(1.6, 0.35, 3.2, 0x0ea5e9, 1.65, 0.22, 0.2));
  villaMesh.visible = false;
  hGroup.add(villaMesh);

  for (let s = 0; s < 3; s++) {
    const puff = createBlock(0.45, 0.45, 0.45, 0xf1f5f9, x + 1.35, 4.9 + s * 0.8, z - 0.8, false, false);
    puff.material.transparent = true;
    puff.material.opacity = 0.75;
    puff.userData = { baseX: x + 1.35, baseZ: z - 0.8, offset: s * 2.1 + houseId };
    cityGroup.add(puff);
    smokeParticles.push(puff);
  }

  hGroup.position.set(x, 0, z);
  hGroup.rotation.y = rot;

  const labelEl = document.createElement("div");
  labelEl.className = "house-label px-2 py-0.5 rounded text-[10px] font-extrabold shadow border";
  document.getElementById("labelsContainer").appendChild(labelEl);

  hGroup.userData = {
    id: houseId,
    name: `House #${houseId}`,
    roofColor: roofCol,
    owner: null,
    tier: "subsidized",
    decor: null,
    has_yard: false,
    avatarType: "citizen",
    yardGroup: yardGroup,
    subMesh: subMesh,
    villaMesh: villaMesh,
    avatarMesh: null,
    labelEl: labelEl
  };

  cityGroup.add(hGroup);
  clickableHouses.push(hGroup);
  return hGroup;
}

function spawnCitizenAvatarOnHouse(houseGroup, username, fallbackColor, avatarType) {
  if (houseGroup.userData.avatarMesh) return;

  const charGroup = new THREE.Group();
  const uLower = (username || "").toLowerCase();
  const isNaoya = avatarType === "naoya" || uLower.includes("godkingters");

  let legL, legR, armL, armR;

  if (isNaoya) {
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
    const piercingL = createBlock(0.08, 0.18, 0.08, 0xfef08a, -0.44, 1.88, 0.1);
    const piercingR = createBlock(0.08, 0.18, 0.08, 0xfef08a, 0.44, 1.88, 0.1);

    const speedAura = createBlock(1.0, 1.9, 0.1, 0x38bdf8, 0, 1.1, -0.35, false, false);
    speedAura.material.transparent = true;
    speedAura.material.opacity = 0.28;

    charGroup.add(
      legL, legR, obi, body, collar, armL, armR,
      head, eyeL, eyeR, hairTop, hairBangs, hairDarkSideL, hairDarkSideR,
      piercingL, piercingR, speedAura
    );
  } else {
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
    isNaoya,
    phase: houseGroup.userData.id * 1.3
  };

  houseGroup.add(charGroup);
  houseGroup.userData.avatarMesh = charGroup;
  citizenAvatars.push(charGroup);
}

const animalSpawnSpots = [
  [-6.8, 6.8], [6.8, 6.8], [-6.8, -6.8], [6.8, -6.8],
  [-13.5, 4.2], [13.5, 4.2], [-13.5, -4.2], [13.5, -4.2]
];

function buildSeasonalBiomes() {
  const snowmenSpots = [
    [-6.5, 8.2], [6.5, 8.2], [-6.5, -8.2], [6.5, -8.2],
    [-10.5, -5.2], [-18.5, -5.2], [-10.5, -14.2]
  ];
  snowmenSpots.forEach(([sx, sz]) => {
    const sm = new THREE.Group();
    sm.add(createBlock(1.1, 0.9, 1.1, 0xffffff, 0, 0.45, 0));
    sm.add(createBlock(0.85, 0.75, 0.85, 0xf8fafc, 0, 1.25, 0));
    sm.add(createBlock(0.65, 0.65, 0.65, 0xffffff, 0, 1.9, 0));
    sm.add(createBlock(0.14, 0.14, 0.35, 0xf97316, 0, 1.9, 0.42));
    sm.add(createBlock(0.1, 0.1, 0.08, 0x0f172a, -0.15, 2.02, 0.34));
    sm.add(createBlock(0.1, 0.1, 0.08, 0x0f172a, 0.15, 2.02, 0.34));
    sm.add(createBlock(0.95, 0.18, 0.95, 0xef4444, 0, 1.6, 0));
    sm.add(createBlock(0.75, 0.12, 0.75, 0x0f172a, 0, 2.26, 0));
    sm.add(createBlock(0.5, 0.45, 0.5, 0x1e293b, 0, 2.5, 0));
    sm.position.set(sx, 0.1, sz);
    seasonGroups.snow.add(sm);
  });

  const snowballPairs = [
    { x1: -12, z1: -6.5, x2: -19, z2: -6.5 },
    { x1: -12, z1: -14.5, x2: -12, z2: -7.0 },
    { x1: -5, z1: 5, x2: 5, z2: 5 },
    { x1: 12, z1: -6.5, x2: 19, z2: -6.5 }
  ];
  snowballPairs.forEach((pair, idx) => {
    const sb = createBlock(0.32, 0.32, 0.32, 0xffffff, pair.x1, 1.5, pair.z1, true, false);
    sb.userData = { ...pair, phase: idx * 0.8 };
    seasonGroups.snow.add(sb);
    snowballsList.push(sb);
  });

  animalSpawnSpots.forEach(([ax, az], idx) => {
    const pg = new THREE.Group();
    pg.add(createBlock(0.46, 0.75, 0.4, 0x0f172a, 0, 0.42, 0));
    pg.add(createBlock(0.36, 0.65, 0.08, 0xffffff, 0, 0.4, 0.18));
    pg.add(createBlock(0.42, 0.4, 0.4, 0x0f172a, 0, 0.95, 0));
    pg.add(createBlock(0.18, 0.12, 0.22, 0xf97316, 0, 0.9, 0.26));
    pg.position.set(ax, 0.12, az);
    pg.userData = { baseX: ax, baseZ: az, phase: idx * 1.1, moveType: "waddle", season: "snow" };
    seasonGroups.snow.add(pg);
    seasonalAnimals.push(pg);
  });

  const beachSpots = [
    [-6.5, 8.0, 0xef4444], [6.5, 8.0, 0x0ea5e9], [-6.5, -8.0, 0xfacc15], [6.5, -8.0, 0xec4899],
    [-9.8, -15.5, 0x38bdf8], [-9.8, -6.5, 0xf97316]
  ];
  beachSpots.forEach(([bx, bz, col]) => {
    const umb = new THREE.Group();
    umb.add(createBlock(0.14, 2.4, 0.14, 0xf8fafc, 0, 1.2, 0));
    umb.add(createBlock(2.2, 0.25, 2.2, col, 0, 2.35, 0));
    umb.add(createBlock(1.4, 0.2, 1.4, 0xffffff, 0, 2.52, 0));
    umb.add(createBlock(0.9, 0.2, 1.6, 0xfef08a, 0.6, 0.2, 0));
    umb.add(createBlock(0.9, 0.45, 0.3, 0xfacc15, 0.6, 0.4, -0.65));
    umb.position.set(bx, 0.1, bz);
    seasonGroups.summer.add(umb);
  });

  snowballPairs.forEach((pair, idx) => {
    const bb = new THREE.Group();
    bb.add(createBlock(0.45, 0.45, 0.45, 0xef4444, 0, 0, 0));
    bb.add(createBlock(0.48, 0.2, 0.48, 0xfacc15, 0, 0, 0));
    bb.add(createBlock(0.2, 0.48, 0.48, 0x38bdf8, 0, 0, 0));
    bb.userData = { ...pair, phase: idx * 0.7 };
    seasonGroups.summer.add(bb);
    beachBallsList.push(bb);
  });

  animalSpawnSpots.forEach(([ax, az], idx) => {
    const duck = new THREE.Group();
    duck.add(createBlock(0.42, 0.35, 0.55, 0xfacc15, 0, 0.28, 0));
    duck.add(createBlock(0.32, 0.32, 0.32, 0xfef08a, 0, 0.55, 0.18));
    duck.add(createBlock(0.22, 0.1, 0.22, 0xf97316, 0, 0.5, 0.4));
    duck.position.set(ax, 0.12, az);
    duck.userData = { baseX: ax, baseZ: az, phase: idx * 0.9, moveType: "waddle", season: "summer" };
    seasonGroups.summer.add(duck);
    seasonalAnimals.push(duck);
  });

  const picnicSpots = [[-6.5, 8.0], [6.5, -8.0], [-14.2, -5.8], [-14.2, -14.8]];
  picnicSpots.forEach(([px, pz]) => {
    const pic = new THREE.Group();
    pic.add(createBlock(2.2, 0.06, 2.2, 0xf43f5e, 0, 0.04, 0));
    pic.add(createBlock(1.8, 0.08, 1.8, 0xffffff, 0, 0.05, 0));
    pic.add(createBlock(0.6, 0.45, 0.45, 0xb45309, 0.3, 0.28, 0.2));
    pic.add(createBlock(0.12, 2.2, 0.12, 0x451a03, -0.9, 1.1, -0.9));
    const lantern = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 0.55, 0.45),
      new THREE.MeshBasicMaterial({ color: 0xf472b6 })
    );
    lantern.position.set(-0.9, 2.1, -0.9);
    pic.add(lantern);
    pic.position.set(px, 0.12, pz);
    seasonGroups.sakura.add(pic);
  });

  animalSpawnSpots.forEach(([ax, az], idx) => {
    const bun = new THREE.Group();
    const bCol = idx % 2 === 0 ? 0xffffff : 0xfbcfe8;
    bun.add(createBlock(0.38, 0.32, 0.48, bCol, 0, 0.22, 0));
    bun.add(createBlock(0.32, 0.3, 0.32, bCol, 0, 0.45, 0.18));
    bun.add(createBlock(0.1, 0.38, 0.1, bCol, -0.09, 0.72, 0.18));
    bun.add(createBlock(0.1, 0.38, 0.1, bCol, 0.09, 0.72, 0.18));
    bun.position.set(ax, 0.12, az);
    bun.userData = { baseX: ax, baseZ: az, phase: idx * 1.3, moveType: "hop", season: "sakura" };
    seasonGroups.sakura.add(bun);
    seasonalAnimals.push(bun);
  });

  const campfireSpots = [[-6.5, 8.0], [6.5, 8.0], [-10.2, -5.5], [-10.2, -14.5]];
  campfireSpots.forEach(([cx, cz], idx) => {
    const cf = new THREE.Group();
    cf.add(createBlock(1.1, 0.2, 0.25, 0x451a03, 0, 0.12, 0));
    cf.add(createBlock(0.25, 0.2, 1.1, 0x78350f, 0, 0.15, 0));
    const flame = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.7, 0.55),
      new THREE.MeshBasicMaterial({ color: 0xf97316 })
    );
    flame.position.set(0, 0.5, 0);
    flame.userData = { phase: idx };
    cf.add(flame);
    campfireFlamesList.push(flame);

    cf.add(createBlock(0.75, 0.65, 0.75, 0xea580c, 1.1, 0.32, 0.3));
    cf.add(createBlock(0.16, 0.22, 0.16, 0x15803d, 1.1, 0.7, 0.3));
    cf.position.set(cx, 0.12, cz);
    seasonGroups.autumn.add(cf);
  });

  animalSpawnSpots.forEach(([ax, az], idx) => {
    const fox = new THREE.Group();
    fox.add(createBlock(0.36, 0.32, 0.62, 0xea580c, 0, 0.28, 0));
    fox.add(createBlock(0.38, 0.32, 0.36, 0xf97316, 0, 0.46, 0.28));
    fox.add(createBlock(0.24, 0.24, 0.45, 0xf97316, 0, 0.32, -0.45));
    fox.position.set(ax, 0.12, az);
    fox.userData = { baseX: ax, baseZ: az, phase: idx * 1.5, moveType: "hop", season: "autumn" };
    seasonGroups.autumn.add(fox);
    seasonalAnimals.push(fox);
  });

  const puddleSpots = [
    [-6.5, 8.0], [6.5, 8.0], [-6.5, -8.0], [6.5, -8.0],
    [-11.5, -5.8], [-19.5, -5.8], [-11.5, -14.8]
  ];
  puddleSpots.forEach(([rx, rz], idx) => {
    const pd = new THREE.Group();
    pd.add(createBlock(1.7, 0.04, 1.5, 0x38bdf8, 0, 0.02, 0, false, true));
    const ring = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.06, 0.6),
      new THREE.MeshBasicMaterial({ color: 0xe0f2fe, transparent: true, opacity: 0.8 })
    );
    ring.position.set(0, 0.05, 0);
    ring.userData = { phase: idx * 0.9 };
    pd.add(ring);
    rainSplashRingsList.push(ring);

    pd.position.set(rx, 0.12, rz);
    seasonGroups.rain.add(pd);
  });

  animalSpawnSpots.forEach(([ax, az], idx) => {
    const frog = new THREE.Group();
    frog.add(createBlock(0.42, 0.26, 0.44, 0x16a34a, 0, 0.16, 0));
    frog.add(createBlock(0.36, 0.08, 0.38, 0xbef264, 0, 0.12, 0.04));
    frog.position.set(ax, 0.12, az);
    frog.userData = { baseX: ax, baseZ: az, phase: idx * 1.4, moveType: "frogJump", season: "rain" };
    seasonGroups.rain.add(frog);
    seasonalAnimals.push(frog);
  });
}

const expansionDirections = [
  {
    islandX: 0, islandZ: 56, width: 28, depth: 24,
    bridgeX: 0, bridgeZ: 41.5, bridgeW: 4.6, bridgeD: 9.0,
    roadW: 4.0, roadD: 22,
    plots: [
      { dx: -7.5, dz: -5, rot: Math.PI / 2 },
      { dx: -7.5, dz: 5, rot: Math.PI / 2 },
      { dx: 7.5, dz: -5, rot: -Math.PI / 2 },
      { dx: 7.5, dz: 5, rot: -Math.PI / 2 }
    ]
  },
  {
    islandX: -56, islandZ: 0, width: 24, depth: 28,
    bridgeX: -41.5, bridgeZ: 0, bridgeW: 9.0, bridgeD: 4.6,
    roadW: 22, roadD: 4.0,
    plots: [
      { dx: -5, dz: -7.5, rot: 0 },
      { dx: 5, dz: -7.5, rot: 0 },
      { dx: -5, dz: 7.5, rot: Math.PI },
      { dx: 5, dz: 7.5, rot: Math.PI }
    ]
  },
  {
    islandX: 56, islandZ: 0, width: 24, depth: 28,
    bridgeX: 41.5, bridgeZ: 0, bridgeW: 9.0, bridgeD: 4.6,
    roadW: 22, roadD: 4.0,
    plots: [
      { dx: -5, dz: -7.5, rot: 0 },
      { dx: 5, dz: -7.5, rot: 0 },
      { dx: -5, dz: 7.5, rot: Math.PI },
      { dx: 5, dz: 7.5, rot: Math.PI }
    ]
  }
];

function spawnNextExpansionIsland() {
  const expIdx = spawnedExpansionIslands;
  const cfg = expansionDirections[expIdx % expansionDirections.length];
  const ringMultiplier = Math.floor(expIdx / expansionDirections.length) + 1;

  const ix = cfg.islandX * ringMultiplier;
  const iz = cfg.islandZ * ringMultiplier;
  const bx = cfg.bridgeX * ringMultiplier;
  const bz = cfg.bridgeZ * ringMultiplier;

  const bridge = new THREE.Group();
  bridge.add(createBlock(cfg.bridgeW, 0.35, cfg.bridgeD, 0x92400e, 0, 0.05, 0));
  bridge.add(createBlock(cfg.bridgeW, 0.6, 0.25, 0x475569, 0, 0.45, cfg.bridgeD / 2 - 0.15));
  bridge.add(createBlock(cfg.bridgeW, 0.6, 0.25, 0x475569, 0, 0.45, -cfg.bridgeD / 2 + 0.15));
  bridge.position.set(bx, 0, bz);
  cityGroup.add(bridge);

  buildFloatingIslandBase(cfg.width, cfg.depth, ix, iz);

  cityGroup.add(createBlock(cfg.roadW + 1.2, 0.12, cfg.roadD + 1.2, 0x94a3b8, ix, 0.06, iz, false, true));
  cityGroup.add(createBlock(cfg.roadW, 0.15, cfg.roadD, 0x334155, ix, 0.075, iz, false, true));

  cfg.plots.forEach(p => {
    const nextHouseId = clickableHouses.length + 1;
    createSingleHousePlot(nextHouseId, ix + p.dx, iz + p.dz, p.rot);
  });

  createOakTree(ix - cfg.width / 2 + 2.5, iz - cfg.depth / 2 + 2.5, 0.9);
  createOakTree(ix + cfg.width / 2 - 2.5, iz + cfg.depth / 2 - 2.5, 0.9);

  spawnedExpansionIslands++;
  document.getElementById("hudIslands").textContent = 1 + spawnedExpansionIslands;

  if (seasons && seasons[currentSeasonIdx]) {
    const s = seasons[currentSeasonIdx];
    islandTopMeshes.forEach(m => m.material.color.setHex(isNight ? 0x0f172a : s.groundHex));
  }
}

function buildRoundaboutAndRoads() {
  cityGroup.add(createCylinderVoxel(8.6, 8.6, 0.14, 24, 0x94a3b8, 0, 0.07, 0));
  cityGroup.add(createCylinderVoxel(7.8, 7.8, 0.16, 24, 0x334155, 0, 0.08, 0));
  cityGroup.add(createCylinderVoxel(4.6, 4.6, 0.24, 20, 0xcbd5e1, 0, 0.12, 0));
  cityGroup.add(createCylinderVoxel(4.2, 4.2, 0.26, 20, 0xe2e8f0, 0, 0.13, 0));

  for (let a = 0; a < 12; a++) {
    const rad = (a / 12) * Math.PI * 2;
    const dash = createBlock(0.9, 0.18, 0.22, 0xfacc15, Math.cos(rad) * 6.2, 0.09, Math.sin(rad) * 6.2, false, true);
    dash.rotation.y = -rad;
    cityGroup.add(dash);
  }

  cityGroup.add(createBlock(30.5, 0.12, 5.4, 0x94a3b8, -22.75, 0.06, 0, false, true));
  cityGroup.add(createBlock(30.5, 0.15, 4.0, 0x334155, -22.75, 0.075, 0, false, true));
  cityGroup.add(createBlock(30.5, 0.12, 5.4, 0x94a3b8, 22.75, 0.06, 0, false, true));
  cityGroup.add(createBlock(30.5, 0.15, 4.0, 0x334155, 22.75, 0.075, 0, false, true));
  cityGroup.add(createBlock(5.4, 0.12, 30.5, 0x94a3b8, 0, 0.06, 22.75, false, true));
  cityGroup.add(createBlock(4.0, 0.15, 30.5, 0x334155, 0, 0.075, 22.75, false, true));
  cityGroup.add(createBlock(5.4, 0.12, 6.0, 0x94a3b8, 0, 0.06, -10.5, false, true));
  cityGroup.add(createBlock(4.0, 0.15, 6.0, 0x334155, 0, 0.075, -10.5, false, true));

  for (let i = 13; i <= 34; i += 4) {
    cityGroup.add(createBlock(1.8, 0.17, 0.24, 0xfacc15, -i, 0.085, 0, false, true));
    cityGroup.add(createBlock(1.8, 0.17, 0.24, 0xfacc15, i, 0.085, 0, false, true));
    cityGroup.add(createBlock(0.24, 0.17, 1.8, 0xfacc15, 0, 0.085, i, false, true));
  }

  for (let s = -1.5; s <= 1.5; s += 0.75) {
    cityGroup.add(createBlock(1.3, 0.17, 0.38, 0xffffff, -8.8, 0.086, s, false, true));
    cityGroup.add(createBlock(1.3, 0.17, 0.38, 0xffffff, 8.8, 0.086, s, false, true));
    cityGroup.add(createBlock(0.38, 0.17, 1.3, 0xffffff, s, 0.086, -8.8, false, true));
    cityGroup.add(createBlock(0.38, 0.17, 1.3, 0xffffff, s, 0.086, 8.8, false, true));
  }

  const tlConfigs = [
    { x: -9.6, z: 3.1, rot: Math.PI / 2, dirGroup: 0 },
    { x: 9.6, z: -3.1, rot: -Math.PI / 2, dirGroup: 0 },
    { x: -3.1, z: -9.6, rot: 0, dirGroup: 1 },
    { x: 3.1, z: 9.6, rot: Math.PI, dirGroup: 1 }
  ];

  tlConfigs.forEach(cfg => {
    const tl = new THREE.Group();
    tl.add(createBlock(0.24, 3.8, 0.24, 0x1e293b, 0, 1.9, 0));
    tl.add(createBlock(1.4, 0.18, 0.18, 0x1e293b, 0.6, 3.6, 0));
    tl.add(createBlock(0.45, 1.15, 0.35, 0x090d16, 1.15, 3.25, 0));

    const redMat = new THREE.MeshBasicMaterial({ color: 0xef4444 });
    const yelMat = new THREE.MeshBasicMaterial({ color: 0x451a03 });
    const grnMat = new THREE.MeshBasicMaterial({ color: 0x064e3b });

    const redBulb = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.24, 0.4), redMat);
    redBulb.position.set(1.15, 3.6, 0);
    const yelBulb = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.24, 0.4), yelMat);
    yelBulb.position.set(1.15, 3.25, 0);
    const grnBulb = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.24, 0.4), grnMat);
    grnBulb.position.set(1.15, 2.9, 0);

    tl.add(redBulb, yelBulb, grnBulb);
    tl.position.set(cfg.x, 0.1, cfg.z);
    tl.rotation.y = cfg.rot;
    cityGroup.add(tl);

    trafficLightsList.push({ redMat, yelMat, grnMat, dirGroup: cfg.dirGroup });
  });
}

function createOakTree(x, z, scale = 1) {
  const g = new THREE.Group();
  g.add(createBlock(0.55 * scale, 1.8 * scale, 0.55 * scale, 0x78350f, 0, 0.9 * scale, 0));
  const leaf1 = createBlock(2.1 * scale, 1.3 * scale, 2.1 * scale, 0x15803d, 0, 2.2 * scale, 0);
  const leaf2 = createBlock(1.4 * scale, 1.0 * scale, 1.4 * scale, 0x22c55e, 0, 3.1 * scale, 0);
  treeFoliageMaterials.push(leaf1.material, leaf2.material);
  g.add(leaf1, leaf2);
  g.position.set(x, 0, z);
  cityGroup.add(g);
}

function createPineTree(x, z) {
  const g = new THREE.Group();
  g.add(createBlock(0.5, 2.2, 0.5, 0x451a03, 0, 1.1, 0));
  const p1 = createBlock(2.2, 1.2, 2.2, 0x065f46, 0, 2.2, 0);
  const p2 = createBlock(1.6, 1.2, 1.6, 0x047857, 0, 3.2, 0);
  const p3 = createBlock(0.9, 1.1, 0.9, 0x10b981, 0, 4.2, 0);
  treeFoliageMaterials.push(p1.material, p2.material, p3.material);
  g.add(p1, p2, p3);
  g.position.set(x, 0, z);
  cityGroup.add(g);
}

function createUtilityPole(x, z, rotateCrossbar = false) {
  const pole = new THREE.Group();
  pole.add(createBlock(0.28, 5.2, 0.28, 0x475569, 0, 2.6, 0));
  pole.add(createBlock(rotateCrossbar ? 0.2 : 1.8, 0.2, rotateCrossbar ? 1.8 : 0.2, 0x334155, 0, 4.9, 0));
  const lampBulb = createBlock(0.5, 0.25, 0.5, 0xfef08a, 0, 3.8, 0.35);
  pole.add(lampBulb);
  nightWindows.push(lampBulb.material);
  pole.position.set(x, 0, z);
  cityGroup.add(pole);
  return new THREE.Vector3(x, 5.05, z);
}

function connectPowerWire(p1, p2) {
  const points = [];
  for (let i = 0; i <= 8; i++) {
    const t = i / 8;
    const x = THREE.MathUtils.lerp(p1.x, p2.x, t);
    const z = THREE.MathUtils.lerp(p1.z, p2.z, t);
    const y = THREE.MathUtils.lerp(p1.y, p2.y, t) - Math.sin(t * Math.PI) * 0.45;
    points.push(new THREE.Vector3(x, y, z));
  }
  const geo = new THREE.BufferGeometry().setFromPoints(points);
  cityGroup.add(new THREE.Line(geo, new THREE.LineBasicMaterial({ color: 0x0f172a })));
}

function buildMunicipalWaterTower(x, z) {
  const wt = new THREE.Group();
  wt.add(createBlock(4.8, 0.3, 4.8, 0x94a3b8, 0, 0.15, 0));
  [[-1.5, -1.5], [1.5, -1.5], [-1.5, 1.5], [1.5, 1.5]].forEach(([lx, lz]) => {
    wt.add(createBlock(0.4, 5.5, 0.4, 0x475569, lx, 2.8, lz));
  });
  wt.add(createBlock(3.4, 0.25, 3.4, 0x64748b, 0, 3.0, 0));
  wt.add(createBlock(0.6, 5.5, 0.6, 0x0284c7, 0, 2.8, 0));
  wt.add(createBlock(4.2, 0.4, 4.2, 0x334155, 0, 5.6, 0));
  wt.add(createBlock(3.8, 3.2, 3.8, 0x0ea5e9, 0, 7.4, 0));
  wt.add(createBlock(4.0, 0.35, 4.0, 0x0284c7, 0, 6.4, 0));
  wt.add(createBlock(4.0, 0.35, 4.0, 0x0284c7, 0, 8.2, 0));
  wt.add(createBlock(3.2, 0.5, 3.2, 0x38bdf8, 0, 9.2, 0));
  wt.position.set(x, 0, z);
  cityGroup.add(wt);
}

function buildPowerStation(x, z) {
  const ps = new THREE.Group();
  ps.add(createBlock(5.0, 0.3, 5.0, 0x64748b, 0, 0.15, 0));
  ps.add(createBlock(2.2, 2.0, 2.2, 0x334155, -1.0, 1.15, 0.8));
  ps.add(createBlock(2.4, 0.3, 2.4, 0xf59e0b, -1.0, 2.25, 0.8));
  ps.add(createBlock(0.7, 8.5, 0.7, 0xf8fafc, 1.0, 4.25, -0.8));
  ps.add(createBlock(1.2, 1.0, 1.4, 0xe2e8f0, 1.0, 8.5, -0.6));

  turbineBlades = new THREE.Group();
  turbineBlades.add(createBlock(0.4, 0.4, 0.4, 0x0284c7, 0, 0, 0.2));
  turbineBlades.add(createBlock(0.35, 3.8, 0.12, 0xffffff, 0, 1.9, 0.25));
  turbineBlades.add(createBlock(0.35, 3.8, 0.12, 0xffffff, 0, -1.9, 0.25));
  turbineBlades.add(createBlock(3.8, 0.35, 0.12, 0xffffff, 1.9, 0, 0.25));
  turbineBlades.add(createBlock(3.8, 0.35, 0.12, 0xffffff, -1.9, 0, 0.25));
  turbineBlades.position.set(1.0, 8.5, 0.15);
  ps.add(turbineBlades);

  ps.position.set(x, 0, z);
  cityGroup.add(ps);
}

function spawnDayBirds() {
  const birdColors = [0xffffff, 0xfef08a, 0x38bdf8, 0xfb7185];
  for (let i = 0; i < 16; i++) {
    const bird = new THREE.Group();
    const col = birdColors[i % birdColors.length];
    const body = createBlock(0.32, 0.18, 0.55, col, 0, 0, 0, false, false);
    const tail = createBlock(0.24, 0.08, 0.25, col, 0, 0.02, -0.35, false, false);
    const beak = createBlock(0.14, 0.1, 0.2, 0xf97316, 0, 0, 0.35, false, false);
    const leftWing = createBlock(0.48, 0.06, 0.28, col, -0.36, 0.04, 0, false, false);
    const rightWing = createBlock(0.48, 0.06, 0.28, col, 0.36, 0.04, 0, false, false);
    bird.add(body, tail, beak, leftWing, rightWing);

    bird.userData = {
      leftWing, rightWing,
      rx: 12 + (i % 4) * 5,
      rz: 10 + ((i + 2) % 4) * 5,
      freqX: 0.005 + (i % 3) * 0.002,
      freqZ: 0.007 + (i % 2) * 0.003,
      baseY: 9.5 + (i % 5) * 1.8,
      phase: i * 1.7,
      centerX: (i % 2 === 0 ? 1 : -1) * 5,
      centerZ: (i % 3 === 0 ? -5 : 5)
    };
    cityGroup.add(bird);
    birdsList.push(bird);
  }
}

function spawnNightWildlife() {
  for (let i = 0; i < 75; i++) {
    const geo = new THREE.BoxGeometry(0.18, 0.18, 0.18);
    const mat = new THREE.MeshBasicMaterial({
      color: i % 2 === 0 ? 0xbef264 : 0xfde047,
      transparent: true,
      opacity: 0.9
    });
    const fly = new THREE.Mesh(geo, mat);
    const bx = (Math.random() - 0.5) * 48;
    const bz = (Math.random() - 0.5) * 48;
    const by = 0.8 + Math.random() * 3.5;
    fly.position.set(bx, by, bz);
    fly.visible = false;
    fly.userData = { baseX: bx, baseY: by, baseZ: bz, phase: Math.random() * Math.PI * 2 };
    cityGroup.add(fly);
    firefliesList.push(fly);
  }

  [[-5.8, -5.8], [5.8, 5.8]].forEach(([ox, oz]) => {
    const owl = new THREE.Group();
    owl.add(createBlock(0.45, 0.55, 0.4, 0x451a03, 0, 0, 0, false, false));
    const eyeL = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.08), new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
    const eyeR = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.12, 0.08), new THREE.MeshBasicMaterial({ color: 0xfacc15 }));
    eyeL.position.set(-0.1, 0.1, 0.22);
    eyeR.position.set(0.1, 0.1, 0.22);
    owl.add(eyeL, eyeR);
    owl.position.set(ox, 3.85, oz);
    owl.visible = false;
    cityGroup.add(owl);
    owlsList.push(owl);
  });
}

function spawnWeatherParticles() {
  for (let i = 0; i < 240; i++) {
    const geo = new THREE.BoxGeometry(0.22, 0.22, 0.22);
    const mat = new THREE.MeshBasicMaterial({ color: 0xf9a8d4, transparent: true, opacity: 0.9 });
    const drop = new THREE.Mesh(geo, mat);
    drop.position.set((Math.random() - 0.5) * 60, Math.random() * 26, (Math.random() - 0.5) * 60);
    drop.userData = { phase: Math.random() * 10, speedMod: 0.8 + Math.random() * 0.4 };
    cityGroup.add(drop);
    weatherDrops.push(drop);
  }
}

function spawnClouds() {
  [
    [-22, 18, -18], [15, 20, -22], [-10, 19, 16], [24, 17, 12], [0, 21, -28],
    [-38, -6, 18], [38, -8, -14], [0, -10, 42]
  ].forEach(([cx, cy, cz], idx) => {
    const cl = new THREE.Group();
    cl.add(createBlock(5.5, 0.9, 3.5, 0xffffff, 0, 0, 0, false, false));
    cl.add(createBlock(3.5, 0.8, 4.8, 0xf8fafc, 1.2, -0.1, 0.5, false, false));
    cl.position.set(cx, cy, cz);
    cl.userData = { speed: 0.015 + (idx % 3) * 0.005 };
    cityGroup.add(cl);
    cloudsList.push(cl);
  });
}

const initialHouseCoords = [
  { x: -12, z: -9, rot: 0 }, { x: -20, z: -9, rot: 0 }, { x: -12, z: -18, rot: 0 },
  { x: 12, z: -9, rot: 0 },  { x: 20, z: -9, rot: 0 },  { x: 12, z: -18, rot: 0 },
  { x: -12, z: 9, rot: Math.PI }, { x: -20, z: 9, rot: Math.PI }, { x: -12, z: 18, rot: Math.PI },
  { x: 12, z: 9, rot: Math.PI },  { x: 20, z: 9, rot: Math.PI },  { x: 12, z: 18, rot: Math.PI }
];

function buildWorld() {
  buildFloatingIslandBase(76, 76, 0, 0);
  buildRoundaboutAndRoads();

  const busStop = new THREE.Group();
  busStop.add(createBlock(3.2, 0.2, 1.6, 0x64748b, 0, 0.1, 0));
  busStop.add(createBlock(0.2, 2.2, 0.2, 0x1e293b, -1.4, 1.1, -0.6));
  busStop.add(createBlock(0.2, 2.2, 0.2, 0x1e293b, 1.4, 1.1, -0.6));
  busStop.add(createBlock(3.4, 0.25, 1.8, 0x0284c7, 0, 2.25, 0));
  busStop.add(createBlock(1.8, 0.4, 0.5, 0xd97706, 0, 0.4, -0.3));
  busStop.position.set(-14.5, 0, -3.6);
  cityGroup.add(busStop);

  const fountain = new THREE.Group();
  fountain.add(createCylinderVoxel(2.6, 2.7, 0.55, 16, 0x64748b, 0, 0.35, 0));
  fountain.add(createCylinderVoxel(2.2, 2.2, 0.6, 16, 0x0ea5e9, 0, 0.4, 0));
  fountain.add(createBlock(1.3, 1.6, 1.3, 0xf1f5f9, 0, 0.9, 0));
  fountain.add(createBlock(2.1, 0.3, 2.1, 0xe2e8f0, 0, 1.8, 0));
  fountain.add(createBlock(0.75, 1.4, 0.75, 0xf8fafc, 0, 2.5, 0));
  fountain.add(createBlock(0.95, 0.5, 0.95, 0x38bdf8, 0, 3.4, 0));
  cityGroup.add(fountain);

  for (let i = 0; i < 16; i++) {
    const drop = createBlock(0.26, 0.26, 0.26, 0x7dd3fc, 0, 2, 0, false, false);
    drop.userData = { angle: (i / 16) * Math.PI * 2, speed: 0.04 + (i % 3) * 0.01, phase: i * 0.4 };
    cityGroup.add(drop);
    fountainDrops.push(drop);
  }

  const th = new THREE.Group();
  th.add(createBlock(9.2, 0.5, 6, 0x94a3b8, 0, 0.25, 0));
  th.add(createBlock(8.2, 3.8, 5, 0xf8fafc, 0, 2.4, 0));
  [-3, -1.2, 1.2, 3].forEach(px => th.add(createBlock(0.5, 3.8, 0.5, 0xe2e8f0, px, 2.4, 2.6)));
  th.add(createBlock(9.4, 0.8, 6.2, 0xdc2626, 0, 4.6, 0));
  th.add(createBlock(7.8, 0.8, 4.8, 0xef4444, 0, 5.4, 0));
  th.add(createBlock(2.5, 2.8, 2.5, 0x334155, 0, 6.8, 0));
  th.add(createBlock(2.9, 0.8, 2.9, 0x0f172a, 0, 8.5, 0));

  th.add(createBlock(1.55, 1.55, 0.14, 0x090d16, 0, 7.0, 1.26));
  const glowingClockMat = new THREE.MeshBasicMaterial({ color: 0xfde047 });
  const clockFace = new THREE.Mesh(new THREE.BoxGeometry(1.3, 1.3, 0.16), glowingClockMat);
  clockFace.position.set(0, 7.0, 1.28);
  th.add(clockFace);
  th.add(createBlock(0.12, 0.48, 0.2, 0x090d16, 0, 7.18, 1.3));
  th.add(createBlock(0.38, 0.12, 0.2, 0x090d16, 0.15, 7.0, 1.3));

  th.position.set(0, 0, -16.5);
  cityGroup.add(th);

  buildMunicipalWaterTower(-8.2, -16.5);
  buildPowerStation(8.2, -16.5);

  const poleEast = [createUtilityPole(10, -3.2, true), createUtilityPole(18, -3.2, true), createUtilityPole(26, -3.2, true)];
  connectPowerWire(poleEast[0], poleEast[1]);
  connectPowerWire(poleEast[1], poleEast[2]);

  const poleWest = [createUtilityPole(-10, 3.2, true), createUtilityPole(-18, 3.2, true), createUtilityPole(-26, 3.2, true)];
  connectPowerWire(poleWest[0], poleWest[1]);
  connectPowerWire(poleWest[1], poleWest[2]);

  const poleSouth = [createUtilityPole(3.2, 10, false), createUtilityPole(3.2, 18, false), createUtilityPole(3.2, 26, false)];
  connectPowerWire(poleSouth[0], poleSouth[1]);
  connectPowerWire(poleSouth[1], poleSouth[2]);
  connectPowerWire(new THREE.Vector3(7.2, 2.4, -15.5), poleEast[0]);

  const oakLocations = [
    [-5.8, -5.8], [5.8, -5.8], [-5.8, 5.8], [5.8, 5.8],
    [-8, -9], [-16, -9], [-25, -9], [8, -9], [16, -9], [25, -9],
    [-8, 9], [-16, 9], [-25, 9], [8, 9], [16, 9], [25, 9],
    [-16, -18], [16, -18], [-16, 18], [16, 18]
  ];
  oakLocations.forEach(([ox, oz], i) => createOakTree(ox, oz, 0.85 + (i % 3) * 0.15));

  const pineLocations = [
    [-26, -19], [-23, -24], [-15, -25], [15, -25], [23, -24], [26, -19],
    [-26, 19], [-23, 24], [-15, 25], [15, 25], [23, 24], [26, 19]
  ];
  pineLocations.forEach(([px, pz]) => createPineTree(px, pz));

  mayorGroup = new THREE.Group();
  mayorLeftLeg = createBlock(0.36, 0.7, 0.36, 0x0f172a, -0.22, 0.35, 0);
  mayorRightLeg = createBlock(0.36, 0.7, 0.36, 0x0f172a, 0.22, 0.35, 0);
  mayorLeftArm = createBlock(0.32, 0.85, 0.35, 0x1e293b, -0.65, 1.15, 0);
  mayorRightArm = createBlock(0.32, 0.85, 0.35, 0x1e293b, 0.65, 1.15, 0);
  mayorGroup.add(mayorLeftLeg, mayorRightLeg, mayorLeftArm, mayorRightArm);

  mayorGroup.add(createBlock(0.9, 0.95, 0.5, 0x1e293b, 0, 1.15, 0));
  mayorGroup.add(createBlock(0.28, 0.75, 0.54, 0xffffff, 0, 1.2, 0));
  mayorGroup.add(createBlock(0.14, 0.55, 0.58, 0xef4444, 0, 1.15, 0));
  mayorGroup.add(createBlock(0.85, 0.85, 0.85, 0xfde68a, 0, 2.05, 0));
  mayorGroup.add(createBlock(0.15, 0.15, 0.08, 0x0f172a, -0.2, 2.1, 0.44));
  mayorGroup.add(createBlock(0.15, 0.15, 0.08, 0x0f172a, 0.2, 2.1, 0.44));

  mayorHatGroup = new THREE.Group();
  mayorHatGroup.add(createBlock(1.35, 0.16, 1.35, 0x090d16, 0, 0, 0));
  mayorHatGroup.add(createBlock(0.92, 0.2, 0.92, 0xf59e0b, 0, 0.15, 0));
  mayorHatGroup.add(createBlock(0.9, 0.85, 0.9, 0x090d16, 0, 0.6, 0));
  mayorHatGroup.position.set(0, 2.55, 0);
  mayorGroup.add(mayorHatGroup);

  mayorGroup.position.set(0, 0.26, 3.2);
  cityGroup.add(mayorGroup);

  bananaPeelMesh = new THREE.Group();
  bananaPeelMesh.add(createBlock(0.5, 0.12, 0.5, 0xfacc15, 0, 0.06, 0));
  bananaPeelMesh.add(createBlock(0.2, 0.22, 0.2, 0xeab308, 0, 0.18, 0));
  bananaPeelMesh.position.set(0, 0.28, 3.2);
  bananaPeelMesh.visible = false;
  cityGroup.add(bananaPeelMesh);

  initialHouseCoords.forEach((pos, idx) => {
    createSingleHousePlot(idx + 1, pos.x, pos.z, pos.rot);
  });

  buildSeasonalBiomes();
  spawnDayBirds();
  spawnNightWildlife();
  spawnWeatherParticles();
  spawnClouds();
}

buildWorld();

const seasons = [
  {
    id: "sakura",
    badge: "🌸 SAKURA",
    biomeLabel: "🍱 Hanami Picnic & Bunnies",
    groundHex: 0x4ade80,
    foliagePalette: [0xf472b6, 0xf9a8d4, 0xfbcfe8],
    skyDayHex: 0x93c5fd,
    ambientDayHex: 0xfce7f3,
    hemiGroundHex: 0xfbcfe8,
    particleHex: 0xf9a8d4,
    particleScale: [0.22, 0.08, 0.22],
    fallSpeed: 0.045,
    drift: 0.04,
    showParticles: true
  },
  {
    id: "summer",
    badge: "☀️ SUMMER",
    biomeLabel: "🏐 Beach Balls & Ducks",
    groundHex: 0x22c55e,
    foliagePalette: [0x15803d, 0x22c55e, 0x16a34a],
    skyDayHex: 0x38bdf8,
    ambientDayHex: 0xfef08a,
    hemiGroundHex: 0x86efac,
    particleHex: 0xfde047,
    particleScale: [0.16, 0.12, 0.16],
    fallSpeed: 0.02,
    drift: 0.06,
    showParticles: true
  },
  {
    id: "autumn",
    badge: "🍂 AUTUMN",
    biomeLabel: "🔥 Campfires & Foxes",
    groundHex: 0xca8a04,
    foliagePalette: [0xd97706, 0xea580c, 0xb45309],
    skyDayHex: 0xfdba74,
    ambientDayHex: 0xffedd5,
    hemiGroundHex: 0xfde047,
    particleHex: 0xf97316,
    particleScale: [0.25, 0.08, 0.25],
    fallSpeed: 0.055,
    drift: 0.05,
    showParticles: true
  },
  {
    id: "rain",
    badge: "🌧️ RAINY",
    biomeLabel: "☔ Umbrellas & Puddle Jumps",
    groundHex: 0x15803d,
    foliagePalette: [0x166534, 0x14532d, 0x065f46],
    skyDayHex: 0x64748b,
    ambientDayHex: 0xcbd5e1,
    hemiGroundHex: 0x334155,
    particleHex: 0x38bdf8,
    particleScale: [0.06, 0.65, 0.06],
    fallSpeed: 0.48,
    drift: 0.005,
    showParticles: true
  },
  {
    id: "snow",
    badge: "❄️ SNOW",
    biomeLabel: "⛄ Snowball Fights & Snowmen",
    groundHex: 0xf8fafc,
    foliagePalette: [0xe2e8f0, 0xf1f5f9, 0xcbd5e1],
    skyDayHex: 0xcbd5e1,
    ambientDayHex: 0xe0f2fe,
    hemiGroundHex: 0xffffff,
    particleHex: 0xffffff,
    particleScale: [0.2, 0.2, 0.2],
    fallSpeed: 0.06,
    drift: 0.03,
    showParticles: true
  }
];

let lastAppliedSeason = -1;
let lastAppliedNight = null;

function updateGlobalSyncedEnvironment() {
  const nowMs = Date.now();
  const SEASON_DURATION_MS = 48 * 60 * 60 * 1000;
  const DAY_NIGHT_CYCLE_MS = 24 * 60 * 60 * 1000;

  const syncedSeasonIdx = Math.floor(nowMs / SEASON_DURATION_MS) % seasons.length;
  const cycleProgress = (nowMs % DAY_NIGHT_CYCLE_MS) / DAY_NIGHT_CYCLE_MS;
  const syncedIsNight = cycleProgress >= 0.5;

  if (syncedSeasonIdx !== lastAppliedSeason || syncedIsNight !== lastAppliedNight) {
    lastAppliedSeason = syncedSeasonIdx;
    lastAppliedNight = syncedIsNight;
    currentSeasonIdx = syncedSeasonIdx;
    isNight = syncedIsNight;

    const s = seasons[currentSeasonIdx];
    document.getElementById("seasonBadge").textContent = s.badge;
    document.getElementById("timeBadge").textContent = isNight ? "🌙 NIGHT" : "☀️ DAY";
    document.getElementById("biomeHud").textContent = s.biomeLabel;

    Object.keys(seasonGroups).forEach(k => {
      seasonGroups[k].visible = (k === s.id);
    });

    citizenAvatars.forEach(av => {
      if (av.userData.citizenUmbrella) av.userData.citizenUmbrella.visible = (s.id === "rain");
      if (av.userData.handSnowball) av.userData.handSnowball.visible = (s.id === "snow");
    });

    islandTopMeshes.forEach(mesh => {
      mesh.material.color.setHex(isNight ? 0x0f172a : s.groundHex);
    });

    treeFoliageMaterials.forEach((mat, i) => {
      mat.color.setHex(s.foliagePalette[i % s.foliagePalette.length]);
    });

    const skyHex = isNight ? 0x070b14 : s.skyDayHex;
    scene.background.setHex(skyHex);
    scene.fog.color.setHex(skyHex);

    ambientLight.color.setHex(isNight ? 0x1e293b : s.ambientDayHex);
    ambientLight.intensity = isNight ? 0.32 : 0.72;
    hemiLight.groundColor.setHex(isNight ? 0x090d16 : s.hemiGroundHex);
    sunLight.intensity = isNight ? 0.35 : (s.id === "rain" ? 0.65 : 1.25);

    birdsList.forEach(b => { b.visible = !isNight; });
    firefliesList.forEach(f => { f.visible = isNight; });
    owlsList.forEach(o => { o.visible = isNight; });

    nightWindows.forEach(mat => {
      mat.color.setHex(isNight ? 0xfef08a : 0xbae6fd);
      mat.emissive = new THREE.Color(isNight ? 0xfacc15 : 0x000000);
      mat.emissiveIntensity = isNight ? 0.85 : 0;
    });

    weatherDrops.forEach(drop => {
      drop.visible = s.showParticles;
      drop.material.color.setHex(s.particleHex);
      drop.scale.set(s.particleScale[0], s.particleScale[1], s.particleScale[2]);
    });
  }
}

updateGlobalSyncedEnvironment();

let claimedData = { ...defaultCitizens };

const localSaved = JSON.parse(localStorage.getItem("nexaton_citizens_v3") || "{}");
Object.keys(localSaved).forEach(k => {
  if (!defaultCitizens[k]) claimedData[k] = localSaved[k];
});

async function loadCitizensData() {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient.from("citizens").select("*");
      if (!error && data) {
        data.forEach(row => {
          const def = defaultCitizens[row.house_id];
          claimedData[row.house_id] = {
            username: def ? def.username : row.username,
            tier: row.tier || (def ? def.tier : "subsidized"),
            decor: row.decor || (def ? def.decor : null),
            has_yard: def ? def.has_yard : Boolean(row.has_commented || row.has_yard),
            avatar: def ? def.avatar : "citizen"
          };
        });
      }
    } catch (err) {
      console.warn("Supabase sync note:", err);
    }
  }
  refreshHousesState();
}

setInterval(loadCitizensData, 10000);

function refreshHousesState() {
  const claimedIds = Object.keys(claimedData).map(Number);
  const maxClaimedId = claimedIds.length > 0 ? Math.max(...claimedIds) : 3;

  while (clickableHouses.length <= maxClaimedId || clickableHouses.filter(h => !claimedData[h.userData.id]).length === 0) {
    spawnNextExpansionIsland();
  }

  let claimedCount = 0;
  clickableHouses.forEach(h => {
    const entry = claimedData[h.userData.id] || null;
    const owner = entry ? (typeof entry === "string" ? entry : entry.username) : null;
    const tier = entry && entry.tier ? entry.tier : "subsidized";
    const decor = entry && entry.decor ? entry.decor : null;
    const hasYard = entry && entry.has_yard ? true : false;
    const avatarType = entry && entry.avatar ? entry.avatar : "citizen";

    h.userData.owner = owner;
    h.userData.tier = tier;
    h.userData.decor = decor;
    h.userData.has_yard = hasYard;
    h.userData.avatarType = avatarType;

    h.userData.yardGroup.visible = Boolean(owner && hasYard);

    const isVilla = tier.toLowerCase().includes("villa") || tier.toLowerCase().includes("penthouse");
    h.userData.subMesh.visible = !isVilla;
    h.userData.villaMesh.visible = isVilla;

    const lbl = h.userData.labelEl;
    if (owner) {
      claimedCount++;
      spawnCitizenAvatarOnHouse(h, owner, h.userData.roofColor, avatarType);
      const s = seasons[currentSeasonIdx];
      if (h.userData.avatarMesh) {
        h.userData.avatarMesh.userData.citizenUmbrella.visible = (s.id === "rain");
        h.userData.avatarMesh.userData.handSnowball.visible = (s.id === "snow");
      }

      if (isVilla) {
        lbl.textContent = `🏰 ${owner} (VIP)`;
        lbl.className = "house-label bg-amber-400 text-slate-950 border-slate-900 px-2 py-0.5 rounded-md text-[10px] font-black shadow-md";
      } else if (avatarType === "naoya") {
        lbl.textContent = `⚡ ${owner} (Naoya Zenin + Yard 🌳)`;
        lbl.className = "house-label bg-sky-400 text-slate-950 border-slate-900 px-2.5 py-0.5 rounded-md text-[10px] font-black shadow-lg";
      } else if (hasYard) {
        lbl.textContent = `🌳 ${owner}`;
        lbl.className = "house-label bg-emerald-400 text-slate-950 border-slate-900 px-2 py-0.5 rounded-md text-[10px] font-black shadow-md";
      } else {
        lbl.textContent = `🏠 ${owner}`;
        lbl.className = "house-label bg-emerald-500 text-slate-950 border-slate-900 px-2 py-0.5 rounded-md text-[10px] font-black shadow-md";
      }
    } else {
      lbl.textContent = `Plot #${h.userData.id} (FREE)`;
      lbl.className = "house-label bg-slate-900/80 text-slate-200 border-slate-600 px-2 py-0.5 rounded text-[9px] font-bold";
    }
  });

  document.getElementById("hudCitizens").textContent = claimedCount;
  document.getElementById("hudEmpty").textContent = clickableHouses.length - claimedCount;
}

loadCitizensData();

function showToast(msg) {
  const t = document.getElementById("toastMsg");
  t.textContent = msg;
  t.classList.remove("hidden");
  setTimeout(() => t.classList.add("hidden"), 4500);
}

function focusCitizenById(hid) {
  const h = clickableHouses.find(item => item.userData.id === hid);
  if (h) {
    focusOnHouse(h);
    showToast(`⚡ Zoomed to ${h.userData.owner} at House #${hid}!`);
  }
}

function openClaimModal(specificHouseId = null) {
  preselectedHouseId = specificHouseId;
  document.getElementById("claimModal").classList.remove("hidden");
}

function closeClaimModal() { document.getElementById("claimModal").classList.add("hidden"); }
function unlockClaimStep() { document.getElementById("followConfirmCheck").checked = true; }

function openShopGateway(prefillUsername = "") {
  if (prefillUsername) document.getElementById("shopUsernameInput").value = prefillUsername;
  document.getElementById("shopModal").classList.remove("hidden");
}

function closeShopGateway() { document.getElementById("shopModal").classList.add("hidden"); }

function proceedToShopify() {
  let u = document.getElementById("shopUsernameInput").value.trim();
  if (!u) {
    showToast("⚠️ Please enter your TikTok @username first!");
    return;
  }
  if (!u.startsWith("@")) u = "@" + u;
  try { navigator.clipboard.writeText(`TikTok Username: ${u}`); } catch (e) {}
  localStorage.setItem("nexaton_last_buyer", u);
  closeShopGateway();
  showToast(`✅ Copied "${u}"! Paste it in the Shopify Cart Note at checkout!`);
  setTimeout(() => { window.open("https://pevcsr-r6.myshopify.com", "_blank"); }, 600);
}

async function submitClaimHouse() {
  let rawUser = document.getElementById("claimUsernameInput").value.trim();
  const isChecked = document.getElementById("followConfirmCheck").checked;
  const hasCommented = document.getElementById("commentConfirmCheck").checked;

  if (!rawUser) { showToast("⚠️ Please enter your TikTok @username!"); return; }
  if (!isChecked) { showToast("⚠️ Please follow @mayorofnexatoncity first!"); return; }
  if (!rawUser.startsWith("@")) rawUser = "@" + rawUser;

  const existingHouse = clickableHouses.find(h => h.userData.owner && h.userData.owner.toLowerCase() === rawUser.toLowerCase());
  if (existingHouse) {
    if (hasCommented) {
      claimedData[existingHouse.userData.id].has_yard = true;
      localStorage.setItem("nexaton_citizens_v3", JSON.stringify(claimedData));
      refreshHousesState();
    }
    closeClaimModal();
    focusOnHouse(existingHouse);
    showToast(`🎉 Welcome back ${rawUser}! Taking you to House #${existingHouse.userData.id}.`);
    return;
  }

  let targetHouse = preselectedHouseId
    ? clickableHouses.find(h => h.userData.id === preselectedHouseId && !h.userData.owner)
    : null;
  if (!targetHouse) targetHouse = clickableHouses.find(h => !h.userData.owner);

  if (!targetHouse) {
    spawnNextExpansionIsland();
    targetHouse = clickableHouses.find(h => !h.userData.owner);
  }

  const hid = targetHouse.userData.id;
  claimedData[hid] = { username: rawUser, tier: "subsidized", decor: null, has_yard: hasCommented, avatar: "citizen" };
  localStorage.setItem("nexaton_citizens_v3", JSON.stringify(claimedData));

  if (supabaseClient) {
    try { await supabaseClient.from("citizens").upsert({ house_id: hid, username: rawUser }); } catch (e) {}
  }

  refreshHousesState();
  closeClaimModal();
  focusOnHouse(targetHouse);
  showToast(`🎉 Congratulations ${rawUser}! You now own Subsidized House #${hid}!`);
}

function focusOnHouse(houseGroup) {
  controls.target.set(houseGroup.position.x, 1.5, houseGroup.position.z);
  camera.position.set(houseGroup.position.x, 14, houseGroup.position.z + 16);
}

function searchCitizen() {
  const q = document.getElementById("searchInput").value.trim().toLowerCase();
  if (!q) return;
  const found = clickableHouses.find(h => h.userData.owner && h.userData.owner.toLowerCase().includes(q));
  if (found) {
    focusOnHouse(found);
    showToast(`📍 Found ${found.userData.owner} at House #${found.userData.id}!`);
  } else {
    showToast(`Citizen "${q}" doesn't have a house yet! Click CLAIM FREE HOUSE to move in.`);
  }
}

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
let downX = 0, downY = 0;

renderer.domElement.addEventListener("pointerdown", (e) => { downX = e.clientX; downY = e.clientY; });
renderer.domElement.addEventListener("pointerup", (e) => {
  if (Math.hypot(e.clientX - downX, e.clientY - downY) > 7) return;
  pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);

  const intersects = raycaster.intersectObjects(clickableHouses, true);
  if (intersects.length > 0) {
    let obj = intersects[0].object;
    while (obj.parent && !obj.userData.name) obj = obj.parent;
    if (obj.userData && obj.userData.name) open3DInterior(obj.userData);
  }
});

let roomScene, roomCamera, roomRenderer, roomBedBlanket, roomCitizenMesh, roomAnimId;

function initRoom3D() {
  const box = document.getElementById("room3dContainer");
  roomScene = new THREE.Scene();
  roomScene.background = new THREE.Color(0x0f172a);

  roomCamera = new THREE.PerspectiveCamera(40, box.clientWidth / box.clientHeight, 0.1, 100);
  roomCamera.position.set(7.5, 6.5, 7.5);
  roomCamera.lookAt(0, 1.2, 0);

  roomRenderer = new THREE.WebGLRenderer({ antialias: true });
  roomRenderer.setSize(box.clientWidth, box.clientHeight);
  roomRenderer.shadowMap.enabled = true;
  box.appendChild(roomRenderer.domElement);

  roomScene.add(new THREE.AmbientLight(0xffffff, 0.7));
  const rLight = new THREE.PointLight(0xffedd5, 1.2, 20);
  rLight.position.set(2, 5, 2);
  rLight.castShadow = true;
  roomScene.add(rLight);

  roomScene.add(createBlock(6, 0.3, 6, 0x78350f, 0, 0, 0));
  roomScene.add(createBlock(6, 4, 0.3, 0xf1f5f9, 0, 2, -2.85));
  roomScene.add(createBlock(0.3, 4, 6, 0xe2e8f0, -2.85, 2, 0));
  roomScene.add(createBlock(1.8, 1.6, 0.36, 0x38bdf8, 0.5, 2.3, -2.85));
  roomScene.add(createBlock(3.2, 0.08, 2.4, 0xfef3c7, 0.3, 0.18, 0.3));

  roomScene.add(createBlock(1.8, 0.45, 2.8, 0x92400e, -1.6, 0.38, -0.8));
  roomScene.add(createBlock(1.8, 1.3, 0.3, 0x78350f, -1.6, 0.8, -2.1));
  roomScene.add(createBlock(1.4, 0.25, 0.65, 0xffffff, -1.6, 0.72, -1.55));
  roomBedBlanket = createBlock(1.65, 0.32, 1.85, 0x0284c7, -1.6, 0.65, -0.35);
  roomScene.add(roomBedBlanket);

  roomScene.add(createBlock(0.8, 2.4, 1.6, 0x78350f, -2.2, 1.35, 1.5));
  roomScene.add(createBlock(0.86, 0.4, 1.3, 0xef4444, -2.18, 1.8, 1.5));
  roomScene.add(createBlock(0.86, 0.4, 1.3, 0x22c55e, -2.18, 1.1, 1.5));
  roomScene.add(createBlock(1.6, 1.1, 1.0, 0xb45309, 1.6, 0.7, -1.9));
  roomScene.add(createBlock(0.55, 0.55, 0.55, 0xfef08a, 1.6, 1.65, -1.9));

  roomCitizenMesh = new THREE.Group();
  roomCitizenMesh.add(createBlock(0.35, 0.65, 0.35, 0xd6d3d1, -0.2, 0.45, 0));
  roomCitizenMesh.add(createBlock(0.35, 0.65, 0.35, 0xd6d3d1, 0.2, 0.45, 0));
  roomCitizenMesh.add(createBlock(0.8, 0.85, 0.45, 0x1e293b, 0, 1.2, 0));
  roomCitizenMesh.add(createBlock(0.8, 0.8, 0.8, 0xffedd5, 0, 2.0, 0));
  roomCitizenMesh.add(createBlock(0.84, 0.25, 0.84, 0xfacc15, 0, 2.42, 0));
  roomCitizenMesh.position.set(0.5, 0, 0.5);
  roomScene.add(roomCitizenMesh);
}

function open3DInterior(houseData) {
  document.getElementById("roomTitle").textContent = `${houseData.name.toUpperCase()}`;
  document.getElementById("interiorModal").classList.remove("hidden");

  if (!roomRenderer) initRoom3D();
  roomBedBlanket.material.color.setHex(houseData.roofColor);

  const actionArea = document.getElementById("roomActionArea");
  document.getElementById("infoYard").textContent = houseData.has_yard ? "Unlocked (Fence + Tree) 🌳" : "Comment on TikTok 💬";
  document.getElementById("roomYardBanner").textContent = houseData.has_yard ? "🌳 Yard & Oak Tree: INSTALLED" : "🌳 Yard: Comment to Unlock";
  document.getElementById("infoDecor").textContent = houseData.decor ? houseData.decor : "Shop Upgrade 🛍️";

  if (houseData.owner) {
    roomCitizenMesh.visible = true;
    document.getElementById("roomOwnerBanner").textContent = `👤 Citizen: ${houseData.owner}`;
    document.getElementById("infoCitizen").textContent = houseData.owner;
    actionArea.innerHTML = `
      <button onclick="closeInterior(); openShopGateway('${houseData.owner}');"
         class="mc-btn-gold w-full py-3 rounded-xl text-center text-slate-950 font-black text-xs sm:text-sm block">
        🛒 BUY DECOR TO UPGRADE ${houseData.owner.toUpperCase()} TO A VILLA!
      </button>`;
  } else {
    roomCitizenMesh.visible = false;
    document.getElementById("roomOwnerBanner").textContent = `🔑 Unclaimed Subsidized House`;
    document.getElementById("infoCitizen").textContent = "Available (Free)";
    actionArea.innerHTML = `
      <button onclick="closeInterior(); openClaimModal(${houseData.id});"
         class="mc-btn-emerald w-full py-3 rounded-xl text-center text-slate-950 font-black text-xs sm:text-sm block">
        🏠 CLAIM THIS HOUSE FOR FREE (FOLLOW MAYOR)
      </button>`;
  }

  function renderRoomLoop() {
    roomAnimId = requestAnimationFrame(renderRoomLoop);
    roomScene.rotation.y = Math.sin(tick * 0.015) * 0.18;
    if (roomCitizenMesh.visible) {
      roomCitizenMesh.position.y = Math.abs(Math.sin(tick * 0.1)) * 0.2;
    }
    roomRenderer.render(roomScene, roomCamera);
  }
  if (roomAnimId) cancelAnimationFrame(roomAnimId);
  renderRoomLoop();
}

function closeInterior() {
  document.getElementById("interiorModal").classList.add("hidden");
  if (roomAnimId) cancelAnimationFrame(roomAnimId);
}

const bubbleEl = document.getElementById("mayorBubble");
const speechTextEl = document.getElementById("mayorSpeechText");

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);
  tick++;
  controls.update();

  if (tick % 60 === 0) updateGlobalSyncedEnvironment();
  if (turbineBlades) turbineBlades.rotation.z -= 0.025;

  const nowSec = Date.now() / 1000;

  const tlCycle = nowSec % 12;
  trafficLightsList.forEach(tl => {
    const phase = tl.dirGroup === 0 ? tlCycle : (tlCycle + 6) % 12;
    if (phase < 4.5) {
      tl.redMat.color.setHex(0x450a0a);
      tl.yelMat.color.setHex(0x451a03);
      tl.grnMat.color.setHex(0x22c55e);
    } else if (phase < 6.0) {
      tl.redMat.color.setHex(0x450a0a);
      tl.yelMat.color.setHex(0xfacc15);
      tl.grnMat.color.setHex(0x064e3b);
    } else {
      tl.redMat.color.setHex(0xef4444);
      tl.yelMat.color.setHex(0x451a03);
      tl.grnMat.color.setHex(0x064e3b);
    }
  });

  const activeSeason = seasons[currentSeasonIdx];

  if (activeSeason.id === "snow") {
    snowballsList.forEach(sb => {
      const u = sb.userData;
      const t = (Math.sin(tick * 0.055 + u.phase) + 1) * 0.5;
      sb.position.x = THREE.MathUtils.lerp(u.x1, u.x2, t);
      sb.position.z = THREE.MathUtils.lerp(u.z1, u.z2, t);
      sb.position.y = 1.3 + Math.sin(t * Math.PI) * 2.6;
      sb.rotation.x += 0.1;
      sb.rotation.y += 0.1;
    });
  } else if (activeSeason.id === "summer") {
    beachBallsList.forEach(bb => {
      const u = bb.userData;
      const t = (Math.sin(tick * 0.04 + u.phase) + 1) * 0.5;
      bb.position.x = THREE.MathUtils.lerp(u.x1, u.x2, t);
      bb.position.z = THREE.MathUtils.lerp(u.z1, u.z2, t);
      bb.position.y = 0.5 + Math.abs(Math.sin(tick * 0.12 + u.phase)) * 2.2;
      bb.rotation.z += 0.08;
    });
  } else if (activeSeason.id === "autumn") {
    campfireFlamesList.forEach(fl => {
      const s = 0.85 + Math.abs(Math.sin(tick * 0.2 + fl.userData.phase)) * 0.4;
      fl.scale.set(1, s, 1);
    });
  } else if (activeSeason.id === "rain") {
    rainSplashRingsList.forEach(rg => {
      const s = ((tick * 0.04 + rg.userData.phase) % 1.5) + 0.4;
      rg.scale.set(s, 1, s);
      rg.material.opacity = Math.max(0, 1.0 - (s / 1.9));
    });
  }

  seasonalAnimals.forEach((anim) => {
    const u = anim.userData;
    if (u.season !== activeSeason.id) return;

    const walkT = tick * 0.03 + u.phase;
    const nx = u.baseX + Math.sin(walkT) * 1.3;
    const nz = u.baseZ + Math.cos(walkT * 0.8) * 1.3;
    const dx = nx - anim.position.x;
    const dz = nz - anim.position.z;

    anim.position.x = nx;
    anim.position.z = nz;
    anim.rotation.y = Math.atan2(dx, dz);

    if (u.moveType === "waddle") {
      anim.rotation.z = Math.sin(tick * 0.22 + u.phase) * 0.22;
      anim.position.y = 0.12 + Math.abs(Math.cos(tick * 0.22 + u.phase)) * 0.08;
    } else if (u.moveType === "hop") {
      anim.position.y = 0.12 + Math.abs(Math.sin(tick * 0.15 + u.phase)) * 0.45;
    } else if (u.moveType === "frogJump") {
      const jumpWave = Math.max(0, Math.sin(tick * 0.1 + u.phase));
      anim.position.y = 0.12 + jumpWave * 0.85;
    }
  });

  if (!isNight) {
    birdsList.forEach((b, idx) => {
      const u = b.userData;
      const t = tick + u.phase * 100;
      const prevX = b.position.x;
      const prevY = b.position.y;
      const prevZ = b.position.z;

      const nx = u.centerX + Math.sin(t * u.freqX) * u.rx + Math.cos(t * u.freqX * 0.5) * 3;
      const nz = u.centerZ + Math.cos(t * u.freqZ) * u.rz + Math.sin(t * u.freqZ * 0.5) * 3;
      const ny = u.baseY + Math.sin(t * 0.025 + u.phase) * 1.6;

      b.position.set(nx, ny, nz);
      b.lookAt(nx + (nx - prevX), ny + (ny - prevY), nz + (nz - prevZ));
      b.rotation.z = Math.sin(t * u.freqX) * 0.35;

      const climbing = (ny - prevY) > -0.005;
      const flap = climbing ? Math.sin(tick * 0.42 + idx) * 0.65 : Math.sin(tick * 0.08 + idx) * 0.12;
      u.leftWing.rotation.z = flap;
      u.rightWing.rotation.z = -flap;
    });
  } else {
    firefliesList.forEach((f, idx) => {
      const u = f.userData;
      f.position.x = u.baseX + Math.sin(tick * 0.03 + u.phase) * 1.2;
      f.position.y = u.baseY + Math.cos(tick * 0.04 + idx) * 0.6;
      f.position.z = u.baseZ + Math.cos(tick * 0.03 + u.phase) * 1.2;
      f.material.opacity = 0.35 + Math.abs(Math.sin(tick * 0.08 + u.phase)) * 0.65;
    });
    owlsList.forEach((o, idx) => {
      o.rotation.y = Math.sin(tick * 0.02 + idx) * 0.6;
    });
  }

  if (activeSeason.showParticles) {
    weatherDrops.forEach(drop => {
      drop.position.y -= activeSeason.fallSpeed * drop.userData.speedMod;
      drop.position.x += Math.sin(tick * 0.03 + drop.userData.phase) * activeSeason.drift;
      if (activeSeason.id !== "rain") {
        drop.rotation.x += 0.02;
        drop.rotation.z += 0.02;
      } else {
        drop.rotation.set(0, 0, 0);
      }
      if (drop.position.y < 0.2) {
        drop.position.y = 24 + Math.random() * 4;
        drop.position.x = (Math.random() - 0.5) * 60;
        drop.position.z = (Math.random() - 0.5) * 60;
      }
    });
  }

  cloudsList.forEach(c => {
    c.position.x += c.userData.speed;
    if (c.position.x > 42) c.position.x = -42;
  });

  smokeParticles.forEach(p => {
    const cycle = ((tick * 0.025 + p.userData.offset) % 2.8);
    p.position.y = 4.8 + cycle;
    p.position.x = p.userData.baseX + Math.sin(tick * 0.04 + p.userData.offset) * 0.2;
    p.material.opacity = Math.max(0, 0.8 - (cycle / 2.8) * 0.8);
  });

  fountainDrops.forEach(d => {
    const t = (tick * d.userData.speed + d.userData.phase) % 1;
    const radius = 0.4 + t * 1.3;
    d.position.x = Math.cos(d.userData.angle) * radius;
    d.position.z = Math.sin(d.userData.angle) * radius;
    d.position.y = 3.3 - (t * t * 2.6);
  });

  citizenAvatars.forEach((av) => {
    const p = av.userData.phase;
    const speedMult = av.userData.isNaoya ? 0.065 : 0.03;
    const walkOffset = Math.sin(tick * speedMult + p) * 1.15;
    av.position.x = walkOffset;

    const jumpHeight = (activeSeason.id === "rain" || activeSeason.id === "sakura") ? 0.28 : 0.14;
    av.position.y = 0.18 + Math.abs(Math.sin(tick * 0.14 + p)) * jumpHeight;
    av.rotation.y = Math.cos(tick * speedMult + p) > 0 ? Math.PI / 2 : -Math.PI / 2;

    const swing = Math.sin(tick * 0.18 + p) * 0.55;
    av.userData.legL.rotation.x = swing;
    av.userData.legR.rotation.x = -swing;
    av.userData.armL.rotation.x = -swing;

    if (activeSeason.id === "snow" || activeSeason.id === "summer") {
      av.userData.armR.rotation.x = Math.sin(tick * 0.28 + p) * 1.1;
    } else {
      av.userData.armR.rotation.x = swing;
    }
  });

  if (mayorGroup) {
    const gagCycle = nowSec % 45;

    if (gagCycle < 3.5) {
      bananaPeelMesh.visible = true;
      bananaPeelMesh.position.x = mayorGroup.position.x;
      mayorGroup.rotation.x = -Math.PI / 2.2;
      mayorGroup.position.y = 0.65;
      mayorHatGroup.position.y = 3.1 + Math.abs(Math.sin(tick * 0.25)) * 0.6;
      speechTextEl.textContent = "\"WHOA!! MY BACK!! 🍌💥\"";
    } else if (gagCycle >= 20 && gagCycle < 23) {
      bananaPeelMesh.visible = false;
      mayorGroup.rotation.x = 0.35;
      mayorGroup.position.y = 0.26 + Math.abs(Math.sin(tick * 0.3)) * 0.75;
      mayorHatGroup.position.y = 3.4;
      speechTextEl.textContent = "\"ACHOO!! 🤧 Excuse me!\"";
    } else {
      bananaPeelMesh.visible = false;
      mayorGroup.rotation.x = 0;
      mayorHatGroup.position.y = 2.55;

      const walkWave = Math.sin(nowSec * 0.65);
      const walkDir = Math.cos(nowSec * 0.65);
      mayorGroup.position.x = walkWave * 2.1;
      mayorGroup.position.y = 0.26 + Math.abs(Math.sin(nowSec * 6)) * 0.12;
      mayorGroup.rotation.y = walkDir >= 0 ? Math.PI / 2.5 : -Math.PI / 2.5;

      const limbSwing = Math.sin(nowSec * 7) * 0.55;
      mayorLeftLeg.rotation.x = limbSwing;
      mayorRightLeg.rotation.x = -limbSwing;
      mayorLeftArm.rotation.x = -limbSwing;
      mayorRightArm.rotation.x = limbSwing;

      const phraseIdx = Math.floor(nowSec / 4) % mayorPhrases.length;
      speechTextEl.textContent = mayorPhrases[phraseIdx];
    }

    const headPos = new THREE.Vector3(mayorGroup.position.x, 4.3, mayorGroup.position.z);
    headPos.project(camera);
    if (headPos.z < 1) {
      bubbleEl.style.left = `${(headPos.x * 0.5 + 0.5) * window.innerWidth}px`;
      bubbleEl.style.top = `${(-(headPos.y * 0.5) + 0.5) * window.innerHeight}px`;
      bubbleEl.style.opacity = "1";
    } else {
      bubbleEl.style.opacity = "0";
    }
  }

  clickableHouses.forEach(h => {
    const pos = new THREE.Vector3(h.position.x, 5.2, h.position.z);
    pos.project(camera);
    if (pos.z < 1) {
      h.userData.labelEl.style.left = `${(pos.x * 0.5 + 0.5) * window.innerWidth}px`;
      h.userData.labelEl.style.top = `${(-(pos.y * 0.5) + 0.5) * window.innerHeight}px`;
      h.userData.labelEl.style.opacity = "1";
    } else {
      h.userData.labelEl.style.opacity = "0";
    }
  });

  renderer.render(scene, camera);
}

animate();
