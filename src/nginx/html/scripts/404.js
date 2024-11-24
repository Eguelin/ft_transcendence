var template = `
<div id="pageContentContainer">
    <h2 id="NotFoundtitle">Ho no, this page does not exist :(</h2>
	<button id="NotFoundBtn" tabindex="12">HOME</button>
</div>
`

{
	document.getElementById("container").innerHTML = template;

	homeBtn404 = document.getElementById("NotFoundBtn");

	homeBtn404.addEventListener("click", (e) => {
		myPushState(`https://${hostname.host}/${currentLang}/home`);
	})
	homeBtn404.focus();
	inputSearchUserContainer.style.setProperty("display", "none");
	dropDownUserContainer.style.setProperty("display", "flex");
	homeBtn.style.setProperty("display", "none");
	notifCenterContainer.style.setProperty("display", "none");
}
