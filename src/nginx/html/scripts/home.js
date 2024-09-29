container = document.getElementById("container");
recentMatchHistoryContainer = document.getElementById("recentMatchHistoryContainer");
playBtn = document.getElementById("playBtn");

{
	inputSearchUser.style.setProperty("display", "block");
	dropDownUserContainer.style.setProperty("display", "flex");
	homeBtn.style.setProperty("display", "none");
		
	fetch('/api/user/current', {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
		credentials: 'include'
	})
	.then(response => {
		if (!response.ok) {
			history.replaceState("", "", `https://${hostname.host}/login`);
		}
		else{
			response.json().then(currentUser => {
				matches = currentUser.matches;
				if (Object.keys(matches).length == 0){
					var message = document.createElement("a");
					recentMatchHistoryContainer.style.setProperty("background", "var(--input-bg-rgb)");
					recentMatchHistoryContainer.style.setProperty("align-items", "center");
					message.style.setProperty("color", "var(--main-text-rgb)");	
					message.style.setProperty("width", "100vw");
					message.innerText = "You have not played any match today";
					recentMatchHistoryContainer.appendChild(message);
				}
				else{
					recentMatchHistoryContainer.innerHTML = "";
					for (var i=0; i<Object.keys(matches).length && i<5;i++)
						createMatchResumeContainer(matches[i]);
				}
				matchUsersName = document.querySelectorAll(".resultScoreName")
				Object.keys(matchUsersName).forEach(function(key){
					matchUsersName[key].addEventListener("click", (e) => {
						history.pushState("", "", `https://${hostname.host}/user/${matchUsersName[key].innerHTML}`);
					})
				})
			})
		}
	})
}

playBtn.addEventListener("click", (e) => {
	history.pushState("", "", `https://${hostname.host}/game`);
})
