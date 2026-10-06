/* ========================================
   タイトル画面（index.html 専用）

   【流れ】
     タイトル画面「がめんを クリックして スタート」
        ↓ クリック（またはEnter）
        ・効果音「ピコーン♪」を鳴らす
        ・画面全体をフェードアウト（暗転）
        ↓
     最初のページ（PROFILE）へ移動

   【音について（ブラウザの「自動再生制限」）】
   ブラウザは、ユーザーが一度もクリックやキー操作をしていないページで
   勝手に音が鳴らないようにしています（Autoplay Policy）。
   そのため、必ず「クリック」してもらい、
   そのクリックの処理の中で、音を鳴らす準備（AudioContext の作成）と再生をしています。
======================================== */


/* ========================================
   1. 設定
======================================== */

// 「ピコーン♪」に使う音声ファイル（index.html から見た場所）
// ※ ファイルが無くても止まらず、代わりにJSで作った音を鳴らします
const OPENING_START_SOUND = "audio/start.mp3";

// スタートした後に進む、最初のページ
const OPENING_FIRST_PAGE = "profile.html";


/* ========================================
   2. 要素の取得と状態
======================================== */

const opening = document.getElementById("opening");
const openingStartButton = document.getElementById("opening-start");

const openingState = {
  step: "start"  // 今の状態：start（タイトル表示中） → leaving（移動中）
};


// 指定したミリ秒だけ待つ（await openingWait(500) で「0.5秒待つ」）
function openingWait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}


// 状態を切り替える。
// data-step の値を変えるだけで、CSS 側で表示（フェード）が切り替わる
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
    // 音が使えない環境でも、タイトル画面自体は止めずに進める
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


/* ========================================
   4. スタート → 最初のページへ
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


  // 画面全体をフェードアウト（CSS の .opening[data-step="leaving"]）
  setOpeningStep("leaving");

  // 効果音を聞かせつつ、暗転が終わるまで待ってから移動する
  await openingWait(1000);

  window.location.href = OPENING_FIRST_PAGE;

}


/* ========================================
   5. スタート
======================================== */

if (opening) {

  // 画面クリック（またはEnter・スペースキー）でスタート
  // ※ <button> なので、キーボードの Enter / スペースでも click が発生する
  openingStartButton.addEventListener("click", handleOpeningStart);

  // 最初からスタートボタンにフォーカスを当てておき、Enter だけで始められるようにする
  openingStartButton.focus({ preventScroll: true });

}


// 「戻る」ボタンで PROFILE から戻ってきたときの対策。
// ブラウザは、暗転した状態のままページを復元することがあり、
// そのままだと画面が真っ暗になってしまう。タイトル画面の状態に戻す
window.addEventListener("pageshow", (event) => {

  if (event.persisted && opening) {
    setOpeningStep("start");
  }

});
