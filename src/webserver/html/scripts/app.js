container = document.getElementById("container");
homeBtn = document.getElementById("goHomeButton");
swichTheme = document.getElementById("themeButton");
var currentPage = "";
var currentLang = "lang/EN_US.json"

window.navigation.addEventListener("navigate", (e) => {
	const url = new URL(e.destination.url);

	if (url.pathname.startsWith("/user")){
		e.intercept({
			async handler() {
				var splitPath = url.pathname.split('/');
				fetch('/api/user/get', {
					method: 'POST', //GET forbid the use of body :(
					headers: {'Content-Type': 'application/json',},
					body: JSON.stringify({"name" : splitPath[2]}),
					credentials: 'include'
				}).then(user => {
					user.json().then(((user) => {
						fetch('bodyLess/profile.html').then((response) => {
							response.text().then(response => {
								container.innerHTML = response;
								document.getElementById("script").remove();
								var s = document.createElement("script");
								s.setAttribute('id', 'script');
								s.setAttribute('src', `scripts/profile.js`);
								document.body.appendChild(s);
								currentPage = "profile";
								loadCurrentLang(currentPage);
								homeBtn.style.setProperty("display", "block");
								document.getElementById("profileName").innerHTML = user.display;
								document.getElementById("profilePfp").style.setProperty("display", "block");
								document.getElementById("profilePfp").innerHTML = "";
								if (user.pfp != ""){
									var rawPfp = user.pfp;
									if (rawPfp.startsWith('https://'))
										document.getElementById("profilePfp").setAttribute("src", `${rawPfp}`);
									else
										document.getElementById("profilePfp").setAttribute("src", `data:image/jpg;base64,${rawPfp}`);
								}
								else
									document.getElementById("profilePfp").style.setProperty("display", "none");
								recentMatchHistoryContainer = document.getElementById("recentMatchHistoryContainer");
								for (var i=0; i<Object.keys(user.matches).length && i<5;i++){
									createMatchResumeContainer(user.matches[i]);
								};
							})
						})
					}))
				})
			}
		})
	}
})

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
			fetch ('bodyLess/home.html').then((response) => {
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
					s.setAttribute('src', `scripts/home.js`);
					document.body.appendChild(s);
					currentPage = "home";
					currentLang = response.lang;
					loadCurrentLang();
					state = JSON.stringify({"html": document.body.innerHTML, "currentPage": currentPage, "currentLang": currentLang});

					history.replaceState(state, "");
				}))
			});	

		});
		fetch('/api/user/update', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({"is_active": true}),
			credentials: 'include'
		})
	}
	else {
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
				loadCurrentLang();
				state = JSON.stringify({"html": document.body.innerHTML, "currentPage": currentPage, "currentLang": currentLang});

				history.replaceState(state, "");
			}))
		});
	}
	return (null);
})
.catch(error => {
	console.error('There was a problem with the fetch operation:', error);
	return (null);
});

window.addEventListener("beforeunload", (e) => {
	fetch('/api/user/update', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({"is_active": false}),
		credentials: 'include'
	})
})

homeBtn.addEventListener("click", (e) => {
	fetch ('bodyLess/home.html').then((response) => {
		return (response.text().then(response => {
			state = JSON.stringify({"html": document.body.innerHTML, "currentPage": currentPage, "currentLang": currentLang});

			if (container.innerHTML != "")
				history.pushState(state, "", "https://localhost:49300");
			else
				history.replaceState(state,"", "https://localhost:49300");
			container.innerHTML = response;
			document.getElementById("script").remove();
			var s = document.createElement("script");
			s.setAttribute('id', 'script');
			s.setAttribute('src', `scripts/home.js`);
			currentPage = "home";
			loadCurrentLang();
			document.body.appendChild(s);
			homeBtn.style.setProperty("display", "none");
		}))
	});	
})

homeBtn.addEventListener("keydown", (e) => {
	if (e.key == "Enter")
		homeBtn.click();
})

function switchTheme(darkTheme){
	if (darkTheme == 1 || darkTheme == true){
		document.documentElement.style.setProperty("--page-bg-rgb", "#110026");
		document.documentElement.style.setProperty("--main-text-rgb", "#FDFDFB");
		document.documentElement.style.setProperty("--hover-text-rgb", "#3A3053");
		document.documentElement.style.setProperty("--option-hover-text-rgb", "#110026");
		document.documentElement.style.setProperty("--option-text-rgb", "#FDFDFB");
		document.documentElement.style.setProperty("--input-bg-rgb", "#3A3053");
		document.documentElement.style.setProperty("--is-dark-theme", 1);
		if (document.getElementById("themeButton"))
			document.getElementById("themeButton").style.maskImage = "url(\"svg/button-night-mode.svg\")";
	}
	else{
		document.documentElement.style.setProperty("--page-bg-rgb", "#FDFDFB");
		document.documentElement.style.setProperty("--main-text-rgb", "#110026");
		document.documentElement.style.setProperty("--hover-text-rgb", "#FFDBDE");
		document.documentElement.style.setProperty("--option-hover-text-rgb", "#110026");
		document.documentElement.style.setProperty("--option-text-rgb", "#FDFDFB");
		document.documentElement.style.setProperty("--input-bg-rgb", "#FFDBDE");
		if (document.getElementById("themeButton"))
			document.getElementById("themeButton").style.maskImage = "url(\"svg/button-light-mode.svg\")";
		document.documentElement.style.setProperty("--is-dark-theme", 0);
	}
}

