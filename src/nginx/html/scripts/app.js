homeBtn = document.getElementById("goHomeButton");
switchThemeBtn = document.getElementById("themeButton");
inputSearchUser = document.getElementById("inputSearchUser");
inputSearchUserContainer = document.getElementById("inputSearchUserContainer");
usernameBtn = document.getElementById("usernameBtn");
userPfp = document.getElementById("pfp");
dropDownUserContainer = document.getElementById("dropDownUserContainer");
dropDownUser = document.getElementById("dropDownUser");
dropDownLang = document.getElementById("dropDownLang");
dropDownLangBtn = document.getElementById("dropDownLangBtn");
dropDownLangOption = document.querySelectorAll(".dropDownLangOptions");
notifCenterContainer = document.getElementById("notifCenterContainer")

var currentPage = "";
var currentLang = "EN_UK";
var currentLangPack = `lang/${currentLang}.json`;
var currentTheme = "browser";
var username = "";
const hostname = new URL(window.location.href);
const preferedColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
var matchInfoChart = null, playerOneInfoChart = null, playerTwoInfoChart = null;

var client = null;
var pageName;
var use_browser_theme = true;
var langJson = null;

const routes = {
	"/home": `https://${hostname.host}/scripts/home.js`,
	"/": `https://${hostname.host}/scripts/home.js`,
	"/game": `https://${hostname.host}/scripts/game.js`,
	"/tournament": `https://${hostname.host}/scripts/game.js`,
	"/match": `https://${hostname.host}/scripts/match.js`,
	"/settings": `https://${hostname.host}/scripts/settings.js`,
	"/user": `https://${hostname.host}/scripts/user.js`,
	"/dashboard": `https://${hostname.host}/scripts/dashboard.js`,
	"/search": `https://${hostname.host}/scripts/search.js`,
	"/friends": `https://${hostname.host}/scripts/friends.js`,
	"/login": `https://${hostname.host}/scripts/login.js`,
	"/404": `https://${hostname.host}/scripts/404.js`,
	"/403": `https://${hostname.host}/scripts/403.js`,
	404: `https://${hostname.host}/scripts/404.js`,
	403: `https://${hostname.host}/scripts/403.js`,
	"/admin": `https://${hostname.host}/scripts/admin.js`
}

const friendHashMap = {
	0 : "#online",
	1 : "#all",
	2 : "#pending",
	3 : "#blocked"
}

const availableLang = {
	"EN_UK" : true,
	"FR_FR" : true,
	"IT_IT" : true,
	"DE_GE" : true,
}

const accountSlideTabIdxMap = {
	"#inputChangeUsername" : "13",
	"#saveUsernameBtn" : "14",
	"#changePasswordBtn" : "15",
	"#pfpLabel" : "19",
	"#deleteAccountBtn" : "20",
}

const accessibilitySlideTabIdxMap = {
	"#fontSizeRange" : "13",
	"#settingsDropDownTheme" : "14",
	"#settingsThemeLight" : "15",
	"#settingsThemeDark" : "16",
	"#settingsThemeHCLight" : "17",
	"#settingsThemeHCDark" : "18",
	"#settingsThemeDevice" : "19",
	"#settingsDropDownLang" : "20",
	"#EN_UK" : "21",
	"#FR_FR" : "22",
	"#DE_GE" : "23",
	"#IT_IT" : "24",
}

const errorMap = {
	"Username already taken" : "nameAlreadyTaken",
	"Invalid username" : "invalidName",
	"Username must be alphanumeric" : "forbidenChars",
	"Username must be 15 characters or fewer" : "usernameTooLong",
	"Invalid pfp value, should be a string" : "invalidValue",
	"Image format not supported, use JPEG, PNG or GIF" : "invalidImgFormat",
	"Invalid base64 string" : "invalidBase64Value",
	"Old password not provided" : "missingOldPassword",
	"Remote password change forbiden" : "remotePasswordChangeForbiden",
	"Error while authenticating" : "authenticationError",
	"Old password mismatch" : "incorectOldPassword",
	"Invalid password" : "invalidPassword",
	"Password too long" : "passwordTooLong",
	"Password too short" : "passwordTooShort",
	"Password too weak" : "passwordTooWeak",
	"Password must contain at least one uppercase letter" : "passwordMissingLowerCase",
	"Password must contain at least one lowercase letter" : "passwordMissingUpperCase",
	"Password must contain at least one digit" : "passwordMissingDigit",
	"Password must contain at least one special character" : "passwordMissingSpec",
	"Invalid language_pack value, should be a string" : "invalidValue",
	"Invalid language_pack value, should be 'DE_GE', 'EN_UK', 'FR_FR' or 'IT_IT" : "invalidLanguagePack",
	"Invalid theme_name value, should be a string" : "invalidValue",
	"Invalid theme_name value, should be 'dark', 'light', 'high_dark', 'high_light' or 'browser'" : "invalidThemeName",
}

function addPfpUrlToImgSrc(img, path) {
	if (path != "") {
		var testImg = new Image();

		testImg.onload = function () {
			if (testImg.width > testImg.height) {
				img.style.setProperty("height", "100%");
				img.style.setProperty("width", "unset");
			}
		}
		if (path.startsWith("http")) {
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


/*	 _____  _       ___   _____  _____
	/  __ \| |     / _ \ /  ___|/  ___|
	| /  \/| |    / /_\ \\ `--. \ `--.
	| |    | |    |  _  | `--. \ `--. \
	| \__/\| |____| | | |/\__/ //\__/ /
	 \____/\_____/\_| |_/\____/ \____/*/

class Client {
	username;
	currentPage;
	currentLangPack;
	currentLang
	langJson;
	pfpUrl;
	use_browser_theme;
	theme_name;
	friends;
	friend_requests;
	blocked_user;
	recentMatches;
	#is_admin;
	fontAmplifier;
	doNotDisturb;
	displayName;
	isRemote;

	constructor() {
		return (async () => {
	//		popUpError(window.getComputedStyle(document.body).height);
			try {
				const fetchResult = await fetch('/api/user/current', {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
					},
					credentials: 'include'
				})
				const result = await fetchResult.json();
				if (fetchResult.ok) {
					this.username = result.username;
					this.currentLang = result.lang
					this.currentLangPack = `lang/${this.currentLang}.json`;
					this.pfpUrl = result.pfp;
					this.theme_name = result.theme_name;
					this.friends = result.friends;
					this.friend_requests = result.friend_requests;
					this.blocked_user = result.blocked_users;
					this.isRemote = result.remote_auth;


					var startDate = new Date();
					try{
						this.recentMatches = result.matches[startDate.getFullYear()][startDate.getMonth() + 1][startDate.getDate()];
					}
					catch{
						this.recentMatches = {};
					}

					this.#is_admin = result.is_admin;
					this.fontAmplifier = result.font_amplifier;
					this.use_browser_theme = this.theme_name === "browser" ? true : false;
					this.doNotDisturb = result.do_not_disturb;
					use_browser_theme = this.use_browser_theme;
					if (use_browser_theme == false)
						switchTheme(this.theme_name);
					if (this.doNotDisturb == true)
						notifCenterContainer.classList.add("dnd");
					document.documentElement.style.setProperty("--font-size-amplifier", this.fontAmplifier);

					dropDownLangBtn.style.setProperty("background-image", `url(https://${hostname.host}/icons/${currentLang}.svg)`);

					usernameBtn.innerHTML = result.username;

					try{
						this.displayName = result.display_name;
					}
					catch{
						this.displayName = result.username;
					}

					addPfpUrlToImgSrc(userPfp, result.pfp)

					fetch('/api/user/update', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({ "is_active": true }),
						credentials: 'include'
					})
					document.querySelector("#myProfileBtn").href  = `https://${hostname.host}/${currentLang}/user/${this.username}`;

					const url = new URL(window.location.href);
					var lang = url.pathname.substring(1, url.pathname.indexOf("/", 1));
					if (!availableLang[lang]){
						currentLangPack = this.currentLangPack
						currentLang = this.currentLang;
					}
					else{
						currentLangPack = `lang/${lang}.json`
						currentLang = lang;
					}
				}
				else if (fetchResult.status == 401)
					return null
			}
			catch (error){
				console.error(error);
				var template = `
				<div id="pageContentContainer">
					<h2 id="NotFoundtitle">Error while connecting to server :(</h2>
				</div>
				`
				document.getElementById("container").innerHTML = template;
				throw new Error("Error while reaching server");
			}
			dropDownLangBtn.style.setProperty("background-image", `url(https://${hostname.host}/icons/${currentLang}.svg)`);
			if (this.currentLang != currentLang){
				this.currentLang = currentLang;
				this.currentLangPack = `lang/${this.currentLang}.json`;
				fetch('/api/user/update', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({"language_pack": this.currentLang }),
					credentials: 'include'
				})
			}
			const fetchLangResult = await fetch(`https://${hostname.host}/${this.currentLangPack}`);
			if (fetchLangResult.ok)
				this.langJson = await fetchLangResult.json()
			else
				this.langJson = null;
			return (this);
		})();
	}

	loadPage(page) {
		(async () => {
			setLoader()
			try {
				const fetchResult = await fetch('/api/user/current', {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
					},
					credentials: 'include'
				})
				const result = await fetchResult.json();
				var search = 404;
				if (fetchResult.ok) {
					this.#is_admin = result.is_admin;

					var sep = page.indexOf("/", 1)
					if (sep > 0)
						pageName = page.substring(0, sep)
					else
						pageName = page;
					search = pageName;
					if (routes[pageName]) {
						if (!this.#is_admin && pageName == "/admin") {
							currentPage = 403;
							search = 403;
						}
						else {
							currentPage = pageName.substring(1);
						}
					}
					else {
						currentPage = 404;
						search = 404;
					}
				}
				else {
					dropDownUserContainer.style.setProperty("display", "none");
					dropDownLangBtn.style.setProperty("background-image", `url(https://${hostname.host}/icons/${currentLang}.svg)`);

					currentPage = 'login';
					search = "/login"
				}
				document.getElementById("script").remove();
				var s = document.createElement("script");
				s.onload = function () {
					(async () => (loadCurrentLang()))();
					unsetLoader()
					resizeEvent();
				}
				s.setAttribute('id', 'script');
				s.setAttribute('src', routes[search]);
				document.body.appendChild(s);
			}
			catch {
				popUpError(client.langJson['index']['error_reaching_server']);
				unsetLoader();
			}
		})();
	}
}

