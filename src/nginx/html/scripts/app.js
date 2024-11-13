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
	"/home": `https://${hostname.host}/scripts/home.js`,
	"/": `https://${hostname.host}/scripts/home.js`,
	"/game" : `https://${hostname.host}/scripts/game.js`,
	"/tournament" : `https://${hostname.host}/scripts/game.js`,
	"/settings" : `https://${hostname.host}/scripts/settings.js`,
	"/user" : `https://${hostname.host}/scripts/user.js`,
	"/dashboard" : `https://${hostname.host}/scripts/dashboard.js`,
	"/search" : `https://${hostname.host}/scripts/search.js`,
	"/friends" : `https://${hostname.host}/scripts/friends.js`,
	"/login" : `https://${hostname.host}/scripts/login.js`,
	404 : `https://${hostname.host}/scripts/404.js`,
	403 : `https://${hostname.host}/scripts/403.js`,
	"/admin": `https://${hostname.host}/scripts/admin.js`
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
	fontAmplifier;
	doNotDisturb;

	constructor (){
		return (async () =>{
			try{
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
					this.doNotDisturb = result.do_not_disturb;
					use_browser_theme = result.use_browser_theme;
					if (use_browser_theme == false)
						switchTheme(this.theme_name);
					if (this.doNotDisturb == true)
						notifCenterContainer.classList.add("dnd");
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
				else if (fetchResult.status == 401)
					return null
			}
			catch{
				var template = `
				<div id="pageContentContainer">
					<h2 id="NotFoundtitle">Error while connecting to server :(</h2>
				</div>
				`
				document.getElementById("container").innerHTML = template;
				throw new Error("Error while reaching server");
			}
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
			setLoader()
			try{
				const fetchResult = await fetch('/api/user/current', {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
					},
					credentials: 'include'
				})
				const result = await fetchResult.json();
				var search = 404;
				if (fetchResult.ok){
					this.#is_admin = result.is_admin;

					var sep = page.indexOf("/", 1)
					if (sep > 0)
						pageName = page.substring(0, sep)
					else
						pageName = page;
					search = pageName;
					if (routes[pageName]){
						if (!this.#is_admin && pageName == "/admin"){
							currentPage = 403;
							search = 403;
						}
						else{
							currentPage = pageName.substring(1);
						}
					}
					else{
						currentPage = 404;
						search = 404;
					}
				}
				else{
					dropDownUserContainer.style.setProperty("display", "none");
					dropDownLangBtn.style.setProperty("background-image", `url(https://${hostname.host}/icons/${currentLang.substring(4, 10)}.svg)`);

					currentPage = 'login';
					search = "/login"
				}
				document.getElementById("script").remove();
				var s = document.createElement("script");
				s.onload = function(){
					(async () => (loadCurrentLang()))();
					unsetLoader()
					checkResizeWindow();
				}
				s.setAttribute('id', 'script');
				s.setAttribute('src', routes[search]);
				document.body.appendChild(s);
			}
			catch{
				popUpError(client.langJson['index']['error reaching server']);
				unsetLoader();
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
		disconnectSocket();
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
		window.onkeydown = null
	}
	if (currentPage == "login"){
		window.onkeydown = null
	}
	if (currentPage == "friends"){
		window.onkeydown = null
	}
	if (currentPage == "game"){
		window.removeEventListener("resize", displayTournament)
	}

	if (client)
		client.loadPage(url.pathname)
	else {
		setLoader();
		dropDownUserContainer.style.setProperty("display", "none");
		dropDownLangBtn.style.setProperty("background-image", `url(https://${hostname.host}/icons/${currentLang.substring(4, 10)}.svg)`);
		history.replaceState("","",`https://${hostname.host}/login`);


		document.getElementById("script").remove();
		var s = document.createElement("script");
		s.onload = function(){
			(async () => (loadCurrentLang()))();
			unsetLoader()
			checkResizeWindow();
		}
		s.setAttribute('id', 'script');
		s.setAttribute('src', `https://${hostname.host}/scripts/login.js`);
		document.body.appendChild(s);
	}
	homeBtn.focus();
}


function handleToken() {
	if (client)
		disconnectSocket();
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
					try {
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
						{
							friendUpdate();
							myReplaceState(`https://${hostname.host}/home`);
						}
					}
					catch{
						unsetLoader();
					}
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
			setLoader();
			(async () => {
				try{
					client = await new Client();
					if (!client)
						myReplaceState(`https://${hostname.host}/login`);
					else if (url.pathname == "" || url.pathname == "/"){
						friendUpdate();
						myReplaceState(`https://${hostname.host}/home`);
					}
					else{
						load();
						friendUpdate();
					}
					if (use_browser_theme){
						if (window.matchMedia) {
							switchTheme(window.matchMedia('(prefers-color-scheme: dark)').matches == 1 ? 'dark' : 'light');
						}
						preferedColorSchemeMedia.addEventListener('change', browserThemeEvent);
					}
				}
				catch{
					unsetLoader();
				}
			})()
	}
}

