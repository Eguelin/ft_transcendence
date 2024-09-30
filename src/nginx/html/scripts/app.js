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
var username = "";
const hostname = new URL(window.location.href);

var client = null;
var pageName;

const routes = {
	"/home": "bodyLess/home.html",
	"/": "bodyLess/home.html",
	"/game" : "bodyLess/game.html",
	"/settings" : "bodyLess/settings.html",
	"/user" : "bodyLess/user.html",
	"/dashboard" : "bodyLess/dashboard.html",
	"/search" : "bodyLess/search.html",
	"/friends" : "bodyLess/friends.html",
	"/login" : "bodyLess/login.html",
	"/register" : "bodyLess/register.html",
	404 : "bodyLess/404.html"
}

function addPfpUrlToImgSrc(img, path){
	if (path != "") {
		var testImg = new Image();
		
		testImg.onload = function(){
			if (testImg.width > testImg.height) {		//this condition does not work if not in a setTimeout. You'll ask why. The answer is : ¯\_(ツ)_/¯
				img.style.setProperty("height", "100%");
				img.style.setProperty("width", "unset");
			}
		}
		testImg.src = `https://${hostname.host}/${path}`;
		img.src = `https://${hostname.host}/${path}`;
		img.style.setProperty("display", "block");
	}
	else
		img.style.setProperty("display", "none");
}

class Client{
	username;
	currentPage;
	currentLang;
	langJson;
	pfpUrl;
	use_dark_theme;
	friends;
	friend_requests;
	blocked_user;
	recentMatches;

	constructor (){
		return (async () =>{
			const fetchResult = await fetch('/api/user/current', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include'
			})
			const result = await fetchResult.json();
			if (fetchResult.ok){
				this.username = result.username;
				this.currentLang = result.lang;
				this.pfpUrl = result.pfp;
				this.use_dark_theme = result.is_dark_theme;
				this.friends = result.friends;
				this.friend_requests = result.friend_requests;
				this.blocked_user = result.blocked_user;
				this.recentMatches = result.matches;
				switchTheme(this.use_dark_theme);
				
				langDropDownBtn.style.setProperty("background-image", `url(icons/${result.lang.substring(4, 10)}.svg)`);

				usernameBtn.innerHTML = result.username;
	
				addPfpUrlToImgSrc(userPfp, result.pfp)

				fetch('/api/user/update', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({ "is_active": true }),
					credentials: 'include'
				})
			}
			else
				return null
			const fetchLangResult = await fetch(this.currentLang);
			if (fetchLangResult.ok)
				this.langJson = await fetchLangResult.json()
			else
				this.langJson = null;
			return (this);
		})();
	}

	loadPage(page){
		if (this.username == null)
			return ;
		document.getElementById("loaderBg").style.setProperty("display", "block");
		
		var sep = page.indexOf("/", 1)
		if (sep > 0)
			pageName = page.substring(0, sep)
		else
			pageName = page;
		
		if (routes[pageName]){ //need error 404 page 
			fetch(routes[pageName]).then((response) => {
				response.text().then(response => {
					currentPage = pageName.substring(1);
					container.innerHTML = response;
	
					document.getElementById("script").remove();
					var s = document.createElement("script");
					s.setAttribute('id', 'script');
					s.setAttribute('src', `scripts/${currentPage}.js`);
					document.body.appendChild(s);
					document.getElementById("loaderBg").style.setProperty("display", "none");
					loadCurrentLang(currentPage);
				})
			})
		}
		else{
			fetch(routes[404]).then((response) => {
				response.text().then(response => {
					currentPage = '404';
					container.innerHTML = response;
	
					document.getElementById("script").remove();
					var s = document.createElement("script");
					s.setAttribute('id', 'script');
					s.setAttribute('src', `scripts/${currentPage}.js`);
					document.body.appendChild(s);
					document.getElementById("loaderBg").style.setProperty("display", "none");
					loadCurrentLang(currentPage);
				})
			})
		}
	}
}

