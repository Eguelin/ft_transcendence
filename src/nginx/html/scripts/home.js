container = document.getElementById("container");
recentMatchHistoryContainer = document.getElementById("recentMatchHistoryContainer");
playBtn = document.getElementById("playBtn");

{
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
				recentMatchHistoryContainer.innerHTML = "";
				for (var i=0; i<Object.keys(matches).length && i<5;i++){
					createMatchResumeContainer(matches[i]);
				};
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
