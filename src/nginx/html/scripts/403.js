homeBtn403 = document.getElementById("403_homeBtn");

homeBtn403.addEventListener("click", (e) => {
	myPushState(`https://${hostname.host}/home`);
})

{
	inputSearchUserContainer.style.setProperty("display", "none");
	dropDownUserContainer.style.setProperty("display", "flex");
	homeBtn.style.setProperty("display", "none");
}
