homeBtn404 = document.getElementById("NotFoundBtn");

homeBtn404.addEventListener("click", (e) => {
	myPushState(`https://${hostname.host}/home`);
})

{
	homeBtn404.focus();
	inputSearchUserContainer.style.setProperty("display", "none");
	dropDownUserContainer.style.setProperty("display", "flex");
	homeBtn.style.setProperty("display", "none");
	notifCenterContainer.style.setProperty("display", "none");
}
