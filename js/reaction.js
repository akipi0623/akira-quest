/* ========================================
   REACTION：ページ下の「コマンドウィンドウ」（全ページ共通）

   【コマンド】 data-reaction-type で、どのコマンドかを見分ける
     cheer     … ▶ おうえんする     → 「＊ AKIRAは げんきが でた！」（1ページ1回まで）
     share     … ▶ シェアする       → スマホは共有メニュー／PCはURLをコピー
     next_page … ▶ つぎの ぼうけんへ → 01 → 02 → 03 → 04 → タイトル画面

   ※ script.js と同じページで読み込むため、名前がぶつからないよう
     全体を { } で囲み、中の変数がほかのファイルに漏れないようにしています。
======================================== */

{

  /* ========================================
     1. 設定
  ======================================== */

  // ページの順番（最後のページの次はタイトル画面へ）
  const REACTION_PAGE_ORDER = [
    "profile.html",
    "history.html",
    "strength.html",
    "future.html"
  ];

  const REACTION_TITLE_PAGE = "index.html";

  // 表示するメッセージ
  const REACTION_MESSAGES = {
    cheer: "＊ AKIRAは げんきが でた！",
    cheerAgain: "＊ AKIRAは もう げんき いっぱいだ！",
    shareDone: "＊ ぼうけんの きろくを みんなに しらせた！",
    copyDone: "＊ ページの URLを コピーした！",
    copyFailed: "＊ コピーに しっぱいした…\n"
  };


  /* ========================================
     2. 要素の取得
  ======================================== */

  const reactionWindow = document.querySelector(".reaction");


  /* ========================================
     3. メッセージを表示する
     同じメッセージが続いても、毎回ウィンドウが開き直すように
     いったん class を外してから付け直す。
  ======================================== */

  function showReactionMessage(text) {

    const message = reactionWindow.querySelector(".reaction__message");

    message.textContent = text;
    message.classList.remove("is-shown");
    void message.offsetWidth; // 付け直しをブラウザに気づかせるための1行
    message.classList.add("is-shown");

  }


  /* ========================================
     4. おうえんする（1ページにつき1回まで）
     sessionStorage は「このタブを閉じるまで覚えておく」保存場所。
     プライベートモードなどで使えないときは、ページを開いている間だけ覚えておく。
  ======================================== */

  const cheerKey = "akira-quest:cheer:" + location.pathname;
  let cheeredInMemory = false;

  function hasCheered() {
    try {
      return sessionStorage.getItem(cheerKey) === "done";
    } catch (error) {
      return cheeredInMemory;
    }
  }

  function saveCheered() {
    cheeredInMemory = true;
    try {
      sessionStorage.setItem(cheerKey, "done");
    } catch (error) {
      // 保存できなくても、cheeredInMemory で連打は防げる
    }
  }

  // おうえん済みのボタンを「使用済み」の見た目にする
  function markCheerUsed(button) {
    button.classList.add("is-used");
    button.setAttribute("aria-disabled", "true");
  }

  function cheer(button) {

    if (hasCheered()) {
      showReactionMessage(REACTION_MESSAGES.cheerAgain);
      return;
    }

    saveCheered();
    markCheerUsed(button);
    showReactionMessage(REACTION_MESSAGES.cheer);

  }


  /* ========================================
     5. シェアする
     navigator.share があるとき（主にスマホ）… 共有メニューを開く
     ないとき（主にPC）                    … URLをクリップボードにコピー
  ======================================== */

  async function share() {

    const url = location.href;

    if (navigator.share) {

      try {
        await navigator.share({ title: document.title, url: url });
        showReactionMessage(REACTION_MESSAGES.shareDone);
      } catch (error) {
        // 共有メニューを自分で閉じたとき（AbortError）は何も言わない
        if (error.name !== "AbortError") {
          await copyUrl(url);
        }
      }

      return;

    }

    await copyUrl(url);

  }

  async function copyUrl(url) {

    try {
      await navigator.clipboard.writeText(url);
      showReactionMessage(REACTION_MESSAGES.copyDone);
    } catch (error) {
      // file:// で開いているときなどはコピーできないので、URLを見せて手でコピーしてもらう
      showReactionMessage(REACTION_MESSAGES.copyFailed + url);
    }

  }


  /* ========================================
     6. つぎの ぼうけんへ
     今のページが順番の何番目かを調べて、その次のページへ移動する。
     移動のときは、ほかのリンクと同じ「暗転」を使う（script.js の .page-transition）。
  ======================================== */

  function getNextPage() {

    const currentFile = location.pathname.split("/").pop() || REACTION_TITLE_PAGE;
    const index = REACTION_PAGE_ORDER.indexOf(currentFile);

    // 最後のページ（または一覧にないページ）の次はタイトル画面
    if (index === -1 || index === REACTION_PAGE_ORDER.length - 1) {
      return REACTION_TITLE_PAGE;
    }

    return REACTION_PAGE_ORDER[index + 1];

  }

  function goNextPage() {

    const nextPage = getNextPage();
    const curtain = document.querySelector(".page-transition");

    if (!curtain) {
      window.location.href = nextPage;
      return;
    }

    curtain.classList.add("active");

    setTimeout(() => {
      window.location.href = nextPage;
    }, 600);

  }


  /* ========================================
     7. スタート
     （コマンドウィンドウがないページで読み込まれても何もしない）
  ======================================== */

  if (reactionWindow) {

    const cheerButton =
      reactionWindow.querySelector('[data-reaction-type="cheer"]');

    // すでにおうえん済みなら、最初から「使用済み」の見た目にしておく
    if (cheerButton && hasCheered()) {
      markCheerUsed(cheerButton);
    }

    const actions = {
      cheer: cheer,
      share: share,
      next_page: goNextPage
    };

    reactionWindow
      .querySelectorAll("[data-reaction-type]")
      .forEach((button) => {

        button.addEventListener("click", () => {

          const action = actions[button.dataset.reactionType];

          if (action) {
            action(button);
          }

        });

      });

  }

}
