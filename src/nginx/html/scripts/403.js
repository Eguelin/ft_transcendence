homeBtn403 = document.getElementById("403_homeBtn");

homeBtn403.addEventListener("click", (e) => {
	history.pushState("", "", `https://${hostname.host}/home`);
})

{
	inputSearchUser.style.setProperty("display", "none");
	dropDownUserContainer.style.setProperty("display", "flex");
	homeBtn.style.setProperty("display", "none");
}
