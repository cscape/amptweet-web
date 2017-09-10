$(".top-bar .account-info > .usercontainer > .name").click(function (e) {
  e.stopPropagation();
  e.preventDefault();
  let optionsbox = $(".top-bar .account-options");
  let tween = TweenLite.to(optionsbox, 0.75, {
    ease: Expo.easeOut,
    boxShadow: "0px 3px 5px rgba(0, 0, 0, 0.35)",
    top: "3rem",
    opacity: 1
  });

  if (optionsbox.css(display) === "none") {
    tween.play();
  } else {
    tween.reverse();
  }
});