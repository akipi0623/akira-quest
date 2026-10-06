/* ========================================
   RPG風・人生ロードマップ（history.html 専用）

   【このファイルの流れ】
     1. 設定とデータ   … 主人公の名前、マスの中身
     2. ドット絵       … 宝箱・家・城・山・木を文字で描いた設計図
     3. 要素の取得     … HTMLの部品をJSで使えるようにする
     4. 状態（state）  … 「今どのマスにいるか」「移動中か」などを覚えておく
     5. 便利な道具     … 待つ、効果音、文字送り、ドット絵の描画
     6. マスを作る     … データからボタンを自動で作る
     7. 盤を並べる     … S字に配置して、道を描き、コマを置く
     8. コマの移動     … 1マスずつ歩いて進む
     9. モーダル       … エピソードのポップアップを開く/閉じる
    10. スタート       … 上の処理を実行する

   ※ script.js と同じページで読み込むため、名前がぶつからないよう
     変数や関数の名前には roadmap を付けています。
======================================== */


/* ========================================
   1. 設定とデータ
======================================== */

// 主人公の名前（「つよさ」ウィンドウやメッセージに出ます。好きな名前に変えてOK）
const ROADMAP_HERO_NAME = "AKIRA";

// どのマスもクリックして止まれます。止まると「ひとこと」のポップアップが出て、
// そこで「くわしく みる」を選ぶと、詳しいエピソードのウィンドウが開きます。
//   summary  … ポップアップに出す、短いひとこと（\n で改行）
//   text     … 「くわしく みる」で出す、詳しいエピソード
//   hasEvent … true なら宝箱のマス、false なら石だたみのマス
//   ※ summary や text が空のマスは、RPGらしい決まり文句が出ます（getRoadmapSummary などを参照）。
//     エピソードを書き足せば、そのまま表示されます。
// image は history.html から見た場所（相対パス）で書きます。
const lifeRoadmapData = [
  { age: 0, title: "0歳", summary: "千葉県で たんじょう！\nだんボールから はじまる ぼうけん。", text: "千葉県で誕生(両親曰く、段ボールに入っていたところを拾ったらしい)", hasEvent: true, image: "images/roadmap/0歳.jpg" },
  { age: 2, title: "2歳", text: "", hasEvent: false },
  { age: 4, title: "4歳", summary: "埼玉の いなかへ ひっこした。\nつうがくの あくむが まっている…", text: "埼玉県の某田舎に引っ越し(このときは知りませんでした。通学で悪夢を見ることを)", hasEvent: true, image: "images/roadmap/4歳.jpg" },
  { age: 8, title: "8歳", text: "", hasEvent: false },
  { age: 11, title: "11歳", text: "", hasEvent: false },
  { age: 13, title: "13歳", summary: "中学生に なった！\nソフトテニス部に にゅうぶ。", text: "小学校メンバーほぼ変わらず中学生になる。中学ではソフトテニス部に入部。(14歳で初彼女ができて調子に載る)", hasEvent: true, image: "images/roadmap/13歳.jpg" },
  { age: 15, title: "15歳", summary: "スポーツ強豪校で 弓道部に。\nあんこく じだいの はじまり…", text: "埼玉のスポーツ強豪校に入り、弓道部に入部(完全なる暗黒時代突入)", hasEvent: true, image: "images/roadmap/15歳.jpg" },
  { age: 18, title: "18歳", summary: "E判定から 大学に ごうかく！\nしかし バイトの日々が はじまる。", text: "E判定で合格が絶望的だった大学に何とか合格。だがしかし、ここからバイト>>>大学の生活が始まる", hasEvent: true, image: "images/roadmap/18歳.jpg" },
  { age: 21, title: "21歳", text: "", hasEvent: false },
  { age: 24, title: "24歳", summary: "大学を そつぎょう！\nWeb広告代理店に 営業として 入社。", text: "紆余曲折ありながら大学卒業。東京にあるWeb広告代理店に営業として入社(絵に描いたような体育会系の代理店でしたが、今と思えばメンタルはかなり鍛えられたと思います。感謝。)", hasEvent: true, image: "images/roadmap/24歳.jpg" },
  { age: 26, title: "26歳", summary: "Webメディア事業会社へ 転職！\nあたらしい スキルを おぼえた。", text: "会社に染まりすぎる自分自身に恐怖を感じ、Webメディア事業会社に営業として転職(営業だけでなくディレクション・SEO・広告運用を学ぶ。)", hasEvent: true, image: "images/roadmap/26歳.jpg" },
  { age: 30, title: "30歳", text: "", hasEvent: false },
  { age: 33, title: "33歳", summary: "自己成長の ために 転職を けつい。\nセルミュラーに 入社！", text: "自己成長のために転職を決意。ご縁がありセルミュラーに入社", hasEvent: true, image: "images/roadmap/33歳.jpg" },
  { age: 36, title: "36歳", summary: "年間1億円プレーヤーに なった！", text: "年間1億円プレーヤーになり、自己と会社の成長のために奮闘", hasEvent: true, image: "images/roadmap/36歳.jpg" },
  { age: 45, title: "45歳", text: "", hasEvent: false },
  { age: 52, title: "52歳", text: "", hasEvent: false },
  { age: 60, title: "60歳（GOAL）", summary: "げんえきを いんたい。\nキャンピングカーで ぜんこくの たびへ！", text: "現役を引退。キャンピングカーを購入し、愛犬と共に全国津々浦々をのんびり巡るのが目標", hasEvent: true, image: "images/roadmap/60歳.jpg" }
];


