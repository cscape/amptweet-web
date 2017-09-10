$(".top-bar .account-info > .usercontainer > .name").click(function (e) {
	e.stopPropagation();
	e.preventDefault();
	$(".top-bar .account-options").toggle();
});