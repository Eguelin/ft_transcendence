container = document.getElementById("container");
homeBtn = document.getElementById("goHomeButton");
swichTheme = document.getElementById("themeButton");
inputSearchUser = document.getElementById("inputSearchUser");
pageContentContainer = document.getElementById("pageContentContainer");
var currentPage = "";
var currentLang = "lang/EN_US.json"
const hostname = new URL(window.location.href)

window.navigation.addEventListener("navigate", (e) => {
	const url = new URL(e.destination.url);

	e.intercept({
		async handler() {
			fetch('/api/user/current', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include'
			})
			.then(currentUser => {
				if (currentUser.ok) {
					currentUser.json().then((currentUser) => {
						if (url.pathname.startsWith("/user")){
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
						else if (url.pathname.startsWith("/search")){
							fetch('/api/user/search_by_display', {
								method: 'POST', //GET forbid the use of body :(
								headers: {'Content-Type': 'application/json',},
								body: JSON.stringify({"name" : url.searchParams.get("query")}),
								credentials: 'include'
							}).then(user => {
								user.json().then(((user) => {
									fetch('bodyLess/search.html').then((response) => {
										response.text().then(response => {
											container.innerHTML = response;
											document.getElementById("script").remove();
											var s = document.createElement("script");
											s.setAttribute('id', 'script');
											s.setAttribute('src', `scripts/profile.js`);
											document.body.appendChild(s);
											currentPage = "search";
											loadCurrentLang(currentPage);
											homeBtn.style.setProperty("display", "block");
											document.getElementById("userResumeCount").innerHTML = Object.keys(user).length;
											document.getElementById("userResumeSearch").innerHTML = url.searchParams.get("query");
											Object.keys(user).forEach(function(key){
												createUserResumeContainer(user[key]);
											})
											inputSearchUser.value = "";
											userResume = document.querySelectorAll(".userResume");
											for (var i = 0; i< userResume.length; i++){
												userResume[i].addEventListener("click", (e) => {
													var username = e.target.closest(".userResume").id;
													history.pushState(JSON.stringify({"html": document.body.innerHTML, "currentPage": currentPage, "currentLang": currentLang}), "", `https://${hostname.host}/user/${username}`);
												})
											}
										})
									})
								}))
							})
						}
						else if (url.pathname.startsWith("/login")){
							fetch('/api/user/logout', {
								method: 'POST',
								headers: {
									'Content-Type': 'application/json',
								},
								credentials: 'include'
							});
							fetch ('bodyLess/login.html').then((response) => {
								(response.text().then(response => {
									inputSearchUser.style.setProperty("display", "none");
									document.getElementById("pfp").style.setProperty("display", "none");
									document.getElementById("dropDownUser").style.setProperty("display", "none");
									container.innerHTML = response;
									document.getElementById("script").remove();
									var s = document.createElement("script");
									s.setAttribute('id', 'script');
									s.setAttribute('src', `scripts/login.js`);
									document.body.appendChild(s);
									currentPage = "login";
									loadCurrentLang();
								}))
							});
						}
						else if (url.pathname.startsWith("/register")){
							fetch('/api/user/logout', {
								method: 'POST',
								headers: {
									'Content-Type': 'application/json',
								},
								credentials: 'include'
							});
							fetch ('bodyLess/register.html').then((response) => {
								return (response.text().then(response => {
									container.innerHTML = response;
									inputSearchUser.style.setProperty("display", "none");
									document.getElementById("pfp").style.setProperty("display", "none");
									document.getElementById("dropDownUser").style.setProperty("display", "none");
									document.getElementById("script").remove();
									var s = document.createElement("script");
									s.setAttribute('id', 'script');
									s.setAttribute('src', `scripts/register.js`);
									currentPage = "register";
									loadCurrentLang();
									document.body.appendChild(s);
								}))
							});
						}
						else if (url.pathname.startsWith("/settings")){
							fetch ('bodyLess/settings.html').then((response) => {
								(response.text().then(response => {
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
						}
						else if (url.pathname.startsWith("/friends")){
							fetch ('bodyLess/friends.html').then((response) => {
								return (response.text().then(response => {
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
						}
						else{
							fetch ('bodyLess/home.html').then((response) => {
								(response.text().then(response => {
									container.innerHTML = response;
									document.getElementById("script").remove();
									var s = document.createElement("script");
									s.setAttribute('id', 'script');
									s.setAttribute('src', `scripts/home.js`);
									document.body.appendChild(s);
									currentPage = "home";
									currentLang = currentUser.lang;
									switchTheme(currentUser.is_dark_theme);
									document.getElementById("usernameBtn").innerHTML = currentUser.display;
									document.getElementById("goHomeButton").style.setProperty("display", "none");
									document.getElementById("pfp").style.setProperty("display", "block");
									document.getElementById("dropDownUser").style.setProperty("display", "inline-table");
									if (currentUser.pfp != ""){
										var rawPfp = currentUser.pfp;
										if (rawPfp.startsWith('https://'))
											document.getElementById("pfp").setAttribute("src", `${rawPfp}`);
										else
											document.getElementById("pfp").setAttribute("src", `data:image/jpg;base64,${rawPfp}`);
									}
									else
										document.getElementById("pfp").style.setProperty("display", "none");
									matches = currentUser.matches;
									recentMatchHistoryContainer.innerHTML = "";
									for (var i=0; i<Object.keys(matches).length && i<5;i++){
										createMatchResumeContainer(matches[i]);
									};
									loadCurrentLang();
								}))
							});	
						}
					})

					fetch('/api/user/update', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({"is_active": true}),
						credentials: 'include'
					})
				}
				else{
					document.getElementById("pfp").style.setProperty("display", "none");
					document.getElementById("dropDownUser").style.setProperty("display", "none");
					if (url.pathname.startsWith("/login")){
						fetch ('bodyLess/login.html').then((response) => {
							(response.text().then(response => {
								inputSearchUser.style.setProperty("display", "none");
								container.innerHTML = response;
								document.getElementById("script").remove();
								var s = document.createElement("script");
								s.setAttribute('id', 'script');
								s.setAttribute('src', `scripts/login.js`);
								document.body.appendChild(s);
								currentPage = "login";
								loadCurrentLang();
							}))
						});
					}
					if (url.pathname.startsWith("/register")){
						fetch ('bodyLess/register.html').then((response) => {
							return (response.text().then(response => {
								container.innerHTML = response;
								document.getElementById("script").remove();
								var s = document.createElement("script");
								s.setAttribute('id', 'script');
								s.setAttribute('src', `scripts/register.js`);
								currentPage = "register";
								loadCurrentLang();
								document.body.appendChild(s);
							}))
						});
					}
				}
			})
		}
	})
})


fetch('/api/user/current', {
	method: 'GET',
	headers: {
		'Content-Type': 'application/json',
	},
	credentials: 'include'
})
.then(response => {
	const url = new URL(window.location.href);

	if (response.ok) {
		(response.json()).then((text) => {
			if (!(url.pathname.startsWith("/user") || url.pathname.startsWith("/search") || url.pathname.startsWith("/login") || url.pathname.startsWith("/register") || url.pathname.startsWith("/settings") || url.pathname.startsWith("/friends")))
				history.replaceState(JSON.stringify({"html": document.body.innerHTML, "currentPage": 'login', "currentLang": currentLang}), "", `https://${hostname.host}/home`);
			else
				history.replaceState(JSON.stringify({"html": document.body.innerHTML, "currentPage": 'login', "currentLang": currentLang}), "");
		});
	}
	else {
		history.replaceState(JSON.stringify({"html": document.body.innerHTML, "currentPage": 'login', "currentLang": currentLang}), "", `https://${hostname.host}/login`);
	}
})

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
				history.pushState(state, "", `https://${hostname.host}`);
			else
				history.replaceState(state,"", `https://${hostname.host}`);
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
	fetch('/api/user/current', {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
		credentials: 'include'
	})
	.then(response => {
		if (!response.ok) {
			history.replaceState(state, "", `https://${hostname.host}/login`);
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

function createUserResumeContainer(user){
	userResumeContainer = document.createElement("div");
	userResumeContainer.className = "userResumeContainer";
	
	userResume = document.createElement("div");
	userResume.className = "userResume";
	userResume.id = user.username

	img = document.createElement("img");
	imgContainer = document.createElement("div");
	img.className = "userResumePfp";
	imgContainer.className = "userResumePfpContainer";
	if (user.pfp != ""){
		var rawPfp = user.pfp;
		if (rawPfp.startsWith('https://'))
			img.setAttribute("src", `${rawPfp}`);
		else
			img.setAttribute("src", `data:image/jpg;base64,${rawPfp}`);
	}
	else
		img.style.setProperty("display", "none");

	userResumeName = document.createElement("a");
	userResumeName.className = "userResumeName"
	userResumeName.innerHTML = user.display;
	
	
	imgContainer.appendChild(img);
	userResume.appendChild(imgContainer);
	userResume.appendChild(userResumeName);
	userResumeContainer.appendChild(userResume)
	document.getElementById("resumeContainer").appendChild(userResumeContainer);
}

inputSearchUser.addEventListener("keydown", (e) => {
	if (e.key == "Enter"){
		fetch('/api/user/search_by_display', {
			method: 'POST', //GET forbid the use of body :(
			headers: {'Content-Type': 'application/json',},
			body: JSON.stringify({"name" : inputSearchUser.value}),
			credentials: 'include'
		}).then(user => {
			user.json().then(((user) => {
				fetch('bodyLess/search.html').then((response) => {
					response.text().then(response => {
						state = JSON.stringify({"html": document.body.innerHTML, "currentPage": currentPage, "currentLang": currentLang});

						if (container.innerHTML != "")
							history.pushState(state, "", `https://${hostname.host}/search?query=${inputSearchUser.value}`);
						else
							history.replaceState(state,"");
						container.innerHTML = response;
						document.getElementById("script").remove();
						var s = document.createElement("script");
						s.setAttribute('id', 'script');
						s.setAttribute('src', `scripts/profile.js`);
						document.body.appendChild(s);
						currentPage = "search";
						loadCurrentLang(currentPage);
						homeBtn.style.setProperty("display", "block");
						document.getElementById("userResumeCount").innerHTML = Object.keys(user).length;
						document.getElementById("userResumeSearch").innerHTML = inputSearchUser.value;
						Object.keys(user).forEach(function(key){
							createUserResumeContainer(user[key]);
						})
						inputSearchUser.value = "";
					})
				})
			}))
		})
	}
})