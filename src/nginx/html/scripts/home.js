container = document.getElementById("container");
playBtn = document.getElementById("playBtn");

{
	inputSearchUserContainer.style.setProperty("display", "block");
	document.getElementById("inputSearchUser").focus();
	dropDownUserContainer.style.setProperty("display", "flex");
	homeBtn.style.setProperty("display", "none");

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
			recentMatchHistoryContainer.appendChild(message);
		}
		else{
			for (var i=0; i<Object.keys(client.recentMatches).length && i<5;i++)
				createMatchResumeContainer(client.recentMatches[i]);
		}
		matchUsersName = document.querySelectorAll(".resultScoreName")
		Object.keys(matchUsersName).forEach(function(key){
			if (!matchUsersName[key].classList.contains("deletedUser")){
				matchUsersName[key].addEventListener("click", (e) => {
					myPushState(`https://${hostname.host}/user/${matchUsersName[key].innerHTML}`);	
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
