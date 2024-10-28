container = document.getElementById("container");
homeBtn = document.getElementById("goHomeButton");
swichTheme = document.getElementById("themeButton");
inputSearchUser = document.getElementById("inputSearchUser");
inputSearchUserContainer = document.getElementById("inputSearchUserContainer");
usernameBtn = document.getElementById("usernameBtn");
userPfp = document.getElementById("pfp");
dropDownUserContainer = document.getElementById("dropDownUserContainer");
dropDownUser = document.getElementById("dropDownUser");
pageContentContainer = document.getElementById("pageContentContainer");
dropDownLang = document.getElementById("dropDownLang");
dropDownLangBtn = document.getElementById("dropDownLangBtn");
dropDownLangOption = document.querySelectorAll(".dropDownLangOptions");
myProfileBtn = document.getElementById("myProfileBtn");
friendsBtn = document.getElementById("friendsBtn");
settingsBtn = document.getElementById("settingsBtn");
logOutBtn = document.getElementById('logOutBtn');
notifCenterContainer = document.getElementById("notifCenterContainer")

var currentPage = "";
var currentLang = "lang/EN_UK.json"
var username = "";
const hostname = new URL(window.location.href);
const defaultLastXDaysDisplayed = 7;
const preferedColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');

var client = null;
var pageName;
var use_browser_theme = true;

const routes = {
	"/home": `https://${hostname.host}/bodyLess/home.html`,
	"/": `https://${hostname.host}/bodyLess/home.html`,
	"/game" : `https://${hostname.host}/bodyLess/game.html`,
	"/settings" : `https://${hostname.host}/bodyLess/settings.html`,
	"/user" : `https://${hostname.host}/bodyLess/user.html`,
	"/dashboard" : `https://${hostname.host}/bodyLess/dashboard.html`,
	"/search" : `https://${hostname.host}/bodyLess/search.html`,
	"/friends" : `https://${hostname.host}/bodyLess/friends.html`,
	"/login" : `https://${hostname.host}/bodyLess/login.html`,
	404 : `https://${hostname.host}/bodyLess/404.html`,
	403 : `https://${hostname.host}/bodyLess/403.html`,
	"/admin": `https://${hostname.host}/bodyLess/admin.html`
}