function isMobile(){
	let hasTouchScreen = false;
	if ("maxTouchPoints" in navigator) {
		hasTouchScreen = navigator.maxTouchPoints > 0;
	}
	else if ("msMaxTouchPoints" in navigator) {
		hasTouchScreen = navigator.msMaxTouchPoints > 0;
	}
	else {
		const mQ = matchMedia?.("(pointer:coarse)");
		if (mQ?.media === "(pointer:coarse)") {
			hasTouchScreen = !!mQ.matches;
		}
		else if ("orientation" in window) {
			hasTouchScreen = true; // deprecated, but good fallback
		}
		else {
			// Only as a last resort, fall back to user agent sniffing
			const UA = navigator.userAgent;
			hasTouchScreen =
			/\b(BlackBerry|webOS|iPhone|IEMobile)\b/i.test(UA) ||
			/\b(Android|Windows Phone|iPad|iPod)\b/i.test(UA);
		}
	}
	return(hasTouchScreen);
}

window.addEventListener('load', (e) => {
	handleToken();
	document.querySelector("#titleFlexContainer").style.setProperty("display", "flex");
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
	{
		myPushState(`https://${hostname.host}/home`);
		friendUpdate();
	}
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
	disconnectSocket();
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
		"svg-path" : "/icons/moon.svg"
	},
	"high_dark" : {
		"--page-bg-rgb" : "#222831",
		"--main-text-rgb" : "#00FFF5",
		"--hover-text-rgb" : "#00ADB5",
		"--option-hover-text-rgb" : "#222831",
		"--option-text-rgb" : "#00FFF5",
		"--input-bg-rgb" : "#393E46",
		"is-dark" : 1,
		"svg-path" : "/icons/moon.svg"
	},
	"light" : {
		"--page-bg-rgb" : "#F5EDED",
		"--main-text-rgb" : "#110026",
		"--hover-text-rgb" : "#FFC6C6",
		"--option-hover-text-rgb" : "#F5EDED",
		"--option-text-rgb" : "#110026",
		"--input-bg-rgb" : "#FFC6C6",
		"is-dark" : 0,
		"svg-path" : "/icons/sun.svg"
	},
	"high_light" : {
		"--page-bg-rgb" : "#FFFBF5",
		"--main-text-rgb" : "#7743DB",
		"--hover-text-rgb" : "#C3ACD0",
		"--option-hover-text-rgb" : "#FFFBF5",
		"--option-text-rgb" : "#7743DB",
		"--input-bg-rgb" : "#F7EFE5",
		"is-dark" : 0,
		"svg-path" : "/icons/sun.svg"
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


		chartStats._plugins._cache[5].options.color = themeMap[theme]["--main-text-rgb"];
		chartStats.update();
	}
	if (currentPage == "game"){
		displayTournament();
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

function ft_create_element(element_name, map){
	var elem = document.createElement(element_name);

	Object.keys(map).forEach(function (key){
		if (key == "innerText")
			elem.innerText = map[key]
		else
			elem.setAttribute(key, map[key]);
	})
	return elem;
}		

function createMatchResumeContainer(match, username) {
	matchContainer = ft_create_element("div", {"class" : "matchDescContainer"});

	result = ft_create_element("a", {"class" : "matchDescContainerResult"});

	date = ft_create_element("a", {"class" : "matchDescContainerDate", "innerText" : match.date});

	if (match.type == 'match'){
		scoreContainer = ft_create_element("div", {"class" : "matchDescContainerScore"});
		scoreUser = ft_create_element("div", {"class" : "resultScore"});
		scoreOpponent = ft_create_element("div", {"class" : "resultScore"});
	
		scoreUserName = ft_create_element("a", {"class" : "resultScoreName", "innerText" : match.player_one == username ? match.player_one : match.player_two});
		scoreUserScore = ft_create_element("a", {"class" : "resultScoreScore", "innerText" : match.player_one == username ? match.player_one_pts : match.player_two_pts});
	
		scoreOpponentName = ft_create_element("a", {"class" : "resultScoreName", "innerText" : match.player_one == username ? match.player_two : match.player_one});
		scoreOpponentScore = ft_create_element("a", {"class" : "resultScoreScore", "innerText" : match.player_one == username ? match.player_two_pts : match.player_one_pts});
		scoreOpponentName.innerText += ":"
		scoreUserName.innerText += ":"
	
		if (scoreUserName.innerText == "deleted")
			scoreUserName.classList.add("deletedUser");
		else
			scoreUserName.setAttribute("aria-label", `${scoreUserName.innerText} ${client.langJson['search']['aria.userResume']}`);
	
	
		if (scoreOpponentName.innerText == "deleted")
			scoreOpponentName.classList.add("deletedUser");
		else
			scoreOpponentName.setAttribute("aria-label", `${scoreOpponentName.innerText} ${client.langJson['search']['aria.userResume']}`);
	
		scoreUser.appendChild(scoreUserName);
		scoreUser.appendChild(scoreUserScore);
	
		scoreOpponent.appendChild(scoreOpponentName);
		scoreOpponent.appendChild(scoreOpponentScore);
		if (username == match.winner){
			result.classList.add("victory");
			result.innerHTML = client.langJson['user']['.victory'];
		}
		else {
			result.classList.add("loss");
			result.innerHTML = client.langJson['user']['.loss'];
		}
		//matchContainer.setAttribute("aria-label", `${result.innerText} ${client.langJson['user']['ariaP1.matchDescContainer']} ${scoreOpponentName.innerText} ${client.langJson['user']['ariaP2.matchDescContainer']} ${date.innerText}`);
	
		scoreContainer.appendChild(scoreUser);
		scoreContainer.appendChild(scoreOpponent);
	
		matchContainer.appendChild(result);
		matchContainer.appendChild(scoreContainer);
	}
	else if (match.type == "tournament"){
		result.classList.add("tournament");
		result.innerHTML = client.langJson['user']['.tournament'];

		result.href = `https://${hostname.host}/tournament?id=${match.id}`;

		matchContainer.appendChild(result);
	}
	else
		return ;
	matchContainer.appendChild(date);
	return (matchContainer);
}

async function updateUserAriaLabel(key, content){
	if (key.startsWith("P1")){
		document.querySelectorAll(key.substring(2)).forEach(function (elem) {
			var status = elem.querySelectorAll(".matchDescContainerResult")[0];
			if (!status.classList.contains("tournament")){
				if (status.classList.contains("victory"))
					status = client.langJson['user']['.victory'];
				else if (status.classList.contains("loss"))
					status = client.langJson['user']['.loss'];
				else
					status = client.langJson['user']['.draw'];
				var opponentName = elem.querySelectorAll(".resultScoreName")[1].innerText;
				var date = elem.querySelectorAll(".matchDescContainerDate")[0].innerText;
				elem.setAttribute("aria-label", `${status} ${client.langJson['user']['ariaP1.matchDescContainer']} ${opponentName} ${client.langJson['user']['ariaP2.matchDescContainer']} ${date}`);
			}
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
	else{
		dropDownLang.classList.remove("inactiveDropDown");
		void dropDownLang.offsetWidth;
		dropDownLang.classList.add("activeDropDown");
	}
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
	if (e.target.closest(".notifReject, .notifAccept")){
		e.target.closest(".notifContainer").remove();
	}
	if (e.target.classList.contains("tournament")){
		e.preventDefault();
		myPushState(`${e.target.href}`);
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

function checkResizeWindow(){
	if(currentPage == "dashboard"){
		var startDate = new Date();
		startDate.setDate(startDate.getDate() - 7);
		loadUserDashboard(startDate, today);
	}

	var tmp = document.querySelector("#inputSearchUserContainer");
	var fontSize = window.getComputedStyle(document.documentElement).fontSize.replace("px", "");
	document.querySelector("#inputSearchUser").style.setProperty("display", "none");
	document.querySelector("#mobileSearchBtn").style.setProperty("display", "none");
	if (window.getComputedStyle(tmp).display != "none"){
		var sectionWidth = 0;
		document.querySelectorAll("#browseFlexContainer > *").forEach(function(elem){
			sectionWidth += elem.getBoundingClientRect().width;
		})
		var availableWidth = document.querySelector("#browseFlexContainer").getBoundingClientRect().width - sectionWidth;
		if (availableWidth < fontSize * 1.5){
			document.querySelector("#mobileSearchBtn").style.setProperty("display", "block");
		}
		else {
			document.querySelector("#inputSearchUser").style.setProperty("display", "block");
		}
	}
}

window.addEventListener("resize", checkResizeWindow);

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
		if (notifCenterContainer.classList.contains("dnd")){
			fetch('/api/user/update', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ "do_not_disturb": false }),
				credentials: 'include'
			})
			notifCenterContainer.classList.remove("dnd");
		}
		else{
			fetch('/api/user/update', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ "do_not_disturb": true }),
				credentials: 'include'
			})
			notifCenterContainer.classList.add("dnd");
		}
	}
})

