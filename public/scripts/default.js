$(".top-bar .account-info > .usercontainer > .name").click(function (e) {
  e.stopPropagation();
  e.preventDefault();
  let optionsbox = $(".top-bar .account-options");
  let tween = TweenLite.to(optionsbox, 0.75, {
    ease: Power4.easeOut,
    boxShadow: "0px 3px 5px rgba(0, 0, 0, 0.35)",
    top: "3rem",
    opacity: 1,
    display: "block"
  });

  if (optionsbox.css("display") === "none") {
    optionsbox.show();
    tween.play();
  } else {
    optionsbox.hide();
    tween.reverse();
  }
});