/* ========================================
   2. ドット絵
   1文字＝1ドット。文字ごとに下のパレットの色で塗ります。
   「.」は透明（何も描かない）です。
======================================== */

const ROADMAP_PIXEL_PALETTE = {
  K: "#000000", // 輪郭の黒
  b: "#c8742c", // 木の明るい茶色
  B: "#8b4a1c", // 木の暗い茶色
  D: "#3b2410", // 宝箱の中の暗がり
  Y: "#ffd23f", // 金
  y: "#b8860b", // 暗い金
  R: "#d64545", // 屋根の赤
  W: "#f2e3c6", // 壁のクリーム色
  C: "#7ec8ff", // 窓の水色
  d: "#6b3e17", // 扉
  S: "#c9ced6", // 城の石
  F: "#ff3b00", // 旗
  G: "#2e8b3e", // 葉の緑
  g: "#5cc46a", // 葉の明るい緑
  t: "#7a4a1e", // 幹
  M: "#8a7f6a", // 山の岩
  m: "#a89c82", // 山の明るい岩
  w: "#ffffff"  // 雪
};

const ROADMAP_PIXEL_ART = {

  // 閉じた宝箱（まだ見ていないエピソード）
  chest: [
    "..KKKKKKKKKK..",
    ".KbbbbbbbbbbK.",
    "KbbYbbbbbbYbbK",
    "KbbYbbbbbbYbbK",
    "KKKKKKKKKKKKKK",
    "KYYYYYKKYYYYYK",
    "KbbYbKYYKbYbbK",
    "KbbYbKyyKbYbbK",
    "KbbYbbKKbbYbbK",
    "KBBYBBBBBBYBBK",
    "KKKKKKKKKKKKKK"
  ],

  // 開いた宝箱（見たエピソード）
  chestOpen: [
    "..KKKKKKKKKK..",
    ".KBBBBBBBBBBK.",
    "KBYbbbbbbbbYBK",
    "KKKKKKKKKKKKKK",
    "KDDDDDDDDDDDDK",
    "KDYDYYDDYYDYDK",
    "KKKKKKKKKKKKKK",
    "KbbYbbbbbbYbbK",
    "KbbYbbbbbbYbbK",
    "KBBYBBBBBBYBBK",
    "KKKKKKKKKKKKKK"
  ],

  // 村の家（START）
  house: [
    "......KK......",
    ".....KRRK.....",
    "....KRRRRK....",
    "...KRRRRRRK...",
    "..KRRRRRRRRK..",
    ".KRRRRRRRRRRK.",
    "KKKKKKKKKKKKKK",
    ".KWWWWWWWWWWK.",
    ".KWCCWWKKWWWK.",
    ".KWCCWKddKWWK.",
    ".KWWWWKddKWWK.",
    ".KWWWWKddKWWK.",
    ".KKKKKKKKKKKK."
  ],

  // お城（GOAL）
  castle: [
    ".......KFF......",
    ".......KFFF.....",
    ".......K........",
    "..K.K.KKKK.K.K..",
    "..KKKKKSSKKKKK..",
    "..KSSSKSSKSSSK..",
    "K.KSSSKSSKSSSK.K",
    "KKKSSSSSSSSSSKKK",
    "KSSSSSSSSSSSSSSK",
    "KSSKKSSSSSSKKSSK",
    "KSSKCSSSSSSKCSSK",
    "KSSSSSKKKKSSSSSK",
    "KSSSSKddddKSSSSK",
    "KSSSSKddddKSSSSK",
    "KKKKKKKKKKKKKKKK"
  ],

  // 木（空の飾り）
  tree: [
    "...KKKK...",
    "..KGGGGK..",
    ".KGgGGGGK.",
    "KGGGGgGGGK",
    "KGgGGGGGgK",
    "KGGGgGGGGK",
    ".KGGGGgGK.",
    "..KKKKKK..",
    "...KttK...",
    "...KttK...",
    "...KKKK..."
  ],

  // 雪山（空の飾り）
  mountain: [
    ".......KK.......",
    "......KwwK......",
    ".....KwwMMK.....",
    "....KMMMMMMK....",
    "...KMMmMMMMMK...",
    "..KMMMMMMmMMMK..",
    ".KMMmMMMMMMMMMK.",
    "KMMMMMMMmMMMMMMK",
    "KKKKKKKKKKKKKKKK"
  ]

};


/* ========================================
   3. 要素の取得
======================================== */

const roadmapBoard = document.getElementById("roadmap-board");
const roadmapAvatar = document.getElementById("roadmap-avatar");
const roadmapModal = document.getElementById("roadmap-modal");
const roadmapMessage = document.getElementById("roadmap-message");
const roadmapMessageText = document.getElementById("roadmap-message-text");
const roadmapMessageLive = document.getElementById("roadmap-message-live");
const roadmapSoundButton = document.getElementById("roadmap-sound");
const roadmapPopup = document.getElementById("roadmap-popup");


/* ========================================
   4. 状態（state）
   「今どうなっているか」をこのオブジェクト1つにまとめて覚えておきます。
   画面の見た目は、この状態をもとに変えていきます。
======================================== */

