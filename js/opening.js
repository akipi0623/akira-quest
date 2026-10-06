/* ========================================
   オープニング演出（index.html 専用）

   【流れ】
     STEP 1 「がめんを クリックして スタート」
        ↓ クリック（またはEnter）
        ・効果音「ピコーン♪」を鳴らす
        ・スタート画面をフェードアウト → 「ぼうけんのしょ」をフェードイン
     STEP 2 「ぼうけんのしょ」
        ↓ 「MY STORY」を選ぶ（クリック または ↑↓キー＋Enter）
        ・決定音を鳴らす
        ・オープニング全体をフェードアウト → 本編をフェードイン
     STEP 3 本編（トップページ）

   【音について（ブラウザの「自動再生制限」）】
   ブラウザは、ユーザーが一度もクリックやキー操作をしていないページで
   勝手に音が鳴らないようにしています（Autoplay Policy）。
   そのため STEP 1 で必ず「クリック」してもらい、
   そのクリックの処理の中で、音を鳴らす準備（AudioContext の作成）と再生をしています。
======================================== */


/* ========================================
   1. 設定
======================================== */

// 「ピコーン♪」に使う音声ファイル（index.html から見た場所）
// ※ ファイルが無くても止まらず、代わりにJSで作った音を鳴らします
const OPENING_START_SOUND = "audio/start.mp3";

// 「オープニングを見た」ことを覚えておくための名前（index.html の <head> と同じにする）
const OPENING_STORAGE_KEY = "akiraQuestOpeningDone";


/* ========================================
   2. 要素の取得と状態
======================================== */

const opening = document.getElementById("opening");
const openingStartButton = document.getElementById("opening-start");
const openingMenuItems = document.querySelectorAll(".opening-menu__item");

const openingState = {
  step: "start",       // 今の画面：start → loading → save → leaving
  selectedIndex: 0     // 「ぼうけんのしょ」で選んでいる項目の番号
};


// 指定したミリ秒だけ待つ（await openingWait(500) で「0.5秒待つ」）
function openingWait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}


// 今の画面を切り替える。
// data-step の値を変えるだけで、CSS 側で表示/非表示（フェード）が切り替わる
function setOpeningStep(step) {
  openingState.step = step;
  opening.dataset.step = step; // HTMLの data-step="..." が書き換わる
}


/* ========================================
   3. 効果音

   Web Audio API … ブラウザの中で音を作ったり鳴らしたりできる仕組み。
   AudioContext は「音を鳴らすための装置」のようなもの。
   この装置は、ユーザーがクリックした「その瞬間の処理の中」で作る・動かすのがポイント。
   （クリックと関係ないタイミングで作ると、ブラウザに止められて音が出ない）
======================================== */

let openingAudioContext = null;


// クリックの処理の中で呼んで、音を鳴らせる状態にしておく
function unlockOpeningAudio() {

  try {

    if (!openingAudioContext) {
      // 古いSafariでは名前が webkitAudioContext なので、両方に対応する
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      openingAudioContext = new AudioContextClass();
    }

    // 「一時停止中（suspended）」になっていたら、動かし始める
    if (openingAudioContext.state === "suspended") {
      openingAudioContext.resume();
    }

  } catch (error) {
    // 音が使えない環境でも、オープニング自体は止めずに進める
    console.warn("[AKIRA QUEST] 効果音を準備できませんでした:", error);
  }

}