function sendNotif(message, id, type){
	var notifContainer = document.createElement("div");
	var notifCenter = document.getElementById("notifCenter");
	notifContainer.classList.add("notifContainer");
	notifContainer.innerHTML = `<a class="notifMessage">${message}</a>
	<div style="display:none !important" id="notifId"></div>
<div class="notifOptionContainer">
<div class="notifAccept"></div>
<div class="separator"></div>
<div class="notifReject"></div>
</div>`;

	if (id != undefined && id){
		notifContainer.querySelector("#notifId").classList.add(id);
	}
	if (type == "friend_request"){
		notifContainer.querySelector(".notifAccept").addEventListener("click", function(e){
			const data = {username: e.target.closest(".notifContainer").querySelector("#notifId").className};
			fetch('/api/user/accept_friend_request', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
				credentials: 'include'
			})
		})
		notifContainer.querySelector(".notifReject").addEventListener("click", function(e){
			const data = {username: e.target.closest(".notifContainer").querySelector("#notifId").className};
			fetch('/api/user/reject_friend_request', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
				credentials: 'include'
			})
		})
	}

	notifCenter.insertBefore(notifContainer, notifCenter.firstChild);
	if (!(notifCenterContainer.classList.contains("openCenter") || notifCenterContainer.classList.contains("quickOpenCenter"))){
		notifCenterContainer.classList.add("pendingNotification");
		incomingPushNotif(message);
	}
}