function addPfpUrlToImgSrc(img, path){
	if (path != "") {
		var testImg = new Image();

		testImg.onload = function(){
			if (testImg.width > testImg.height) {
				img.style.setProperty("height", "100%");
				img.style.setProperty("width", "unset");
			}
		}
		if (path.startsWith("http")){
			testImg.src = path;
			img.src = path;
		} else {
			testImg.src = `https://${hostname.host}${path}`;
			img.src = `https://${hostname.host}${path}`;
		}
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
	use_browser_theme;
	theme_name;
	friends;
	friend_requests;
	blocked_user;
	recentMatches;
	#is_admin;
	mainTextRgb;
	fontAmplifier

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
				this.theme_name = result.theme_name;
				this.friends = result.friends;
				this.friend_requests = result.friend_requests;
				this.blocked_user = result.blocked_user;
				this.recentMatches = result.matches;
				this.#is_admin = result.is_admin;
				this.mainTextRgb = window.getComputedStyle(document.documentElement).getPropertyValue("--main-text-rgb");
				this.fontAmplifier = result.font_amplifier;
				this.use_browser_theme = result.use_browser_theme;
				use_browser_theme = result.use_browser_theme;
				if (use_browser_theme == false)
					switchTheme(this.theme_name);
				document.documentElement.style.setProperty("--font-size-amplifier", this.fontAmplifier);

				dropDownLangBtn.style.setProperty("background-image", `url(https://${hostname.host}/icons/${result.lang.substring(4, 10)}.svg)`);

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
			const fetchLangResult = await fetch(`https://${hostname.host}/${this.currentLang}`);
			if (fetchLangResult.ok)
				this.langJson = await fetchLangResult.json()
			else
				this.langJson = null;
			return (this);
		})();
	}

	loadPage(page){
		(async() => {
			const fetchResult = await fetch('/api/user/current', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include'
			})
			const result = await fetchResult.json();
			if (fetchResult.ok){
				this.#is_admin = result.is_admin;
				setLoader()

				var sep = page.indexOf("/", 1)
				if (sep > 0)
					pageName = page.substring(0, sep)
				else
					pageName = page;

				if (routes[pageName]){
					if (!this.#is_admin && pageName == "/admin"){
						fetch(routes[403]).then((response) => {
							response.text().then(response => {
								currentPage = '403';
								container.innerHTML = response;

								document.getElementById("script").remove();
								var s = document.createElement("script");
								s.setAttribute('id', 'script');
								s.onload = function(){
									(async () => (loadCurrentLang()))();
								}
								s.setAttribute('src', `https://${hostname.host}/scripts/${currentPage}.js`);
								document.body.appendChild(s);
								unsetLoader()
							})
						})
					}
					else{
						fetch(routes[pageName]).then((response) => {
							response.text().then(response => {
								currentPage = pageName.substring(1);
								container.innerHTML = response;

								document.getElementById("script").remove();
								var s = document.createElement("script");
								s.onload = function(){
									(async () => (loadCurrentLang()))();
								}
								s.setAttribute('id', 'script');
								s.setAttribute('src', `https://${hostname.host}/scripts/${currentPage}.js`);
								document.body.appendChild(s);
								unsetLoader()
							})
						})
					}
				}
				else{
					fetch(routes[404]).then((response) => {
						response.text().then(response => {
							currentPage = '404';
							container.innerHTML = response;

							document.getElementById("script").remove();
							var s = document.createElement("script");
							s.setAttribute('id', 'script');
							s.setAttribute('src', `https://${hostname.host}/scripts/${currentPage}.js`);
							document.body.appendChild(s);
							unsetLoader()
							(async () => (loadCurrentLang()))();
						})
					})
				}
			}
			else{
				dropDownUserContainer.style.setProperty("display", "none");
				dropDownLangBtn.style.setProperty("background-image", `url(https://${hostname.host}/icons/${currentLang.substring(4, 10)}.svg)`);

				fetch(`https://${hostname.host}/bodyLess/login.html`).then((response) => {
					(response.text().then(response => {
						inputSearchUserContainer.style.setProperty("display", "none");
						container.innerHTML = response;
						document.getElementById("script").remove();
						var s = document.createElement("script");
						s.setAttribute('id', 'script');
						s.setAttribute('src', `https://${hostname.host}/scripts/login.js`);
						document.body.appendChild(s);
						currentPage = "login";
						(async () => (loadCurrentLang()))();
					}))
				});
			}
		})();
	}
}

XMLHttpRequest.prototype.send = function() {
	return false;
}

window.addEventListener("popstate", (e) =>{
	load();
})

function load(){
	const url =  new URL( window.location.href);
	if (dropDownLang.classList.contains("activeDropDown")){
		dropDownLang.classList.remove("activeDropDown");
		void dropDownLang.offsetWidth;
		dropDownLang.classList.add("inactiveDropDown");

		setTimeout((dropDownLang) => {
			dropDownLang.classList.remove("inactiveDropDown");
		}, 300, dropDownLang)
	}
	if (dropDownUser.classList.contains("activeDropDown")){
		dropDownUser.classList.remove("activeDropDown");
		void dropDownUser.offsetWidth;
		dropDownUser.classList.add("inactiveDropDown");
		setTimeout((dropDownUser) => {
			dropDownUser.classList.remove("inactiveDropDown");
		}, 300, dropDownUser)
	}

	if (client && !(client instanceof Client)){
		client = null;
		fetch('/api/user/logout', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include'
		})
		history.replaceState("","", `https://${hostname.host}/login`)
	}
	if (currentPage == "settings"){
		window.removeEventListener("keydown", settingsKeyDownEvent)
	}
	if (currentPage == "login"){
		window.removeEventListener("keydown", loginKeyDownEvent)
	}
	if (currentPage == "friends"){
		window.removeEventListener("keydown", friendKeyDownEvent)
	}

	if (client)
		client.loadPage(url.pathname)
	else {
		dropDownUserContainer.style.setProperty("display", "none");
		dropDownLangBtn.style.setProperty("background-image", `url(https://${hostname.host}/icons/${currentLang.substring(4, 10)}.svg)`);
		history.replaceState("","",`https://${hostname.host}/login`);

		fetch(`https://${hostname.host}/bodyLess/login.html`).then((response) => {
			(response.text().then(response => {
				inputSearchUserContainer.style.setProperty("display", "none");
				container.innerHTML = response;
				document.getElementById("script").remove();
				var s = document.createElement("script");
				s.setAttribute('id', 'script');
				s.setAttribute('src', `https://${hostname.host}/scripts/login.js`);
				document.body.appendChild(s);
				currentPage = "login";
				(async () => (loadCurrentLang()))();
			}))
		});
	}
	homeBtn.focus();
}


