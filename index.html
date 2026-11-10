<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>NexatonCity - Official Citizen Portal</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background-color: #f8fafc; font-family: 'Inter', -apple-system, sans-serif; }
    .house-lot { transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1); }
    .house-lot:hover { transform: translateY(-4px); }
    .highlight-ring { animation: pulse-ring 1.5s infinite; }
    @keyframes pulse-ring {
      0% { box-shadow: 0 0 0 0 rgba(14, 165, 233, 0.7); }
      70% { box-shadow: 0 0 0 12px rgba(14, 165, 233, 0); }
      100% { box-shadow: 0 0 0 0 rgba(14, 165, 233, 0); }
    }
    .fence-border {
      border: 3px dashed #cbd5e1;
      background-image: radial-gradient(#dcfce7 15%, transparent 16%);
      background-size: 12px 12px;
    }
  </style>
</head>
<body class="text-slate-800">

  <!-- Top Navigation -->
  <header class="sticky top-0 z-30 bg-white/90 backdrop-blur border-b border-slate-200">
    <div class="max-w-6xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-3">
      <div class="flex items-center gap-2">
        <span class="text-2xl">🏙️</span>
        <div>
          <h1 class="font-extrabold text-lg leading-none text-slate-900">NexatonCity</h1>
          <p class="text-xs text-slate-500">Official Citizen Map & Interior Portal</p>
        </div>
      </div>

      <!-- Search Username -->
      <div class="flex items-center gap-2 flex-1 max-w-md">
        <div class="relative w-full">
          <input
            id="searchInput"
            type="text"
            placeholder="Search @username (e.g. @alex_99)..."
            class="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:bg-white"
            oninput="searchCitizen()"
          />
          <span class="absolute left-3 top-2.5 text-slate-400 text-sm">🔍</span>
        </div>
      </div>

      <a href="https://YOUR-SHOPIFY-STORE.myshopify.com" target="_blank"
         class="bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition">
        🛒 Upgrade House & Decor
      </a>
    </div>
  </header>

  <!-- Rules Banner -->
  <section class="max-w-6xl mx-auto px-4 pt-6">
    <div class="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
      <div class="flex flex-wrap gap-3 text-xs font-medium">
        <span class="bg-slate-100 text-slate-700 px-3 py-1.5 rounded-lg">
          ➕ <strong>Follow</strong> = Free Subsidized House (Random Color)
        </span>
        <span class="bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg">
          💬 <strong>Comment</strong> = Get Yard + Fence + Tree 🌳
        </span>
        <span class="bg-amber-50 text-amber-700 border border-amber-200 px-3 py-1.5 rounded-lg">
          🛍️ <strong>Shop Decor</strong> = Luxury Upgrade + Real Item Shipped
        </span>
      </div>
      <div class="text-xs text-slate-500 font-semibold">
        👥 Citizens: <span id="citizenCount" class="text-slate-900">0</span>
      </div>
    </div>
  </section>

  <!-- City Grid Map -->
  <main class="max-w-6xl mx-auto px-4 py-6">
    <div class="flex items-center justify-between mb-4">
      <h2 class="font-bold text-sm uppercase tracking-wider text-slate-400">Residential District A1 (Click any house to enter)</h2>
      <span id="searchStatus" class="text-xs font-semibold text-sky-600"></span>
    </div>

    <div id="cityGrid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      <!-- Populated by JS -->
    </div>

    <!-- Infrastructure Request Zone -->
    <div class="mt-8">
      <h2 class="font-bold text-sm uppercase tracking-wider text-slate-400 mb-3">Public Infrastructure (Waiting for Citizen Requests)</h2>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div class="border-2 border-dashed border-slate-300 rounded-2xl p-5 text-center bg-slate-50/60">
          <div class="text-2xl mb-1">🏗️</div>
          <h3 class="font-bold text-sm text-slate-700">Empty Public Lot #1</h3>
          <p class="text-xs text-slate-500 mt-1">No infrastructure yet. Comment on TikTok what the Mayor should build here (Park, Hospital, Police, or Cafe)!</p>
        </div>
        <div class="border-2 border-dashed border-slate-300 rounded-2xl p-5 text-center bg-slate-50/60">
          <div class="text-2xl mb-1">🏗️</div>
          <h3 class="font-bold text-sm text-slate-700">Empty Public Lot #2</h3>
          <p class="text-xs text-slate-500 mt-1">Reserved for citizen voting. Most liked comment on our latest TikTok decides this building!</p>
        </div>
        <a href="https://YOUR-SHOPIFY-STORE.myshopify.com" target="_blank"
           class="border border-sky-200 bg-gradient-to-br from-sky-50 to-indigo-50 rounded-2xl p-5 text-center hover:shadow-md transition block">
          <div class="text-2xl mb-1">⚡</div>
          <h3 class="font-bold text-sm text-sky-900">City Sponsor Billboard</h3>
          <p class="text-xs text-sky-700 mt-1">Get the Volcano Flame Diffuser or Moon Lamp for your real room + unlock VIP items inside your virtual house!</p>
        </a>
      </div>
    </div>
  </main>

  <!-- Modal: Enter House (Interior View) -->
  <div id="houseModal" class="fixed inset-0 z-50 hidden bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100">
      <!-- Modal Top -->
      <div id="modalHeader" class="p-5 text-white flex justify-between items-center bg-slate-800">
        <div>
          <span id="modalTierBadge" class="text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded bg-white/20">Subsidized House</span>
          <h3 id="modalUsername" class="text-lg font-extrabold mt-1">@username</h3>
        </div>
        <button onclick="closeModal()" class="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center font-bold">✕</button>
      </div>

      <!-- Interior Visual Room -->
      <div class="p-5">
        <div class="bg-slate-100 rounded-2xl p-4 border border-slate-200 relative overflow-hidden">
          <div class="text-xs font-bold text-slate-400 uppercase mb-3 flex justify-between">
            <span>🛋️ Living Room Interior</span>
            <span id="modalYardStatus" class="text-emerald-600"></span>
          </div>

          <!-- Visual Room Box -->
          <div class="h-36 bg-white rounded-xl border border-slate-200 flex items-center justify-around p-4 shadow-inner relative">
            <div class="text-center">
              <div class="text-3xl">🛏️</div>
              <span class="text-[10px] text-slate-400 font-medium">Standard Bed</span>
            </div>
            <div class="text-center">
              <div id="modalDecorIcon" class="text-3xl opacity-30">🔒</div>
              <span id="modalDecorName" class="text-[10px] text-slate-400 font-medium">Empty Desk</span>
            </div>
            <div class="text-center">
              <div class="text-3xl">🖼️</div>
              <span class="text-[10px] text-slate-400 font-medium">Citizen ID</span>
            </div>
          </div>
        </div>

        <!-- Citizen Status Checklist -->
        <div class="mt-4 space-y-2 text-xs">
          <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
            <span>🏠 Subsidized House (Followed)</span>
            <span class="font-bold text-emerald-600">✓ Active</span>
          </div>
          <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
            <span>🌳 Front Yard, Fence & Tree (Commented)</span>
            <span id="checkComment" class="font-bold text-slate-400">Not Unlocked</span>
          </div>
          <div class="flex items-center justify-between p-2.5 rounded-xl bg-slate-50">
            <span>✨ Room Decor & Villa Upgrade (Shop Order)</span>
            <span id="checkShop" class="font-bold text-slate-400">Not Unlocked</span>
          </div>
        </div>

        <!-- Call to Action -->
        <a href="https://YOUR-SHOPIFY-STORE.myshopify.com" target="_blank"
           class="mt-5 w-full block text-center bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm py-3 rounded-xl transition">
          🎁 Add Real & Virtual Decor to This Room
        </a>
      </div>
    </div>
  </div>

  <script>
    // Data Warga (Nantinya bisa ditarik otomatis dari tabel Supabase)
    const citizens = [
      { username: "@alex_vibes", color: "bg-sky-500", roof: "#0284c7", hasCommented: true, tier: "Subsidized House", decor: null },
      { username: "@sarah_miller", color: "bg-rose-500", roof: "#e11d48", hasCommented: false, tier: "Subsidized House", decor: null },
      { username: "@jayden_uk", color: "bg-indigo-600", roof: "#4f46e5", hasCommented: true, tier: "Cyber Villa", decor: "🌋 Volcano Diffuser" },
      { username: "@emily_rose", color: "bg-emerald-500", roof: "#059669", hasCommented: true, tier: "Subsidized House", decor: null },
      { username: "@lucas_gaming", color: "bg-amber-500", roof: "#d97706", hasCommented: false, tier: "Subsidized House", decor: null },
      { username: "@chloe_nyc", color: "bg-purple-600", roof: "#9333ea", hasCommented: true, tier: "Luxury Penthouse", decor: "🌙 Levitating Moon Lamp" },
      { username: "@noah_smith", color: "bg-teal-500", roof: "#0d9488", hasCommented: true, tier: "Subsidized House", decor: null },
      { username: "@mia_chen", color: "bg-pink-500", roof: "#db2777", hasCommented: false, tier: "Subsidized House", decor: null }
    ];

    function renderCity(filterText = "") {
      const grid = document.getElementById("cityGrid");
      const countEl = document.getElementById("citizenCount");
      const statusEl = document.getElementById("searchStatus");
      grid.innerHTML = "";
      countEl.textContent = citizens.length;

      let matchFound = false;

      citizens.forEach((c, idx) => {
        const isMatch = filterText && c.username.toLowerCase().includes(filterText.toLowerCase());
        if (isMatch) matchFound = true;

        // Bentuk rumah subsidi sama (SVG clean), hanya warna atap/pintu yang berbeda
        const houseSvg = `
          <svg viewBox="0 0 80 70" class="w-16 h-14 mx-auto drop-shadow-sm">
            <!-- Atap (Warna Beda Tiap Warga) -->
            <polygon points="40,6 8,32 72,32" fill="${c.roof}" />
            <!-- Dinding Rumah Subsidi (Bentuk Sama) -->
            <rect x="16" y="32" width="48" height="32" rx="3" fill="#ffffff" stroke="#cbd5e1" stroke-width="2"/>
            <!-- Pintu -->
            <rect x="34" y="44" width="12" height="20" rx="2" fill="${c.roof}" />
            <!-- Jendela -->
            <rect x="21" y="38" width="9" height="9" rx="1" fill="#bae6fd" />
            <rect x="50" y="38" width="9" height="9" rx="1" fill="#bae6fd" />
          </svg>
        `;

        const card = document.createElement("div");
        card.id = `citizen-${idx}`;
        card.onclick = () => openHouseModal(c);
        card.className = `house-lot cursor-pointer rounded-2xl p-4 bg-white border border-slate-200 shadow-sm relative text-center ${
          c.hasCommented ? "fence-border" : ""
        } ${isMatch ? "ring-4 ring-sky-400 highlight-ring" : ""}`;

        card.innerHTML = `
          <div class="flex justify-between items-center text-[10px] font-bold text-slate-400 mb-2">
            <span>PLOT #${idx + 101}</span>
            ${c.decor ? '<span class="bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">⭐ VIP</span>' : ''}
          </div>

          <div class="relative py-2 flex items-center justify-center">
            ${c.hasCommented ? '<span class="absolute left-2 bottom-2 text-lg" title="Comment Tree">🌳</span>' : ''}
            ${houseSvg}
            ${c.hasCommented ? '<span class="absolute right-2 bottom-2 text-sm" title="Garden">🌷</span>' : ''}
          </div>

          <div class="mt-2 font-bold text-sm text-slate-800 truncate">${c.username}</div>
          <div class="text-[11px] text-slate-500">${c.tier}</div>

          ${
            c.hasCommented
              ? '<div class="mt-2 inline-block text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md">🏡 Yard + Fence + Tree</div>'
              : '<div class="mt-2 inline-block text-[10px] text-slate-400">Comment on TikTok for Yard 🌳</div>'
          }
        `;

        grid.appendChild(card);

        if (isMatch) {
          card.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      });

      if (filterText) {
        statusEl.textContent = matchFound ? `Found "${filterText}"!` : `Citizen "${filterText}" not found yet. Follow @NexatonCity!`;
      } else {
        statusEl.textContent = "";
      }
    }

    function searchCitizen() {
      const val = document.getElementById("searchInput").value.trim();
      renderCity(val);
    }

    function openHouseModal(citizen) {
      document.getElementById("modalUsername").textContent = citizen.username;
      document.getElementById("modalTierBadge").textContent = citizen.tier;
      document.getElementById("modalHeader").className = `p-5 text-white flex justify-between items-center ${citizen.color}`;

      const yardStatus = document.getElementById("modalYardStatus");
      const checkComment = document.getElementById("checkComment");
      if (citizen.hasCommented) {
        yardStatus.textContent = "🌳 Yard & Fence Installed";
        checkComment.textContent = "✓ Installed";
        checkComment.className = "font-bold text-emerald-600";
      } else {
        yardStatus.textContent = "No Yard Yet";
        checkComment.textContent = "Comment to Unlock";
        checkComment.className = "font-bold text-slate-400";
      }

      const decorIcon = document.getElementById("modalDecorIcon");
      const decorName = document.getElementById("modalDecorName");
      const checkShop = document.getElementById("checkShop");

      if (citizen.decor) {
        decorIcon.textContent = citizen.decor.split(" ")[0];
        decorIcon.className = "text-3xl opacity-100 animate-bounce";
        decorName.textContent = citizen.decor.substring(2);
        decorName.className = "text-[10px] text-amber-600 font-bold";
        checkShop.textContent = "✓ " + citizen.decor;
        checkShop.className = "font-bold text-amber-600";
      } else {
        decorIcon.textContent = "🔒";
        decorIcon.className = "text-3xl opacity-30";
        decorName.textContent = "Empty Desk (Shop to Unlock)";
        decorName.className = "text-[10px] text-slate-400 font-medium";
        checkShop.textContent = "Not Unlocked";
        checkShop.className = "font-bold text-slate-400";
      }

      document.getElementById("houseModal").classList.remove("hidden");
    }

    function closeModal() {
      document.getElementById("houseModal").classList.add("hidden");
    }

    renderCity();
  </script>
</body>
</html>
