//import Chart from '../chart.js/auto';

container = document.getElementById("container");
homeBtn = document.getElementById("goHomeButton");
swichTheme = document.getElementById("themeButton");
inputSearchUser = document.getElementById("inputSearchUser");
usernameBtn = document.getElementById("usernameBtn");
userPfp = document.getElementById("pfp");
dropDownUserContainer = document.getElementById("dropDownUserContainer");
dropDownUser = document.getElementById("dropDownUser");
pageContentContainer = document.getElementById("pageContentContainer");
langDropDown = document.getElementById("langDropDown");
langDropDownBtn = document.getElementById("langDropDownBtn");
langDropDownOption = document.querySelectorAll(".langDropDownOptions");
myProfileBtn = document.getElementById("myProfileBtn");
friendsBtn = document.getElementById("friendsBtn");
settingsBtn = document.getElementById("settingsBtn");
logOutBtn = document.getElementById('logOutBtn');


var currentPage = "";
var currentLang = "lang/EN_UK.json"
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
				if (langDropDown.classList.contains("activeDropDown"))
					langDropDown.classList.remove("activeDropDown");
				if (dropDownUser.classList.contains("activeDropDown"))
					dropDownUser.classList.remove("activeDropDown");

				
				if (currentUser.ok) {
					currentUser.json().then((currentUser) => {
						currentLang = currentUser.lang;
						langDropDownBtn.style.setProperty("background-image", `url(icons/${currentLang.substring(4,10)}.svg)`);

						usernameBtn.innerHTML = currentUser.username;
						if (currentUser.pfp != ""){
							var rawPfp = currentUser.pfp;
							testImg = new Image();
							if (rawPfp.startsWith('https://')){
								testImg.setAttribute("src", `${rawPfp}`)
								userPfp.setAttribute("src", `${rawPfp}`);
							}
							else{
								testImg.setAttribute("src", `data:image/jpg;base64,${rawPfp}`)
								userPfp.setAttribute("src", `data:image/jpg;base64,${rawPfp}`);
							}
							userPfp.style.setProperty("display", "block");

							setTimeout(() => {
								if (testImg.width > testImg.height){		//this condition does not work if not in a setTimeout. You'll ask why. The answer is : ¯\_(ツ)_/¯
									userPfp.style.setProperty("height", "100%");
									userPfp.style.setProperty("width", "unset");
								}
							}, 0)
						}
						else
							userPfp.style.setProperty("display", "none");

						if (url.pathname.startsWith("/user")){
							fetch('bodyLess/profile.html').then((response) => {
								response.text().then(response => {
									container.innerHTML = response;
									var splitPath = window.location.href.split('/');


									if (splitPath[4] == currentUser.username || currentUser.friends[splitPath[4]] != null){
										document.getElementById("sendFriendRequestBtn").remove();
									}
									if (splitPath[4] == currentUser.username || currentUser.friends[splitPath[4]] == null)
										document.getElementById("deleteFriendBtn").remove();


									document.getElementById("script").remove();
									var s = document.createElement("script");
									s.setAttribute('id', 'script');
									s.setAttribute('src', `scripts/profile.js`);
									document.body.appendChild(s);
									currentPage = "profile";
									loadCurrentLang(currentPage);
									homeBtn.style.setProperty("display", "block");
									dropDownUserContainer.style.setProperty("display", "flex");
								})
							})
						}
						else if (url.pathname.startsWith("/dashboard")){
							fetch('bodyLess/dashboard.html').then((response) => {
								response.text().then(response => {
									document.getElementById("loaderBg").style.setProperty("display", "block");
									container.innerHTML = response;

									document.getElementById("script").remove();
									var s = document.createElement("script");
									s.setAttribute('id', 'script');
									s.setAttribute('src', `scripts/dashboard.js`);
									document.body.appendChild(s);
									currentPage = "dashboard";
									loadCurrentLang(currentPage);
									homeBtn.style.setProperty("display", "block");
									dropDownUserContainer.style.setProperty("display", "flex");
								})
							})
						}
						else if (url.pathname.startsWith("/search")){
							if(url.searchParams.get("query")){
								fetch('/api/user/search_by_username', {
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
												s.setAttribute('src', `scripts/search.js`);
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
											})
										})
									}))
								})
							}
							else{
								history.replaceState("","",`https://${hostname.host}/home`);
							}
							
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
									dropDownUserContainer.style.setProperty("display", "none");
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
									homeBtn.style.setProperty("display", "block");
									inputSearchUser.style.setProperty("display", "none");
									dropDownUserContainer.style.setProperty("display", "none");
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
									dropDownUserContainer.style.setProperty("display", "none");
									homeBtn.style.setProperty("display", "block");
									document.getElementById("confirmDeleteDialogVar").innerHTML = currentUser.username;
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
									dropDownUserContainer.style.setProperty("display", "none");
									homeBtn.style.setProperty("display", "block");
								}))
							});
						}
						else if (url.pathname.startsWith("/game")){
							fetch ('bodyLess/game.html').then((response) => {
								return (response.text().then(response => {
									container.innerHTML = response;
									document.getElementById("script").remove();
									var s = document.createElement("script");
									s.setAttribute('id', 'script');
									s.setAttribute('src', `scripts/game.js`);
									currentPage = "game";
									loadCurrentLang();
									document.body.appendChild(s);
									dropDownUserContainer.style.setProperty("display", "none");
									homeBtn.style.setProperty("display", "block");
								}))
							});
						}
						else{
							fetch ('bodyLess/home.html').then((response) => {
								(response.text().then(response => {
									container.innerHTML = response;
									currentPage = "home";
									switchTheme(currentUser.is_dark_theme);
									homeBtn.style.setProperty("display", "none");
									dropDownUserContainer.style.setProperty("display", "flex");
									inputSearchUser.style.setProperty("display", "block");
									document.getElementById("script").remove();
									var s = document.createElement("script");
									s.setAttribute('id', 'script');
									s.setAttribute('src', `scripts/home.js`);
									document.body.appendChild(s);
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
					dropDownUserContainer.style.setProperty("display", "none");
					currentLang = "lang/EN_UK.json";
					langDropDownBtn.style.setProperty("background-image", `url(icons/${currentLang.substring(4,10)}.svg)`);
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

								homeBtn.style.setProperty("display", "block");
								inputSearchUser.style.setProperty("display", "none");
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

function handleToken() {
	const code = window.location.href.split("code=")[1];

	if (code)
	{
		if (document.getElementById("loaderBg"))
			document.getElementById("loaderBg").style.setProperty("display", "block");
		fetch('/api/user/fortyTwo/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ code: code }),
			credentials: 'include'
		})
		.then(response => response.json())
		.then(data => {
				if (document.getElementById("loaderBg"))
					document.getElementById("loaderBg").style.setProperty("display", "none");
				console.log('Data:', data)
				history.replaceState("", "", `https://${hostname.host}/home`);

		})
		.catch(error => console.error('Error:', error));
	}
	else{
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
					if (!(url.pathname.startsWith("/user") || url.pathname.startsWith("/search") || url.pathname.startsWith("/login") || url.pathname.startsWith("/register") || url.pathname.startsWith("/settings") || url.pathname.startsWith("/friends") || url.pathname.startsWith("/dashboard")))
						history.replaceState("", "", `https://${hostname.host}/home`);
					else
						history.replaceState("", "");
				});
			}
			else {
				history.replaceState("", "", `https://${hostname.host}/login`);
			}
		})
	}
}

