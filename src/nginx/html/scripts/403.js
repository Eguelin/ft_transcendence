var template = `
<div id="pageContentContainer">
    <h2 id="ForbidenTitle">You're not supposed to be here >:(</h2>
	<button id="ForbidenBtn" tabindex="12">HOME</button>
</div>
`

{
	document.getElementById("container").innerHTML = template;
	homeBtn403 = document.getElementById("ForbidenBtn");
	homeBtn403.addEventListener("click", (e) => {
		myPushState(`https://${hostname.host}/home`);
	})

	homeBtn403.focus();
	inputSearchUserContainer.style.setProperty("display", "none");
	dropDownUserContainer.style.setProperty("display", "flex");
	homeBtn.style.setProperty("display", "none");
	notifCenterContainer.style.setProperty("display", "none");
}