function friendUpdate()
{
	if (!client)
		return;
	var socket = new WebSocket("/ws/friend/");

	socket.onopen = function()
	{
		console.log("Connection established");
	}

	socket.onmessage = function(event)
	{
		var data = JSON.parse(event.data);
		console.log(data);
	}

	socket.onclose = function()
	{
		console.log("Connection closed");
	}

	window.addEventListener('beforeunload', function()
	{
		socket.close();
	});

	document.getElementById('goHomeButton').addEventListener('click', function()
	{
		socket.close();
	});

	window.addEventListener('popstate', function()
	{
		socket.close();
	});

	socket.onmessage = function(event) {
		const data = JSON.parse(event.data);
		if (data.new_request) {
			sendNotif(`${client.langJson.friends['incoming pending request'].replace("USER", data.sender_name)}`, data.sender_name, "friend_request");
		}
	};

	window.disconnectSocket = function()
	{
		if (socket)
			socket.close();
	};

	window.sendFriendRequest = function(user)
	{
		fetch('/api/user/get_user_id', {
			method: 'POST',
			headers: {'Content-Type': 'application/json'},
			body: JSON.stringify({"user" : user,}),
			credentials: 'include'
		}).then(response => {
			if (response.ok) {
				response.json().then((user) => {
					if (!user.blocked){
						const message = JSON.stringify({
							type: 'send_friend_request',
							target_user_id: user.id,
							sender_username: client.username
						});
						socket.send(message);
					}
					else{
						popUpError(client.langJson['friends']['error sending request'])
					}
				});
			}
			else
				console.log("Error: ", response);
		});
	};
}

document.querySelector("#mobileSearchBtn").addEventListener("click", function() {
	myPushState(`https://${hostname.host}/search`);
})

function getWindowWidth() {
	return Math.max(
	  document.body.scrollWidth,
	  document.documentElement.scrollWidth,
	  document.body.offsetWidth,
	  document.documentElement.offsetWidth,
	  document.documentElement.clientWidth
	);
}
  
function getWindowHeight() {
	return Math.max(
	  document.body.scrollHeight,
	  document.documentElement.scrollHeight,
	  document.body.offsetHeight,
	  document.documentElement.offsetHeight,
	  document.documentElement.clientHeight
	);
}