window.addEventListener('load', handleToken());


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
	if (currentPage != "register")
		history.pushState("", "", `https://${hostname.host}/home`);
	else
		history.pushState("", "", `https://${hostname.host}/login`);
})

myProfileBtn.addEventListener("click", (e) => {
	history.pushState("","",`https://${hostname.host}/user/${usernameBtn.innerHTML}`);
})

friendsBtn.addEventListener("click", (e) => {
	history.pushState("","",`https://${hostname.host}/friends`);
})

settingsBtn.addEventListener("click", (e) => {
	history.pushState("","",`https://${hostname.host}/settings`);
})

homeBtn.addEventListener("keydown", (e) => {
	if (e.key == "Enter")
		homeBtn.click();
})

logOutBtn.addEventListener("click", (e) => {
	history.replaceState("", "", `https://${hostname.host}/login`);
});

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
			document.getElementById("themeButton").style.maskImage = "url(\"icons/button-night-mode.svg\")";
	}
	else{
		document.documentElement.style.setProperty("--page-bg-rgb", "#FDFDFB");
		document.documentElement.style.setProperty("--main-text-rgb", "#110026");
		document.documentElement.style.setProperty("--hover-text-rgb", "#FFDBDE");
		document.documentElement.style.setProperty("--option-hover-text-rgb", "#110026");
		document.documentElement.style.setProperty("--option-text-rgb", "#FDFDFB");
		document.documentElement.style.setProperty("--input-bg-rgb", "#FFDBDE");
		if (document.getElementById("themeButton"))
			document.getElementById("themeButton").style.maskImage = "url(\"icons/button-light-mode.svg\")";
		document.documentElement.style.setProperty("--is-dark-theme", 0);
	}
	if (currentPage == "dashboard"){
		chartAverage.options.scales.x._proxy.ticks.color = window.getComputedStyle(document.documentElement).getPropertyValue("--main-text-rgb");
		chartAverage.options.scales.y._proxy.ticks.color = window.getComputedStyle(document.documentElement).getPropertyValue("--main-text-rgb");
		chartAverage.options.scales.x._proxy.grid.color = window.getComputedStyle(document.documentElement).getPropertyValue("--main-text-rgb");
		chartAverage.options.scales.y._proxy.grid.color = window.getComputedStyle(document.documentElement).getPropertyValue("--main-text-rgb");
		chartAverage._plugins._cache[5].options.color = window.getComputedStyle(document.documentElement).getPropertyValue("--main-text-rgb");
		chartAverage.update();

		chartAbs.options.scales.x._proxy.ticks.color = window.getComputedStyle(document.documentElement).getPropertyValue("--main-text-rgb");
		chartAbs.options.scales.y._proxy.ticks.color = window.getComputedStyle(document.documentElement).getPropertyValue("--main-text-rgb");
		chartAbs.options.scales.x._proxy.grid.color = window.getComputedStyle(document.documentElement).getPropertyValue("--main-text-rgb");
		chartAbs.options.scales.y._proxy.grid.color = window.getComputedStyle(document.documentElement).getPropertyValue("--main-text-rgb");
		chartAbs._plugins._cache[5].options.color = window.getComputedStyle(document.documentElement).getPropertyValue("--main-text-rgb");
		chartAbs.update();
	}
}
/*
window.addEventListener("popstate", (event) => {
	fetch('/api/user/current', {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
		credentials: 'include'
	})
	.then(response => {
		if (response.ok) {
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
*/
function loadCurrentLang(){ //just for better readability before prod, don't care about efficiency
	if (currentLang != undefined){
		fetch(currentLang).then(response => {
			if (response.ok){
				response.json().then((text) => {
					content = text[currentPage];
					if (content != null || content != undefined){
						Object.keys(content).forEach(function(key) {
							if (document.getElementById(key)){
								if (key.startsWith('input'))
									document.getElementById(key).placeholder = content[key];
								else
									document.getElementById(key).innerHTML = content[key];	
							}
						});
					}
				})
			}
			else{
				fetch("lang/EN_UK.json").then(response => {
					response.json().then((text) => {
						content = text[currentPage];
						if (content != null || content != undefined){
							Object.keys(content).forEach(function(key) {
								if (document.getElementById(key)){
									if (key.startsWith('input'))
										document.getElementById(key).placeholder = content[key];
									else
										document.getElementById(key).innerHTML = content[key];
								}
							});
						}
					})
				})
			}
		})
	}
	else{
		fetch("lang/EN_UK.json").then(response => {
			response.json().then((text) => {
				content = text[currentPage];
				if (content != null || content != undefined){
					Object.keys(content).forEach(function(key) {
						if (document.getElementById(key)){
							if (key.startsWith('input'))
								document.getElementById(key).placeholder = content[key];
							else
								document.getElementById(key).innerHTML = content[key];
						}
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

	scoreUserName.innerHTML = `${match.player_one}`;
	scoreOpponentName.innerHTML = `${match.player_two}`;

	scoreUserScore.innerHTML = `${match.player_one_pts}`;
	scoreOpponentScore.innerHTML = `${match.player_two_pts}`;

	scoreUser.appendChild(scoreUserName);
	scoreUser.innerHTML += " : ";
	scoreUser.appendChild(scoreUserScore);

	scoreOpponent.appendChild(scoreOpponentName);
	scoreOpponent.innerHTML += " : ";
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
	userResumeName.innerHTML = user.username;


	imgContainer.appendChild(img);
	userResume.appendChild(imgContainer);
	userResume.appendChild(userResumeName);
	userResume.setAttribute("tabindex", 10);
	userResumeContainer.appendChild(userResume)
	document.getElementById("resumeContainer").appendChild(userResumeContainer);
}

inputSearchUser.addEventListener("keydown", (e) => {
	if (e.key == "Enter" && inputSearchUser.value.length > 0){
		fetch('/api/user/search_by_username', {
			method: 'POST', //GET forbid the use of body :(
			headers: {'Content-Type': 'application/json',},
			body: JSON.stringify({"name" : inputSearchUser.value}),
			credentials: 'include'
		}).then(user => {
			user.json().then((user) => {
				fetch('bodyLess/search.html').then((response) => {
					response.text().then(response => {
						state = "";

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
					})
				})
			})
		})
	}
})

langDropDownBtn.addEventListener("click", (e) => {
	if (langDropDown.classList.contains("activeDropDown"))
		langDropDown.classList.remove("activeDropDown")
	else
		langDropDown.classList.add("activeDropDown")
})

usernameBtn.addEventListener("click", (e) => {
	if (dropDownUser.classList.contains("activeDropDown"))
		dropDownUser.classList.remove("activeDropDown")
	else
		dropDownUser.classList.add("activeDropDown")
})


langDropDownBtn.addEventListener("keydown", (e) => {
	if (e.key == "Enter"){
		langDropDownBtn.click();
		if (dropDownUser.classList.contains("activeDropDown"))
			dropDownUser.classList.remove("activeDropDown");
	}
})

usernameBtn.addEventListener("keydown", (e) => {
	if (e.key == "Enter"){
		usernameBtn.click();
		if (langDropDown.classList.contains("activeDropDown"))
			langDropDown.classList.remove("activeDropDown");
	}
})

langDropDownOption.forEach(function(button) {
	button.addEventListener("click", (e) =>{
		currentLang = `lang/${button.id}.json`;
		fetch(currentLang).then(response => {
			response.json().then((text) => {
				content = text[currentPage];
				Object.keys(content).forEach(function(key) {
					if (key.startsWith('input'))
						document.getElementById(key).placeholder = content[key];
					else
						document.getElementById(key).innerHTML = content[key];
				});
			})
		})
		fetch('/api/user/update', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({language_pack: currentLang}),
			credentials: 'include'
		})
		langDropDownBtn.style.setProperty("background-image", `url(icons/${button.id}.svg)`);
	})
	button.addEventListener("keydown", (e) => {
		if (e.key == "Enter")
			button.click();
	})
})

window.addEventListener("click", (e) => {
	if (!e.target.closest(".activeDropDown")){
		if (langDropDown.classList.contains("activeDropDown"))
			langDropDown.classList.remove("activeDropDown");
		if (dropDownUser.classList.contains("activeDropDown"))
			dropDownUser.classList.remove("activeDropDown");
		if (currentPage == "dashboard")
			timelineDropdown.classList.remove("activeDropDown")
	}
})