const roadmapState = {
  currentIndex: 0,  // コマが今いるマスの番号（0 = START）
  isMoving: false,  // コマが移動中なら true（移動中のクリックを無視するため）
  soundOn: false,   // 効果音を鳴らすかどうか（最初はOFF）
  popupIndex: null, // ひとことポップアップを出しているマスの番号（出していなければ null）
  modalIndex: null  // 詳しいウィンドウで見ているマスの番号（見ていなければ null）
};

// 作ったマス（ボタン）を、データと同じ順番で入れておく配列
const roadmapTiles = [];

// OSで「視差効果を減らす（動きを減らす）」設定になっているか
const roadmapReduceMotion =
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;


/* ========================================
   5. 便利な道具
======================================== */

// --- 指定したミリ秒だけ待つ（await roadmapWait(300) で「0.3秒待つ」） ---
function roadmapWait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}


// --- ドット絵の設計図から、SVG（線や図形の画像）の文字列を作る ---
function renderRoadmapPixelArt(name, className) {

  const rows = ROADMAP_PIXEL_ART[name];
  const width = rows[0].length;
  const height = rows.length;
  let rects = "";

  rows.forEach((row, y) => {

    let x = 0;

    while (x < width) {

      const color = row[x];

      // 同じ色が横に続く分は、1つの長い四角にまとめる（四角の数が減って軽くなる）
      let length = 1;
      while (x + length < width && row[x + length] === color) {
        length++;
      }

      if (color !== ".") {
        rects +=
          '<rect x="' + x + '" y="' + y +
          '" width="' + length + '" height="1" fill="' +
          ROADMAP_PIXEL_PALETTE[color] + '"/>';
      }

      x += length;

    }

  });

  // shape-rendering="crispEdges" … 四角のフチをぼかさず、くっきりドットにする
  return (
    '<svg class="' + (className || "") + '" viewBox="0 0 ' + width + " " + height +
    '" shape-rendering="crispEdges" aria-hidden="true">' + rects + "</svg>"
  );

}


// --- 写真をドット絵に変換する ---
// 写真を 20×20 マスの小さなキャンバスに縮めて描き、
// CSSの image-rendering: pixelated で「ぼかさず」拡大表示するとドット絵になる
function createRoadmapPixelFace(image) {

  const resolution = 20; // 小さくするほど粗いドットになる

  const canvas = document.createElement("canvas");
  canvas.width = resolution;
  canvas.height = resolution;
  canvas.className = "pixel-face";

  const context = canvas.getContext("2d");
  context.drawImage(image, 0, 0, resolution, resolution);

  return canvas;

}


// --- 効果音（Web Audio API で、昔のゲーム機のような「ピコッ」を作る） ---
let roadmapAudioContext = null;