class Dashboard{
	startDate;
	endDate;
	startDateStr;
	endDateStr;
	username;
	matches;
	clientUsername;
	clientMatches;

	constructor (startDate, endDate, username, clientUsername){
		return (async () =>{
			try {
				this.startDate = startDate;
				this.endDate = endDate;
				this.startDateStr = `${startDate.getFullYear()}-${startDate.getMonth() + 1}-${startDate.getDate()}`
				this.endDateStr = `${endDate.getFullYear()}-${endDate.getMonth() + 1}-${endDate.getDate()}`
				this.username = username;
				this.clientUsername = clientUsername;
				const matchesFetch = await fetch('/api/user/get', {
					method: 'POST', //GET forbid the use of body :(
					headers: {'Content-Type': 'application/json',},
					body: JSON.stringify({"name" : username, "startDate" : this.startDateStr, "endDate" : this.endDateStr}),
					credentials: 'include'
				})
				this.matches = await matchesFetch.json();
				this.matches = this.matches.matches;

				const clientMatchesFetch = await fetch('/api/user/get', {
					method: 'POST', //GET forbid the use of body :(
					headers: {'Content-Type': 'application/json',},
					body: JSON.stringify({"name" : this.clientUsername, "startDate" : this.startDateStr, "endDate" : this.endDateStr}),
					credentials: 'include'
				})
				this.clientMatches = await clientMatchesFetch.json();
				this.clientMatches = this.clientMatches.matches;
				history.replaceState("","",`https://${hostname.host}/${currentLang}/dashboard/${username}`)
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
			return (this);
		})();
	}
}

XMLHttpRequest.prototype.send = function () {
	return false;
}

window.addEventListener("popstate", (e) => {
	load();
})

function load() {
	const url = new URL(window.location.href);
	var lang;
	var path;
	if (url.pathname.indexOf("/", 1) == -1){
		lang = url.pathname.substring(1);
		path = url.pathname;
		if (langMap[lang] || !routes[url.pathname])
			path = "/home"
		else{
			if (!client){
				currentLangPack = `lang/EN_UK.json`
				currentLang = "EN_UK";
			}
			else{
				currentLangPack = client.currentLangPack
				currentLang = client.currentLang;
			}
		}
	}
	else{
		lang = url.pathname.substring(1, url.pathname.indexOf("/", 2));
		path = url.pathname.substring(lang.length + 1);
	}

	if (!availableLang[lang]){
		if (!client){
			currentLangPack = `lang/EN_UK.json`
			currentLang = "EN_UK";
		}
		else{
			currentLangPack = client.currentLangPack
			currentLang = client.currentLang;
		}
	}
	else{
		currentLangPack = `lang/${lang}.json`
		currentLang = lang;
	}
	if (dropDownLang.classList.contains("activeDropDown")) {
		dropDownLang.classList.remove("activeDropDown");
		void dropDownLang.offsetWidth;
		dropDownLang.classList.add("inactiveDropDown");

		setTimeout((dropDownLang) => {
			dropDownLang.classList.remove("inactiveDropDown");
		}, 300, dropDownLang)
	}
	if (dropDownUser.classList.contains("activeDropDown")) {
		dropDownUser.classList.remove("activeDropDown");
		void dropDownUser.offsetWidth;
		dropDownUser.classList.add("inactiveDropDown");
		setTimeout((dropDownUser) => {
			dropDownUser.classList.remove("inactiveDropDown");
		}, 300, dropDownUser)
	}

	if (client && !(client instanceof Client)) {
		disconnectSocket();
		client = null;
		fetch('/api/user/logout', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include'
		})
		history.replaceState("","",`https://${hostname.host}/${currentLang}/login#login`)
	}
	if (currentPage == "settings") {
		window.onkeydown = null
	}
	if (currentPage == "login") {
		window.onkeydown = null
	}
	if (currentPage == "friends") {
		window.onkeydown = null
	}
	if (currentPage == "game") {
		window.removeEventListener("resize", displayTournament)
	}

