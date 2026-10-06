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