function playRoadmapTone(frequency, duration, delay, volume) {

  if (!roadmapState.soundOn) {
    return;
  }

  // 音を作る装置は、最初に音を鳴らすときに1回だけ用意する
  if (!roadmapAudioContext) {
    roadmapAudioContext = new (window.AudioContext || window.webkitAudioContext)();
  }

  const context = roadmapAudioContext;
  const startTime = context.currentTime + (delay || 0);

  const oscillator = context.createOscillator(); // 音のもと（発振器）
  const gain = context.createGain();             // 音量のつまみ

  oscillator.type = "square";            // 矩形波 ＝ ファミコンっぽい「ピコピコ」音
  oscillator.frequency.value = frequency; // 音の高さ（Hz）

  // 鳴らした瞬間の音量から、だんだん小さくして消す
  gain.gain.setValueAtTime(volume || 0.05, startTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  oscillator.connect(gain);
  gain.connect(context.destination);     // スピーカーへつなぐ

  oscillator.start(startTime);
  oscillator.stop(startTime + duration);

}

// 場面ごとの効果音（どれもオリジナルの短い音です）
const roadmapSounds = {

  cursor: () => playRoadmapTone(1320, 0.05),             // 決定
  step: () => playRoadmapTone(330, 0.05, 0, 0.03),       // 1歩
  text: () => playRoadmapTone(990, 0.02, 0, 0.012),      // 文字送り

  levelUp: () => {                                       // レベルアップ
    [523, 659, 784, 1047, 784, 1047].forEach((frequency, index) => {
      playRoadmapTone(frequency, 0.14, index * 0.09);
    });
  },

  back: () => {                                          // 過去へ戻った
    [784, 659, 523].forEach((frequency, index) => {
      playRoadmapTone(frequency, 0.12, index * 0.1, 0.04);
    });
  }

};


// --- 文字送り（1文字ずつ表示する仕組み） ---
// element に文字を出す係を作って返す。
// 係は「type(文章)」で文字送りを始め、「finish()」で残りを一気に出す。
function createRoadmapTypewriter(element) {

  let timerId = null;
  let characters = [];
  let shownCount = 0;

  function finish() {
    clearInterval(timerId);
    element.textContent = characters.join("");
    element.classList.add("is-done"); // CSSで最後に ▼ を出す
  }

  function type(text) {

    clearInterval(timerId);

    // Array.from で1文字ずつの配列にする（絵文字なども1文字として扱える）
    characters = Array.from(text);
    shownCount = 0;
    element.classList.remove("is-done");

    // 先に全文を入れて高さを測り、その高さを確保しておく。
    // こうすると、文字が増えるたびにウィンドウの高さが伸び縮みしない
    element.style.minHeight = "";
    element.textContent = text;
    element.style.minHeight = element.offsetHeight + "px";
    element.textContent = "";

    if (roadmapReduceMotion) {
      finish();
      return;
    }

    // 35ミリ秒ごとに1文字ずつ増やす
    timerId = setInterval(() => {

      shownCount++;
      element.textContent = characters.slice(0, shownCount).join("");

      // 2文字に1回「ピッ」と鳴らす
      if (shownCount % 2 === 0) {
        roadmapSounds.text();
      }

      if (shownCount >= characters.length) {
        finish();
      }

    }, 35);

  }

  return { type: type, finish: finish };

}

// 文字送り係を3人用意する（メッセージウィンドウ用、モーダル用、ポップアップ用）
// ※ モーダルがないページでエラーにならないよう、あるときだけ作る
const roadmapMessageWriter = createRoadmapTypewriter(roadmapMessageText);
const roadmapModalWriter = roadmapModal
  ? createRoadmapTypewriter(roadmapModal.querySelector(".roadmap-modal__text"))
  : null;
// 3人目：マスのそばに出る「ひとことポップアップ」用
const roadmapPopupWriter = roadmapPopup
  ? createRoadmapTypewriter(roadmapPopup.querySelector(".roadmap-popup__text"))
  : null;


// メッセージウィンドウに文章を出す
function showRoadmapMessage(text) {

  roadmapMessageWriter.type(text);

  // 読み上げソフトには、全文を一度に伝える
  roadmapMessageLive.textContent = text;

}


/* ========================================
   6. マスを作る
   データ1件ごとにマスを1つ作り、盤に追加します。
======================================== */

function createRoadmapTiles() {

  const lastIndex = lifeRoadmapData.length - 1;

  lifeRoadmapData.forEach((item, index) => {

    // どのマスにも止まれるように、すべてのマスをクリックできる <button> にする
    const tile = document.createElement("button");
    tile.type = "button";
    tile.className = "roadmap-tile";


    // マスに描くドット絵を決める（START=家、GOAL=城、イベント=宝箱）
    let iconName = "";

    if (index === 0) {
      iconName = "house";
    } else if (index === lastIndex) {
      iconName = "castle";
    } else if (item.hasEvent) {
      iconName = "chest";
    }

    if (iconName) {
      tile.innerHTML +=
        '<span class="roadmap-tile__icon">' +
        renderRoadmapPixelArt(iconName) +
        "</span>";
    }

    tile.innerHTML +=
      '<span class="roadmap-tile__age">' + item.age + "<small>さい</small></span>";


    // 宝箱のあるマスと、石だたみのマスで見た目（class）を分ける
    tile.classList.add(item.hasEvent ? "is-event" : "is-blank");

    // 画面読み上げソフト用の説明
    tile.setAttribute("aria-label", item.title + "のマスへ すすむ");

    // クリックされたら、このマスの番号を渡して処理を始める
    tile.addEventListener("click", () => {
      handleRoadmapTileClick(index);
    });


    // START と GOAL のラベル
    if (index === 0) {
      tile.classList.add("is-start");
      tile.insertAdjacentHTML("beforeend", '<span class="roadmap-tile__badge">スタート</span>');
    }

    if (index === lastIndex) {
      tile.classList.add("is-goal");
      tile.insertAdjacentHTML("beforeend", '<span class="roadmap-tile__badge">ゴール</span>');
    }


    // コマより前に入れる（コマを常にHTMLの最後＝一番手前にしておくため）
    roadmapBoard.insertBefore(tile, roadmapAvatar);

    roadmapTiles.push(tile);

  });

}


// 一度見た宝箱を「開いた宝箱」に変える
function openRoadmapChest(index) {

  const tile = roadmapTiles[index];
  tile.classList.add("is-visited");

  // 宝箱のマスだけ絵を差し替える（家と城はそのまま）
  const isChest =
    index !== 0 && index !== lifeRoadmapData.length - 1;

  if (isChest) {
    tile.querySelector(".roadmap-tile__icon").innerHTML =
      renderRoadmapPixelArt("chestOpen");
  }

}


// 空に、山と木のドット絵を並べる
function createRoadmapScenery() {

  const scenery = document.getElementById("roadmap-scenery");
  const pattern = ["mountain", "tree", "mountain", "mountain", "tree", "tree"];

  // 横幅が足りなくならないよう、パターンを4回くり返して並べる
  // （はみ出た分は CSS の overflow: hidden で見えない）
  for (let i = 0; i < 4; i++) {
    pattern.forEach((name) => {
      scenery.innerHTML += renderRoadmapPixelArt(name, name === "tree" ? "is-tree" : "");
    });
  }

}


// 主人公と「つよさ」ウィンドウの顔をドット絵にする
function setupRoadmapPixelFaces() {

  const avatarBody = roadmapAvatar.querySelector(".roadmap-avatar__body");
  const photo = avatarBody.querySelector("img");

  function apply() {

    // 写真が読み込めなかったときは、何もしない（写真のまま）
    if (!photo.naturalWidth) {
      return;
    }

    avatarBody.appendChild(createRoadmapPixelFace(photo));
    avatarBody.classList.add("is-pixelated"); // CSSで元の写真を隠す

    document
      .getElementById("roadmap-status-face")
      .appendChild(createRoadmapPixelFace(photo));

  }

  // すでに読み込み済みならすぐ、まだなら読み込み終わってから変換する
  if (photo.complete) {
    apply();
  } else {
    photo.addEventListener("load", apply);
  }

}


/* ========================================
   7. 盤を並べる（S字カーブ）
======================================== */

// 盤の幅に合わせて、1行に並べるマスの数を決める
function getRoadmapColumnCount() {

  const width = roadmapBoard.clientWidth;

  if (width < 520) return 3; // スマホ
  if (width < 820) return 4; // タブレット
  return 5;                  // パソコン

}


// 各マスを「何行目・何列目」に置くか決める
function placeRoadmapTiles(columnCount) {

  roadmapTiles.forEach((tile, index) => {

    const row = Math.floor(index / columnCount); // 何行目か（0から数える）
    const positionInRow = index % columnCount;   // その行の中で何番目か

    // ★ここがS字のポイント★
    // 偶数行（0, 2, 4…）は左→右、奇数行（1, 3, 5…）は右→左に並べる
    const column =
      row % 2 === 0
        ? positionInRow
        : columnCount - 1 - positionInRow;

    // CSS Grid の行・列は1から数えるので +1 する
    tile.style.gridRow = row + 1;
    tile.style.gridColumn = column + 1;

  });

}


// マスの位置（盤の左上からの距離）を調べる
function getRoadmapTilePosition(index) {

  const tile = roadmapTiles[index];

  // offsetLeft / offsetTop … 盤（position: relative の親）の左上からの距離
  // offsetWidth / offsetHeight … マスの幅・高さ
  return {
    x: tile.offsetLeft + tile.offsetWidth / 2,  // マスの中心（横）
    y: tile.offsetTop + tile.offsetHeight / 2,  // マスの中心（縦）
    top: tile.offsetTop,                        // マスの上辺
    size: tile.offsetWidth
  };

}


// マスの中心を順番につないで、道（SVGの線）を描く
function drawRoadmapRoad() {

  const svg = roadmapBoard.querySelector(".roadmap-road");
  const boardWidth = roadmapBoard.clientWidth;
  const boardHeight = roadmapBoard.clientHeight;

  // SVGの座標を「1 = 1px」にそろえる
  svg.setAttribute("viewBox", "0 0 " + boardWidth + " " + boardHeight);


  // SVGの path は「d」という文字列で形を指定します
  //   M x y … ペンをそこに置く
  //   L x y … そこまで直線を引く
  //   C …   … 曲線（ベジェ曲線）を引く
  let pathData = "";

  roadmapTiles.forEach((tile, index) => {

    const point = getRoadmapTilePosition(index);

    if (index === 0) {
      pathData = "M " + point.x + " " + point.y;
      return;
    }

    const prev = getRoadmapTilePosition(index - 1);

    if (Math.abs(prev.y - point.y) < 1) {

      // 同じ行なら、まっすぐ横に線を引く
      pathData += " L " + point.x + " " + point.y;

    } else {

      // 次の行へ折り返すところは、外側にふくらむU字カーブにする
      // 右端で折り返すなら右へ(+)、左端なら左へ(-)ふくらませる
      const side = point.x > boardWidth / 2 ? 1 : -1;
      const bulge = point.size * 0.8 * side;

      pathData +=
        " C " + (prev.x + bulge) + " " + prev.y +
        ", " + (point.x + bulge) + " " + point.y +
        ", " + point.x + " " + point.y;

    }

  });


  // 3本の線（フチ・道・足あと）すべてに同じ形を設定
  svg.querySelectorAll("path").forEach((path) => {
    path.setAttribute("d", pathData);
  });

}


// コマを指定したマスの位置に置く
function placeRoadmapAvatar(index) {

  const point = getRoadmapTilePosition(index);
  const avatarSize = roadmapAvatar.offsetWidth;

  // 横：マスの中心にコマの中心を合わせる
  // 縦：マスの上辺に、コマが半分ほど乗っかる位置にする
  const x = point.x - avatarSize / 2;
  const y = point.top - avatarSize * 0.6;

  // transform を変えると、CSSの transition によって滑らかに移動する
  roadmapAvatar.style.transform = "translate(" + x + "px, " + y + "px)";

}


// 盤全体を並べ直す（最初と、画面サイズが変わったときに実行）
function layoutRoadmapBoard() {

  const columnCount = getRoadmapColumnCount();

  // CSSの grid-template-columns: repeat(var(--cols), 1fr) に列数を渡す
  roadmapBoard.style.setProperty("--cols", columnCount);

  placeRoadmapTiles(columnCount);
  drawRoadmapRoad();


  // 並べ直しのときは、コマをアニメーションさせずに一瞬で移す
  roadmapAvatar.classList.add("is-instant");
  placeRoadmapAvatar(roadmapState.currentIndex);

  // offsetWidth を読むと、ブラウザがその場で位置を確定させる（リフロー）。
  // これをしないと、is-instant を外すのと同時に処理され、結局アニメーションしてしまう
  void roadmapAvatar.offsetWidth;

  roadmapAvatar.classList.remove("is-instant");

}


/* ========================================
   8. コマの移動
======================================== */

// コマがいるマスに is-current を付け、「つよさ」ウィンドウを更新する
function updateRoadmapStatus() {

  roadmapTiles.forEach((tile, index) => {
    tile.classList.toggle("is-current", index === roadmapState.currentIndex);
  });

  const eventCount =
    lifeRoadmapData.filter((item) => item.hasEvent).length;

  const visitedCount =
    roadmapTiles.filter((tile) => tile.classList.contains("is-visited")).length;

  document.getElementById("roadmap-status-name").textContent = ROADMAP_HERO_NAME;
  document.getElementById("roadmap-status-level").textContent =
    lifeRoadmapData[roadmapState.currentIndex].age;
  document.getElementById("roadmap-status-exp").textContent =
    visitedCount + " / " + eventCount;

}


// 目的のマスまで、1マスずつ歩いて進む（または戻る）
// async を付けた関数の中では await で「終わるまで待つ」ができる
async function moveRoadmapAvatarTo(targetIndex) {

  const direction = targetIndex > roadmapState.currentIndex ? 1 : -1; // 進む(+1) or 戻る(-1)
  const steps = Math.abs(targetIndex - roadmapState.currentIndex);    // 何マス動くか

  // 1マスにかける時間。遠いほど1マスを速くして、全体で約2.4秒以内に収める
  // （最短0.15秒〜最長0.35秒）
  const stepTime = roadmapReduceMotion
    ? 0
    : Math.max(150, Math.min(350, 2400 / steps));

  // CSSの transition の長さに使ってもらう
  roadmapBoard.style.setProperty("--step-duration", stepTime + "ms");


  // 目的地に着くまで、1マスずつくり返す
  while (roadmapState.currentIndex !== targetIndex) {

    roadmapState.currentIndex += direction;

    placeRoadmapAvatar(roadmapState.currentIndex); // 次のマスへ移動開始
    roadmapSounds.step();                          // 足音
    updateRoadmapStatus();                         // Lv（年齢）も1マスごとに変わる

    await roadmapWait(stepTime);                   // 移動し終わるまで待つ

  }

}


// マスがクリックされたときの処理（全体の流れ）
async function handleRoadmapTileClick(targetIndex) {

  // 移動中に別のマスを押されても無視する
  if (roadmapState.isMoving) {
    return;
  }

  const item = lifeRoadmapData[targetIndex];
  const startIndex = roadmapState.currentIndex;

  roadmapSounds.cursor();

  // 前のマスのポップアップが出ていたら、いったん閉じてから歩き出す
  hideRoadmapPopup();


  if (targetIndex !== startIndex) {

    // ① 移動中の状態にする
    roadmapState.isMoving = true;
    roadmapBoard.classList.add("is-moving");

    showRoadmapMessage(ROADMAP_HERO_NAME + "は " + item.age + "さいへ むかった！");

    // ② コマが着くまで待つ
    await moveRoadmapAvatarTo(targetIndex);

    // ③ 移動中の状態を解除
    roadmapState.isMoving = false;
    roadmapBoard.classList.remove("is-moving");

    // 到着してすぐ開くと慌ただしいので、ほんの少し間を空ける
    await roadmapWait(roadmapReduceMotion ? 0 : 250);

  }


  // ④ 着いたら、宝箱のマスなら宝箱を開ける
  if (item.hasEvent) {
    openRoadmapChest(targetIndex);
  }
  updateRoadmapStatus();

  // 進んだ・戻った・その場、で一言を変える
  let levelUpText = "";

  if (targetIndex > startIndex) {
    levelUpText = "★ " + ROADMAP_HERO_NAME + "は レベル" + item.age + "に あがった！";
    roadmapSounds.levelUp();
  } else if (targetIndex < startIndex) {
    levelUpText = "◆ " + ROADMAP_HERO_NAME + "は " + item.age + "さいの きおくを おもいだした。";
    roadmapSounds.back();
  } else {
    levelUpText = "◆ " + ROADMAP_HERO_NAME + "は あしもとを しらべた。";
  }

  showRoadmapMessage(
    item.hasEvent
      ? "たからばこを あけた！\n" + item.title + "の おもいでを みつけた。"
      : item.title + "の マスに とまった。"
  );

  // ⑤ マスのそばに、ひとことポップアップを出す
  //   （そこで「くわしく みる」を選ぶと、詳しいエピソードのウィンドウが開く）
  showRoadmapPopup(targetIndex, levelUpText);

}


/* ========================================
   8.5 ひとことポップアップ
   マスに止まると、そのマスのそばに小さなメッセージウィンドウを出す。
   ここで「くわしく みる」を選ぶと、9. の詳しいウィンドウ（モーダル）が開く。

   【表示/非表示の状態】
   roadmapPopup.hidden が true なら非表示、false なら表示。
   どのマスのポップアップかは roadmapState.popupIndex に覚えておく。
======================================== */

// マスのひとこと（データに summary が無いマスは、RPGらしい決まり文句にする）
function getRoadmapSummary(item) {
  return item.summary ||
    ROADMAP_HERO_NAME + "は あたりを みわたした。\nしかし なにも みつからなかった！";
}

// マスの詳しいエピソード（データに text が無いマスは、まだ書かれていない扱いにする）
function getRoadmapDetail(item) {
  return item.text ||
    item.title + "ごろの きろくは、まだ ぼうけんのしょに かかれていない…";
}


function showRoadmapPopup(index, levelUpText) {

  const item = lifeRoadmapData[index];

  roadmapState.popupIndex = index;

  roadmapPopup.querySelector(".roadmap-popup__label").textContent = item.title;
  roadmapPopup.querySelector(".roadmap-popup__levelup").textContent = levelUpText;

  // 先に表示してから文字送りを始める（表示前だと、高さを正しく測れないため）
  roadmapPopup.hidden = false;
  roadmapPopupWriter.type(getRoadmapSummary(item));

  // 高さが決まったので、マスのそばに置く
  positionRoadmapPopup();

  // RPGと同じく、1つ目のコマンド「くわしく みる」にカーソル（▶）を合わせ、
  // キーボードの Enter ですぐ選べるようにフォーカスも移す
  const detailCommand = roadmapPopup.querySelector('[data-action="detail"]');
  selectRoadmapPopupCommand(detailCommand);
  detailCommand.focus({ preventScroll: true });

}


// ▶ カーソルを、指定したコマンドに移す（CSS の .is-selected）
function selectRoadmapPopupCommand(command) {

  roadmapPopup.querySelectorAll(".roadmap-popup__command").forEach((item) => {
    item.classList.toggle("is-selected", item === command);
  });

}


function hideRoadmapPopup() {

  roadmapPopupWriter.finish();
  roadmapPopup.hidden = true;
  roadmapState.popupIndex = null;

}


// ポップアップを、止まったマスの「下」に置く。
// 下に入りきらないとき（盤の一番下の行など）は「上」に置く
function positionRoadmapPopup() {

  if (roadmapPopup.hidden || roadmapState.popupIndex === null) {
    return;
  }

  const point = getRoadmapTilePosition(roadmapState.popupIndex);
  const boardWidth = roadmapBoard.clientWidth;
  const boardHeight = roadmapBoard.clientHeight;
  const popupWidth = roadmapPopup.offsetWidth;
  const popupHeight = roadmapPopup.offsetHeight;
  const gap = 18; // マスとポップアップの間のすき間

  // 横：マスの中心にそろえる。ただし盤の左右からはみ出さないように 12px 内側におさめる
  //   Math.min / Math.max で「最小値〜最大値」の範囲に閉じこめている
  const left = Math.max(12, Math.min(point.x - popupWidth / 2, boardWidth - popupWidth - 12));

  // 縦：まずはマスの下。入りきらなければマス（とコマ）の上へ
  let y = point.top + point.size + gap;
  let placeAbove = false;

  if (y + popupHeight > boardHeight - 8) {
    y = point.top - roadmapAvatar.offsetHeight * 0.6 - popupHeight - gap;
    placeAbove = true;
  }

  roadmapPopup.style.left = left + "px";
  roadmapPopup.style.top = Math.max(8, y) + "px";

  // 吹き出しのしっぽ（▲）を、マスの中心を指す位置に合わせる（CSS の --tail-x）
  roadmapPopup.style.setProperty("--tail-x", (point.x - left) + "px");
  roadmapPopup.classList.toggle("is-above", placeAbove);

}


function setupRoadmapPopup() {

  // マウスを乗せた／Tabキーで選んだコマンドに、▶ カーソルを移す
  roadmapPopup.querySelectorAll(".roadmap-popup__command").forEach((command) => {
    command.addEventListener("mouseenter", () => selectRoadmapPopupCommand(command));
    command.addEventListener("focus", () => selectRoadmapPopupCommand(command));
  });

  // 「くわしく みる」→ 詳しいエピソードのウィンドウを開く
  roadmapPopup
    .querySelector('[data-action="detail"]')
    .addEventListener("click", () => {

      const index = roadmapState.popupIndex;

      if (index === null) {
        return;
      }

      roadmapSounds.cursor();
      hideRoadmapPopup();
      openRoadmapModal(index);

    });


  // 「とじる」→ ポップアップを閉じて、止まったマスにフォーカスを戻す
  roadmapPopup
    .querySelector('[data-action="close"]')
    .addEventListener("click", () => {

      const index = roadmapState.popupIndex;

      roadmapSounds.cursor();
      hideRoadmapPopup();
      showRoadmapMessage("＊ つぎは どこへ いきますか？");

      if (index !== null) {
        roadmapTiles[index].focus({ preventScroll: true });
      }

    });


  // 文章をクリックしたら、文字送りをスキップして全文を出す
  roadmapPopup
    .querySelector(".roadmap-popup__text")
    .addEventListener("click", () => {
      roadmapPopupWriter.finish();
    });


  // Escキーで閉じる（詳しいウィンドウが開いているときは、そちらが先に閉じる）
  document.addEventListener("keydown", (event) => {

    if (event.key === "Escape" && !roadmapPopup.hidden && !roadmapModal.open) {
      roadmapPopup.querySelector('[data-action="close"]').click();
    }

  });

}


/* ========================================
   9. モーダル（ポップアップ）

   【表示/非表示の状態】
   <dialog> は、開いているかどうかを自分で覚えています。
     開く   … roadmapModal.showModal()
     閉じる … roadmapModal.close()
     今開いているか … roadmapModal.open（true / false）
======================================== */

function openRoadmapModal(index) {

  const item = lifeRoadmapData[index];
  const title = roadmapModal.querySelector(".roadmap-modal__title");
  const levelUp = roadmapModal.querySelector(".roadmap-modal__levelup");
  const image = roadmapModal.querySelector(".roadmap-modal__image");

  // 閉じたあとにフォーカスを戻すため、どのマスを見ているか覚えておく
  roadmapState.modalIndex = index;


  // 中身を、クリックされたマスのデータに入れ替える
  // （textContent は文字をそのまま入れるので、記号が入っていても安全）
  // 金色の一行 ＝ ポップアップと同じ「ひとこと」、下の文章 ＝ 詳しいエピソード
  title.textContent = item.title;
  levelUp.textContent = getRoadmapSummary(item).replace("\n", " ");


  if (item.image) {

    // いったん表示しておき、読み込めなかったら error 処理で隠す
    image.hidden = false;
    image.alt = item.title + "の写真";
    image.src = item.image;

  } else {

    // 画像の指定がないときは隠す → 下のプレースホルダーが見える
    image.hidden = true;
    image.removeAttribute("src");

  }


  roadmapModal.showModal();

  // 後ろのページがスクロールしないようにする（CSSの body.modal-open）
  document.body.classList.add("modal-open");

  // 開いてから文字送りを始める（開く前だと、高さを正しく測れないため）
  roadmapModalWriter.type("＊「" + getRoadmapDetail(item) + "」");

}


// モーダルが閉じたあとの後片付け（どの方法で閉じても、ここを通す）
function handleRoadmapModalClosed() {

  // すでに片付け済みなら何もしない（2回実行されるのを防ぐ）
  if (!document.body.classList.contains("modal-open")) {
    return;
  }

  // 後ろのページのスクロールを元に戻す
  document.body.classList.remove("modal-open");

  roadmapModalWriter.finish();

  // 全部の宝箱を開けたかどうかで、メッセージを変える
  const allVisited = roadmapTiles.every((tile, index) =>
    !lifeRoadmapData[index].hasEvent || tile.classList.contains("is-visited")
  );

  showRoadmapMessage(
    allVisited
      ? "おめでとう！ すべての おもいでを あつめた！\nでも たびは まだまだ つづく…"
      : "＊ つぎは どこへ いきますか？"
  );

  // 見ていたマスにフォーカスを戻す（キーボードで続けて操作できるように）
  if (roadmapState.modalIndex !== null) {
    roadmapTiles[roadmapState.modalIndex].focus({ preventScroll: true });
    roadmapState.modalIndex = null;
  }

}


// モーダルを閉じる
function closeRoadmapModal() {

  roadmapSounds.cursor();
  roadmapModal.close();
  handleRoadmapModalClosed();

}


function setupRoadmapModal() {

  const closeButton = roadmapModal.querySelector(".roadmap-modal__close");
  const image = roadmapModal.querySelector(".roadmap-modal__image");
  const text = roadmapModal.querySelector(".roadmap-modal__text");


  // 画像が見つからない・壊れているときは、画像を隠してプレースホルダーを見せる
  image.addEventListener("error", () => {
    image.hidden = true;
  });


  // 文章をクリックしたら、文字送りをスキップして全文を出す
  text.addEventListener("click", () => {
    roadmapModalWriter.finish();
  });


  // 閉じるボタン
  closeButton.addEventListener("click", () => {
    closeRoadmapModal();
  });


  // 背景（暗い幕）クリックで閉じる
  // クリックされたのが dialog そのもの＝ウィンドウの外側、と判断できる
  roadmapModal.addEventListener("click", (event) => {

    if (event.target === roadmapModal) {
      closeRoadmapModal();
    }

  });


  // Escキーで閉じたときは、ブラウザが自動で閉じるので closeRoadmapModal() を通らない。
  // そのため、dialog が閉じたときに届く「close」の合図でも後片付けをする
  roadmapModal.addEventListener("close", () => {
    handleRoadmapModalClosed();
  });

}


// 効果音のON/OFFボタン
function setupRoadmapSound() {

  roadmapSoundButton.addEventListener("click", () => {

    roadmapState.soundOn = !roadmapState.soundOn;

    roadmapSoundButton.textContent =
      "♪ サウンド：" + (roadmapState.soundOn ? "ON" : "OFF");

    // aria-pressed … 「押されている（ON）」状態を読み上げソフトに伝える
    roadmapSoundButton.setAttribute("aria-pressed", String(roadmapState.soundOn));

    roadmapSounds.cursor();

  });

}


/* ========================================
   10. スタート
   （history.html 以外で読み込まれても何もしないように、盤があるか確認）
======================================== */

if (roadmapBoard) {

  createRoadmapScenery();
  createRoadmapTiles();
  layoutRoadmapBoard();
  updateRoadmapStatus();
  setupRoadmapPixelFaces();
  setupRoadmapModal();
  setupRoadmapPopup();
  setupRoadmapSound();


  // メッセージウィンドウをクリックしたら、文字送りをスキップ
  roadmapMessage.addEventListener("click", () => {
    roadmapMessageWriter.finish();
  });

  showRoadmapMessage(
    "＊ ようこそ！ " + ROADMAP_HERO_NAME + "の じんせいの たびへ。\n" +
    "　 すきな マスを えらぶと、そこまで あるいて できごとが みられるぞ！"
  );


  // 画面サイズが変わったら並べ直す
  // requestAnimationFrame … 次に画面を描き直すタイミングで1回だけ実行する
  let roadmapResizeRequested = false;

  window.addEventListener("resize", () => {

    if (roadmapResizeRequested) {
      return;
    }

    roadmapResizeRequested = true;

    requestAnimationFrame(() => {
      layoutRoadmapBoard();
      positionRoadmapPopup(); // ポップアップも、マスの新しい位置に合わせて置き直す
      roadmapResizeRequested = false;
    });

  });

}