	if (client)
		client.loadPage(path)
	else {
		setLoader();
		currentPage = "login";
		dropDownUserContainer.style.setProperty("display", "none");
		dropDownLangBtn.style.setProperty("background-image", `url(https://${hostname.host}/icons/${currentLang}.svg)`);
		history.replaceState("","", `https://${hostname.host}/${currentLang}/login${url.hash}`);


		document.getElementById("script").remove();
		var s = document.createElement("script");
		s.onload = function () {
			(async () => (loadCurrentLang()))();
			unsetLoader()
			resizeEvent();
		}
		s.setAttribute('id', 'script');
		s.setAttribute('src', `https://${hostname.host}/scripts/login.js`);
		document.body.appendChild(s);
	}
	resizeEvent();
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
				if (response.ok) {
					(async () => {
						try {
							client = await new Client()
							if (use_browser_theme) {
								if (window.matchMedia) {
									switchTheme(window.matchMedia('(prefers-color-scheme: dark)').matches == 1 ? 'dark' : 'light');
								}
								preferedColorSchemeMedia.addEventListener('change', browserThemeEvent);
							}
							if (!client)
								myReplaceState(`https://${hostname.host}/${currentLang}/login${hostname.hash}`);
							else {
								friendUpdate();
								myReplaceState(`https://${hostname.host}/${currentLang}/home`);
							}
						}
						catch (e){
							console.error(e);
							unsetLoader();
						}
					})()
				}
				else {
					response.json().then(data => {
						unsetLoader()
						popUpError(data.message || "Error API 42 Invalid key or API down");
						myReplaceState(`https://${hostname.host}/${currentLang}/login#login`);
					})
				}
			}).catch(error => console.error('Error:', error));
	}
	else {
		const url = new URL(window.location.href);
		if (document.getElementById("loaderBg"))
			setLoader();
		(async () => {
			try {
				client = await new Client();
				if (!client)
					myReplaceState(`https://${hostname.host}/${currentLang}/login${hostname.hash}`);
				else if (url.pathname == "" || url.pathname == "/") {
					friendUpdate();
					myReplaceState(`https://${hostname.host}/${currentLang}/home`);
				}
				else {
					friendUpdate();
					load();
				}
				if (use_browser_theme) {
					if (window.matchMedia) {
						switchTheme(window.matchMedia('(prefers-color-scheme: dark)').matches == 1 ? 'dark' : 'light');
					}
					preferedColorSchemeMedia.addEventListener('change', browserThemeEvent);
				}
			}
			catch (error){
				console.error(error);
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

function browser(){
	if (navigator.userAgent.includes("Chrome")){
		console.log("Chrome")
	}
	else if (navigator.userAgent.includes("Mozilla")){
		console.log("Mozilla")
	}
}

window.addEventListener('load', (e) => {
	document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
	handleToken();
	document.querySelector("#titleFlexContainer").style.setProperty("display", "flex");
	if (isMobile()){
		document.documentElement.classList.add("mobile");
		document.documentElement.style.setProperty("--is-mobile", 1)
	}
	else
		document.documentElement.style.setProperty("--is-mobile", 0)

});

function myReplaceState(url) {
	history.replaceState("", "", url);
	load();
}

function myPushState(url) {
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
	friendUpdate();
})

homeBtn.addEventListener("keydown", (e) => {
	if (e.key == "Enter")
		homeBtn.click();
})

const themeMap = {
	"dark": {
		"--page-bg-rgb": "#110026",
		"--main-text-rgb": "#FDFDFB",
		"--hover-text-rgb": "#3A3053",
		"--option-hover-rgb": "#110026",
		"--option-text-rgb": "#FDFDFB",
		"--input-bg-rgb": "#3A3053",
		"--match-bg-rgb": "#3A3053",
		"--border-rgb": "#FDFDFB00",
		"--match-border-rgb": "#110026",
		"--active-selector-rgb" : "#3A3053",
		"--notif-center-border-rgb" : "#FDFDFB",
		"--contest-match-bg-rgb" : "#3A3053",
		"--input-focus-border" : "#FDFDFB",
		"--recent-match-container-focus-child": "#00000000",
		"--recent-match-container-focus-text": "#FDFDFB",
		"--popup-input-bg-rgb" : "#110026",

		"is-dark": 1,
		"svg-path": "/icons/moon.svg"
	},
	"high_dark": {
		"--page-bg-rgb": "#222831",
		"--main-text-rgb": "#00FFF5",
		"--hover-text-rgb": "#ffbff7",
		"--option-hover-rgb": "#ffbff7",
		"--option-text-rgb": "#00FFF5",
		"--input-bg-rgb": "#393E46",
		"--match-bg-rgb": "#393E4600",
		"--border-rgb": "#00FFF5",
		"--match-border-rgb": "#00FFF5",
		"--active-selector-rgb" : "#22283100",
		"--notif-center-border-rgb" : "#00FFF5",
		"--contest-match-bg-rgb" : "#222831",
		"--input-focus-border" : "#FFBFF7",
		"--recent-match-container-focus-child": "#FFBFF7",
		"--recent-match-container-focus-text": "#FFBFF7",
		"--popup-input-bg-rgb" : "#393E46",

		"is-dark": 1,
		"svg-path": "/icons/moon.svg"
	},
	"light": {
		"--page-bg-rgb": "#F5EDED",
		"--main-text-rgb": "#110026",
		"--hover-text-rgb": "#FFC6C6",
		"--option-hover-rgb": "#F5EDED",
		"--option-text-rgb": "#110026",
		"--input-bg-rgb": "#FFC6C6",
		"--match-bg-rgb": "#FFC6C6",
		"--border-rgb": "#11002600",
		"--match-border-rgb": "#F5EDED",
		"--active-selector-rgb" : "#FFC6C6",
		"--notif-center-border-rgb" : "#110026",
		"--contest-match-bg-rgb" : "#FFC6C6",
		"--input-focus-border" : "#110026",
		"--recent-match-container-focus-child": "#00000000",
		"--recent-match-container-focus-text": "#110026",
		"--popup-input-bg-rgb" : "#F5EDED",
		"is-dark": 0,
		"svg-path": "/icons/sun.svg"
	},
	"high_light": {
		"--page-bg-rgb": "#FFFBF5",
		"--main-text-rgb": "#7743DB",
		"--hover-text-rgb": "#2E073F",
		"--option-hover-rgb": "#2E073F",
		"--option-text-rgb": "#7743DB",
		"--input-bg-rgb": "#F7EFE5",
		"--match-bg-rgb": "#F7EFE500",
		"--border-rgb": "#7743DB",
		"--match-border-rgb": "#7743DB",
		"--active-selector-rgb" : "#2E073F00",
		"--notif-center-border-rgb" : "#7743DB",
		"--contest-match-bg-rgb" : "#FFFBF5",
		"--input-focus-border" : "#2E073F",
		"--recent-match-container-focus-child": "#2E073F",
		"--recent-match-container-focus-text": "#2E073F",
		"--popup-input-bg-rgb" : "#F7EFE5",
		"is-dark": 0,
		"svg-path": "/icons/sun.svg"
	}
}

function switchTheme(theme) {
	if (theme == "browser"){
		theme = preferedColorSchemeMedia.matches ? "dark" : "light";
	}
	Object.keys(themeMap[theme]).forEach(function (key) {
		document.documentElement.style.setProperty(key, themeMap[theme][key])
	})
	if (client) {
		fetch('/api/user/update', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ "theme_name": theme}),
			credentials: 'include'
		})
		client.use_browser_theme = false;
		if (document.querySelector("#notifCenter").style.borderLeftColor != "" && document.querySelector("#notifCenter").style.borderLeftColor != "unset"){
			document.querySelector("#notifCenter").style.borderLeftColor = `${window.getComputedStyle(document.documentElement).getPropertyValue("--input-focus-border")}`
			document.querySelector("#notifCenter").style.borderBottomColor = `${window.getComputedStyle(document.documentElement).getPropertyValue("--input-focus-border")}`
		}
	}
	document.documentElement.style.setProperty("--is-dark-theme", themeMap[theme]["is-dark"]);
	if (document.getElementById("themeButton"))
		document.getElementById("themeButton").style.maskImage = `url(https://${hostname.host}${themeMap[theme]["svg-path"]})`;

	if (currentPage == "dashboard") {
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
	if (currentPage == "match"){
		matchInfoChart._plugins._cache[5].options.color = themeMap[theme]["--main-text-rgb"];
		matchInfoChart.update();

		playerOneInfoChart._plugins._cache[5].options.color = themeMap[theme]["--main-text-rgb"];
		playerOneInfoChart.update();


		playerTwoInfoChart._plugins._cache[5].options.color = themeMap[theme]["--main-text-rgb"];
		playerTwoInfoChart.update();

	}
	if (currentPage == "game" && document.querySelector("#tournamentContainer").style.getPropertyValue("display") != "none") {
		displayTournament();
	}
}

switchThemeBtn.addEventListener("click", () => {
	var theme_name = window.getComputedStyle(document.documentElement).getPropertyValue("--is-dark-theme") == 1 ? 'light' : 'dark';
	currentTheme = theme_name;
	use_browser_theme = false;
	preferedColorSchemeMedia.removeEventListener('change', browserThemeEvent)
	switchTheme(theme_name);
	switchThemeBtn.blur();
})

function browserThemeEvent(event) {
	switchTheme(event.matches == 1 ? 'dark' : 'light');
}

switchThemeBtn.addEventListener("keydown", (e) => {
	if (e.key == "Enter") {
		switchThemeBtn.click();
		switchThemeBtn.focus();
	}
})

function ft_create_element(element_name, map) {
	var elem = document.createElement(element_name);

	Object.keys(map).forEach(function (key) {
		if (key == "innerText")
			elem.innerText = map[key]
		else
			elem.setAttribute(key, map[key]);
	})
	return elem;
}

inputSearchUser.addEventListener("keydown", (e) => {
	if (e.key == "Enter") {
		query = inputSearchUser.value.trim();
		myPushState(`https://${hostname.host}/${currentLang}/search?query=${query}`);
	}
})

dropDownLangBtn.addEventListener("click", (e) => {
	if (dropDownUser.classList.contains("activeDropDown")) {
		dropDownUser.classList.remove("activeDropDown");
		void dropDownUser.offsetWidth;
		dropDownUser.classList.add("inactiveDropDown");
		setTimeout((dropDownUser) => {
			dropDownUser.classList.remove("inactiveDropDown");
		}, 300, dropDownUser)
	}
	if (dropDownLang.classList.contains("activeDropDown")) {
		dropDownLang.classList.remove("activeDropDown");
		void dropDownLang.offsetWidth;
		dropDownLang.classList.add("inactiveDropDown");

		setTimeout((dropDownLang) => {
			dropDownLang.classList.remove("inactiveDropDown");
		}, 300, dropDownLang)
	}
	else {
		dropDownLang.classList.remove("inactiveDropDown");
		void dropDownLang.offsetWidth;
		dropDownLang.classList.add("activeDropDown");
	}
})

usernameBtn.addEventListener("click", (e) => {
	if (dropDownLang.classList.contains("activeDropDown")) {
		dropDownLang.classList.remove("activeDropDown");
		void dropDownLang.offsetWidth;
		dropDownLang.classList.add("inactiveDropDown");

		setTimeout((dropDownLang) => {
			dropDownLang.classList.remove("inactiveDropDown");
		}, 300, dropDownLang)
	}
	if (dropDownUser.classList.contains("activeDropDown")) {
		dropDownUser.classList.remove("activeDropDown");
		void dropDownUser.offsetWidth;
		dropDownUser.classList.add("inactiveDropDown");
		setTimeout((dropDownUser) => {
			dropDownUser.classList.remove("inactiveDropDown");
		}, 300, dropDownUser)
	}
	else if (dropDownUser.classList.contains("inactiveDropDown")) {
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


const langMap = {
	"EN_UK" : "en-UK",
	"FR_FR" : "fr",
	"DE_GE" : "de",
	"IT_IT" : "it",
}

dropDownLangOption.forEach(function (button) {
	button.addEventListener("click", (e) => {
		(async () => {
			currentLangPack = `lang/${button.id}.json`;
			try {
				if (client) {
					client.currentLangPack = `lang/${button.id}.json`;
					fetchResult = await fetch(`https://${hostname.host}/${currentLangPack}`);
					content = await fetchResult.json();
					client.langJson = content;
				}
				loadCurrentLang();
				document.documentElement.setAttribute("lang", langMap[button.id]);
				url = new URL(window.location.href);
				history.replaceState("","",`https://${hostname.host}${url.pathname.replace(currentLang, button.id)}`);
				currentLang = button.id;
				if (client) {
					fetch('/api/user/update', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({ language_pack: currentLangPack }),
						credentials: 'include'
					})
					dropDownLangBtn.style.setProperty("background-image", `url(https://${hostname.host}/icons/${button.id}.svg)`);
				}
			}
			catch {
				if (langJson && langJson['index']['.errorLoadLangPack'])
					popUpError(langJson['index']['.errorLoadLangPack'].replace("${LANG}", button.id));
				else
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
		if (dropDownLang.classList.contains("activeDropDown")) {
			dropDownLang.classList.remove("activeDropDown");
			void dropDownLang.offsetWidth;
			dropDownLang.classList.add("inactiveDropDown");

			setTimeout((dropDownLang) => {
				dropDownLang.classList.remove("inactiveDropDown");
			}, 300, dropDownLang)
		}
		if (dropDownUser.classList.contains("activeDropDown")) {
			dropDownUser.classList.remove("activeDropDown");
			void dropDownUser.offsetWidth;
			dropDownUser.classList.add("inactiveDropDown");
			setTimeout((dropDownUser) => {
				dropDownUser.classList.remove("inactiveDropDown");
			}, 300, dropDownUser)
		}
	}
	if (!e.target.closest("#notifCenterContainer")) {
		if (notifCenterContainer.classList.contains("openCenter") || notifCenterContainer.classList.contains("quickOpenCenter")) {
			notifCenterContainer.classList.remove("openCenter")
			notifCenterContainer.classList.remove("quickOpenCenter")
			notifCenterContainer.offsetWidth;
			notifCenterContainer.classList.add("closeCenter")
			setTimeout((container) => {
				container.classList.remove("closeCenter");
			}, 550, notifCenterContainer)
		}
	}
	if (e.target.closest(".notifReject, .notifAccept")) {
		e.target.closest(".notifContainer").remove();
	}
	if (e.target.id == "logOutBtn")
		disconnectSocket();

	if (e.target.href != "" && e.target.href != undefined){
		e.preventDefault();
		myPushState(`${e.target.href}`);

	}

})

function popUpError(error){
	var popupContainer = document.createElement("div");
	popupContainer.className = "popupErrorContainer";
	var popupText = document.createElement("a")
	popupText.innerText = error;
	popupContainer.appendChild(popupText);
	popupContainer.setAttribute("role", "alert");
	popupContainer.addEventListener("mouseleave", (e) => {
		popupContainer.className = "popupErrorContainerClose"
		setTimeout(() => {
			popupContainer.remove();
		}, 500)
	})/*
	setTimeout(function (container){
		container.remove()
	}, 5000, popupContainer);*/
	document.getElementById("popupContainer").insertBefore(popupContainer, document.getElementById("popupContainer").firstChild);
}

function popUpSuccess(error){
	var popupContainer = document.createElement("div");
	popupContainer.className = "popupSuccessContainer";
	var popupText = document.createElement("a")
	popupText.innerText = error;
	popupContainer.appendChild(popupText);
	popupContainer.addEventListener("mouseleave", (e) => {
		popupContainer.className = "popupSuccessContainerClose"
		setTimeout(() => {
			popupContainer.remove();
		}, 500)
	})
	setTimeout(function (container){
		container.remove()
	}, 5000, popupContainer);
	document.getElementById("popupContainer").insertBefore(popupContainer, document.getElementById("popupContainer").firstChild);
}


function setLoader() {
	document.getElementById("loaderBg").style.setProperty("display", "block");

	window.onscroll = function () { window.scrollTo(0, 0); };
}
function unsetLoader() {
	document.getElementById("loaderBg").style.setProperty("display", "none");
	window.onscroll = function () { };
}

document.querySelector("#mobileSearchBtn").addEventListener("click", function() {
	myPushState(`https://${hostname.host}/${currentLang}/search`);
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



/*
		_   _  _____  _____  _____ ______  _____  _____   ___   _____  _____  _____  _   _  _____
		| \ | ||  _  ||_   _||_   _||  ___||_   _|/  __ \ / _ \ |_   _||_   _||  _  || \ | |/  ___|
		|  \| || | | |  | |    | |  | |_     | |  | /  \// /_\ \  | |    | |  | | | ||  \| |\ `--.
		| . ` || | | |  | |    | |  |  _|    | |  | |    |  _  |  | |    | |  | | | || . ` | `--. \
		| |\  |\ \_/ /  | |   _| |_ | |     _| |_ | \__/\| | | |  | |   _| |_ \ \_/ /| |\  |/\__/ /
		\_| \_/ \___/   \_/   \___/ \_|     \___/  \____/\_| |_/  \_/   \___/  \___/ \_| \_/\____/
*/

function incomingPushNotif(message){
	btn = document.getElementById("pushNotif");
	btnText = document.getElementById("pushNotifMessage");
	if (notifCenterContainer.classList.contains("dnd") || btnText.innerText != "")
		return;
	if (message == undefined || message == "" || (typeof message !== 'string' && !(message instanceof String)))
		message = "PUSH NOTIFICATION";
	else if (message.length > 20) {
		message = `${message.substring(0, 20)}...`;
	}
	btnText.innerText = message;
	btn.classList.add("incoming");
	setTimeout((btn, btnText) => {
		if (btn.classList.contains("incoming")) {
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
	if (!notifCenterContainer.classList.contains("closeCenter")) {
		if (document.getElementById("pushNotif").classList.contains("incoming")) {
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

notifBtn.onfocus = function(e) {
	document.querySelector("#notifCenter").style.borderLeftColor = `${window.getComputedStyle(document.documentElement).getPropertyValue("--input-focus-border")}`
	document.querySelector("#notifCenter").style.borderBottomColor = `${window.getComputedStyle(document.documentElement).getPropertyValue("--input-focus-border")}`
}

notifBtn.onmouseover = function(e) {
	document.querySelector("#notifCenter").style.borderLeftColor = `${window.getComputedStyle(document.documentElement).getPropertyValue("--input-focus-border")}`
	document.querySelector("#notifCenter").style.borderBottomColor = `${window.getComputedStyle(document.documentElement).getPropertyValue("--input-focus-border")}`
}


notifBtn.onmouseout = function(e) {
	if (document.activeElement.id != "pushNotif"){
		document.querySelector("#notifCenter").style.borderLeftColor = "unset"
		document.querySelector("#notifCenter").style.borderBottomColor = "unset"
	}
}


notifBtn.onblur = function(e) {
	document.querySelector("#notifCenter").style.borderLeftColor = "unset"
	document.querySelector("#notifCenter").style.borderBottomColor = "unset"
}

notifBtn.onkeydown = function (e) {
	if (e.key == "Enter") {
		if (notifCenterContainer.classList.contains("openCenter") || notifCenterContainer.classList.contains("quickOpenCenter")){
			notifCenterContainer.classList.remove("openCenter")
			notifCenterContainer.classList.remove("quickOpenCenter")
			notifCenterContainer.offsetWidth;
			notifCenterContainer.classList.add("closeCenter")
			setTimeout((container) => {
				container.classList.remove("closeCenter");
			}, 550, notifCenterContainer)
		}
		else
			notifBtn.click()
	};
};

document.getElementById("pushNotifIcon").addEventListener("click", (e) => {
	if (notifCenterContainer.classList.contains("openCenter") || notifCenterContainer.classList.contains("quickOpenCenter")) {
		if (notifCenterContainer.classList.contains("dnd")) {
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
		else {
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

function updateNotifAriaLabel(){
	document.querySelectorAll(".notifContainer").forEach(function(elem){
		elem.setAttribute("aria-label", `${langJson['index']['aria.notifContainer'].replace("${MESSAGE}", elem.innerText)}`);
	})
	document.querySelectorAll(".notifAccept").forEach(function (elem){
		elem.setAttribute("aria-label", langJson['index']['aria.notifAccept']);
	})
	document.querySelectorAll(".notifReject").forEach(function (elem){
		elem.setAttribute("aria-label", langJson['index']['aria.notifReject']);
	})
}

function sendNotif(message, id, type) {
	var notifContainer = document.createElement("div");
	var notifCenter = document.getElementById("notifCenter");
	notifContainer.classList.add("notifContainer");
	notifContainer.setAttribute("aria-label", `${langJson['index']['aria.notifContainer'].replace("${MESSAGE}", message)}`);
	notifContainer.innerHTML = `
	<a class="notifMessage ${type}">${message}</a>
	<div style="display:none !important" id="notifId"></div>
	<div class="notifOptionContainer">
		<div class="notifAccept"></div>
		<div class="separator"></div>
		<div class="notifReject"></div>
	</div>`;

	if (id != undefined && id) {
		notifContainer.querySelector("#notifId").classList.add(id);
	}
	if (type == "friend_request") {
		notifContainer.querySelector(".notifAccept").addEventListener("click", function (e) {
			const data = { username: e.target.closest(".notifContainer").querySelector("#notifId").className };
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
	notifContainer.querySelector(".notifAccept").onkeydown = function(e){if (e.key == "Enter") {e.target.click();}};
	notifContainer.querySelector(".notifReject").onkeydown = function(e){if (e.key == "Enter") {e.target.click();}};
	notifContainer.querySelector(".notifAccept").setAttribute("aria-label", langJson['index']['aria.notifAccept']);
	notifContainer.querySelector(".notifReject").setAttribute("aria-label", langJson['index']['aria.notifReject']);

	notifCenter.insertBefore(notifContainer, notifCenter.firstChild);
	if (!(notifCenterContainer.classList.contains("openCenter") || notifCenterContainer.classList.contains("quickOpenCenter"))) {
		notifCenterContainer.classList.add("pendingNotification");
		incomingPushNotif(message);
	}
	setNotifTabIndexes(notifBtn.tabIndex);
}

function friendUpdate()
{
	if (!client)
		return;
	var socket = new WebSocket("/ws/friend/");

	socket.onopen = function () {
		console.log("Connection established");
	}

	socket.onclose = function () {
		console.log("Connection closed");
	}

	window.addEventListener('beforeunload', function () {
		socket.close();
	});

	document.getElementById('goHomeButton').addEventListener('click', function () {
		socket.close();
	});

	window.addEventListener('popstate', function () {
		socket.close();
	});

	window.disconnectSocket = function()
	{
		if (socket)
			socket.close();
	};

	socket.onmessage = function (event)
	{
		const data = JSON.parse(event.data);
		if (data.new_request)
		{
			sendNotif(`${client.langJson.friends['incoming_pending_request'].replace("${USERNAME}", data.sender_name)}`, data.sender_name, "friend_request");
			if (currentPage === "friends" && !document.getElementById(data.sender_name))
			{
				fetch('/api/user/current', {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
					},
					credentials: 'include'
				})
				.then(response => {
					if (response.ok)
					{
						(response.json()).then((text) => {
						friendRequest = Object.values(text.friend_requests).find(request => request.username === data.sender_name);
						if (friendRequest)
						{
							createFriendRequestContainer(friendRequest);
							document.getElementById("pendingFriendRequestSelectorCount").innerHTML = `(${pendingFriendRequestListContainer.childElementCount})`
						}
						});
					}
				});
			}
		}
		else if (data.status && data.username && currentPage == "friends")
		{
			if (data.status === "online")
			{
				fetch('/api/user/current', {
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
					},
					credentials: 'include'
				})
				.then(response => {
					if (response.ok)
					{
						(response.json()).then((text) => {
						friendRequest = Object.values(text.friends).find(request => request.username === data.username);
						if (friendRequest && !document.querySelector(`#onlineFriendList #${data.username}`))
						{
							if (document.querySelector(`#allFriendList #${data.username}`))
								createFriendOnlineContainer(friendRequest);
							else
							{
								createFriendContainer(friendRequest);
								document.getElementById("allFriendSelectorCount").innerHTML = `(${allFriendListContainer.childElementCount})`;
							}
								document.getElementById("onlineFriendSelectorCount").innerHTML = `(${onlineFriendListContainer.childElementCount})`;
							if (document.querySelector(`#pendingFriendRequestList #${data.username}`))
							{
								document.querySelector(`#pendingFriendRequestList #${data.username}`).remove();
								document.getElementById("pendingFriendRequestSelectorCount").innerHTML = `(${pendingFriendRequestListContainer.childElementCount})`
							}
						}
						});
					}
				});
			}
			else if (data.status === "offline")
			{
				if (document.getElementById(data.username))
				{
					document.getElementById(data.username).remove();
					document.getElementById("onlineFriendSelectorCount").innerHTML = `(${onlineFriendListContainer.childElementCount})`;
				}
			}
		}
		else if (data.status && data.username && currentPage == "user")
		{
			if (data.status === "online")
			{
				document.getElementById("deleteFriendBtn").style.setProperty("display", "block");
				document.getElementById("sendFriendRequestBtn").style.setProperty("display", "none");
			}
		}
		else if (data.type === "friend_removed")
		{
			if (currentPage === "friends")
			{
				if (document.querySelector(`#allFriendList #${data.username}`))
					document.querySelector(`#allFriendList #${data.username}`).remove();

				if (document.querySelector(`#onlineFriendList #${data.username}`))
					document.querySelector(`#onlineFriendList #${data.username}`).remove();

				document.getElementById("allFriendSelectorCount").innerHTML = `(${allFriendListContainer.childElementCount})`;
				document.getElementById("onlineFriendSelectorCount").innerHTML = `(${onlineFriendListContainer.childElementCount})`;
			}
			else if (currentPage === "user")
			{
				document.getElementById("deleteFriendBtn").style.setProperty("display", "none");
				document.getElementById("sendFriendRequestBtn").style.setProperty("display", "block");

			}
		}
	}

	window.sendFriendRequest = function (user) {
		fetch('/api/user/get_user_id', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ "username": user, }),
			credentials: 'include'
		}).then(response => {
			if (response.ok) {
				response.json().then((user) => {
					if (!user.blocked) {
						const message = JSON.stringify({
							type: 'send_friend_request',
							target_user_id: user.id,
							sender_username: client.username
						});
						socket.send(message);
					}
					else {
						if (langJson && langJson['friends']['error_sending_request'])
							popUpError(langJson['friends']['error_sending_request'])
						else
							popUpError("Couldn't send friend request")
					}
				});
			}
			else
				console.log("Error: ", response);
		});
	};
}

function getElemWidth(elem){
	return(Math.max(
		elem.scrollWidth,
		elem.offsetWidth,
		elem.clientWidth
	));
}

const getOrCreateLegendList = (chart, id) => {
	const legendContainer = document.getElementById(id);
	let listContainer = legendContainer.querySelector('ul');

	if (!listContainer) {
	  listContainer = document.createElement('ul');
	  listContainer.className = "legendContainer"

	  legendContainer.appendChild(listContainer);
	}

	return listContainer;
};

const htmlLegendPlugin = {
	id: 'htmlLegend',
	afterUpdate(chart, args, options) {
	  const ul = getOrCreateLegendList(chart, options.containerID);

	  // Remove old legend items
	  while (ul.firstChild) {
		ul.firstChild.remove();
	  }

	  // Reuse the built-in legendItems generator
	  const items = chart.options.plugins.legend.labels.generateLabels(chart);

	  items.forEach(item => {
		const li = document.createElement('li');
		li.className = "legendElementContainer"

		li.onclick = () => {
		  const {type} = chart.config;
		  if (type === 'pie' || type === 'doughnut') {
			// Pie and doughnut charts only have a single dataset and visibility is per item
			chart.toggleDataVisibility(item.index);
		  } else {
			chart.setDatasetVisibility(item.datasetIndex, !chart.isDatasetVisible(item.datasetIndex));
		  }
		  chart.update();
		};

		// Color box
		const boxSpan = document.createElement('span');
		boxSpan.style.background = item.fillStyle;
		boxSpan.style.borderColor = item.strokeStyle;
		boxSpan.style.borderWidth = item.lineWidth + 'px';
		boxSpan.style.display = 'inline-block';
		boxSpan.style.flexShrink = 0;
		boxSpan.style.height = '20px';
		boxSpan.style.marginRight = '10px';
		boxSpan.style.width = '20px';

		// Text
		const textContainer = document.createElement('p');
		textContainer.className = "legendTextContainer"
		textContainer.style.textDecoration = item.hidden ? 'line-through' : '';

		const text = document.createTextNode(item.text);
		textContainer.appendChild(text);

		li.appendChild(boxSpan);
		li.appendChild(textContainer);
		ul.appendChild(li);
	  });
	}
  };

/*
		______ __   __ _   _   ___  ___  ___ _____  _____      ______  _   _  _   _  _____  _____  _____  _____  _   _  _____
		|  _  \\ \ / /| \ | | / _ \ |  \/  ||_   _|/  __ \     |  ___|| | | || \ | |/  __ \|_   _||_   _||  _  || \ | |/  ___|
		| | | | \ V / |  \| |/ /_\ \| .  . |  | |  | /  \/     | |_   | | | ||  \| || /  \/  | |    | |  | | | ||  \| |\ `--.
		| | | |  \ /  | . ` ||  _  || |\/| |  | |  | |         |  _|  | | | || . ` || |      | |    | |  | | | || . ` | `--. \
		| |/ /   | |  | |\  || | | || |  | | _| |_ | \__/\     | |    | |_| || |\  || \__/\  | |   _| |_ \ \_/ /| |\  |/\__/ /
		|___/    \_/  \_| \_/\_| |_/\_|  |_/ \___/  \____/     \_|     \___/ \_| \_/ \____/  \_/   \___/  \___/ \_| \_/\____/
*/


async function loadCurrentLang(){
	const url = new URL(window.location.href);
	langJson = null;
	if (client && client.langJson){
		langJson = client.langJson;
	}
	else if (currentLangPack != undefined){
		const fetchResult = await fetch(`https://${hostname.host}/${currentLangPack}`);
		const svgPath = `https://${hostname.host}/icons/${currentLang}.svg`;
		if (fetchResult.ok){
			try{
				langJson = await fetchResult.json()
				dropDownLangBtn.style.setProperty("background-image", `url(${svgPath})`);
			}
			catch{
				if (langJson && langJson['index']['.errorLoadLangPack'])
					popUpError(langJson['index']['.errorLoadLangPack'].replace("${LANG}", currentLang));
				else
					popUpError(`Could not load ${currentLang} language pack`);
			}
		}
		else {
			if (langJson && langJson['index']['.errorLoadLangPack'])
				popUpError(langJson['index']['.errorLoadLangPack'].replace("${LANG}", currentLang));
			else
				popUpError(`Could not load ${currentLang} language pack`);
			currentLangPack = "lang${currentLang}.json";
			const fetchResult = await fetch(`https://${hostname.host}/lang${currentLang}.json`);
			if (fetchResult.ok){
				try {
					langJson = await fetchResult.json();
				}
				catch {
					if (langJson && langJson['index']['.errorLoadLangPack'])
						popUpError(langJson['index']['.errorLoadLangPack'].replace("${LANG}", currentLang));
					else
						popUpError(`Could not load ${currentLang} language pack`);
				}
			}
			if (client)
				client.langJson = langJson;
		}
	}
	if (langJson == null) {
		currentLangPack = "lang${currentLang}.json";
		const fetchResult = await fetch(`https://${hostname.host}/lang${currentLang}.json`);
		if (fetchResult.ok){
			try {
				langJson = await fetchResult.json();
				dropDownLangBtn.style.setProperty("background-image", `url(https://${hostname.host}/icons${currentLang}.svg)`);
			}
			catch {
				if (langJson && langJson['index']['.errorLoadLangPack'])
					popUpError(langJson['index']['.errorLoadLangPack'].replace("${LANG}", currentLang));
				else
					popUpError(`Could not load ${currentLang} language pack`);
			}
			if (client)
				client.langJson = langJson;
		}
		else{
			if (langJson && langJson['index']['.errorLoadLangPack'])
				popUpError(langJson['index']['.errorLoadLangPack'].replace("${LANG}", currentLang));
			else
				popUpError(`Could not load ${currentLang} language pack`);
		}
	}
	if (langJson != null && langJson != undefined){

		if (url.hash != ""){
			document.title = langJson[currentPage][`${url.hash.replace("#","")} title`];
		}
		else
			document.title = langJson[currentPage][`${currentPage} title`];

		content = langJson[currentPage];
		if (content != null && content != undefined) {
			Object.keys(content).forEach(function (key) {
				try {
					instances = document.querySelectorAll(key);
					if (key.startsWith('#input')){
						for (var i=0; i< Object.keys(instances).length; i++)
							instances[i].placeholder = content[key];
					}
					else if (key.startsWith("aria")){
						document.querySelectorAll(key.substring(4)).forEach( function (elem) {
							elem.setAttribute("aria-label", content[key]);
						})
						if (currentPage == 'friends')
							updateFriendsAriaLabel(key.substring(4), content[key]);
						if (currentPage == 'search')
							updateSearchAriaLabel(key.substring(4), content[key]);
					}
					else{
						document.querySelectorAll(key).forEach( function (elem) {
							elem.innerHTML = content[key];
						})
					}
				}
				catch{}
			});
			try {

				if (currentPage == "user" || currentPage == "home")
					updateUserAriaLabel(content);
				if (currentPage == 'user') {updateUserLang();}
				if (currentPage == 'dashboard') {updateDashboardLang();}
				if (currentPage == "game") {
					document.title = langJson['game'][`game title`].replace("${MODE}", url.searchParams.get("mode"));
				}
				if (currentPage == "search")
					document.title = client.langJson['search'][`search title`].replace("${SEARCH}", "");
				if (currentPage == "home"){
					document.querySelector("#playBtn1v1").href=`https://${hostname.host}/${currentLang}/game?mode=remote`;
					document.querySelector("#playBtnLocal").href=`https://${hostname.host}/${currentLang}/game?mode=local`;
					document.querySelector("#playBtnAI").href=`https://${hostname.host}/${currentLang}/game?mode=ai`;
					document.querySelector("#playTournament").href=`https://${hostname.host}/${currentLang}/game?mode=tournament`;
				}
			}
			catch{}
		}
		content = langJson['index'];
		if (content != null || content != undefined) {
			var searchBar = document.querySelector("#inputSearchUser");
			updateNotifAriaLabel();
			if (content["#inputSearchUser"].length > 15){
				searchBar.style.setProperty("width", `${content["#inputSearchUser"].length}ch`)
			}
			else
				searchBar.style.setProperty("width", `15ch`)
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
				else if (key == ".notifMessage.friend_request"){
					instances.forEach(function(elem){
						elem.innerText = content[key].replace("${USERNAME}", elem.parentElement.querySelector("#notifId").className);
					})
				}
				else{
					for (var i=0; i< Object.keys(instances).length; i++)
						instances[i].innerHTML = content[key];
				}
			});
			document.querySelector("#goHomeButton").href = `/${currentLang}/home`;
			document.querySelector("#friendsBtn").href = `/${currentLang}/friends`;
			document.querySelector("#settingsBtn").href = `/${currentLang}/settings`;
			document.querySelector("#logOutBtn").href = `/${currentLang}/login`;
		}
	}
}

function setNotifTabIndexes(tabIdx){
	notifBtn.tabIndex = tabIdx++;
	document.querySelectorAll(".notifContainer").forEach(function(elem){
		elem.tabIndex = tabIdx;
		tabIdx += 3;

		elem.querySelector(".notifAccept").tabIndex = -1;
		elem.querySelector(".notifReject").tabIndex = -1;
		elem.onkeydown = function(e) {
			if (e.key == "Enter" && e.target.classList.contains("notifContainer")){
				e.target.querySelector(".notifAccept").tabIndex = e.target.tabIndex + 1;
				e.target.querySelector(".notifReject").tabIndex = e.target.tabIndex + 2;
			}
		}
	})
}

function createMatchResumeContainer(match, username, displayName) {
	matchContainer = ft_create_element("a", {"class" : "matchDescContainer", "tabIndex" : "-1"});

	result = ft_create_element("a", {"class" : "matchDescContainerResult"});

	date = ft_create_element("a", {"class" : "matchDescContainerDate", "innerText" : match.date});
	if (match.type == 'match'){
		scoreContainer = ft_create_element("div", {"class" : "matchDescContainerScore"});
		scoreUser = ft_create_element("div", {"class" : "resultScore"});
		scoreOpponent = ft_create_element("div", {"class" : "resultScore"});

		scoreUserName = ft_create_element("a", {"class" : `resultScoreName ${
			match.player_one_display_name == displayName || match.player_one== username ? (match.player_one_display_name != match.player_one ? "displayName" : "") : (match.player_two_display_name != match.player_two ? "displayName" : "")}`,
			 "innerText" : match.player_one_display_name == displayName || match.player_one== username ? match.player_one_display_name : match.player_two_display_name,
			 "tabIndex" : "-1"});
		scoreUserScore = ft_create_element("a", {"class" : "resultScoreScore", "innerText" : match.player_one_display_name == username || match.player_one == username ? match.player_one_pts : match.player_two_pts});

		scoreOpponentName = ft_create_element("a", {"class" : `resultScoreName ${
			match.player_one_display_name == displayName || match.player_one== username ? (match.player_two_display_name != match.player_two ? "displayName" : "") : (match.player_one_display_name != match.player_one ? "displayName" : "")}`,
			"innerText" : match.player_one_display_name == displayName || match.player_one== username ? match.player_two_display_name : match.player_one_display_name,
			"tabIndex" : "-1"});
		scoreOpponentScore = ft_create_element("a", {"class" : "resultScoreScore", "innerText" : match.player_one_display_name == displayName || match.player_one == username ? match.player_two_pts : match.player_one_pts});

		if (scoreUserName.innerText == "deleted"){
			scoreUserName.classList.add("deletedUser");
			scoreUserName.innerText = client.langJson["index"][".deletedUser"];
		}
		else if (scoreUserName.innerText == "blocked"){
			scoreUserName.classList.add("blockedUser");
			scoreUserName.innerText = client.langJson["index"][".blockedUser"];
		}
		else{
			scoreUserName.href  = `https://${hostname.host}/${currentLang}/user/${match.player_one_display_name == username || match.player_one== username ? match.player_one : match.player_two}`
			scoreUserName.setAttribute("aria-label", `${client.langJson['home']['aria.resultScoreName'].replace("${USERNAME}", scoreUserName.innerText)}`);
		}


		if (scoreOpponentName.innerText == "deleted"){
			scoreOpponentName.classList.add("deletedUser");
			scoreOpponentName.innerText = client.langJson["index"][".deletedUser"];
		}
		else if (scoreOpponentName.innerText == "blocked"){
			scoreOpponentName.classList.add("blockedUser");
			scoreOpponentName.innerText = client.langJson["index"][".blockedUser"];
		}
		else{
			scoreOpponentName.href  = `https://${hostname.host}/${currentLang}/user/${match.player_one_display_name == username || match.player_one== username ? match.player_two : match.player_one}`
			scoreOpponentName.setAttribute("aria-label", `${client.langJson['home']['aria.resultScoreName'].replace("${USERNAME}", scoreOpponentName.innerText)}`);
		}
		winnerName = ft_create_element("div", {"class" : "matchResumeWinner", "innerText" : match.winner == match.player_one ? match.player_one == match.player_one_display_name ? match.player_one : match.player_one_display_name : match.player_two == match.player_two_display_name ? match.player_two : match.player_two_display_name});
		matchContainer.appendChild(winnerName);
		matchContainer.setAttribute("aria-label", client.langJson['user']['ariaResume.matchDescContainer'].replace("${USER_ONE}", scoreUserName.innerText).replace("${USER_TWO}", scoreOpponentName.innerText).replace("${DATE}", match.date).replace("${WINNER}", winnerName.innerText))
		scoreOpponentName.innerText += ":"
		scoreUserName.innerText += ":"
		scoreUserNameContainer = ft_create_element("div", {"class" : "resultScoreNameContainer"});
		scoreOpponentNameContainer = ft_create_element("div", {"class" : "resultScoreNameContainer"});
		scoreUserNameContainer.appendChild(scoreUserName)
		scoreOpponentNameContainer.appendChild(scoreOpponentName)
		scoreUser.appendChild(scoreUserNameContainer);
		scoreUser.appendChild(scoreUserScore);

		scoreOpponent.appendChild(scoreOpponentNameContainer);
		scoreOpponent.appendChild(scoreOpponentScore);
		


		if (username == match.winner){
			result.classList.add("victory");
			result.innerHTML = client.langJson['user']['.victory'];
		}
		else {
			result.classList.add("loss");
			result.innerHTML = client.langJson['user']['.loss'];
		}
		scoreContainer.appendChild(scoreUser);
		scoreContainer.appendChild(scoreOpponent);

		matchContainer.appendChild(result);
		matchContainer.appendChild(scoreContainer);
		matchContainer.href  = `https://${hostname.host}/${currentLang}/match?id=${match.id}`;
	}
	else if (match.type == "tournament"){
		result.classList.add("tournament");
		result.innerHTML = client.langJson['user']['.tournament'];

		matchContainer.href  = `https://${hostname.host}/${currentLang}/tournament?id=${match.id}`;

		matchContainer.appendChild(result);
	}
	else
		return ;
	matchContainer.appendChild(date);
	return (matchContainer);
}

async function updateUserAriaLabel(dict){
	document.querySelectorAll(".matchDescContainer").forEach(function (elem){
		var status = elem.querySelectorAll(".matchDescContainerResult")[0];
		var date = elem.querySelector(".matchDescContainerDate").innerText;
		if (!status.classList.contains("tournament")){
			var player_one = elem.querySelectorAll(".resultScoreName")[0].innerText.replace(":","");
			var player_two = elem.querySelectorAll(".resultScoreName")[1].innerText.replace(":","");
			var winner = elem.querySelector(".matchResumeWinner").innerText
			elem.setAttribute("aria-label", dict['ariaResume.matchDescContainer'].replace("${USER_ONE}", player_one).replace("${USER_TWO}", player_two).replace("${DATE}", date).replace("${WINNER}", winner));
		}
		else{
			elem.setAttribute("aria-label", dict['ariaResumeTournament.matchDescContainer'].replace("${DATE}", date));
		}
	})
	document.querySelectorAll(".resultScoreName").forEach(function (elem){
		elem.setAttribute("aria-label", dict['aria.resultScoreName'].replace("${USERNAME}", elem.innerText));
	})
}

/*	______  _____  _____  _____  ______ _____
	| ___ \|  ___|/  ___||_   _||___  /|  ___|
	| |_/ /| |__  \ `--.   | |     / / | |__
	|    / |  __|  `--. \  | |    / /  |  __|
	| |\ \ | |___ /\__/ / _| |_ ./ /___| |___
	\_| \_|\____/ \____/  \___/ \_____/\____/
 */

let ua = navigator.userAgent;
if (!isMobile()){
	setInterval(function() {
		document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
		if (navigator.userAgent !== ua) {
			if (isMobile()){
				document.documentElement.classList.add("mobile");
			}
			else{
				document.documentElement.classList.remove("mobile");
			}
			ua = navigator.userAgent;
		}
		checkResizeIndex()
		if (currentPage == "home" || currentPage == "user"){
			checkMatchResumeSize()
		}
		if (currentPage == "user")
			checkUserPageSize();
		if (currentPage == "game")
			checkGameSize();
		if (currentPage == "tournament")
			displayTournament();
		if (currentPage == "game" || currentPage == "tournament")
			setTimeout(checkWinnerDisplaySize, 1)
		if (currentPage == "friends")
			checkFriendPageSize()
	
	
	}, 500);
}

function isMobile(){return (navigator.userAgent.match(/iphone|android|blackberry/ig))};

function isPortrait(){return window.matchMedia("(orientation: portrait)").matches};

window.matchMedia("(orientation: portrait)").onchange = function(e){
	resizeEvent(e, true);
	if (currentPage == "match")
		drawMatchInfoGraph();
	if (currentPage == "dashboard"){
		if (isMobile()){
			if (document.getElementById("winLossGraph"))
				document.getElementById("winLossGraph").remove();
			if (document.getElementById("winLossAbsGraph"))
				document.getElementById("winLossAbsGraph").remove();
			if (document.getElementById("userStatGraph"))
				document.getElementById("userStatGraph").remove();
			setTimeout(displayCharts, 500)
		}
		else{
			displayCharts();
		}
	}
};

function resizeEvent(event, orientationChange = false){
	document.documentElement.style.setProperty('--vh', `${window.innerHeight * 0.01}px`);
	checkResizeIndex()
	if (orientationChange == false && currentPage == "dashboard")
		displayCharts();
	if (currentPage == "home" || currentPage == "user"){
		checkMatchResumeSize()
	}
	if (currentPage == "user")
		checkUserPageSize();
	if (currentPage == "game")
		checkGameSize();
	if (currentPage == "tournament")
		displayTournament();
	if (currentPage == "game" || currentPage == "tournament")
		setTimeout(checkWinnerDisplaySize, 1)
	if (currentPage == "match")
		checkMatchSize();
	if (currentPage == "friends")
		checkFriendPageSize()
}

function checkResizeIndex(){
	var tmp = document.querySelector("#inputSearchUserContainer");
	var fontSize = parseInt(window.getComputedStyle(document.documentElement).fontSize);
	var spareWidth = 0;
	document.querySelector("#inputSearchUser").style.setProperty("display", "none");
	document.querySelector("#mobileSearchBtn").style.setProperty("display", "none");
	if (window.getComputedStyle(tmp).display != "none") {
		var sectionWidth = 0;
		document.querySelectorAll("#browseFlexContainer > *").forEach(function (elem) {
			sectionWidth += elem.getBoundingClientRect().width;
		})
		var availableWidth = document.querySelector("#browseFlexContainer").getBoundingClientRect().width - sectionWidth;
		if (availableWidth < fontSize * 1.5) {
			document.querySelector("#mobileSearchBtn").style.setProperty("display", "block");
		}
		else {
			document.querySelector("#inputSearchUser").style.setProperty("display", "block");
		}
	}
	if (isPortrait() && isMobile()){
		spareWidth = document.querySelector("#quickSettingContainer").getBoundingClientRect().width - document.querySelector("#dropDownUserContainer").getBoundingClientRect().width;
	}

	if (client){
		tmp = document.querySelector("#quickSettingContainer");
		username = document.querySelector("#dropDownUser");
		var currentFontSize = parseInt(window.getComputedStyle(document.querySelector("#usernameBtn")).fontSize)
		var baseFontSize = parseInt(window.getComputedStyle(document.documentElement).fontSize)
		var texts = document.querySelectorAll("#usernameBtn, .dropDownMenuBtn");
		var biggest = texts[0];
		var dropDownUserContainer = document.querySelector("#dropDownUserContainer").getBoundingClientRect().width
		username.style.fontSize = `${baseFontSize}px`
		texts.forEach(function(elem){
			if (elem.getBoundingClientRect().width > biggest.getBoundingClientRect().width)
				biggest = elem;
		})

		for (let i=0; i<tmp.childElementCount;i++){
			if (tmp.children[i].style.getPropertyValue("display") == "none" || tmp.children[i].style.getPropertyValue("display") == "")
				continue ;
			if (tmp.children[i].getBoundingClientRect().left == tmp.getBoundingClientRect().left)
				break

			while ((tmp.children[i].getBoundingClientRect().left > tmp.getBoundingClientRect().left || spareWidth > 0) && currentFontSize < baseFontSize){
				if (isPortrait() && isMobile()){
					spareWidth = document.querySelector("#quickSettingContainer").getBoundingClientRect().width - document.querySelector("#dropDownUserContainer").getBoundingClientRect().width;
				}
				username.style.setProperty("font-size", `${currentFontSize}px`)
				currentFontSize += 1;
			}
			while ((tmp.children[i].getBoundingClientRect().left < tmp.getBoundingClientRect().left || biggest.getBoundingClientRect().right > document.documentElement.offsetWidth) && currentFontSize > 8){
				username.style.setProperty("font-size", `${currentFontSize}px`)
				currentFontSize -= 1;
			}
		}
		tmp = document.querySelector("#subtitle");
		if (tmp.innerText != ""){
			var currentFontSize = parseInt(window.getComputedStyle(tmp).fontSize)
			var baseFontSize = parseInt(window.getComputedStyle(document.documentElement).fontSize) * 1.5;
			if (currentFontSize > baseFontSize)
				tmp.style.setProperty("font-size", `${baseFontSize}px`)
			var anchor = document.querySelector("#quickSettingContainer");
			while (tmp.getBoundingClientRect().right < anchor.getBoundingClientRect().left && currentFontSize < baseFontSize){
				tmp.style.setProperty("font-size", `${currentFontSize}px`)
				currentFontSize += 1;
			}
			while (tmp.getBoundingClientRect().right > anchor.getBoundingClientRect().left && currentFontSize > 8){
				tmp.style.setProperty("font-size", `${currentFontSize}px`)
				currentFontSize -= 1;
			}
		}
	}
}

function checkUserPageSize(){
	var text = document.querySelector("#profileName");
	if (!text)
		return;

	var baseFontSize = parseInt(window.getComputedStyle(document.documentElement).fontSize) * 4;
	var currentFontSize = parseInt(window.getComputedStyle(text).fontSize);
	text.style.setProperty("transition", "none")
	if (currentFontSize > baseFontSize)
		text.style.setProperty("font-size", `${baseFontSize}px`)
	while (text.getBoundingClientRect().width < text.parentElement.getBoundingClientRect().width && currentFontSize <= baseFontSize){
		text.style.setProperty("font-size", `${currentFontSize}px`)
		currentFontSize += 1;
	}
	while (text.getBoundingClientRect().width > text.parentElement.getBoundingClientRect().width && currentFontSize > 8){
		text.style.setProperty("font-size", `${currentFontSize}px`)
		currentFontSize -= 1;
	}
}

function checkFriendPageSize(){

	var texts = document.querySelectorAll("#friendInfo .slideSelector .slideSelectorText");
	var ancestor = document.querySelector("#friendSlideSelector");
	if (texts.length == 0 || !ancestor)
		return;
	var i =0;
	var baseFontSize = parseInt(window.getComputedStyle(document.body).fontSize);
	var currentFontSize = parseInt(window.getComputedStyle(texts[0].parentElement).fontSize);
	texts.forEach(function(text){
		while (text.getBoundingClientRect().width < text.parentElement.getBoundingClientRect().width && currentFontSize <= baseFontSize){
			ancestor.style.setProperty("font-size", `${currentFontSize}px`)
			currentFontSize += 1;
		}
		while (text.getBoundingClientRect().width > text.parentElement.getBoundingClientRect().width && currentFontSize > 8){
			ancestor.style.setProperty("font-size", `${currentFontSize}px`)
			currentFontSize -= 1;
		}
	})
}

function checkMatchResumeSize(){
	var recentMatchHistoryContainer = document.getElementById("recentMatchHistory");
	if (!recentMatchHistoryContainer)
		return;
	var matches = recentMatchHistoryContainer.querySelectorAll(".matchDescContainer");
	var baseWidth = 16
	var i = 0;
	ch = 1
	if (matches && matches.length > 0){
		if (!(isPortrait() && isMobile())){
			while (i < matches.length && !matches[i].querySelector(".resultScoreNameContainer"))
				i++;
			if (i == matches.length)
				return;
			while (1 && ch <= baseWidth){
				var width = matches[i].getBoundingClientRect().width;
				var ch = parseInt(recentMatchHistoryContainer.querySelector(".resultScoreNameContainer").style.getPropertyValue("width"))

				if (width * matches.length <= getWindowWidth() && ch < baseWidth){
					recentMatchHistoryContainer.querySelectorAll(".resultScoreNameContainer").forEach(function(elem){
						elem.style.setProperty("width", `${ch + 1}ch`);
					})
					var width = matches[i].getBoundingClientRect().width;
				}
				else
					break;

			}
			while (1 && baseWidth > 1){
				width = matches[i].getBoundingClientRect().width;
				if (width * matches.length > getWindowWidth()){
					baseWidth--;
					recentMatchHistoryContainer.querySelectorAll(".resultScoreNameContainer").forEach(function(elem){
						elem.style.setProperty("width", `${baseWidth}ch`);
					})
				}
				else
					break
			}
		}
		else{
			recentMatchHistoryContainer.querySelectorAll(".resultScoreNameContainer").forEach(function(elem){
				elem.style.setProperty("width", "16ch");
			})
		}
	}
	else {
		var text = document.querySelector("#notPlayedToday");
		if (!text)
			return;

		var baseFontSize = parseInt(window.getComputedStyle(document.documentElement).fontSize);
		var currentFontSize = parseInt(window.getComputedStyle(text).fontSize);
		while (text.getBoundingClientRect().width < recentMatchHistoryContainer.getBoundingClientRect().width && currentFontSize <= baseFontSize){
			text.style.setProperty("font-size", `${currentFontSize}px`)
			currentFontSize += 1;
		}
		while (text.getBoundingClientRect().width > recentMatchHistoryContainer.getBoundingClientRect().width && currentFontSize > 8){
			text.style.setProperty("font-size", `${currentFontSize}px`)
			currentFontSize -= 1;
		}
	}
}


const keyMap = {"KeyS" : "KeyS", "KeyW" : "KeyW", "KeyA" : "KeyA", "KeyD" : "KeyD", "ArrowUp" : "ArrowUp", "ArrowDown" : "ArrowDown", "ArrowLeft" : "ArrowLeft", "ArrowRight" : "ArrowRight"};
const verticalInversedkeyMap = {"KeyS" : "KeyW", "KeyW" : "KeyS", "KeyA" : "KeyA", "KeyD" : "KeyD", "ArrowUp" : "ArrowDown", "ArrowDown" : "ArrowUp", "ArrowLeft" : "ArrowLeft", "ArrowRight" : "ArrowRight"};
const HorizontalInversedkeyMap = {"KeyS" : "KeyS", "KeyW" : "KeyW", "KeyA" : "KeyD", "KeyD" : "KeyA", "ArrowUp" : "ArrowUp", "ArrowDown" : "ArrowDown", "ArrowLeft" : "ArrowRight", "ArrowRight" : "ArrowLeft"};
const FullInversedKeyMap = {"KeyS" : "KeyW", "KeyW" : "KeyS", "KeyA" : "KeyD", "KeyD" : "KeyA", "ArrowUp" : "ArrowDown", "ArrowDown" : "ArrowUp", "ArrowLeft" : "ArrowRight", "ArrowRight" : "ArrowLeft"};
const WASDInversedKeyMap = {"KeyS" : "KeyW", "KeyW" : "KeyS", "KeyA" : "KeyD", "KeyD" : "KeyA", "ArrowUp" : "ArrowUp", "ArrowDown" : "ArrowDown", "ArrowLeft" : "ArrowLeft", "ArrowRight" : "ArrowRight"};


function checkGameSize(){
	if (document.querySelector("#tournamentContainer") && document.querySelector("#tournamentContainer").style.getPropertyValue("display") != "none"){
		displayTournament();
	}
	if (document.querySelector("#gameContainer") && !document.querySelector("#gameContainer").classList.contains("local")){
		if (isPortrait()){
			if (client.username == document.querySelector("#gameContainer #playerOne > .playerName").innerText || (client.displayName == document.querySelector("#gameContainer #playerOne > .playerName").innerText) ){
				document.querySelector("#game").style.setProperty("rotate", "270deg");
				document.querySelector("#gameContainer").style.setProperty("flex-direction", "column-reverse");
				document.querySelector("#gameDisplay").style.setProperty("flex-direction", "column-reverse");
				playerKeyMap = FullInversedKeyMap;
				playerTouchMap = keyMap;
			}
			else{
				document.querySelector("#game").style.setProperty("rotate", "90deg");
				document.querySelector("#gameContainer").style.setProperty("flex-direction", "column");
				document.querySelector("#gameDisplay").style.setProperty("flex-direction", "column");

				playerKeyMap = keyMap;
				playerTouchMap = FullInversedKeyMap;
			}
		}
		else {
			if (client.username == document.querySelector("#gameContainer #playerOne > .playerName").innerText || (client.displayName == document.querySelector("#gameContainer #playerOne > .playerName").innerText) ){
				document.querySelector("#game").style.setProperty("rotate", "0deg");
				document.querySelector("#gameContainer").style.setProperty("flex-direction", "row");
				document.querySelector("#gameDisplay").style.setProperty("flex-direction", "row");
				playerKeyMap = HorizontalInversedkeyMap;
				playerTouchMap = verticalInversedkeyMap;
				if (isMobile()){
					document.querySelector("#gameContainer").style.setProperty("flex-direction", "column-reverse")
				}
			}
			else{
				document.querySelector("#game").style.setProperty("rotate", "180deg");
				document.querySelector("#gameDisplay").style.setProperty("flex-direction", "row-reverse");
				playerKeyMap = verticalInversedkeyMap;
				playerTouchMap = verticalInversedkeyMap;
				if (isMobile()){
					document.querySelector("#gameContainer").style.setProperty("flex-direction", "column")
				}
			}
		}
	}
	else{
		if (isMobile())	{
			playerKeyMap = WASDInversedKeyMap;
		}
	}
	var container = document.querySelector("#gameDisplay")
	var baseFontSize = parseInt(window.getComputedStyle(document.documentElement).fontSize) * 1.5;
	var currentFontSize = parseInt(window.getComputedStyle(container.querySelector(".playerName")).fontSize);
	var anchor = document.querySelector("#notifCenterContainer").getBoundingClientRect()
	while (getElemWidth(container).toFixed(0) <= anchor.right.toFixed(0) && currentFontSize < baseFontSize){
		container.querySelectorAll(".playerName").forEach(function (elem) {
			elem.style.setProperty("font-size", `${currentFontSize + 1}px`)
		})
		currentFontSize += 1;
	}
	while (getElemWidth(container).toFixed(0) > anchor.right.toFixed(0) && currentFontSize > 8){
		container.querySelectorAll(".playerName").forEach(function (elem) {
			elem.style.setProperty("font-size", `${currentFontSize - 1}px`)
		})
		currentFontSize -= 1;
	}
}

function checkMatchSize(){
	var container = document.querySelector("#matchPlayersInfo")
	var texts = document.querySelectorAll(".playerName, .playerDisplayName");
	var baseFontSize = parseInt(window.getComputedStyle(document.documentElement).fontSize);
	var graphBaseSize = 300;
	var graphCurrentSize, graphMatchCurrentSize;
	if (playerOneInfoChart)
		graphCurrentSize = playerOneInfoChart.width;
	else
		graphCurrentSize = 300;

	if (matchInfoChart)
		graphMatchCurrentSize = matchInfoChart.width;
	else
		graphMatchCurrentSize = 400;

	var currentFontSize = parseInt(window.getComputedStyle(container).fontSize);
	var biggest = texts[0];
	texts.forEach(function(elem){
		if (elem.getBoundingClientRect().width > biggest.getBoundingClientRect().width)
			biggest = elem;
	})
	if (isPortrait()){
		var graphSample = container.querySelector(".playerInfoGraphContainer");
		var anchorSample = document.querySelector(".playerInfoContainer");
		while (currentFontSize < baseFontSize || (graphSample.getBoundingClientRect().width + 5 <= anchorSample.getBoundingClientRect().width && graphCurrentSize + 5 <= graphBaseSize)){
			if (currentFontSize < baseFontSize){
				container.style.setProperty("font-size", `${currentFontSize + 1}px`)
				currentFontSize += 1;
			}
			if (graphSample.getBoundingClientRect().width + 5 <= anchorSample.getBoundingClientRect().width && graphCurrentSize + 5 <= graphBaseSize){
				graphCurrentSize += 5;
				drawMatchInfoGraph(graphCurrentSize, graphMatchCurrentSize);
			}
		}
		while ((biggest.getBoundingClientRect().width > anchorSample.getBoundingClientRect().width && currentFontSize > 8 * client.fontAmplifier) ||
			((graphSample.getBoundingClientRect().width > anchorSample.getBoundingClientRect().width || document.documentElement.clientHeight - 5 < graphSample.getBoundingClientRect().bottom) && graphCurrentSize > 200)){
			if (biggest.getBoundingClientRect().width > anchorSample.getBoundingClientRect().width && currentFontSize > 8 * client.fontAmplifier){
				container.style.setProperty("font-size", `${currentFontSize - 1}px`)
				currentFontSize -= 1;
			}
			if (graphCurrentSize > 200) {
				graphCurrentSize -= 5;
				drawMatchInfoGraph(graphCurrentSize, graphMatchCurrentSize);
			}
		}
		if (document.querySelector("#exchangeContainer .portrait .exchangeTablesCaption").getBoundingClientRect().width > document.documentElement.offsetWidth){
			document.querySelector("#exchangeContainer .portrait").style.setProperty("display", "none");
			document.querySelector("#exchangeContainer .landscape").style.setProperty("display", "block");
		}
	}
	else{
		anchor = biggest.closest(".playerInfoContainer");
		infoAnchor = biggest.closest(".playerInfo");
		graphAnchor = anchor.querySelector(".playerInfoGraphContainer");
		while ((biggest.getBoundingClientRect().width <= infoAnchor.getBoundingClientRect().width && anchor.getBoundingClientRect().width >= parseInt(graphAnchor.getBoundingClientRect().right)) && currentFontSize <= baseFontSize){
			container.style.setProperty("font-size", `${currentFontSize + 1}px`);
			currentFontSize += 1;
		}
		while ((biggest.getBoundingClientRect().width > infoAnchor.getBoundingClientRect().width || anchor.getBoundingClientRect().width < parseInt(graphAnchor.getBoundingClientRect().right)) && currentFontSize > 8){
			container.style.setProperty("font-size", `${currentFontSize - 1}px`);
			currentFontSize -= 1;
		}
	}
}

function checkWinnerDisplaySize(){
	var container = document.querySelector("#winBg")
	var text = document.querySelector("#winName");
	if (!(container && text) || Math.abs(container.getBoundingClientRect().width - text.getBoundingClientRect().width) < 10)
		return ;
	var baseFontSize = parseInt(window.getComputedStyle(document.querySelector("#title")).fontSize);
	var currentFontSize = parseInt(window.getComputedStyle(container.querySelector("#winName")).fontSize);

	while (container.getBoundingClientRect().width > text.getBoundingClientRect().width && currentFontSize < baseFontSize){
		text.style.setProperty("font-size", `${parseInt(window.getComputedStyle(text).fontSize) + 1}px`)
		currentFontSize += 1;
	}
	while (container.getBoundingClientRect().width < document.querySelector("#winName").getBoundingClientRect().width && currentFontSize > 8){
		document.querySelector("#winName").style.setProperty("font-size", `${currentFontSize}px`)
		currentFontSize -= 1;
	}
}

window.addEventListener("resize", resizeEvent);



/***
 *    ______  _____ ______  _   _  _____
 *    |  _  \|  ___|| ___ \| | | ||  __ \
 *    | | | || |__  | |_/ /| | | || |  \/
 *    | | | ||  __| | ___ \| | | || | __
 *    | |/ / | |___ | |_/ /| |_| || |_\ \
 *    |___/  \____/ \____/  \___/  \____/
 *
 *
 */

function rollThemes(timeout = 1000){
	switchTheme("light");
	setTimeout(()=>{switchTheme("dark")}, timeout * 1);
	setTimeout(()=>{switchTheme("high_light")}, timeout * 2);
	setTimeout(()=>{switchTheme("high_dark")}, timeout * 3);
}

window.addEventListener("keyup", (e) => {	//to check screen reader accessibility
	if (e.key == "Tab"){
		console.log(e.target, e.target.innerText, e.target.getAttribute("aria-label"));
	}
})