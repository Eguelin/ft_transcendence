container = document.getElementById("container");
playBtn = document.getElementById("playBtn");

{
	inputSearchUserContainer.style.setProperty("display", "block");
	document.getElementById("inputSearchUser").focus();
	dropDownUserContainer.style.setProperty("display", "flex");
	homeBtn.style.setProperty("display", "none");
	tabIdx = 13;

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
				recentMatchHistoryContainer.appendChild(createMatchResumeContainer(client.recentMatches[i]));
			}
			document.querySelectorAll(".matchDescContainer").forEach(function (elem) {
				elem.addEventListener("keydown", (e) => {
					if (e.key == "Enter"){
						var idx = elem.tabIndex + 1
						elem.querySelectorAll(".resultScoreName").forEach(function (names){
							names.tabIndex = idx;
							idx++;
						})
					}
				})
			});
			
			document.getElementById("recentMatchHistoryContainer").addEventListener("keydown", (e) => {
				var tabIdx = 14;
				if (e.key == "Enter"){
					document.querySelectorAll(".matchDescContainer").forEach(function (elem) {
						elem.tabIndex = tabIdx;
						tabIdx += 3;
					});
				}
			})
		}
		matchUsersName = document.querySelectorAll(".resultScoreName")
		Object.keys(matchUsersName).forEach(function(key){
			if (!matchUsersName[key].classList.contains("deletedUser")){
				matchUsersName[key].addEventListener("click", (e) => {
					myPushState(`https://${hostname.host}/user/${matchUsersName[key].innerHTML}`);	
				})
				matchUsersName[key].addEventListener("keydown", (e) => {
					if (e.key == "Enter")
						matchUsersName[key].click();
				})
			}
			else{
				matchUsersName[key].innerText = client.langJson["index"][".deletedUser"];
			}
		})
	}
	else
		myReplaceState(`https://${hostname.host}/login`);
}

playBtn.addEventListener("click", (e) => {
	myPushState(`https://${hostname.host}/game`);
})