window.navigation.addEventListener("navigate", (e) => {
	const url = new URL(e.destination.url);

	e.intercept({
		async handler() {
			//reset dropdown menus
			if (langDropDown.classList.contains("activeDropDown"))
				langDropDown.classList.remove("activeDropDown");
			if (dropDownUser.classList.contains("activeDropDown"))
				dropDownUser.classList.remove("activeDropDown");
				
			if (client && !(client instanceof Client)){
				client = null;				
				fetch('/api/user/logout', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					credentials: 'include'
				})
				if (!url.pathname.startsWith("/register"))
					history.replaceState("","", `https://${hostname.host}/login`)
			}
			if (client)
				client.loadPage(url.pathname)
			else {
				dropDownUserContainer.style.setProperty("display", "none");
				langDropDownBtn.style.setProperty("background-image", `url(icons/${currentLang.substring(4, 10)}.svg)`);

				if (url.pathname.startsWith("/register")) {
					fetch('bodyLess/register.html').then((response) => {
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
				else{
					fetch('bodyLess/login.html').then((response) => {
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
			}
		}
	})
})

function htmlEncode(str) {
	return String(str).replace(/[^\w. ]/gi, function (c) {
		return '&#' + c.charCodeAt(0) + ';';
	});
}

function handleToken() {
	const code = window.location.href.split("code=")[1];

	if (code) {
		fetch('/api/user/fortyTwo/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ code: code }),
			credentials: 'include'
		})
		.then(response => {
			if (response.ok){
				(async () => {
					client = await new Client()	
					if (!client)
						history.replaceState("", "", `https://${hostname.host}/login`);
					else
						history.replaceState("", "", `https://${hostname.host}/home`);
				})()
			}
		}).catch(error => console.error('Error:', error));
	}
	else {
		const url = new URL(window.location.href);
		if (document.getElementById("loaderBg"))
			document.getElementById("loaderBg").style.setProperty("display", "none");
		(async () => {
			client = await new Client();
			if (!client)
				history.replaceState("", "", `https://${hostname.host}/login`);
			else{
				if (url.pathname == "" || url.pathname == "/"){
					history.replaceState("", "", `https://${hostname.host}/home`)
					client.loadPage("/home");
				}
				else
					client.loadPage(url.pathname);
			}
		})()
	}
}

window.addEventListener('load', (e) => {
	handleToken();
});


window.addEventListener("beforeunload", (e) => {
	fetch('/api/user/update', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ "is_active": false }),
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
	history.pushState("", "", `https://${hostname.host}/user/${client.username}`);
})

friendsBtn.addEventListener("click", (e) => {
	history.pushState("", "", `https://${hostname.host}/friends`);
})

settingsBtn.addEventListener("click", (e) => {
	history.pushState("", "", `https://${hostname.host}/settings`);
})

homeBtn.addEventListener("keydown", (e) => {
	if (e.key == "Enter")
		homeBtn.click();
})

logOutBtn.addEventListener("click", (e) => {
	history.replaceState("", "", `https://${hostname.host}/login`);
});

function switchTheme(darkTheme) {
	if (darkTheme == 1 || darkTheme == true) {
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
	else {
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

function loadCurrentLang(){ //just for better readability before prod, don't care about efficiency
	if (client && client.langJson){
		content = client.langJson[currentPage];
		if (content != null || content != undefined) {
			Object.keys(content).forEach(function (key) {
				if (key.startsWith('.')){
					instances = document.querySelectorAll(key);
					for (var i=0; i< Object.keys(instances).length; i++){
						instances[i].innerHTML = content[key];
					}
				}
				else if (document.getElementById(key)) {
					if (key.startsWith('input'))
						document.getElementById(key).placeholder = content[key];
					
					else
						document.getElementById(key).innerHTML = content[key];
				}
			});
		}
		content = client.langJson['index'];
		if (content != null || content != undefined) {
			Object.keys(content).forEach(function (key) {
				if (key.startsWith('.')){
					instances = document.querySelectorAll(key);
					for (var i=0; i< Object.keys(instances).length; i++){
						instances[i].innerHTML = content[key];
					}
				}
				else if (document.getElementById(key)) {
					if (key.startsWith('input'))
						document.getElementById(key).placeholder = content[key];
					
					else
						document.getElementById(key).innerHTML = content[key];
				}
			});
		}
	}
	else if (currentLang != undefined){
		fetch(currentLang).then(response => {
			if (response.ok) {
				response.json().then((text) => {
					content = text[currentPage];
					if (content != null || content != undefined) {
						Object.keys(content).forEach(function (key) {
							if (document.getElementById(key)) {
								if (key.startsWith('.')){
									instances = document.querySelectorAll(key);
									for (var i=0; i< Object.keys(instances).length; i++){
										instances[i].innerHTML = content[key];
									}
								}
								else if (document.getElementById(key)) {
									if (key.startsWith('input'))
										document.getElementById(key).placeholder = content[key];
									
									else
										document.getElementById(key).innerHTML = content[key];
								}
							}
						});
					}
				})
			}
			else {
				fetch("lang/EN_UK.json").then(response => {
					response.json().then((text) => {
						currentLang = "lang/EN_UK.json";
						content = text[currentPage];
						if (content != null || content != undefined) {
							Object.keys(content).forEach(function (key) {
								if (document.getElementById(key)) {
									if (key.startsWith('.')){
										instances = document.querySelectorAll(key);
										for (var i=0; i< Object.keys(instances).length; i++){
											instances[i].innerHTML = content[key];
										}
									}
									else if (document.getElementById(key)) {
										if (key.startsWith('input'))
											document.getElementById(key).placeholder = content[key];
										
										else
											document.getElementById(key).innerHTML = content[key];
									}
								}
							});
						}
					})
				})
			}
		})
	}
	else {
		fetch("lang/EN_UK.json").then(response => {
			response.json().then((text) => {
				content = text[currentPage];
				currentLang = "lang/EN_UK.json";
				if (content != null || content != undefined) {
					Object.keys(content).forEach(function (key) {
						if (document.getElementById(key)) {
							if (key.startsWith('.')){
								instances = document.querySelectorAll(key);
								for (var i=0; i< Object.keys(instances).length; i++){
									instances[i].innerHTML = content[key];
								}
							}
							else if (document.getElementById(key)) {
								if (key.startsWith('input'))
									document.getElementById(key).placeholder = content[key];
								
								else
									document.getElementById(key).innerHTML = content[key];
							}
						}
					});
				}
			})
		})
	}
}

swichTheme.addEventListener("click", () => {
	var theme = window.getComputedStyle(document.documentElement).getPropertyValue("--is-dark-theme") == 1 ? false : true;
	const data = { is_dark_theme: theme };
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
	if (e.key == "Enter") {
		swichTheme.click();
		swichTheme.focus();
	}
})

window.addEventListener("keydown", (e) => {
	if (currentPage == "friends") {
		if (e.key == "ArrowLeft" || e.key == "ArrowRight") {
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
	if (currentPage == "settings") {
		if (e.key == "ArrowLeft" || e.key == "ArrowRight") {
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


function createMatchResumeContainer(match) {
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
	if (match.player_one_pts > match.player_two_pts){
		result.classList.add("victory");
		result.innerHTML = client.langJson['user']['.victory'];
	}
	else if (match.player_one_pts < match.player_two_pts){
		result.classList.add("loss");
		result.innerHTML = client.langJson['user']['.loss'];
	}
	else{
		result.classList.add("draw");
		result.innerHTML = client.langJson['user']['.draw'];
	}
	scoreContainer.appendChild(scoreUser);
	scoreContainer.appendChild(scoreOpponent);

	matchContainer.appendChild(result);
	matchContainer.appendChild(scoreContainer);
	matchContainer.appendChild(date);

	recentMatchHistoryContainer.appendChild(matchContainer);
}

inputSearchUser.addEventListener("keydown", (e) => {
	if (e.key == "Enter" && inputSearchUser.value.length > 0) {
		history.pushState("", "", `https://${hostname.host}/search?query=${inputSearchUser.value}`);
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
	if (e.key == "Enter") {
		langDropDownBtn.click();
		if (dropDownUser.classList.contains("activeDropDown"))
			dropDownUser.classList.remove("activeDropDown");
	}
})

usernameBtn.addEventListener("keydown", (e) => {
	if (e.key == "Enter") {
		usernameBtn.click();
		if (langDropDown.classList.contains("activeDropDown"))
			langDropDown.classList.remove("activeDropDown");
	}
})

langDropDownOption.forEach(function (button) {
	button.addEventListener("click", (e) => {
		currentLang = `lang/${button.id}.json`;
		if (client)
			client.currentLang = `lang/${button.id}.json`;
		fetch(currentLang).then(response => {
			if (response.ok){
				response.json().then((text) => {
					if (client)
						client.langJson = text;
					loadCurrentLang();
				})
			}
		})
		fetch('/api/user/update', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ language_pack: currentLang }),
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
	if (!e.target.closest(".activeDropDown")) {
		if (langDropDown.classList.contains("activeDropDown"))
			langDropDown.classList.remove("activeDropDown");
		if (dropDownUser.classList.contains("activeDropDown"))
			dropDownUser.classList.remove("activeDropDown");
	}
})

