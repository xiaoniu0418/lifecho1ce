const UNIQUE_TILE_ICONS = ["🍔", "🍕", "🍟", "🌭", "🥪", "🥙", "🌮", "🌯", "🥗", "🍜", "🍝", "🍣", "🍤", "🍱", "🥡", "🍛", "🍲", "🥘", "🍰", "🍩", "🧋", "☕", "🥤", "🧃", "🍵", "🍺", "🍷", "🎮", "🎧", "🎬", "🎲", "🧩", "📚", "🖊️", "💡", "🔧", "🧠", "💼", "🧳", "🛍️", "👕", "👟", "🧢", "⌚", "📱", "💻", "🖥️", "🎒", "🏠", "🏢", "🚇", "🚌", "🚲", "🚗", "✈️", "🚀", "📈", "💰", "💎", "🧾", "🎁", "🎈", "🎉", "🏆", "🌟", "🔥", "⚡", "🛡️", "🧬", "🛰️", "🌌", "🪐", "🧿", "🔮", "🧪", "🧫", "🔋", "🔌", "📡"];
// ===========================
// ✅ 圖示：依「格子文字」對應，且不重複
// ===========================
const ICON_BANK = {
  "起點": ["🏁"],
  "機會": ["🎲","🎁","✨","🪙","📈"],
  "命運": ["🌀","⚡","🧿","🔮","☯️"],

  "打工": ["💼","🧰","🧑‍🍳","🧑‍🏫","🧹","🛠️"],
  "交通": ["🚌","🚇","🚲","🚕","🚗","🛵"],
  "住房": ["🏠","🛏️","🧺","🪴","🪟","🧹"],
  "穿搭": ["👕","👖","👟","🧢","⌚","🎒"],
  "娛樂": ["🎮","🎬","🎧","🎤","🏀","🧩"],

  "外食:早餐": ["🥪","🍳","🥞","🥛","🍙","🥣"],
  "外食:午餐": ["🍱","🍛","🍜","🍝","🥘","🥗"],
  "外食:晚餐": ["🍲","🍣","🍚","🍖","🥟","🍤"],
  "外食:宵夜": ["🍢","🍜","🌭","🍗","🍕","🥡"],
  "外食:飲料": ["🧋","🥤","☕","🧃","🍵","🧊"],
  "外食:甜點": ["🍰","🍩","🍦","🧁","🍪","🍫"],
  "外食:炸物": ["🍟","🍗","🍤","🥠","🥓","🍢"],
  "外食:速食": ["🍔","🍟","🌭","🍕","🥪","🌯"],
  "外食:便當": ["🍱","🍛","🍚","🥘","🍲","🥡"],
  "外食:拉麵": ["🍜","🥟","🍥","🥢","🍲","🍛"],
  "外食:韓式": ["🍗","🍲","🥘","🌶️","🍢","🥟"],
  "外食:火鍋": ["🍲","🥘","🍄","🥬","🍖","🫕"],
  "外食:聚餐": ["🍻","🍖","🍕","🍤","🥂","🎉"],
};

function pickIconForCell(cell, usedSet){
  const type = (cell?.type || cell?.key || "").toString().trim();
  const subtype = (cell?.subtype || "").toString().trim();

  let key = type;
  if (type === "外食" && subtype) key = `外食:${subtype}`;

  const pool = ICON_BANK[key] || ICON_BANK[type] || [];
  for (const ic of pool) {
    if (!usedSet.has(ic)) { usedSet.add(ic); return ic; }
  }

  for (const ic of UNIQUE_TILE_ICONS) {
    if (!usedSet.has(ic)) { usedSet.add(ic); return ic; }
  }
  return "⬛";
}
// ===========================
// ✅ 格子圖示與樣式（科技感炫光版）
// ===========================
function getCellIcon(cell){
  if(!cell) return "⬛";
  return cell.icon || cell.emoji || cell.iconText || "⬛";
}
function getCellTypeClass(cell){
  const t = (cell.type || cell.name || cell.label || "").toString();
  if(t.includes("機會")) return "chance";
  if(t.includes("命運")) return "destiny";
  if(t.includes("起點")) return "start";
  if(t.includes("打工")) return "work";
  if(t.includes("交通")) return "transport";
  if(t.includes("穿搭")) return "fashion";
  if(t.includes("住房")) return "house";
  if(t.includes("娛樂")) return "fun";
  if(t.includes("投資")) return "invest";
  if(t.includes("甜點")) return "dessert";
  if(t.includes("飲料")) return "drink";
  if(t.includes("早餐")) return "breakfast";
  if(t.includes("午餐")) return "lunch";
  if(t.includes("晚餐")) return "dinner";
  if(t.includes("宵夜")) return "midnight";
  if(t.includes("炸物")) return "fried";
  if(t.includes("速食")) return "fastfood";
  if(t.includes("便當")) return "bento";
  if(t.includes("拉麵")) return "ramen";
  if(t.includes("韓式")) return "korean";
  if(t.includes("火鍋")) return "hotpot";
  return "normal";
}