function handleToken() {
	const code = window.location.href.split("code=")[1];

	if (code) {
		fetch('/api/user/fortyTwo/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ code: code, hostname: hostname.host }),
			credentials: 'include'
		})
		.then(response => {
			if (response.ok){
				(async () => {
					client = await new Client()
					if (use_browser_theme){
						if (window.matchMedia) {
							switchTheme(window.matchMedia('(prefers-color-scheme: dark)').matches == 1 ? 'dark' : 'light');
						}
						preferedColorSchemeMedia.addEventListener('change', browserThemeEvent);
					}
					if (!client)
						myReplaceState(`https://${hostname.host}/login`);
					else
						myReplaceState(`https://${hostname.host}/home`);
				})()
			}
			else
			{
				response.json().then(data => {
					unsetLoader()
					popUpError(data.message || "Error API 42 Invalid key or API down");
					myReplaceState(`https://${hostname.host}/login`);
				})
			}
		}).catch(error => console.error('Error:', error));
	}
	else {
		const url = new URL(window.location.href);
		if (document.getElementById("loaderBg"))
			unsetLoader();
			(async () => {
				client = await new Client();
				if (!client)
					myReplaceState(`https://${hostname.host}/login`);
				else if (url.pathname == "" || url.pathname == "/")
					myReplaceState(`https://${hostname.host}/home`);
				else
					load();
				if (use_browser_theme){
					if (window.matchMedia) {
						switchTheme(window.matchMedia('(prefers-color-scheme: dark)').matches == 1 ? 'dark' : 'light');
					}
					preferedColorSchemeMedia.addEventListener('change', browserThemeEvent);
				}
			})()
	}
}

window.addEventListener('load', (e) => {
	handleToken();
});


function myReplaceState(url){
	history.replaceState("", "", url);
	load();
}

function myPushState(url){
	history.pushState("", "", url);
	load();
}

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
		myPushState(`https://${hostname.host}/home`);
	else
		myPushState(`https://${hostname.host}/login`);
})

myProfileBtn.addEventListener("click", (e) => {
	myPushState(`https://${hostname.host}/user/${client.username}`);
})

friendsBtn.addEventListener("click", (e) => {
	myPushState(`https://${hostname.host}/friends`);
})

settingsBtn.addEventListener("click", (e) => {
	myPushState(`https://${hostname.host}/settings`);
})

homeBtn.addEventListener("keydown", (e) => {
	if (e.key == "Enter")
		homeBtn.click();
})

logOutBtn.addEventListener("click", (e) => {
	myReplaceState(`https://${hostname.host}/login`);
});

const themeMap = {
	"dark" : {
		"--page-bg-rgb" : "#110026",
		"--main-text-rgb" : "#FDFDFB",
		"--hover-text-rgb" : "#3A3053",
		"--option-hover-text-rgb" : "#110026",
		"--option-text-rgb" : "#FDFDFB",
		"--input-bg-rgb" : "#3A3053",
		"is-dark" : 1,
		"svg-path" : "/icons/button-night-mode.svg"
	},
	"light" : {
		"--page-bg-rgb" : "#F5EDED",
		"--main-text-rgb" : "#110026",
		"--hover-text-rgb" : "#FFC6C6",
		"--option-hover-text-rgb" : "#F5EDED",
		"--option-text-rgb" : "#110026",
		"--input-bg-rgb" : "#FFC6C6",
		"is-dark" : 0,
		"svg-path" : "/icons/button-light-mode.svg"
	}
}

