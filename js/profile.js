/* ========================================
   PROFILE：能力値のポップアップ（profile.html 専用）

   【流れ】
     能力値（好奇心など）のボタンをクリック（タップ）
        ↓
     その能力の説明を <dialog> に入れて開く
        ↓
     「とじる」ボタン／ポップアップの外側クリック／Escキー のどれかで閉じる

   ※ script.js と同じページで読み込むため、名前がぶつからないよう
     変数や関数の名前には stat を付けています。
======================================== */


/* ========================================
   1. データ
   data-stat="curiosity" などのボタンと、ここの名前（curiosity）が対応している。
   text の \n は改行になる。
======================================== */

const PROFILE_STATS = {

  curiosity: {
    name: "好奇心",
    stars: 5,
    text: "キャンプ・フェス・登山・漫画アニメ・カフェ巡り・ご飯屋巡り・旅行・美容などが趣味。\nすぐに興味を持つ。"
  },

  action: {
    name: "行動力",
    stars: 4,
    text: "出発する1時間前に東京から名古屋に行くことを決め、車で行ってしまうほどのフッ軽さが突然現れる。"
  },

  planning: {
    name: "計画性",
    stars: 2,
    text: "「人生は行き当たりばったりの方が刺激的」が信条。"
  },

  communication: {
    name: "コミュ力",
    stars: 2,
    text: "コミュ力が上がりそうな本や動画が大好き。\nただ、実力は全く比例していない。"
  },

  persistence: {
    name: "継続力",
    stars: 3,
    text: "一度やると決めたら頑固。\nそれによって奥さんとも何度も揉めた。"
  }

};


/* ========================================
   2. 要素の取得
======================================== */

const statDialog = document.getElementById("stat-dialog");
const statButtons = document.querySelectorAll(".stat");


/* ========================================
   3. 開く・閉じる

   【表示/非表示の状態】
   <dialog> は、開いているかどうかを自分で覚えている。
     開く   … statDialog.showModal()
     閉じる … statDialog.close()
     今開いているか … statDialog.open（true / false）
   閉じるアニメーションの最中だけ、class="is-closing" を付けている。
======================================== */

// 星の文字列を作る（例：3 → ★★★☆☆）
function makeStatStars(count) {
  return "★".repeat(count) + "☆".repeat(5 - count);
}


function openStatDialog(key) {

  const stat = PROFILE_STATS[key];

  // データが見つからないボタンは何もしない（書き間違い対策）
  if (!stat) {
    return;
  }

  // 中身を、クリックされた能力のデータに入れ替える
  // （textContent は文字をそのまま入れるので、記号が入っていても安全）
  statDialog.querySelector(".dq-dialog__title").textContent = stat.name;
  statDialog.querySelector(".dq-dialog__stars").textContent = makeStatStars(stat.stars);
  statDialog.querySelector(".dq-dialog__text").textContent = stat.text;

  statDialog.classList.remove("is-closing");
  statDialog.showModal();

  // 後ろのページがスクロールしないようにする（CSS の body.modal-open）
  document.body.classList.add("modal-open");

}


// 閉じる：しぼむアニメーション（0.2秒）が終わってから、本当に閉じる
function closeStatDialog() {

  // すでに閉じている／閉じている途中なら何もしない（連打対策）
  if (!statDialog.open || statDialog.classList.contains("is-closing")) {
    return;
  }

  statDialog.classList.add("is-closing");

  setTimeout(() => {
    statDialog.classList.remove("is-closing");
    statDialog.close();
    document.body.classList.remove("modal-open"); // スクロールを元に戻す
  }, 200);

}


/* ========================================
   4. スタート
   （profile.html 以外で読み込まれても何もしないように、dialog があるか確認）
======================================== */

if (statDialog) {

  // 能力値のボタンをクリック → その能力のポップアップを開く
  statButtons.forEach((button) => {
    button.addEventListener("click", () => {
      openStatDialog(button.dataset.stat);
    });
  });


  // 「とじる」ボタン
  statDialog
    .querySelector(".dq-dialog__close")
    .addEventListener("click", closeStatDialog);


  // ポップアップの外側（暗い幕）をクリック → 閉じる
  // <dialog> の中身はウィンドウ部分だけなので、
  // クリックされたのが dialog そのもの＝ウィンドウの外側、と判断できる
  statDialog.addEventListener("click", (event) => {
    if (event.target === statDialog) {
      closeStatDialog();
    }
  });


  // Escキー → ブラウザがすぐ閉じてしまう代わりに、アニメーション付きで閉じる
  // （cancel は「Escキーで閉じようとした」ときに届く合図。preventDefault で自動の閉じ方を止める）
  statDialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    closeStatDialog();
  });


  // どの方法で閉じても、最後に必ずここが動く：スクロールを元に戻す
  // （フォーカスは、ブラウザが自動で「開く前に押したボタン」に戻してくれる）
  statDialog.addEventListener("close", () => {
    document.body.classList.remove("modal-open");
  });

}
