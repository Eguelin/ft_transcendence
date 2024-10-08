homeBtn404 = document.getElementById("NotFoundtitle");

homeBtn404.addEventListener("click", (e) => {
	history.pushState("", "", `https://${hostname.host}/home`);
})

{
	inputSearchUser.style.setProperty("display", "none");
	dropDownUserContainer.style.setProperty("display", "flex");
	homeBtn.style.setProperty("display", "none");
}
