container = document.getElementById("container");
recentMatchHistoryContainer = document.getElementById("recentMatchHistoryContainer");
playBtn = document.getElementById("playBtn");

{
	inputSearchUser.style.setProperty("display", "block");
	dropDownUserContainer.style.setProperty("display", "flex");
	homeBtn.style.setProperty("display", "none");

	if (client){
		recentMatchHistoryContainer.innerHTML = "";
		if (Object.keys(client.recentMatches).length == 0){
			var message = document.createElement("a");
			recentMatchHistoryContainer.style.setProperty("background", "var(--input-bg-rgb)");
			recentMatchHistoryContainer.style.setProperty("align-items", "center");
			message.style.setProperty("color", "var(--main-text-rgb)");	
			message.style.setProperty("width", "100vw");
			message.id="notPlayedToday";
			message.innerText = client.langJson['home']['notPlayedToday'];
			recentMatchHistoryContainer.appendChild(message);
		}
		else{
			for (var i=0; i<Object.keys(recentMatches).length && i<5;i++)
				createMatchResumeContainer(recentMatches[i]);
		}
		matchUsersName = document.querySelectorAll(".resultScoreName")
		Object.keys(matchUsersName).forEach(function(key){
			matchUsersName[key].addEventListener("click", (e) => {
				history.pushState("", "", `https://${hostname.host}/user/${matchUsersName[key].innerHTML}`);
			})
		})
	}
	else
		history.replaceState("", "", `https://${hostname.host}/login`);
}

playBtn.addEventListener("click", (e) => {
	history.pushState("", "", `https://${hostname.host}/game`);
})