function switchTheme(theme) {
	Object.keys(themeMap[theme]).forEach(function (key){
		document.documentElement.style.setProperty(key, themeMap[theme][key])
	})
	if (client){
		client.mainTextRgb = themeMap[theme]["--main-text-rgb"];
		client.use_dark_theme = themeMap[theme]["is-dark"];
	}

	document.documentElement.style.setProperty("--is-dark-theme", themeMap[theme]["is-dark"]);
	if (document.getElementById("themeButton"))
		document.getElementById("themeButton").style.maskImage = `url(https://${hostname.host}${themeMap[theme]["svg-path"]})`;

	if (currentPage == "dashboard"){
		chartAverage.options.scales.x._proxy.ticks.color = themeMap[theme]["--main-text-rgb"];
		chartAverage.options.scales.y._proxy.ticks.color = themeMap[theme]["--main-text-rgb"];
		chartAverage.options.scales.x._proxy.grid.color = themeMap[theme]["--main-text-rgb"];
		chartAverage.options.scales.y._proxy.grid.color = themeMap[theme]["--main-text-rgb"];
		chartAverage._plugins._cache[5].options.color = themeMap[theme]["--main-text-rgb"];
		chartAverage.update();

		chartAbs.options.scales.x._proxy.ticks.color = themeMap[theme]["--main-text-rgb"];
		chartAbs.options.scales.y._proxy.ticks.color = themeMap[theme]["--main-text-rgb"];
		chartAbs.options.scales.x._proxy.grid.color = themeMap[theme]["--main-text-rgb"];
		chartAbs.options.scales.y._proxy.grid.color = themeMap[theme]["--main-text-rgb"];
		chartAbs._plugins._cache[5].options.color = themeMap[theme]["--main-text-rgb"];
		chartAbs.update();
	}
}

async function loadCurrentLang(){
	contentJson = null;
	if (client && client.langJson){
		contentJson = client.langJson;
	}
	else if (currentLang != undefined){
		const fetchResult = await fetch(`https://${hostname.host}/${currentLang}`);
		const svgPath = `https://${hostname.host}/icons/${currentLang.substring(5, 10)}.svg`;
		if (fetchResult.ok){
			try{
				contentJson = await fetchResult.json()
				dropDownLangBtn.style.setProperty("background-image", `url(${svgPath})`);
			}
			catch{
				popUpError(`Could not load ${currentLang} language pack`);
			}
		}
		else {
			popUpError(`Could not load ${currentLang} language pack`);
			currentLang = "lang/EN_UK.json";
			const fetchResult = await fetch(`https://${hostname.host}/lang/EN_UK.json`);
			if (fetchResult.ok){
				try {
					contentJson = await fetchResult.json();
				}
				catch {
					popUpError(`Could not load ${currentLang} language pack`);
				}
			}
			if (client)
				client.langJson = contentJson;
		}
	}
	if (contentJson == null) {
		currentLang = "lang/EN_UK.json";
		const fetchResult = await fetch(`https://${hostname.host}/lang/EN_UK.json`);
		if (fetchResult.ok){
			try {
				contentJson = await fetchResult.json();
				dropDownLangBtn.style.setProperty("background-image", `url(https://${hostname.host}/icons/EN_UK.svg)`);
			}
			catch {
				popUpError(`Could not load ${currentLang} language pack`);
			}
			if (client)
				client.langJson = contentJson;
		}
		else{
			popUpError("Could not load language pack");
		}
	}
	if (contentJson != null && contentJson != undefined){
		content = contentJson[currentPage];
		if (content != null && content != undefined) {
			Object.keys(content).forEach(function (key) {
				instances = document.querySelectorAll(key);
				if (key.startsWith('#input')){
					for (var i=0; i< Object.keys(instances).length; i++)
						instances[i].placeholder = content[key];
				}
				else if (key.startsWith("CV") && chartAverage && chartAbs){
					if (key == "CVwinLossGraph")
						chartAverage.titleBlock.options.text = content[key];
					else if (key == "CVwinLossGraphClient" && chartAverage.config._config.data.datasets.length > 1)
						chartAverage.config._config.data.datasets[1].label = content[key];
					else if (key == "CVwinLossAbsGraph")
						chartAbs.titleBlock.options.text = content[key];
					else if (key == "CVwinLossAbsGraphClient" && chartAverage.config._config.data.datasets.length > 1)
						chartAbs.config._config.data.datasets[1].label = content[key];
					chartAverage.update();
					chartAbs.update();
				}
				else if (key.startsWith("aria")){
					document.querySelectorAll(key.substring(4)).forEach( function (elem) {
						elem.setAttribute("aria-label", content[key]);
					})
					if (currentPage == 'friends')
						updateFriendsAriaLabel(key.substring(4), content[key]);
					if (currentPage == 'search')
						updateSearchAriaLabel(key.substring(4), content[key]);
					if (currentPage == "user" || currentPage == "home")
						updateUserAriaLabel(key.substring(4), content[key]);
				}
				else{
					document.querySelectorAll(key).forEach( function (elem) {
						elem.innerHTML = content[key];
					})
				}
			});
		}
		content = contentJson['index'];
		if (content != null || content != undefined) {
			Object.keys(content).forEach(function (key) {
				instances = document.querySelectorAll(key);
				if (key.startsWith('#input')){
					for (var i=0; i< Object.keys(instances).length; i++)
						instances[i].placeholder = content[key];
				}
				else if (key.startsWith("aria")){
					document.querySelectorAll(key.substring(4)).forEach( function (elem) {
						elem.setAttribute("aria-label", content[key]);
					})
				}
				else{
					for (var i=0; i< Object.keys(instances).length; i++)
						instances[i].innerHTML = content[key];
				}
			});
		}
	}
}

