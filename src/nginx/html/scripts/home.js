var playBtn;

var template = `
<div id="pageContentContainer" class="home">
	<div id="homeButtonsContainer">
		<a id="playBtn1v1" href="https://${hostname.host}/game?mode=remote" tabindex="12">Play</a>
		<a id="playBtnLocal" href="https://${hostname.host}/game?mode=local" tabindex="13">Play</a>
		<a id="playBtnAI" href="https://${hostname.host}/game?mode=ai" tabindex="14">Play</a>
		<a id="playTournament" href="https://${hostname.host}/game?mode=tournament" tabindex="15">Play</a>
	</div>
    <div id="recentMatchHistoryContainer" tabindex="16" aria-label="User today's matches">
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

	if (client){
		recentMatchHistoryContainer = document.getElementById("recentMatchHistory");
		( async() => {
			try {
				const fetchResult = await fetch('/api/user/current', {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
					},
					credentials: 'include'
				})
				const result = await fetchResult.json();
				if (fetchResult.ok) {
				
					var startDate = new Date();
					client.recentMatches = result.matches[startDate.getFullYear()][startDate.getMonth() + 1][startDate.getDate()];
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
						recentMatchHistoryContainer.innerHTML = "";
						for (var i=0; i<Object.keys(client.recentMatches).length && i<5;i++){
							recentMatchHistoryContainer.appendChild(createMatchResumeContainer(client.recentMatches[i], client.username));
						}
						checkMatchResumeSize();
						var tabIdx = 17;
						var container = document.getElementById("recentMatchHistoryContainer");
						container.addEventListener("keydown", (e) => {
							if (e.key == "Enter"){
								document.querySelectorAll(".matchDescContainer").forEach(function (elem) {
									if (elem.tabIndex <= container.tabIndex){
										elem.tabIndex = tabIdx;
										tabIdx += 1;
									}
								});
								setNotifTabIndexes(tabIdx);
							}
						})
			
					}
					setNotifTabIndexes(tabIdx);
				}
			}
			catch (error){
				console.error(error)
				var template = `
				<div id="pageContentContainer">
					<h2 id="NotFoundtitle">Error while connecting to server :(</h2>
				</div>
				`
				document.getElementById("container").innerHTML = template;
				throw new Error("Error while reaching server");
			}
		})()
	}
	else
		myReplaceState(`https://${hostname.host}/login`);

		
}