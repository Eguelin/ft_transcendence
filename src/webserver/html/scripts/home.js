container = document.getElementById("container");
logOutBtn = document.getElementById('logOutBtn');
swichTheme = document.getElementById("themeButton");
userBtn = document.getElementById("usernameBtn");
dpUserBtn = document.getElementById("dropDownUser");
accSettingsBtn = document.getElementById("settingsBtn");
friendsBtn = document.getElementById("friendsBtn");
recentMatchHistoryContainer = document.getElementById("recentMatchHistoryContainer");

dpUserBtn.addEventListener("click", (e) => {
	document.getElementById("dropDownUser").focus();
})

window.addEventListener("load", () => {
	fetch('/api/user/current', {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
		credentials: 'include'
	})
	.then(response => {
		if (response.ok) {
			(response.json()).then((text) => {
				switchTheme(text.is_dark_theme);
				currentLang = text.lang;
				loadCurrentLang();
				if (text.pfp != ""){
					var rawPfp = text.pfp;
					if (rawPfp.startsWith('https://'))
						document.getElementById("pfp").setAttribute("src", `${rawPfp}`);
					else
						document.getElementById("pfp").setAttribute("src", `data:image/jpg;base64,${rawPfp}`);
				}
				else
					document.getElementById("pfp").style.setProperty("display", "none");
				document.getElementById("usernameBtn").innerHTML = text.display;
				state = JSON.stringify({"html": document.body.innerHTML, "currentPage": currentPage, "currentLang": currentLang});

				history.replaceState(state, "");
			});
		}
		else {
			console.log("Failed to get user")

			fetch ('bodyLess/login.html').then((response) => {
				(response.text().then(response => {
					state = JSON.stringify({"html": document.body.innerHTML, "currentPage": currentPage, "currentLang": currentLang});

					if (container.innerHTML != "")
						history.pushState(state, "");
					else
						history.replaceState(state,"");
					container.innerHTML = response;
					document.getElementById("script").remove();
					var s = document.createElement("script");
					s.setAttribute('id', 'script');
					s.setAttribute('src', `scripts/login.js`);
					document.body.appendChild(s);
					currentPage = "login";
					state = JSON.stringify({"html": document.body.innerHTML, "currentPage": currentPage, "currentLang": currentLang});

					history.replaceState(state, "");
				}))
			});
		}
		return (null);
	})
})

function createMatchResumeContainer(match){
	matchContainer = document.createElement("div");
	matchContainer.className = "matchDescContainer";
	
	result = document.createElement("a");
	result.className = "matchDescContainerResult"
	
	date = document.createElement("a");
	date.className = "matchDescContainerDate"
	date.innerHTML = match.date;
	
	scoreContainer = document.createElement("div");
	scoreContainer.className = "matchDescContainerScore";
	scoreUser = document.createElement("div");
	scoreOpponent = document.createElement("div");
	scoreUser.className = "resultScore";
	scoreOpponent.className = "resultScore";

	scoreUserName = document.createElement("a");
	scoreUserScore = document.createElement("a");

	scoreUserName.className = "resultScoreName";
	scoreUserScore.className = "resultScoreScore";


	scoreOpponentName = document.createElement("a");
	scoreOpponentScore = document.createElement("a");

	scoreOpponentName.className = "resultScoreName";
	scoreOpponentScore.className = "resultScoreScore";

	scoreUserName.innerHTML = `${match.player_one} :`;
	scoreOpponentName.innerHTML = `${match.player_two} :`;
	
	scoreUserScore.innerHTML = `${match.player_one_pts}`;
	scoreOpponentScore.innerHTML = `${match.player_two_pts}`;

	scoreUser.appendChild(scoreUserName);
	scoreUser.appendChild(scoreUserScore);

	scoreOpponent.appendChild(scoreOpponentName);
	scoreOpponent.appendChild(scoreOpponentScore);
	if (match.player_one_pts > match.player_two_pts)
		result.innerHTML = "VICTORY";
	else if (match.player_one_pts < match.player_two_pts)
		result.innerHTML = "LOST";
	else
		result.innerHTML = "DRAW";
	
	scoreContainer.appendChild(scoreUser);
	scoreContainer.appendChild(scoreOpponent);
	
	matchContainer.appendChild(result);
	matchContainer.appendChild(scoreContainer);
	matchContainer.appendChild(date);
	
	recentMatchHistoryContainer.appendChild(matchContainer);
}
					