swichTheme.addEventListener("click", () => {
	var theme = window.getComputedStyle(document.documentElement).getPropertyValue("--is-dark-theme") == 1 ? false : true;
	var theme_name = window.getComputedStyle(document.documentElement).getPropertyValue("--is-dark-theme") == 1 ? 'light' : 'dark';
	if (client){
		fetch('/api/user/update', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ is_dark_theme: theme, use_browser_theme: false, theme_name : theme_name}),
			credentials: 'include'
		})
		client.use_browser_theme = false;
	}
	use_browser_theme = false;
	preferedColorSchemeMedia.removeEventListener('change', browserThemeEvent)
	switchTheme(theme_name);
	swichTheme.blur();
})	

function browserThemeEvent(event){
	switchTheme(event.matches == 1 ? 'dark' : 'light');	
}

swichTheme.addEventListener("keydown", (e) => {
	if (e.key == "Enter") {
		swichTheme.click();
		swichTheme.focus();
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

	if (scoreUserName.innerHTML == "deleted")
		scoreUserName.classList.add("deletedUser");
	else
		scoreUserName.setAttribute("aria-label", `${scoreUserName.innerText} ${client.langJson['search']['aria.userResume']}`);
	

	if (scoreOpponentName.innerHTML == "deleted")
		scoreOpponentName.classList.add("deletedUser");
	else
		scoreOpponentName.setAttribute("aria-label", `${scoreOpponentName.innerText} ${client.langJson['search']['aria.userResume']}`);
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
	//matchContainer.setAttribute("aria-label", `${result.innerText} ${client.langJson['user']['ariaP1.matchDescContainer']} ${scoreOpponentName.innerText} ${client.langJson['user']['ariaP2.matchDescContainer']} ${date.innerText}`);

	scoreContainer.appendChild(scoreUser);
	scoreContainer.appendChild(scoreOpponent);

	matchContainer.appendChild(result);
	matchContainer.appendChild(scoreContainer);
	matchContainer.appendChild(date);
	return (matchContainer);
}

async function updateUserAriaLabel(key, content){
	if (key.startsWith("P1")){
		document.querySelectorAll(key.substring(2)).forEach(function (elem) {
			var status = elem.querySelectorAll(".matchDescContainerResult")[0];
			if (status.classList.contains("victory"))
				status = client.langJson['user']['.victory'];
			else if (status.classList.contains("loss"))
				status = client.langJson['user']['.loss'];
			else
				status = client.langJson['user']['.draw'];
			var opponentName = elem.querySelectorAll(".resultScoreName")[1].innerText;
			var date = elem.querySelectorAll(".matchDescContainerDate")[0].innerText;
			elem.setAttribute("aria-label", `${status} ${client.langJson['user']['ariaP1.matchDescContainer']} ${opponentName} ${client.langJson['user']['ariaP2.matchDescContainer']} ${date}`);
		})	
	}
	else{
		document.querySelectorAll(key).forEach(function (elem){
			if (elem.classList.contains("resultScoreName")){
				elem.setAttribute("aria-label", `${elem.innerText} ${content}`);
			}
		})
	}
}

inputSearchUser.addEventListener("keydown", (e) => {
	if (e.key == "Enter") {
		query = inputSearchUser.value.trim();
		if (query.length == 0)
			popUpError("Can't search empty query");
		else
			myPushState(`https://${hostname.host}/search?query=${query}`);
	}
})

dropDownLangBtn.addEventListener("click", (e) => {
	if (dropDownUser.classList.contains("activeDropDown")){
		dropDownUser.classList.remove("activeDropDown");
		void dropDownUser.offsetWidth;
		dropDownUser.classList.add("inactiveDropDown");
		setTimeout((dropDownUser) => {
			dropDownUser.classList.remove("inactiveDropDown");
		}, 300, dropDownUser)
	}
	if (dropDownLang.classList.contains("activeDropDown")){
		dropDownLang.classList.remove("activeDropDown");
		void dropDownLang.offsetWidth;
		dropDownLang.classList.add("inactiveDropDown");

		setTimeout((dropDownLang) => {
			dropDownLang.classList.remove("inactiveDropDown");
		}, 300, dropDownLang)
	}
	else if (dropDownLang.classList.contains("inactiveDropDown")){
		dropDownLang.classList.remove("inactiveDropDown");
		void dropDownLang.offsetWidth;
		dropDownLang.classList.add("activeDropDown");
	}
	else
		dropDownLang.classList.add("activeDropDown");
})

usernameBtn.addEventListener("click", (e) => {
	if (dropDownLang.classList.contains("activeDropDown")){
		dropDownLang.classList.remove("activeDropDown");
		void dropDownLang.offsetWidth;
		dropDownLang.classList.add("inactiveDropDown");

		setTimeout((dropDownLang) => {
			dropDownLang.classList.remove("inactiveDropDown");
		}, 300, dropDownLang)
	}
	if (dropDownUser.classList.contains("activeDropDown")){
		dropDownUser.classList.remove("activeDropDown");
		void dropDownUser.offsetWidth;
		dropDownUser.classList.add("inactiveDropDown");
		setTimeout((dropDownUser) => {
			dropDownUser.classList.remove("inactiveDropDown");
		}, 300, dropDownUser)
	}
	else if (dropDownUser.classList.contains("inactiveDropDown")){
		dropDownUser.classList.remove("inactiveDropDown");
		void dropDownUser.offsetWidth;
		dropDownUser.classList.add("activeDropDown");
	}
	else
		dropDownUser.classList.add("activeDropDown");
})


dropDownLangBtn.addEventListener("keydown", (e) => {
	if (e.key == "Enter") {
		dropDownLangBtn.click();
	}
})

usernameBtn.addEventListener("keydown", (e) => {
	if (e.key == "Enter") {
		usernameBtn.click();
	}
})

dropDownLangOption.forEach(function (button) {
	button.addEventListener("click", (e) => {
		(async() => {
			currentLang = `lang/${button.id}.json`;
			try{
				if (client){
					client.currentLang = `lang/${button.id}.json`;
					fetchResult = await fetch(`https://${hostname.host}/${currentLang}`);
					content = await fetchResult.json();
					client.langJson = content;
				}
				loadCurrentLang();
				if (client){
					fetch('/api/user/update', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({ language_pack: currentLang }),
						credentials: 'include'
					})
					dropDownLangBtn.style.setProperty("background-image", `url(https://${hostname.host}/icons/${button.id}.svg)`);
				}
			}
			catch{
				popUpError(`Could not load ${button.id} language pack`);
			}
		})();
	})
	button.addEventListener("keydown", (e) => {
		if (e.key == "Enter")
			button.click();
	})
})

window.addEventListener("click", (e) => {
	if (!e.target.closest(".activeDropDown")) {
		if (dropDownLang.classList.contains("activeDropDown")){
			dropDownLang.classList.remove("activeDropDown");
			void dropDownLang.offsetWidth;
			dropDownLang.classList.add("inactiveDropDown");

			setTimeout((dropDownLang) => {
				dropDownLang.classList.remove("inactiveDropDown");
			}, 300, dropDownLang)
		}
		if (dropDownUser.classList.contains("activeDropDown")){
			dropDownUser.classList.remove("activeDropDown");
			void dropDownUser.offsetWidth;
			dropDownUser.classList.add("inactiveDropDown");
			setTimeout((dropDownUser) => {
				dropDownUser.classList.remove("inactiveDropDown");
			}, 300, dropDownUser)
		}
	}
	if (!e.target.closest("#notifCenterContainer")){
		if (notifCenterContainer.classList.contains("openCenter") || notifCenterContainer.classList.contains("quickOpenCenter")){
			notifCenterContainer.classList.remove("openCenter")
			notifCenterContainer.classList.remove("quickOpenCenter")
			notifCenterContainer.offsetWidth;
			notifCenterContainer.classList.add("closeCenter")
			setTimeout((container) => {
				container.classList.remove("closeCenter");
			}, 550, notifCenterContainer)
		}
	}
	if (e.target.classList.contains("notifReject")){
		e.target.parentElement.parentElement.remove();
	}
})

function popUpError(error){
	if (document.getElementById("popupErrorContainer"))
		document.getElementById("popupErrorContainer").remove();
	var popupContainer = document.createElement("div");
	popupContainer.id = "popupErrorContainer";
	var popupText = document.createElement("a")
	popupText.innerText = error;
	popupContainer.appendChild(popupText);
	popupContainer.addEventListener("mouseleave", (e) => {
		popupContainer.id = "popupErrorContainerClose"
		setTimeout(()=>{
			popupContainer.remove();
		}, 500)
	})
	document.body.appendChild(popupContainer);
}

window.addEventListener("resize", (e) => {
	if(currentPage == "dashboard"){
		loadUserDashboard(defaultLastXDaysDisplayed)
	}
})

function setLoader(){
	document.getElementById("loaderBg").style.setProperty("display", "block");
	window.onscroll=function(){window.scrollTo(0, 0);};
}
function unsetLoader(){
	document.getElementById("loaderBg").style.setProperty("display", "none");
	window.onscroll=function(){};
}

function incomingPushNotif(message){
	btn = document.getElementById("pushNotif");
	btnText = document.getElementById("pushNotifMessage");
	if (notifCenterContainer.classList.contains("dnd") || btnText.innerText != "")
		return ;
	if (message == undefined || message == "" || (typeof message !== 'string' && !(message instanceof String)))
		message = "PUSH NOTIFICATION";
	else if (message.length > 20){
		message = `${message.substring(0, 20)}...`;
	}
	btnText.innerText = message;
	btn.classList.add("incoming");
	setTimeout((btn, btnText) => {
		if (btn.classList.contains("incoming")){
			btn.classList.remove("incoming");
			btn.offsetWidth;
			btn.classList.add("leaving");
			setTimeout((btn) => {
				btnText.innerText = "";
				btn.classList.remove("leaving");
			}, 300, btn, btnText);
		}
	}, 5300, btn, btnText);
}

var notifBtn = document.getElementById("pushNotif");
notifBtn.addEventListener("click", (e) => {
	if (!notifCenterContainer.classList.contains("closeCenter")){
		if (document.getElementById("pushNotif").classList.contains("incoming")){
			document.getElementById("pushNotif").classList.remove("incoming");
			document.getElementById("pushNotifMessage").innerText = "";
			notifCenterContainer.classList.add("quickOpenCenter");
		}
		else if (!notifCenterContainer.classList.contains("quickOpenCenter"))
			notifCenterContainer.classList.add("openCenter");
		if (notifCenterContainer.classList.contains("pendingNotification"))
			notifCenterContainer.classList.remove("pendingNotification");
	}
})

document.getElementById("pushNotifIcon").addEventListener("click", (e) => {
	if (notifCenterContainer.classList.contains("openCenter") || notifCenterContainer.classList.contains("quickOpenCenter")){
		if (notifCenterContainer.classList.contains("dnd"))
			notifCenterContainer.classList.remove("dnd");
		else
			notifCenterContainer.classList.add("dnd");
	}
})

function sendNotif(message){
	var notifContainer = document.createElement("div");
	var notifCenter = document.getElementById("notifCenter");
	notifContainer.classList.add("notifContainer");
	notifContainer.innerHTML = `<a class="notifMessage">${message}</a>
<div class="notifOptionContainer">
<div class="notifAccept"></div>
<div class="separator"></div>
<div class="notifReject"></div>
</div>`;
	notifCenter.insertBefore(notifContainer, notifCenter.firstChild);
	if (!(notifCenterContainer.classList.contains("openCenter") || notifCenterContainer.classList.contains("quickOpenCenter")))
		incomingPushNotif(message);
	if (!(notifCenterContainer.classList.contains("pendingNotification")))
		notifCenterContainer.classList.add("pendingNotification");
}

sendNotif("TEST");