// 短い「ピッ」という音を1つ鳴らす
//   frequency … 音の高さ（Hz）  duration … 長さ（秒）  delay … 何秒後に鳴らすか
function playOpeningTone(frequency, duration, delay, volume) {

  if (!openingAudioContext) {
    return;
  }

  const context = openingAudioContext;
  const startTime = context.currentTime + (delay || 0);

  const oscillator = context.createOscillator(); // 音のもと
  const gain = context.createGain();             // 音量のつまみ

  oscillator.type = "square";             // 矩形波 ＝ 昔のゲーム機のような「ピコピコ」音
  oscillator.frequency.value = frequency;

  // 鳴らした瞬間の音量から、だんだん小さくして消す（余韻）
  gain.gain.setValueAtTime(volume || 0.06, startTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  oscillator.connect(gain);
  gain.connect(context.destination);      // スピーカーへつなぐ

  oscillator.start(startTime);
  oscillator.stop(startTime + duration);

}


// 音声ファイルが無いときの代わりの「ピコーン♪」（オリジナルの2音）
function playOpeningStartSynth() {
  playOpeningTone(988, 0.09);          // ピ
  playOpeningTone(1319, 0.5, 0.09);    // コーン♪
}


// スタート音を鳴らす：まず mp3 を試し、だめなら代わりの音を鳴らす
function playOpeningStartSound() {

  try {

    const audio = new Audio(OPENING_START_SOUND);
    audio.volume = 0.7;

    // audio.play() は「再生できたか」を後から教えてくれる Promise を返す。
    // ファイルが無い・再生を止められた、などの場合は catch の中に来る
    const playPromise = audio.play();

    if (playPromise && playPromise.catch) {
      playPromise.catch((error) => {
        // エラーで止めず、ログに残して代わりの音を鳴らすだけにする
        console.info(
          "[AKIRA QUEST] " + OPENING_START_SOUND + " を再生できませんでした（" +
          error.name + "）。代わりの効果音を鳴らします。"
        );
        playOpeningStartSynth();
      });
    }

  } catch (error) {
    console.info("[AKIRA QUEST] 音声ファイルが使えないため、代わりの効果音を鳴らします。", error);
    playOpeningStartSynth();
  }

}

// カーソル移動の「ピッ」
function playOpeningCursorSound() {
  playOpeningTone(1320, 0.04, 0, 0.04);
}

// 決定の「ピロッ」
function playOpeningDecideSound() {
  playOpeningTone(880, 0.06);
  playOpeningTone(1760, 0.12, 0.06);
}


/* ========================================
   4. STEP 1 → STEP 2
======================================== */

async function handleOpeningStart() {

  // すでにスタート済みなら何もしない（連打対策）
  if (openingState.step !== "start") {
    return;
  }


  // ★ ここが自動再生制限への対策 ★
  // 「クリックされた瞬間の処理の中」で音の装置を動かし、音を鳴らす
  unlockOpeningAudio();
  playOpeningStartSound();


  // スタート画面をフェードアウト（どの画面も出さない「暗転」状態にする）
  setOpeningStep("loading");
  await openingWait(800);

  // 「ぼうけんのしょ」をフェードイン
  setOpeningStep("save");
  selectOpeningItem(0, false);

}


/* ========================================
   5. STEP 2「ぼうけんのしょ」の操作
======================================== */

// 指定した番号の項目にカーソル（▶）を合わせる
function selectOpeningItem(index, withSound) {

  // 一番下で↓を押したら一番上へ、一番上で↑を押したら一番下へ（ぐるっと回る）
  const count = openingMenuItems.length;
  const nextIndex = (index + count) % count;

  if (withSound && nextIndex !== openingState.selectedIndex) {
    playOpeningCursorSound();
  }

  openingState.selectedIndex = nextIndex;

  openingMenuItems.forEach((item, itemIndex) => {
    item.classList.toggle("is-selected", itemIndex === nextIndex);
  });

  // キーボード操作（Enter）がその項目に効くように、フォーカスも移す
  openingMenuItems[nextIndex].focus();

}


// 項目を決定したときの処理
async function chooseOpeningItem(item) {

  if (openingState.step !== "save") {
    return;
  }

  setOpeningStep("leaving");
  playOpeningDecideSound();
  item.classList.add("is-chosen"); // カーソルを速く点滅させる（CSS）

  // 「このタブではオープニングを見た」と覚えておく（次からはすぐ本編）
  try {
    sessionStorage.setItem(OPENING_STORAGE_KEY, "1");
  } catch (error) {
    // 保存できない環境でも、そのまま進める
  }

  await openingWait(500);


  // オープニング全体をフェードアウト（CSS の .is-opening-out）
  document.documentElement.classList.add("is-opening-out");
  await openingWait(800);


  // HISTORY などを選んだときは、そのページへ移動する
  const href = item.dataset.href;

  if (href) {
    window.location.href = href;
    return;
  }


  // MY STORY を選んだときは、オープニングを片付けて本編を表示する。
  // is-opening を外すと、CSS の transition で本編がフェードインする
  document.documentElement.classList.remove("is-opening", "is-opening-out");

}


/* ========================================
   6. スタート
   （<head> のスクリプトがオープニングを出すと決めたときだけ動かす）
======================================== */

if (opening && document.documentElement.classList.contains("is-opening")) {

  // STEP 1：画面クリック（またはEnter・スペースキー）でスタート
  // ※ <button> なので、キーボードの Enter / スペースでも click が発生する
  openingStartButton.addEventListener("click", handleOpeningStart);

  // 最初からスタートボタンにフォーカスを当てておき、Enter だけで始められるようにする
  openingStartButton.focus({ preventScroll: true });


  // STEP 2：各項目の操作
  openingMenuItems.forEach((item, index) => {

    // マウスを乗せたら、その項目にカーソルを合わせる
    item.addEventListener("mouseenter", () => {
      if (openingState.step === "save") {
        selectOpeningItem(index, true);
      }
    });

    // クリック（またはEnter）で決定
    item.addEventListener("click", () => {
      chooseOpeningItem(item);
    });

  });


  // ↑↓キーでカーソルを動かす
  document.addEventListener("keydown", (event) => {

    if (openingState.step !== "save") {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault(); // 画面がスクロールしないようにする
      selectOpeningItem(openingState.selectedIndex + 1, true);
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      selectOpeningItem(openingState.selectedIndex - 1, true);
    }

  });

}


// 「戻る」ボタンで、別のページから戻ってきたときの対策。
// ブラウザは、オープニングがフェードアウトした途中の状態でページを復元することがあり、
// そのままだと画面が真っ暗になってしまう。すでにオープニングを見ていれば、本編を表示する
window.addEventListener("pageshow", (event) => {

  if (!event.persisted) {
    return; // 普通に読み込んだときは何もしない
  }

  let alreadySeen = false;

  try {
    alreadySeen = Boolean(sessionStorage.getItem(OPENING_STORAGE_KEY));
  } catch (error) {
    alreadySeen = false;
  }

  if (alreadySeen) {
    document.documentElement.classList.remove("is-opening", "is-opening-out");
  }

});
