/* ========================================
   SCROLL REVEAL
======================================== */

const revealElements =
  document.querySelectorAll(".reveal");


const observer =
  new IntersectionObserver(

    (entries) => {

      entries.forEach((entry) => {

        if (entry.isIntersecting) {

          entry.target.classList.add("active");

          observer.unobserve(entry.target);

        }

      });

    },

    {
      threshold: 0.15
    }

  );


revealElements.forEach((element) => {

  observer.observe(element);

});


/* ========================================
   HAMBURGER MENU（スマホ用）
======================================== */

const menuToggle =
  document.querySelector(".menu-toggle");


// メニューを開く(true) / 閉じる(false)
function setMenuOpen(isOpen) {

  // body に menu-open を付け外しすると、CSSでメニューが表示・非表示になる
  document.body.classList.toggle("menu-open", isOpen);

  if (menuToggle) {

    menuToggle.setAttribute("aria-expanded", String(isOpen));

    menuToggle.setAttribute(
      "aria-label",
      isOpen ? "メニューを閉じる" : "メニューを開く"
    );

  }

}


if (menuToggle) {

  menuToggle.addEventListener("click", () => {

    const isOpen =
      document.body.classList.contains("menu-open");

    setMenuOpen(!isOpen);

  });

}


// Escキーでメニューを閉じる
document.addEventListener("keydown", (event) => {

  if (event.key === "Escape") {
    setMenuOpen(false);
  }

});


// 画面をPCサイズに広げたら、開きっぱなしのメニューを閉じる
window
  .matchMedia("(min-width: 769px)")
  .addEventListener("change", (event) => {

    if (event.matches) {
      setMenuOpen(false);
    }

  });


/* ========================================
   QUIZ
======================================== */

// 問題のデータ（ここを書き換えれば問題を変えられます）
// answer は正解の番号：0 = A、1 = B
const quizData = [

  {
    question: "旅行するなら、どっち？",
    options: ["予定をしっかり決める", "現地で決める"],
    answer: 1,
    comment: "僕は、予定よりもその場で起こる偶然を楽しむタイプです。"
  },

  {
    question: "失敗したとき、まずどうする？",
    options: ["原因を考えて次に活かす", "すぐに忘れて切り替える"],
    answer: 0,
    comment: "失敗も「次につながる経験」だと考えるようにしています。"
  },

  {
    question: "大切にしている考え方は？",
    options: ["準備が9割", "やってみないと分からない"],
    answer: 1,
    comment: "新しいことは、まずやってみる。それが僕のモットーです。"
  }

];


const quizProgress = document.getElementById("quiz-progress");
const quizQuestion = document.getElementById("quiz-question");
const quizOptions = document.getElementById("quiz-options");
const quizResult = document.getElementById("quiz-result");
const quizNext = document.getElementById("quiz-next");

let currentQuestion = 0; // 今何問目か（0から数える）
let score = 0;           // 正解した数


// 数字を2けたにする（1 → "01"）
function toTwoDigits(number) {
  return String(number).padStart(2, "0");
}


// 今の問題を表示する
function showQuestion() {

  const quiz = quizData[currentQuestion];

  quizProgress.textContent =
    "QUESTION " +
    toTwoDigits(currentQuestion + 1) +
    " / " +
    toTwoDigits(quizData.length);

  quizQuestion.textContent = quiz.question;

  quizResult.textContent = "";

  quizNext.hidden = true;


  // 選択肢ボタンを作り直す
  quizOptions.innerHTML = "";

  quiz.options.forEach((optionText, index) => {

    const button = document.createElement("button");

    button.type = "button";
    button.className = "quiz-option";
    button.textContent = ["A", "B"][index] + " / " + optionText;

    button.addEventListener("click", () => {
      answerQuiz(index);
    });

    quizOptions.appendChild(button);

  });

}


// 選択肢を選んだときの処理
function answerQuiz(selectedIndex) {

  const quiz = quizData[currentQuestion];

  const buttons =
    quizOptions.querySelectorAll(".quiz-option");


  // ボタンを押せなくして、正解・不正解の色を付ける
  buttons.forEach((button, index) => {

    button.disabled = true;

    if (index === quiz.answer) {
      button.classList.add("is-correct");
    } else if (index === selectedIndex) {
      button.classList.add("is-wrong");
    }

  });


  if (selectedIndex === quiz.answer) {

    score++;

    quizResult.textContent = "正解！" + quiz.comment;

  } else {

    quizResult.textContent = "惜しい！" + quiz.comment;

  }


  // 最後の問題なら「結果を見る」、それ以外は「次の問題へ」
  const isLast = currentQuestion === quizData.length - 1;

  quizNext.textContent =
    isLast ? "SEE RESULT →" : "NEXT QUESTION →";

  quizNext.hidden = false;

}


// 全問終わったときの結果を表示する
function showFinalResult() {

  quizProgress.textContent = "RESULT";

  quizQuestion.textContent =
    quizData.length + "問中 " + score + "問 正解！";

  quizOptions.innerHTML = "";


  if (score === quizData.length) {
    quizResult.textContent = "全問正解！もう僕のことはバッチリですね。";
  } else if (score > 0) {
    quizResult.textContent = "なかなかです！少しずつ僕のことを知ってもらえたらうれしいです。";
  } else {
    quizResult.textContent = "全部ハズレ…！でも、ここから知ってもらえたらうれしいです。";
  }


  quizNext.textContent = "TRY AGAIN →";

  quizNext.hidden = false;

}


// クイズがあるページ（quiz.html）でだけ動かす
if (quizQuestion) {

  quizNext.addEventListener("click", () => {

    // 結果画面で押されたら、最初からやり直す
    if (currentQuestion >= quizData.length) {

      currentQuestion = 0;
      score = 0;
      showQuestion();
      return;

    }


    currentQuestion++;

    if (currentQuestion < quizData.length) {
      showQuestion();
    } else {
      showFinalResult();
    }

  });


  showQuestion();

}


/* ========================================
   PAGE TRANSITION
======================================== */

const transition =
  document.querySelector(".page-transition");


const links =
  document.querySelectorAll("a");


links.forEach((link) => {

  link.addEventListener(
    "click",
    (event) => {

      const href =
        link.getAttribute("href");


      if (
        !href ||
        href.startsWith("#") ||
        href.startsWith("http") ||
        href.startsWith("mailto:")
      ) {
        return;
      }


      event.preventDefault();


      transition.classList.add("active");


      setTimeout(() => {

        window.location.href = href;

      }, 600);

    }
  );

});


// ページが表示されるたびに（「戻る」で戻ってきたときも）黒い幕とメニューを閉じる
// ※ブラウザは「戻る」のとき、幕が閉じたままの状態でページを復元することがあるため
window.addEventListener("pageshow", () => {

  transition.classList.remove("active");

  setMenuOpen(false);

});