{
	fetch('/api/user/current', {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
		credentials: 'include'
	})
	.then(response => {
		if (response.ok) {
			(response.json()).then((text) => {
				switchTheme(text.is_dark_theme);
				currentLang = text.lang;
				loadCurrentLang();
				document.getElementById("usernameBtn").innerHTML = text.display;
				document.getElementById("pfp").style.setProperty("display", "block");
				document.getElementById("dropDownUser").style.setProperty("display", "inline-table");
				if (text.pfp != ""){
					var rawPfp = text.pfp;
					if (rawPfp.startsWith('https://'))
						document.getElementById("pfp").setAttribute("src", `${rawPfp}`);
					else
						document.getElementById("pfp").setAttribute("src", `data:image/jpg;base64,${rawPfp}`);
				}
				else
					document.getElementById("pfp").style.setProperty("display", "none");
				matches = text.matches;
				for (var i=0; i<Object.keys(matches).length && i<5;i++){
					createMatchResumeContainer(matches[i]);
				};
				state = JSON.stringify({"html": document.body.innerHTML, "currentPage": currentPage, "currentLang": currentLang});

				history.replaceState(state, "");
			});
		}
		else {
			console.log("Failed to get user")

			fetch ('bodyLess/login.html').then((response) => {
				(response.text().then(response => {
					state = JSON.stringify({"html": document.body.innerHTML, "currentPage": currentPage, "currentLang": currentLang});

					if (container.innerHTML != "")
						history.pushState(state, "");
					else
						history.replaceState(state,"");
					container.innerHTML = response;
					document.getElementById("script").remove();
					var s = document.createElement("script");
					s.setAttribute('id', 'script');
					s.setAttribute('src', `scripts/login.js`);
					document.body.appendChild(s);
					document.getElementById("pfp").style.setProperty("display", "none");
					document.getElementById("dropDownUser").style.setProperty("display", "none");
					currentPage = "login";
					state = JSON.stringify({"html": document.body.innerHTML, "currentPage": currentPage, "currentLang": currentLang});

					history.replaceState(state, "");
				}))
			});
		}
	})
}

logOutBtn.addEventListener("click", (e) => {
	fetch('/api/user/logout', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		credentials: 'include'
	});

	fetch ('bodyLess/login.html').then((response) => {
		return (response.text().then(response => {
			state = JSON.stringify({"html": document.body.innerHTML, "currentPage": currentPage, "currentLang": currentLang});

			if (container.innerHTML != "")
				history.pushState(state, "");
			else
				history.replaceState(state,"");
			container.innerHTML = response;
			document.getElementById("script").remove();
			var s = document.createElement("script");
			s.setAttribute('id', 'script');
			s.setAttribute('src', `scripts/login.js`);
			currentPage = "login";
			loadCurrentLang();
			document.body.appendChild(s);
			document.getElementById("pfp").style.setProperty("display", "none");
			document.getElementById("dropDownUser").style.setProperty("display", "none");
		}))
	});
});

accSettingsBtn.addEventListener("click", (e) => {
	fetch ('bodyLess/settings.html').then((response) => {
		return (response.text().then(response => {
			state = JSON.stringify({"html": document.body.innerHTML, "currentPage": currentPage, "currentLang": currentLang});

			if (container.innerHTML != "")
				history.pushState(state, "");
			else
				history.replaceState(state,"");
			container.innerHTML = response;
			document.getElementById("script").remove();
			var s = document.createElement("script");
			s.setAttribute('id', 'script');
			s.setAttribute('src', `scripts/settings.js`);
			currentPage = "settings";
			loadCurrentLang();
			document.body.appendChild(s);
			document.getElementById("pfp").style.setProperty("display", "none");
			document.getElementById("dropDownUser").style.setProperty("display", "none");
			document.getElementById("goHomeButton").style.setProperty("display", "block");
		}))
	});
})

friendsBtn.addEventListener("click", (e) => {
	fetch ('bodyLess/friends.html').then((response) => {
		return (response.text().then(response => {
			state = JSON.stringify({"html": document.body.innerHTML, "currentPage": currentPage, "currentLang": currentLang});

			if (container.innerHTML != "")
				history.pushState(state, "");
			else
				history.replaceState(state,"");
			container.innerHTML = response;
			document.getElementById("script").remove();
			var s = document.createElement("script");
			s.setAttribute('id', 'script');
			s.setAttribute('src', `scripts/friends.js`);
			currentPage = "friends";
			loadCurrentLang();
			document.body.appendChild(s);
			document.getElementById("pfp").style.setProperty("display", "none");
			document.getElementById("dropDownUser").style.setProperty("display", "none");
			document.getElementById("goHomeButton").style.setProperty("display", "block");
		}))
	});
})