let STORY_OPTIONS = null;
// ===========================
// 隨機洗牌工具
// ===========================
function shuffleArray(arr){
  for(let i=arr.length-1;i>0;i--){
    const j = Math.floor(Math.random()*(i+1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ===========================
// 每次進入遊戲：格子順序隨機（但角落固定）
// 角落索引（外框走一圈）：
// 0 = 左上（起點）
// 右上 = (COLS - 1)
// 右下 = (COLS - 1) + (ROWS - 1)
// ===========================
function randomizeCellsWithFixedCorners(){
  if(!STORY_OPTIONS || !Array.isArray(STORY_OPTIONS.cells)) return;

  // 這裡的 COLS/ROWS 要跟棋盤產生一致（預設 11x9）
  const COLS = (window.BOARD_COLS || 11);
  const ROWS = (window.BOARD_ROWS || 9);

  const total = STORY_OPTIONS.cells.length;
  const topRight = Math.max(0, COLS - 1);
  const bottomRight = Math.max(0, (COLS - 1) + (ROWS - 1));

  const startCell = STORY_OPTIONS.cells.find(c => c && c.type === "起點") || STORY_OPTIONS.cells[0];
  const chanceCell = STORY_OPTIONS.cells.find(c => c && c.type === "機會");
  const fateCell = STORY_OPTIONS.cells.find(c => c && c.type === "命運");

  const pool = STORY_OPTIONS.cells.filter(c => c !== startCell && c !== chanceCell && c !== fateCell);
  shuffleArray(pool);

  const arranged = new Array(total).fill(null);
  arranged[0] = startCell;

  if (chanceCell && topRight < total) arranged[topRight] = chanceCell;      // ✅ 機會：右上
  if (fateCell && bottomRight < total) arranged[bottomRight] = fateCell;   // ✅ 命運：右下

  let pi = 0;
  for(let i=0;i<total;i++){
    if(arranged[i]) continue;
    arranged[i] = pool[pi++] || startCell;
  }
  STORY_OPTIONS.cells = arranged;
}


async function loadStoryOptions() {
  const res = await fetch("./storyOptions.json", { cache: "no-store" });
  STORY_OPTIONS = await res.json();
  randomizeCellsWithFixedCorners();
}

(function () {
  const qs = (s, el = document) => el.querySelector(s);
  const qsa = (s, el = document) => [...el.querySelectorAll(s)];
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
  const formatMoney = (n) => (n || 0).toLocaleString("en-US");
  const randInt = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;

  function buildOuterRingPath(cols, rows) {
    const path = [];
    for (let x = 0; x < cols; x++) path.push({ x, y: 0 });
    for (let y = 1; y < rows - 1; y++) path.push({ x: cols - 1, y });
    for (let x = cols - 1; x >= 0; x--) path.push({ x, y: rows - 1 });
    for (let y = rows - 2; y >= 1; y--) path.push({ x: 0, y });
    return path;
  }

  function getQuery() {
    const u = new URL(location.href);
    return {
      p: parseInt(u.searchParams.get("p") || "0", 10),
      m: parseInt(u.searchParams.get("m") || "0", 10),
    };
  }

  // ===== 退回用：若 JSON 選項不可用 =====
  const FALLBACK_EFFECT = {
    "起點": { money: 0, happy: 0, cls: "start", icon: "🏁" },
    "外食": { money: -150, happy: +1, icon: "🍔" },
    "穿搭": { money: -500, happy: +2, icon: "👕" },
    "住房": { money: -1000, happy: +1, icon: "🏠" },
    "交通": { money: -300, happy: +1, icon: "🚆" },
    "娛樂": { money: -400, happy: +2, icon: "🎮" },
    "打工": { money: +800, happy: -1, icon: "💼" },
    "機會": { money: () => (Math.random() < 0.5 ? +1500 : -800), happy: () => (Math.random() < 0.5 ? +2 : -1), cls: "special", icon: "🎲" },
    "命運": { money: () => (Math.random() < 0.5 ? -2000 : +2000), happy: () => (Math.random() < 0.5 ? -2 : +3), cls: "special", icon: "🌀" },
  };

  // ✅ 不依賴 Bootstrap 的「事件選項」UI（最穩）
  const ChoiceUI = {
    ensure() {
      if (qs("#evOverlay")) return;

      const css = `
#evOverlay{ position:fixed; inset:0; background: rgba(0,0,0,.55); display:none; align-items:center; justify-content:center; z-index: 99999; }
#evCard{ width:min(780px, calc(100vw - 24px)); max-height:calc(100vh - 24px); overflow:auto; border-radius:18px; border:1px solid rgba(255,255,255,.16);
  background: linear-gradient(180deg, rgba(20,24,40,.96), rgba(10,12,22,.96)); box-shadow: 0 26px 60px rgba(0,0,0,.55); color:#fff; }
#evHd{ padding:14px 16px; border-bottom:1px solid rgba(255,255,255,.10); display:flex; align-items:flex-start; justify-content:space-between; gap:12px; }
#evHd .t{ font-weight:900; letter-spacing:.06em; display:flex; align-items:center; gap:10px; }
#evHd .s{ color:rgba(255,255,255,.70); font-weight:700; margin-top:4px; }
#evClose{ appearance:none;border:0;background:transparent;color:#fff; width:36px;height:36px;border-radius:12px; display:grid;place-items:center; opacity:.85; }
#evClose:hover{ background:rgba(255,255,255,.08); opacity:1; }
#evBd{ padding:14px 16px 16px; }
#evNarr{ color:rgba(255,255,255,.90); font-weight:900; line-height:1.6; margin-bottom:12px; padding:10px 12px; border-radius:14px; border:1px solid rgba(255,255,255,.14); background:rgba(255,255,255,.06);}
#evOpts{ display:grid; gap:10px; }
.evBtn{ width:100%; text-align:left; border-radius:14px; border:1px solid rgba(255,255,255,.18); background:rgba(255,255,255,.06); color:#fff; padding:10px 12px; cursor:pointer; }
.evBtn:hover{ border-color: rgba(34,197,94,.35); box-shadow:0 14px 30px rgba(0,0,0,.35); transform: translateY(-1px); }
.evBtn .tt{ font-weight:900; letter-spacing:.03em; }
.evBtn .dd{ color:rgba(255,255,255,.70); font-weight:650; margin-top:4px; }
.evTags{ margin-top:8px; display:flex; gap:10px; flex-wrap:wrap; }
.evTagM{ padding:3px 10px;border-radius:999px; border:1px solid rgba(34,197,94,.28); background:rgba(34,197,94,.14); color:#d1fae5;font-weight:900; }
.evTagH{ padding:3px 10px;border-radius:999px; border:1px solid rgba(255,255,255,.16); background:rgba(255,255,255,.06); color:#fff;font-weight:900; }
#evFoot{ margin-top:12px; color:rgba(255,255,255,.60); font-size:.92rem; }
.cell{ padding:6px !important; letter-spacing:.02em !important; }
.cell .cell-ic{ font-size:18px; line-height:1; margin-bottom:2px; opacity:.95; }
.cell .cell-t{ font-weight:900; font-size:13px; line-height:1.1; }
      `.trim();

      const style = document.createElement("style");
      style.textContent = css;
      document.head.appendChild(style);

      const html = `
<div id="evOverlay" role="dialog" aria-modal="true">
  <div id="evCard">
    <div id="evHd">
      <div>
        <div class="t" id="evTitle">事件</div>
        <div class="s" id="evSub">請選擇一個選項</div>
      </div>
      <button id="evClose" type="button" title="必須選擇一個選項才能繼續">✕</button>
    </div>
    <div id="evBd">
      <div id="evNarr"></div>
      <div id="evOpts"></div>
      <div id="evFoot">※ 必須選擇一個選項才會輪到下一位</div>
    </div>
  </div>
</div>`.trim();

      document.body.insertAdjacentHTML("beforeend", html);

      qs("#evClose").addEventListener("click", () => {
        const n = qs("#evNarr");
        n.textContent = "請先選擇其中一個選項，才會繼續遊戲。";
      });

      qs("#evOverlay").addEventListener("click", (e) => {
        if (e.target && e.target.id === "evOverlay") {
          const n = qs("#evNarr");
          n.textContent = "請先選擇其中一個選項，才會繼續遊戲。";
        }
      });
    },

    async pick(payload) {
      // payload: {playerName, cellName, subtype, icon, dice, narrative, options}
      this.ensure();

      const title = `${payload.icon || ""} ${payload.playerName}｜${payload.cellName}${payload.subtype ? "｜" + payload.subtype : ""}`.trim();
      qs("#evTitle").textContent = title;
      qs("#evSub").textContent = `你擲出 ${payload.dice}，請選擇一個選項`;
      qs("#evNarr").textContent = (payload.narrative ? "劇情｜" + payload.narrative : "劇情｜選擇會影響金錢與幸福值。");

      const box = qs("#evOpts");
      box.innerHTML = "";

      const picked = await new Promise((resolve) => {
        payload.options.forEach((op, idx) => {
          const dm = Number(op.money || 0);
          const dh = Number(op.happy || 0);
          const signM = dm >= 0 ? "+" : "";
          const signH = dh >= 0 ? "+" : "";

          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "evBtn";
          btn.innerHTML = `
            <div class="tt">${op.title || `選項 ${idx + 1}`}</div>
            <div class="dd">${op.desc || ""}</div>
            <div class="evTags">
              <span class="evTagM">金錢：${signM}${dm}</span>
              <span class="evTagH">幸福：${signH}${dh}</span>
            </div>
          `;
          btn.addEventListener("click", () => resolve({ ...op, money: dm, happy: dh }));
          box.appendChild(btn);
        });
      });

      qs("#evOverlay").style.display = "none";
      return picked;
    },

    show() {
      this.ensure();
      qs("#evOverlay").style.display = "flex";
    },
  };


  // ✅ 結算報表 UI：圖表 + 評價（遊戲結束時顯示）
  const ResultUI = {
    ensure() {
      if (qs("#rsOverlay")) return;

      const css = `
#rsOverlay{ position:fixed; inset:0; background: rgba(0,0,0,.62); display:none; align-items:center; justify-content:center; z-index: 99999; }
#rsCard{ width:min(920px, calc(100vw - 24px)); max-height:calc(100vh - 24px); overflow:auto; border-radius:18px; border:1px solid rgba(255,255,255,.16);
  background: linear-gradient(180deg, rgba(20,24,40,.96), rgba(10,12,22,.96)); box-shadow: 0 26px 60px rgba(0,0,0,.55); color:#fff; }
#rsHd{ padding:14px 16px; border-bottom:1px solid rgba(255,255,255,.10); display:flex; align-items:center; justify-content:space-between; gap:12px; }
#rsHd .t{ font-weight:900; letter-spacing:.06em; display:flex; align-items:center; gap:10px; }
#rsClose{ appearance:none;border:0;background:transparent;color:#fff; width:36px;height:36px;border-radius:12px; display:grid;place-items:center; opacity:.85; }
#rsClose:hover{ background:rgba(255,255,255,.08); opacity:1; }
#rsBd{ padding:14px 16px 16px; }
#rsGrid{ display:grid; grid-template-columns: 1.1fr .9fr; gap:14px; }
@media (max-width: 820px){ #rsGrid{ grid-template-columns:1fr; } }
.rsBox{ border-radius:16px; border:1px solid rgba(255,255,255,.12); background:rgba(255,255,255,.06); padding:12px; }
.rsSub{ color:rgba(255,255,255,.70); font-weight:800; margin-top:2px; }
#rsCanvas{ width:100%; height:340px; display:block; }
.rsRow{ display:flex; justify-content:space-between; gap:10px; padding:10px 10px; border-radius:12px; border:1px solid rgba(255,255,255,.10); background:rgba(0,0,0,.16); }
.rsRow + .rsRow{ margin-top:10px; }
.rsName{ font-weight:900; }
.rsMeta{ color:rgba(255,255,255,.72); font-weight:800; font-size:.95rem; }
.rsBadge{ display:inline-block; padding:3px 10px; border-radius:999px; border:1px solid rgba(34,197,94,.28); background:rgba(34,197,94,.14); color:#d1fae5; font-weight:900; }
.rsBad{ border-color: rgba(239,68,68,.26); background: rgba(239,68,68,.10); color:#fecaca; }
#rsBtns{ display:flex; gap:10px; justify-content:flex-end; margin-top:12px; flex-wrap:wrap; }
.rsBtn{ appearance:none; border:1px solid rgba(255,255,255,.16); background: rgba(255,255,255,.08); color:#fff; font-weight:900; padding:10px 14px; border-radius:14px; cursor:pointer; }
.rsBtn:hover{ border-color: rgba(34,197,94,.35); box-shadow:0 14px 30px rgba(0,0,0,.35); transform: translateY(-1px); }
.rsBtnPrimary{ border-color: rgba(34,197,94,.35); background: rgba(34,197,94,.16); }
      `.trim();

      const style = document.createElement("style");
      style.textContent = css;
      document.head.appendChild(style);

      const html = `
<div id="rsOverlay" role="dialog" aria-modal="true">
  <div id="rsCard">
    <div id="rsHd">
      <div>
        <div class="t">📊 遊戲結算報表</div>
        <div class="rsSub" id="rsSub">總花費長條圖與玩家排名</div>
      </div>
      <button id="rsClose" type="button" title="關閉">✕</button>
    </div>
    <div id="rsBd">
      <div id="rsGrid">
        <div class="rsBox">
          <canvas id="rsCanvas" width="940" height="420"></canvas>
          <div class="rsSub" style="margin-top:8px;">※ 長條圖顯示各玩家的「總花費金額」，右側依綜合表現給予排名與不同評價。</div>
        </div>
        <div class="rsBox">
          <div class="rsSub" style="margin-bottom:10px;">每位玩家評價</div>
          <div id="rsList"></div>
          <div id="rsBtns">
            <button class="rsBtn" id="rsCopy">複製結算文字</button>
            <button class="rsBtn rsBtnPrimary" id="rsRestart">重新開始</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>`.trim();

      document.body.insertAdjacentHTML("beforeend", html);

      qs("#rsClose").addEventListener("click", () => (qs("#rsOverlay").style.display = "none"));
      qs("#rsOverlay").addEventListener("click", (e) => {
        if (e.target && e.target.id === "rsOverlay") qs("#rsOverlay").style.display = "none";
      });
    },

    render(players) {
      this.ensure();

      // 圖表排序：消費高到低
      const list = [...players].sort((a, b) => (b.spent || 0) - (a.spent || 0));

      // ===== 右側文字評價 + 排名 =====
      const ranked = [...players].map((p) => {
        const spent = Math.round(p.spent || 0);
        const earned = Math.round(p.earned || 0);
        const start = Math.round(p.startMoney || 0);
        const end = Math.round(p.money || 0);
        const happy = Math.round(p.happy || 0);
        const net = end - start;
        const aliveBonus = p.alive ? 180 : 0;
        const score = Math.round(end * 0.55 + happy * 85 + earned * 0.18 - spent * 0.08 + net * 0.12 + aliveBonus);
        return { ...p, spent, earned, start, end, happy, net, score };
      }).sort((a, b) => b.score - a.score || b.happy - a.happy || b.end - a.end || a.spent - b.spent);

      const rankClass = (n) => n === 1 ? "rank1" : (n === 2 ? "rank2" : (n === 3 ? "rank3" : ""));
      const rankText = (n) => n === 1 ? "🥇 第 1 名" : (n === 2 ? "🥈 第 2 名" : (n === 3 ? "🥉 第 3 名" : `第 ${n} 名`));
      const moneyText = (v) => `${v < 0 ? "-" : "+"}$${Math.abs(v).toLocaleString("en-US")}`;

      function getPlayerReview(p, rank){
        const spendRatio = p.start > 0 ? (p.spent / p.start) : 0;
        const earnRatio = p.spent > 0 ? (p.earned / p.spent) : (p.earned > 0 ? 9 : 0);
        const zeroEnd = p.end <= 0;

        if (rank === 1 && p.happy >= 20 && p.net >= 0) {
          return { tag: "人生勝利組", desc: "錢包和心情都顧到了，該省有省、該享受也有享受，是這局最穩的玩家。", bad: false };
        }
        if (rank === 1 && p.earned >= p.spent && p.end > 0) {
          return { tag: "理財冠軍", desc: "你很懂得讓收入支撐支出，整體節奏穩、判斷準，是本局最會管理資源的人。", bad: false };
        }
        if (p.happy >= 24 && p.spent <= 1400) {
          return { tag: "高CP幸福王", desc: "花費不算誇張，但幸福值衝得很高，代表你很會用小成本換大快樂。", bad: false };
        }
        if (p.happy >= 26) {
          return { tag: "快樂天花板", desc: "你超懂享受生活，整體氛圍感最強，屬於會把日子過得很有感的人。", bad: false };
        }
        if (p.earned >= 1000 && earnRatio >= 0.9) {
          return { tag: "打工達人", desc: "靠自己補足開銷，收入表現亮眼，屬於越玩越能撐住局面的類型。", bad: false };
        }
        if (p.end >= p.start * 0.9 && p.happy >= 14) {
          return { tag: "穩健選手", desc: "沒有亂花，也沒有把自己逼太緊，走的是穩穩前進的成熟路線。", bad: false };
        }
        if (p.spent >= 1600 && p.happy >= 18) {
          return { tag: "享樂派代表", desc: "你真的很敢花，但快樂值也很有感，是標準的『花錢買回憶』型玩家。", bad: false };
        }
        if (p.spent <= 350 && p.end > p.start && p.happy <= 12) {
          return { tag: "省錢小高手", desc: "存得住錢，但也稍微保守了一點，若再多投資一點快樂，整體會更平衡。", bad: false };
        }
        if (p.net < 0 && p.happy >= 18) {
          return { tag: "快樂優先派", desc: "你願意拿金錢換心情，雖然荷包有點痛，但生活體驗值拉很高。", bad: false };
        }
        if (zeroEnd && p.happy >= 20) {
          return { tag: "浪漫冒險家", desc: "你把錢花光了，但也把快樂拉滿，是很有故事感的玩家類型。", bad: true };
        }
        if (zeroEnd && p.spent >= 1200) {
          return { tag: "爆買失控王", desc: "花費衝太快，最後沒守住資金，下次要記得留一點安全存量。", bad: true };
        }
        if (p.happy <= 8 && p.net < 0) {
          return { tag: "壓力警報", desc: "這局玩得比較辛苦，錢和幸福都掉得快，下一次要更注意取捨。", bad: true };
        }
        if (spendRatio >= 1.6 && p.earned === 0) {
          return { tag: "衝動消費型", desc: "開銷速度偏快，收入補位又不夠，屬於很需要預算控管的類型。", bad: true };
        }
        if (p.happy <= 10) {
          return { tag: "低電量模式", desc: "有撐住局面，但你可能太少照顧自己的感受，幸福值還有進步空間。", bad: true };
        }
        return { tag: "平衡發展", desc: "整體表現中規中矩，金錢與幸福都有兼顧，再多一點策略就能往前衝。", bad: false };
      }

      const box = qs("#rsList");
      box.innerHTML = "";
      const lines = [];
      ranked.forEach((p, idx) => {
        const rank = idx + 1;
        const review = getPlayerReview(p, rank);
        const row = document.createElement("div");
        row.className = "rsRow";
        row.innerHTML = `
          <div class="rsMain">
            <div class="rsTop">
              <div class="rsName"><span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${p.color};vertical-align:middle;"></span>${p.name}</div>
              <div class="rsRank ${rankClass(rank)}">${rankText(rank)}</div>
            </div>
            <div class="rsMetrics">
              <span class="rsChip">總消費：<b>$${p.spent.toLocaleString("en-US")}</b></span>
              <span class="rsChip">總收入：<b>$${p.earned.toLocaleString("en-US")}</b></span>
              <span class="rsChip">結束金錢：<b>$${p.end.toLocaleString("en-US")}</b></span>
              <span class="rsChip">幸福值：<b>${p.happy}</b></span>
              <span class="rsChip">淨變化：<b>${moneyText(p.net)}</b></span>
            </div>
            <div class="rsDesc">${review.desc}</div>
          </div>
          <div class="rsSide">
            <div class="rsBadge ${review.bad ? "rsBad" : ""}">${review.tag}</div>
            <div class="rsScore">綜合評分：${p.score}</div>
          </div>
        `;
        box.appendChild(row);

        lines.push(`${rankText(rank)}｜${p.name}｜總消費 $${p.spent.toLocaleString("en-US")}｜總收入 $${p.earned.toLocaleString("en-US")}｜結束金錢 $${p.end.toLocaleString("en-US")}｜幸福 ${p.happy}｜評價：${review.tag} - ${review.desc}`);
      });

      // ===== 畫圖：總花費長條圖（X=玩家, Y=總花費）===== 
const cvs = qs("#rsCanvas");
const ctx = cvs.getContext("2d");

// HiDPI：避免糊
const dpr = window.devicePixelRatio || 1;
const cssW = cvs.clientWidth || 940;
const cssH = cvs.clientHeight || 420;
cvs.width = Math.floor(cssW * dpr);
cvs.height = Math.floor(cssH * dpr);
ctx.setTransform(dpr,0,0,dpr,0,0);
ctx.clearRect(0,0,cssW,cssH);

const padL = 64, padR = 18, padT = 18, padB = 62;
const w = cssW - padL - padR;
const h = cssH - padT - padB;

const bars = list.map(p=>{
  const spent = Math.max(0, Math.round(p.spent || 0));
  return { name: p.name, color: p.color || "#60a5fa", value: spent };
});

const maxV = Math.max(10, ...bars.map(b=>b.value));
const yMax = Math.max(10, Math.ceil(maxV / 100) * 100);

// Grid + Y labels
ctx.font = "12px system-ui, -apple-system, Segoe UI, Microsoft JhengHei, Arial";
ctx.fillStyle = "rgba(255,255,255,.72)";
ctx.strokeStyle = "rgba(255,255,255,.10)";
ctx.lineWidth = 1;
ctx.textAlign = "right";
ctx.textBaseline = "middle";

const ticks = 5;
for(let i=0;i<=ticks;i++){
  const y = padT + (h * i / ticks);
  ctx.beginPath();
  ctx.moveTo(padL, y);
  ctx.lineTo(padL + w, y);
  ctx.stroke();
  const v = Math.round(yMax * (1 - i/ticks));
  ctx.fillText(v.toLocaleString("en-US"), padL - 10, y);
}

// Axis
ctx.strokeStyle = "rgba(255,255,255,.22)";
ctx.lineWidth = 1.2;
ctx.beginPath();
ctx.moveTo(padL, padT);
ctx.lineTo(padL, padT + h);
ctx.lineTo(padL + w, padT + h);
ctx.stroke();

// Bars
const n = Math.max(1, bars.length);
const gap = Math.min(18, Math.max(10, w * 0.05));
const barW = Math.min(120, (w - gap*(n-1)) / n);
const totalW = barW*n + gap*(n-1);
let x0 = padL + (w - totalW)/2;

ctx.textAlign = "center";
ctx.textBaseline = "top";

bars.forEach((b, i)=>{
  const x = x0 + i*(barW + gap);
  const bh = (b.value / yMax) * h;
  const y = padT + (h - bh);

  // glow
  ctx.save();
  ctx.shadowColor = b.color;
  ctx.shadowBlur = 18;
  ctx.globalAlpha = 0.22;
  ctx.fillStyle = b.color;
  ctx.fillRect(x, y, barW, bh);
  ctx.restore();

  // main
  ctx.globalAlpha = 1;
  ctx.fillStyle = b.color;
  ctx.globalAlpha = 0.85;
  ctx.fillRect(x+1, y+1, Math.max(0, barW-2), Math.max(0, bh-2));
  ctx.globalAlpha = 1;

  // value
  ctx.fillStyle = "rgba(255,255,255,.92)";
  ctx.fillText(`$${b.value.toLocaleString("en-US")}`, x + barW/2, Math.max(6, y - 18));

  // name label
  ctx.fillStyle = "rgba(255,255,255,.70)";
  ctx.fillText(b.name, x + barW/2, padT + h + 16);
});

// axis labels
ctx.fillStyle = "rgba(255,255,255,.55)";
ctx.textAlign = "center";
ctx.fillText("玩家", padL + w/2, padT + h + 36);

ctx.save();
ctx.translate(18, padT + h/2);
ctx.rotate(-Math.PI/2);
ctx.textAlign = "center";
ctx.fillText("總花費", 0, 0);
ctx.restore();

qs("#rsOverlay").style.display = "flex";

      // Buttons
      qs("#rsRestart").onclick = () => (location.href = "index.html");
      qs("#rsCopy").onclick = async () => {
        const txt = "【人生棋局｜結算報表】\n" + lines.join("\n");
        try {
          await navigator.clipboard.writeText(txt);
          qs("#rsSub").textContent = "✅ 已複製到剪貼簿";
          setTimeout(() => (qs("#rsSub").textContent = "總花費長條圖與玩家排名"), 1200);
        } catch {
          // fallback
          const ta = document.createElement("textarea");
          ta.value = txt;
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          ta.remove();
          qs("#rsSub").textContent = "✅ 已複製到剪貼簿";
          setTimeout(() => (qs("#rsSub").textContent = "總花費長條圖與玩家排名"), 1200);
        }
      };
    },
  };


  const Game = {
    cols: 11,
    rows: 7,
    path: [],
    cells: [],
    players: [],
    turn: 0,
    lapsToWin: 3,
    started: false,
    eventBusy: false,

    setup() {
      const q = getQuery();
      if (!q.p || !q.m) {
        location.replace("index.html");
        return false;
      }

      this.path = buildOuterRingPath(this.cols, this.rows);

      if (STORY_OPTIONS && Array.isArray(STORY_OPTIONS.cells) && STORY_OPTIONS.cells.length === this.path.length) {
        this.cells = STORY_OPTIONS.cells.map((c, idx) => {
          const type = (c && c.type) ? String(c.type) : "外食";
          const subtype = (c && c.subtype) ? String(c.subtype) : "";
          const icon = ""; // ✅ 統一由文字對應圖示（避免圖示與文字不一致）
          const narrative = (c && c.narrative) ? String(c.narrative) : "";
          const isStart = (idx === 0) || (type === "起點");
          const isSpecial = (type === "機會" || type === "命運");
          return {
            idx,
            key: type,
            subtype,
            icon,
            narrative,
            options: Array.isArray(c.options) ? c.options : [],
            cls: isStart ? "start" : (isSpecial ? "special" : ""),
          };
        });
      } else {
        const seq = [
          "起點",
          "外食","外食","外食","外食","外食","外食","外食","外食","外食","外食",
          "外食","穿搭","穿搭","穿搭","住房",
          "住房","交通","交通","娛樂","娛樂","娛樂","娛樂","交通","住房","外食","外食",
          "打工","打工","打工","機會","命運"
        ];
        this.cells = seq.slice(0, this.path.length).map((type, idx) => {
          const def = FALLBACK_EFFECT[type] || FALLBACK_EFFECT["外食"];
          return { idx, key: type, subtype: "", icon: def.icon || "", narrative: "", options: [], cls: def.cls || "" };
        });
      }

// ✅ 依文字重新分配 icon（符合文字，且不重複）
{
  const used = new Set();
  this.cells.forEach((c, idx) => {
    if (idx === 0 || c.key === "起點") c.icon = "🏁";
    else if (c.key === "機會") c.icon = pickIconForCell({ type: "機會" }, used);
    else if (c.key === "命運") c.icon = pickIconForCell({ type: "命運" }, used);
    else c.icon = pickIconForCell({ type: c.key, subtype: c.subtype }, used);
  });
}

      this.players = this.makePlayers(q.p, q.m);
      this.turn = 0;
      this.started = true;
      this.eventBusy = false;
      return true;
    },

    makePlayers(pCount, money) {
      const colors = ["#60a5fa", "#a78bfa", "#34d399", "#fbbf24"];
      const ps = [];
      for (let i = 0; i < pCount; i++) {
        ps.push({
          id: i + 1,
          name: `玩家 ${i + 1}`,
          color: colors[i],
          pos: 0,
          lap: 0,
          money: money,
          startMoney: money,
          happy: 10,
          spent: 0,
          earned: 0,
          rollCount: 0,
          moneyHistory: [money],
          alive: true,
        });
      }
      return ps;
    },

    renderBoard() {
      const board = qs("#board");
      if (!board) return;
      board.innerHTML = "";

      const rect = board.getBoundingClientRect();
      const padX = 24, padY = 24;

      const cellW = clamp(Math.floor(rect.width / (this.cols + 1)), 74, 118);
      const cellH = clamp(Math.floor(rect.height / (this.rows + 1)), 68, 108);

      const gapX = (rect.width - padX * 2 - cellW) / (this.cols - 1);
      const gapY = (rect.height - padY * 2 - cellH) / (this.rows - 1);

      this.path.forEach((pt, i) => {
        const c = this.cells[i];
        const el = document.createElement("div");
        el.className = "cell " + (c.cls || "");
        el.dataset.idx = i;

        // ✅ 格子不要太擠：外食只顯示「子類型」，其他只顯示「類別」
        const isFood = (c.key === "外食");
        const mainText = isFood ? (c.subtype || "外食") : c.key;
        el.innerHTML = `<div class="cell-ic">${c.icon || ""}</div><div class="cell-t">${mainText}</div>`;

        el.style.width = cellW + "px";
        el.style.height = cellH + "px";
        el.style.left = (padX + pt.x * gapX) + "px";
        el.style.top  = (padY + pt.y * gapY) + "px";

        board.appendChild(el);
      });

      this.renderTokens();
    },

    renderTokens() {
      const board = qs("#board");
      if (!board) return;

      const rect = board.getBoundingClientRect();
      const padX = 24, padY = 24;

      const cellW = clamp(Math.floor(rect.width / (this.cols + 1)), 74, 118);
      const cellH = clamp(Math.floor(rect.height / (this.rows + 1)), 68, 108);

      const gapX = (rect.width - padX * 2 - cellW) / (this.cols - 1);
      const gapY = (rect.height - padY * 2 - cellH) / (this.rows - 1);

      const group = {};
      this.players.forEach(p => {
        if (!p.alive) return;
        (group[p.pos] ||= []).push(p);
      });

      const offsets = [
        { dx: 0, dy: 0 },
        { dx: -20, dy: 0 },
        { dx: 0, dy: 20 },
        { dx: -20, dy: 20 },
      ];

      this.players.forEach(p => {
        let t = qs(`.token[data-id="${p.id}"]`, board);
        if (!p.alive) { if (t) t.remove(); return; }

        if (!t) {
          t = document.createElement("div");
          t.className = "token";
          t.dataset.id = p.id;
          t.dataset.p = String(p.id);
          t.style.background = p.color;
          board.appendChild(t);
        }

        const list = group[p.pos] || [p];
        const idxInCell = list.findIndex(x => x.id === p.id);
        const off = offsets[idxInCell] || { dx: 0, dy: 0 };
        const pt = this.path[p.pos];

        const baseLeft = padX + pt.x * gapX + cellW - 14;
        const baseTop  = padY + pt.y * gapY + 14;

        t.style.left = (baseLeft + off.dx) + "px";
        t.style.top  = (baseTop  + off.dy) + "px";
      });
    },

    getCellEl(idx) {
      const board = qs("#board");
      if (!board) return null;
      return qs(`.cell[data-idx="${idx}"]`, board);
    },

    highlightTurnCell() {
      const board = qs("#board");
      if (!board) return;
      qsa(".cell.turn", board).forEach(el => el.classList.remove("turn"));

      const p = this.players[this.turn];
      if (!p || !p.alive) return;

      const el = this.getCellEl(p.pos);
      if (el) el.classList.add("turn");
    },

    flashCell(idx, cls) {
      const el = this.getCellEl(idx);
      if (!el) return;
      el.classList.add(cls);
      setTimeout(() => el.classList.remove(cls), 260);
    },

    async animateMove(player, steps) {
      const L = this.path.length;
      for (let s = 0; s < steps; s++) {
        let next = player.pos + 1;
        if (next >= L) { next = 0; player.lap += 1; }
        player.pos = next;

        this.flashCell(player.pos, "step");
        this.renderTokens();
        this.renderPlayers();
        this.updateTurnUi();
        await new Promise(r => setTimeout(r, 420));
      }
      this.flashCell(player.pos, "landing");
    },

    renderDiceFace(n) {
      const box = qs("#diceBox");
      if (!box) return;

      if (!n) {
        box.innerHTML = `
          <div style="
            font-size:22px; line-height:1;
            filter: drop-shadow(0 0 10px rgba(0,229,255,.45)) drop-shadow(0 0 16px rgba(124,58,237,.30));
            display:flex; align-items:center; justify-content:center; gap:6px;
          ">
            🎲 <span style="font-size:14px; opacity:.75;">✨</span>
          </div>
        `;
        return;
      }

      const on = new Set();
      if (n === 1) on.add(4);
      if (n === 2) { on.add(0); on.add(8); }
      if (n === 3) { on.add(0); on.add(4); on.add(8); }
      if (n === 4) { on.add(0); on.add(2); on.add(6); on.add(8); }
      if (n === 5) { on.add(0); on.add(2); on.add(4); on.add(6); on.add(8); }
      if (n === 6) { on.add(0); on.add(3); on.add(6); on.add(2); on.add(5); on.add(8); }

      let html = '<div class="dice-face" aria-hidden="true">';
      for (let i = 0; i < 9; i++) html += `<span class="pip ${on.has(i) ? "on" : ""}"></span>`;
      html += "</div>";
      box.innerHTML = html;
    },

    async diceRollAnim(final) {
      for (let i = 0; i < 10; i++) {
        this.renderDiceFace(randInt(1, 6));
        await new Promise(r => setTimeout(r, 35));
      }
      this.renderDiceFace(final);
    },

    renderTurnStatus() {
      const box = qs("#turnStatus");
      if (!box) return;

      const p = this.players[this.turn];
      if (!p) { box.innerHTML = `<div class="muted">-</div>`; return; }

      const aliveText = p.alive ? "" : "（已出局）";
      const happyVal = clamp(p.happy, 0, 30);
      const c = this.cells[p.pos];

      const cellText = `${c.icon || ""} ${c.key}${(c.key==="外食" && c.subtype) ? "｜"+c.subtype : ""}`.trim();

      box.innerHTML = `
        <div style="display:flex;align-items:center;gap:10px;justify-content:space-between;">
          <div style="font-weight:900;">玩家：${p.name} ${aliveText}</div>
          <span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:${p.color};border:1px solid rgba(255,255,255,.55);"></span>
        </div>

        <div class="mt-2" style="display:flex;align-items:center;gap:10px;">
          <span class="muted" style="font-weight:800;">金錢：</span>
          <span style="display:inline-block;padding:3px 10px;border-radius:10px;border:1px solid rgba(34,197,94,.35);background:rgba(34,197,94,.16);font-weight:900;color:#d1fae5;">
            $${formatMoney(p.money)}
          </span>
        </div>

        <div class="mt-2 muted" style="font-weight:800; text-align:left;">幸福值： <b style="color:#fff">${happyVal}</b></div>
        <div class="mt-2 muted">圈數：<b style="color:#fff">${p.lap}</b></div>
        <div class="muted mt-1">目前格子：<b style="color:#fff">${cellText}</b></div>
      `;
    },

    renderPlayers() {
      const panel = qs("#playersPanel");
      if (!panel) return;

      panel.innerHTML = `<div class="players-grid" id="playersGrid"></div>`;
      const grid = qs("#playersGrid", panel);
      if (!grid) return;

      this.players.forEach((p, idx) => {
        const card = document.createElement("div");
        card.className =
          "player-card" +
          (idx === this.turn ? " is-active" : "") +
          (!p.alive ? " is-out" : "");

        const aliveText = p.alive ? "" : "（已出局）";
        const c = this.cells[p.pos];
        const cellText = `${c.icon || ""} ${c.key}${(c.key==="外食" && c.subtype) ? "｜"+c.subtype : ""}`.trim();

        card.innerHTML = `
          <div class="player-top">
            <div class="player-name">玩家：${p.name} ${aliveText}</div>
            <span class="dot" style="background:${p.color}"></span>
          </div>

          <div class="kv">
            <span class="pill-kv money">金錢：<b>$${formatMoney(p.money)}</b></span>
            <span class="pill-kv">幸福值：<b>${clamp(p.happy, 0, 30)}</b></span>
            <span class="pill-kv">圈數：<b>${p.lap}</b></span>
            <span class="pill-kv">格子：<b>${cellText}</b></span>
          </div>
        `;

        grid.appendChild(card);
      });
    },

    updateTurnUi() {
      this.renderTurnStatus();
      this.highlightTurnCell();
      this.renderPlayers();
    },

    log(msg) {
      const box = qs("#logBox");
      if (!box) return;
      box.textContent = msg;
    },

    nextAliveTurn(startFrom) {
      const N = this.players.length;
      for (let step = 1; step <= N; step++) {
        const i = (startFrom + step) % N;
        if (this.players[i].alive) return i;
      }
      return startFrom;
    },

    applyEffect(p, dm, dh) {
      // ✅ 收支統計（用於結算圖表）
      if (typeof p.spent !== "number") p.spent = 0;
      if (typeof p.earned !== "number") p.earned = 0;
      if (dm < 0) p.spent += Math.abs(dm);
      else if (dm > 0) p.earned += dm;

      p.money += dm;
      p.happy += dh;
      p.happy = clamp(p.happy, 0, 30);

      if (p.money <= 0) {
        p.money = 0;
        p.alive = false;
        return { busted: true };
      }
      return { busted: false };
    },

    fallbackEffectForCell(cell, player) {
      const def = FALLBACK_EFFECT[cell.key] || FALLBACK_EFFECT["外食"];
      const dm = (typeof def.money === "function") ? def.money(player) : def.money;
      const dh = (typeof def.happy === "function") ? def.happy(player) : def.happy;
      return { dm: Number(dm || 0), dh: Number(dh || 0) };
    },

    async roll() {
      if (!this.started || this.eventBusy) return;

      const btn = qs("#btnRoll");
      if (btn) btn.disabled = true;

      try {
        const p = this.players[this.turn];
        if (!p || !p.alive) {
          this.turn = this.nextAliveTurn(this.turn);
          this.updateTurnUi();
          return;
        }

        const dice = randInt(1, 6);

        // ✅ 每位玩家擲骰累計：每 15 次加一次「初始金額」(像發年終/加薪)
        p.rollCount = (p.rollCount || 0) + 1;
        if (p.rollCount % 15 === 0) {
          const bonus = (p.startMoney || 0);
          if (bonus > 0) {
            // 記在收入 + 金錢
            if (typeof p.earned !== "number") p.earned = 0;
            p.earned += bonus;
            p.money += bonus;
            this.log(`🎉 ${p.name} 擲骰累計 ${p.rollCount} 次！獲得「初始金額」獎勵 +$${bonus.toLocaleString("en-US")}`);
            this.renderSidebar();
          }
        }
        await this.diceRollAnim(dice);
        await this.animateMove(p, dice);


        // 📈 紀錄金錢歷史（用於多折線圖）
        if (!Array.isArray(p.moneyHistory)) p.moneyHistory = [];
        p.moneyHistory.push(p.money);
        if (p.lap >= this.lapsToWin) {
          this.renderTokens();
          this.renderPlayers();
          this.updateTurnUi();
          this.log(`${p.name} 走完 ${this.lapsToWin} 圈，抵達人生結局！`);
          ResultUI.render(this.players);
          if (btn) btn.disabled = true;
          return;
        }

        const cell = this.cells[p.pos];

        let choice = null;
        if (cell && Array.isArray(cell.options) && cell.options.length > 0) {
          this.eventBusy = true;
          ChoiceUI.show();
          choice = await ChoiceUI.pick({
            playerName: p.name,
            cellName: cell.key,
            subtype: (cell.key === "外食") ? (cell.subtype || "") : "",
            icon: cell.icon || "",
            dice,
            narrative: cell.narrative || "選擇會影響金錢與幸福值。",
            options: cell.options
          });
          this.eventBusy = false;
        }

        let dm, dh, pickedTitle;
        if (choice) {
          dm = Number(choice.money || 0);
          dh = Number(choice.happy || 0);
          pickedTitle = choice.title || "（已選擇）";
        } else {
          const fb = this.fallbackEffectForCell(cell, p);
          dm = fb.dm;
          dh = fb.dh;
          pickedTitle = "（自動事件）";
        }

        const { busted } = this.applyEffect(p, dm, dh);

        // 📈 紀錄金錢歷史（用於多玩家折線圖）— 每次擲骰結算後記一次
        if (!Array.isArray(p.moneyHistory)) p.moneyHistory = [];
        p.moneyHistory.push(p.money);


        this.renderTokens();
        this.renderPlayers();
        this.updateTurnUi();

        const signM = dm >= 0 ? "+" : "";
        const signH = dh >= 0 ? "+" : "";
        const cellText = `${cell.icon || ""} ${cell.key}${(cell.key==="外食" && cell.subtype) ? "｜"+cell.subtype : ""}`.trim();
        let msg = `${p.name} 擲出 ${dice}，到「${cellText}」${pickedTitle}：金錢 ${signM}${dm}，幸福 ${signH}${dh}`;
        if (busted) msg += ` → 破產出局`;
        this.log(msg);

        this.turn = this.nextAliveTurn(this.turn);
        this.updateTurnUi();

        const aliveCount = this.players.filter(x => x.alive).length;

        // ✅ 單人模式：不要用「只剩 1 人」當成結束條件（不然一開始就會結算）
        const isSingleMode = (this.players.length === 1);

        if (!isSingleMode && aliveCount <= 1) {
          const winner = this.players.find(x => x.alive);
          this.log(`遊戲結束！勝利者：${winner ? winner.name : "無"}`);
          ResultUI.render(this.players);
          if (btn) btn.disabled = true;
          return;
        }

        // ✅ 單人模式：只有「走完圈數」或「破產」才結束（破產在 applyEffect 已把 alive=false）
        if (isSingleMode && aliveCount <= 0) {
          this.log(`遊戲結束！你破產出局了。`);
          ResultUI.render(this.players);
          if (btn) btn.disabled = true;
          return;
        }
      } catch (err) {
        console.error(err);
        this.eventBusy = false;
        const box = qs("#logBox");
        if (box) box.textContent = "發生錯誤：請按重新開始（或 F12 看 Console）";
      } finally {
        if (btn) {
          const aliveCount = this.players.filter(x => x.alive).length;
          const cur = this.players[this.turn];

          const isSingleMode = (this.players.length === 1);

          // ✅ 單人：只在「破產(0人存活)」或「走完圈數」才算結束
          // ✅ 多人：只剩 1 人存活 或 走完圈數 才算結束
          const end = isSingleMode
            ? ((aliveCount <= 0) || (cur && cur.lap >= this.lapsToWin))
            : ((aliveCount <= 1) || (cur && cur.lap >= this.lapsToWin));

          if (!end) btn.disabled = false;
        }
      }
    },
  };

  function initStartPage() {
    const modeBtns = qsa(".mode-btn");
    if (modeBtns.length === 0) return;

    let pickedP = 0;
    const moneyRange = qs("#moneyRange");
    const moneyVal = qs("#moneyVal");
    const pickedPlayers = qs("#pickedPlayers");
    const btnStart = qs("#btnStart");

    function sync() {
      moneyVal.textContent = moneyRange.value;
      pickedPlayers.textContent = pickedP ? pickedP + " 人" : "尚未選";
      btnStart.disabled = !(pickedP >= 1 && pickedP <= 4);
    }

    modeBtns.forEach((b) => {
      b.addEventListener("click", () => {
        modeBtns.forEach((x) => x.classList.remove("active"));
        b.classList.add("active");
        pickedP = parseInt(b.dataset.p, 10);
        sync();
      });
    });

    moneyRange.addEventListener("input", sync);

    btnStart.addEventListener("click", () => {
      const m = clamp(parseInt(moneyRange.value, 10), 1, 3000);
      if (!(pickedP >= 1 && pickedP <= 4)) return;
      location.href = `game.html?p=${pickedP}&m=${m}`;
    });

    sync();
  }



  function mountBoardHud() {
    const board = qs("#board");
    const turn = qs("#turnStatus");
    const roll = qs("#btnRoll");
    const log = qs("#logBox");
    if (!board || !turn || !roll || !log) return;

    const host = board.parentElement;
    if (!host || qs(".board-hud", host)) return;

    const hud = document.createElement("div");
    hud.className = "board-hud";
    hud.innerHTML = `
      <div class="board-hud-main">
        <div class="board-turn-card"></div>
        <div class="board-roll-stack">
          <div class="board-roll-card"></div>
          <div class="board-log-under-roll"></div>
        </div>
      </div>
      <div class="board-log-card"></div>
    `;
    host.style.position = "relative";
    host.appendChild(hud);

    qs(".board-turn-card", hud).appendChild(turn);
    qs(".board-roll-card", hud).appendChild(roll);
    qs(".board-log-under-roll", hud).appendChild(log);
  }

  async function initGamePage() {
    const board = qs("#board");
    if (!board) return;

    try {
      await loadStoryOptions();
    } catch (e) {
      console.warn("storyOptions.json 載入失敗（將改用自動事件）", e);
      STORY_OPTIONS = null;
    }

    if (!Game.setup()) return;

    const btnRoll = qs("#btnRoll");
    const btnRestart = qs("#btnRestart");

    const renderAll = () => {
      Game.renderBoard();
      Game.renderPlayers();
      Game.updateTurnUi();
      Game.renderDiceFace(0);
      Game.log("按「擲骰子」開始遊戲。");
    };

    mountBoardHud();
    renderAll();

    window.addEventListener("resize", () => {
      if (!Game.started) return;
      Game.renderBoard();
      Game.renderPlayers();
      Game.updateTurnUi();
    });

    btnRoll && btnRoll.addEventListener("click", () => Game.roll());
    btnRestart && btnRestart.addEventListener("click", () => (location.href = "index.html"));
  }

  document.addEventListener("DOMContentLoaded", () => {
    initStartPage();
    initGamePage();
  });
})();
