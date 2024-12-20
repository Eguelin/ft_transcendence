var playBtn;

var template = `
<div id="pageContentContainer" class="home">
	<div id="homeButtonsContainer">
		<a id="playBtn1v1" href="https://${hostname.host}/game?mode=remote" tabindex="12">Play 1v1</a>
		<a id="playBtnLocal" href="https://${hostname.host}/game?mode=local" tabindex="13">Play local</a>
		<a id="playBtnAI" href="https://${hostname.host}/game?mode=ai" tabindex="14">Play AI</a>
		<a id="playTournament" href="https://${hostname.host}/game?mode=tournament" tabindex="15">Tournament</a>
		<div class="forms" id="saveDisplayNameContainer">
			<input autoclomplete="off" tabindex="16" type="text" id="inputChangeDisplayName" class="formInput" name="displayName" placeholder="Display name"/>
			<div tabindex="17" id="saveDisplayNameBtn"></div>
		</div>
	</div>
    <div id="recentMatchHistoryContainer" tabindex="18" aria-label="User today's matches">
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
	displayNameInput = document.querySelector("#inputChangeDisplayName")

	history.replaceState("","",`https://${hostname.host}/${currentLang}/home`)
	if (client){
		recentMatchHistoryContainer = document.getElementById("recentMatchHistory");
		displayNameInput.placeholder = client.displayName;
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
					try {
						client.recentMatches = result.matches[startDate.getFullYear()][startDate.getMonth() + 1][startDate.getDate()];
					}
					catch{
						client.recentMatches = {}
					}
					var tabIdx = 19;
					if (Object.keys(client.recentMatches).length == 0){
						if (!document.querySelector("#notPlayedToday")){
							var message = document.createElement("a");
							recentMatchHistoryContainer.style.setProperty("background", "var(--input-bg-rgb)");
							recentMatchHistoryContainer.style.setProperty("align-items", "center");
							recentMatchHistoryContainer.style.setProperty("justify-content", "center");
							message.style.setProperty("color", "var(--main-text-rgb)");
							message.style.setProperty("width", "100vw");
							message.id="notPlayedToday";
							message.innerText = client.langJson['home']['#notPlayedToday'];
							recentMatchHistoryContainer.appendChild(message);
						}
					}
					else{
						recentMatchHistoryContainer.innerHTML = "";
						for (var i=0; i<Object.keys(client.recentMatches).length && i<5;i++){
							recentMatchHistoryContainer.appendChild(createMatchResumeContainer(client.recentMatches[i], client.username, client.displayName));
						}
						var container = document.getElementById("recentMatchHistoryContainer");
						container.addEventListener("keydown", (e) => {
							if (e.key == "Enter"){
								document.querySelectorAll(".matchDescContainer").forEach(function (elem) {
									if (elem.tabIndex <= container.tabIndex){
										elem.tabIndex = tabIdx;
										tabIdx += 1;
									}
								});
							}
						})
					}
					checkMatchResumeSize();
					setNotifTabIndexes(40);
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

		document.querySelector("#saveDisplayNameBtn").onkeydown = function(e){if (e.key == "Enter"){e.target.click();}};
		displayNameInput.onkeydown = function(e){if (e.key == "Enter"){document.querySelector("#saveDisplayNameBtn").click();}};

		document.querySelector("#saveDisplayNameBtn").onclick = function (){
			displayName = displayNameInput.value;

			if (displayNameInput.previousElementSibling)
				displayNameInput.previousElementSibling.remove();

			if (displayName != ""){
					fetch('/api/user/update', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({'display_name': displayName}),
						credentials: 'include'
					}).then(response => {
						if (response.ok){
							if (langJson && langJson['home']['.displayNameUpdated'])
								popUpSuccess(langJson['home']['.displayNameUpdated'])
							else
								popUpSuccess("Display name successfully updated")
						}
						else {
							response.json().then(response => {
								if (errorMap[response.message] && langJson && langJson['home'][errorMap[response.message]]){
									popUpError(langJson['home'][errorMap[response.message]]);
								}
								else{
									popUpError(response.message)
								}
							})
						}
					})
			}
			else{
				if (langJson && langJson['home'][`.displayNameCantBeEmpty`]){
					popUpError(langJson['home'][`.displayNameCantBeEmpty`])
				}
				else{
					popUpError("Display name can't be empty")
				}
			}
		}
	}
	else
		myReplaceState(`https://${hostname.host}/${currentLang}/login#login`);


}
