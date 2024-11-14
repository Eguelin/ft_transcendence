var playBtn;

var template = `
<div id="pageContentContainer" class="home">
	<div id="homeButtonsContainer">
		<a id="playBtn1v1" href="https://${hostname.host}/game?mode=remote" tabindex="12">Play</a>
		<a id="playBtnLocal" href="https://${hostname.host}/game?mode=local" tabindex="12">Play</a>
		<a id="playBtnAI" href="https://${hostname.host}/game?mode=ai" tabindex="12">Play</a>
		<a id="playTournament" href="https://${hostname.host}/game?mode=tournament" tabindex="13">Play</a>
	</div>
    <div id="recentMatchHistoryContainer" tabindex="14" aria-label="User today's matches">
        <div id="recentMatchHistory">

        </div>
	</div>
</div>
`

{
	document.getElementById("container").innerHTML = template;
	playBtn = document.getElementById("playBtn");

	inputSearchUserContainer.style.setProperty("display", "block");
	document.getElementById("inputSearchUser").focus();
	dropDownUserContainer.style.setProperty("display", "flex");
	homeBtn.style.setProperty("display", "none");
	notifCenterContainer.style.setProperty("display", "flex");
	tabIdx = 14;

	if (client){
		recentMatchHistoryContainer = document.getElementById("recentMatchHistory");
		recentMatchHistoryContainer.innerHTML = "";
		if (Object.keys(client.recentMatches).length == 0){
			var message = document.createElement("a");
			recentMatchHistoryContainer.style.setProperty("background", "var(--input-bg-rgb)");
			recentMatchHistoryContainer.style.setProperty("align-items", "center");
			message.style.setProperty("color", "var(--main-text-rgb)");
			message.style.setProperty("width", "100vw");
			message.id="notPlayedToday";
			message.innerText = client.langJson['home']['#notPlayedToday'];
			recentMatchHistory.appendChild(message);
		}
		else{
			for (var i=0; i<Object.keys(client.recentMatches).length && i<5;i++){
				recentMatchHistoryContainer.appendChild(createMatchResumeContainer(client.recentMatches[i], client.username));
			}
			document.querySelectorAll(".matchDescContainer").forEach(function (elem) {
				elem.addEventListener("keydown", (e) => {
					if (e.key == "Enter"){
						if (elem.querySelector(".tournament")){
							elem.querySelector(".tournament").click()
						}
						else{
							var idx = elem.tabIndex + 1
							elem.querySelectorAll(".resultScoreName").forEach(function (names){
								console.log(`set name idx : ${idx}`);
								names.tabIndex = idx;
								idx++;
							})
							setNotifTabIndexes(idx);
						}
					}
				})
			});

			document.getElementById("recentMatchHistoryContainer").addEventListener("keydown", (e) => {
				if (e.key == "Enter"){
					document.querySelectorAll(".matchDescContainer").forEach(function (elem) {
						if (elem.tabIndex == -1){
							elem.tabIndex = tabIdx;
							tabIdx += 3;
						}
					});
					setNotifTabIndexes(tabIdx);
				}
			})
		}

		for (let i=0; i<5;i++) {sendNotif(`${client.langJson.friends['incoming pending request'].replace("${USERNAME}", `test${i}`)}`, `test${i}`, "friend_request");}	//TODO REMOVE

		setNotifTabIndexes(tabIdx);
	}
	else
		myReplaceState(`https://${hostname.host}/login`);

		
}