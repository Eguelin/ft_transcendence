homeBtn403 = document.getElementById("ForbidenBtn");

homeBtn403.addEventListener("click", (e) => {
	myPushState(`https://${hostname.host}/home`);
})

{
	homeBtn403.focus();
	inputSearchUserContainer.style.setProperty("display", "none");
	dropDownUserContainer.style.setProperty("display", "flex");
	homeBtn.style.setProperty("display", "none");
	notifCenterContainer.style.setProperty("display", "none");
}