window.addEventListener("popstate", (event) => {
	if (event.state){
		var obj = JSON.parse(event.state);
		document.body.innerHTML = obj['html'];
		currentPage = obj['currentPage'];

		document.getElementById("script").remove();
		var s = document.createElement("script");
		s.setAttribute('id', 'script');
		s.setAttribute('src', `scripts/${currentPage}.js`);
		document.body.appendChild(s);
		currentLang = obj['currentLang'];
		loadCurrentLang();
	}
	fetch('/api/user/current', {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
		credentials: 'include'
	})
	.then(response => {
		if (!response.ok) {
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
					currentLang = "lang/EN_US.json";
					currentPage = "login";
					loadCurrentLang();
					state = JSON.stringify({"html": document.body.innerHTML, "currentPage": currentPage, "currentLang": currentLang});

					history.replaceState(state, "");
				}))
			});
		}
		else{
			fetch('/api/user/update', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({"is_active": true}),
				credentials: 'include'
			})
		}
	})
});

function loadCurrentLang(){ //just for better readability before prod, don't care about efficiency
	if (currentLang != undefined){
		fetch(currentLang).then(response => {
			if (response.ok){
				response.json().then((text) => {
					content = text[currentPage];
					if (content != null || content != undefined){
						Object.keys(content).forEach(function(key) {
							if (key.startsWith('input'))
								document.getElementById(key).placeholder = content[key];
							else
								document.getElementById(key).innerHTML = content[key];
						});
					}
				})
			}
			else{
				fetch("lang/EN_US.json").then(response => {
					response.json().then((text) => {
						content = text[currentPage];
						if (content != null || content != undefined){
							Object.keys(content).forEach(function(key) {
								if (key.startsWith('input'))
									document.getElementById(key).placeholder = content[key];
								else
									document.getElementById(key).innerHTML = content[key];
							});
						}
					})
				})
			}
		})
	}
	else{
		fetch("lang/EN_US.json").then(response => {
			response.json().then((text) => {
				content = text[currentPage];
				if (content != null || content != undefined){
					Object.keys(content).forEach(function(key) {
						if (key.startsWith('input'))
							document.getElementById(key).placeholder = content[key];
						else
							document.getElementById(key).innerHTML = content[key];
					});
				}
			})
		})
	}
}

swichTheme.addEventListener("click", () => {
	var theme = window.getComputedStyle(document.documentElement).getPropertyValue("--is-dark-theme") == 1 ? false : true;
	const data = {is_dark_theme: theme};
	fetch('/api/user/update', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
		credentials: 'include'
	})
	switchTheme(theme);
	swichTheme.blur();
})

swichTheme.addEventListener("keydown", (e) => {
	if (e.key == "Enter"){
		swichTheme.click();
		swichTheme.focus();
	}
})

window.addEventListener("keydown", (e) => {
	if (currentPage == "friends"){
		if (e.key == "ArrowLeft" || e.key == "ArrowRight"){
			friendSlides[friendSlideIdx].className = "friendSlide";
			slideSelector[friendSlideIdx].className = "slideSelector";
			if (e.key == "ArrowLeft")
				friendSlideIdx -= 1;
			else
				friendSlideIdx += 1;
			if (friendSlideIdx > friendSlides.length - 1) 
				friendSlideIdx = 0;
			if (friendSlideIdx < 0) 
				friendSlideIdx = friendSlides.length - 1;
			friendSlides[friendSlideIdx].className = `${friendSlides[friendSlideIdx].className} activeSlide`
			slideSelector[friendSlideIdx].className = `${slideSelector[friendSlideIdx].className} activeSelector`		
		}
	}
	if (currentPage == "settings"){
		if (e.key == "ArrowLeft" || e.key == "ArrowRight"){
			if (e.key == "ArrowLeft")
				slideIdx -= 1;
			else
				slideIdx += 1;
			if (slideIdx > settingsSlides.length - 1) 
				slideIdx = 0;
			if (slideIdx < 0) 
				slideIdx = settingsSlides.length - 1;
			for (let i = 0; i < settingsSlides.length; i++)
				settingsSlides[i].style.display = "none";
			settingsSlides[slideIdx].style.display = "block";
		}
	}
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
