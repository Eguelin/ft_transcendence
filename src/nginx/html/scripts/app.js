homeBtn = document.getElementById("goHomeButton");
swichTheme = document.getElementById("themeButton");
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
var currentLang = "lang/EN_UK.json"
var username = "";
const hostname = new URL(window.location.href);
const preferedColorSchemeMedia = window.matchMedia('(prefers-color-scheme: dark)');

var client = null;
var pageName;
var use_browser_theme = true;

const routes = {
	"/home": `https://${hostname.host}/scripts/home.js`,
	"/": `https://${hostname.host}/scripts/home.js`,
	"/game": `https://${hostname.host}/scripts/game.js`,
	"/tournament": `https://${hostname.host}/scripts/game.js`,
	"/settings": `https://${hostname.host}/scripts/settings.js`,
	"/user": `https://${hostname.host}/scripts/user.js`,
	"/dashboard": `https://${hostname.host}/scripts/dashboard.js`,
	"/search": `https://${hostname.host}/scripts/search.js`,
	"/friends": `https://${hostname.host}/scripts/friends.js`,
	"/login": `https://${hostname.host}/scripts/login.js`,
	404: `https://${hostname.host}/scripts/404.js`,
	403: `https://${hostname.host}/scripts/403.js`,
	"/admin": `https://${hostname.host}/scripts/admin.js`
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

class Client {
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

	constructor() {
		return (async () => {
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
					document.querySelector("#myProfileBtn").href = `https://${hostname.host}/user/${this.username}`;
				}
				else if (fetchResult.status == 401)
					return null
			}
			catch {
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
					dropDownLangBtn.style.setProperty("background-image", `url(https://${hostname.host}/icons/${currentLang.substring(4, 10)}.svg)`);

					currentPage = 'login';
					search = "/login"
				}
				document.getElementById("script").remove();
				var s = document.createElement("script");
				s.onload = function () {
					(async () => (loadCurrentLang()))();
					unsetLoader()
					checkResizeWindow();
				}
				s.setAttribute('id', 'script');
				s.setAttribute('src', routes[search]);
				document.body.appendChild(s);
			}
			catch {
				popUpError(client.langJson['index']['error reaching server']);
				unsetLoader();
			}
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
		history.replaceState("", "", `https://${hostname.host}/login`)
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
		client.loadPage(url.pathname)
	else {
		setLoader();
		currentPage = "login";
		dropDownUserContainer.style.setProperty("display", "none");
		dropDownLangBtn.style.setProperty("background-image", `url(https://${hostname.host}/icons/${currentLang.substring(4, 10)}.svg)`);
		history.replaceState("", "", `https://${hostname.host}/login`);


		document.getElementById("script").remove();
		var s = document.createElement("script");
		s.onload = function () {
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
								myReplaceState(`https://${hostname.host}/login`);
							else {
								friendUpdate();
								myReplaceState(`https://${hostname.host}/home`);
							}
						}
						catch {
							unsetLoader();
						}
					})()
				}
				else {
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
			try {
				client = await new Client();
				if (!client)
					myReplaceState(`https://${hostname.host}/login`);
				else if (url.pathname == "" || url.pathname == "/") {
					friendUpdate();
					myReplaceState(`https://${hostname.host}/home`);
				}
				else {
					load();
					friendUpdate();
				}
				if (use_browser_theme) {
					if (window.matchMedia) {
						switchTheme(window.matchMedia('(prefers-color-scheme: dark)').matches == 1 ? 'dark' : 'light');
					}
					preferedColorSchemeMedia.addEventListener('change', browserThemeEvent);
				}
			}
			catch {
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
	myPushState(`https://${hostname.host}/home`);
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
		"--option-hover-text-rgb": "#110026",
		"--option-text-rgb": "#FDFDFB",
		"--input-bg-rgb": "#3A3053",
		"is-dark": 1,
		"svg-path": "/icons/moon.svg"
	},
	"high_dark": {
		"--page-bg-rgb": "#222831",
		"--main-text-rgb": "#00FFF5",
		"--hover-text-rgb": "#00ADB5",
		"--option-hover-text-rgb": "#222831",
		"--option-text-rgb": "#00FFF5",
		"--input-bg-rgb": "#393E46",
		"is-dark": 1,
		"svg-path": "/icons/moon.svg"
	},
	"light": {
		"--page-bg-rgb": "#F5EDED",
		"--main-text-rgb": "#110026",
		"--hover-text-rgb": "#FFC6C6",
		"--option-hover-text-rgb": "#F5EDED",
		"--option-text-rgb": "#110026",
		"--input-bg-rgb": "#FFC6C6",
		"is-dark": 0,
		"svg-path": "/icons/sun.svg"
	},
	"high_light": {
		"--page-bg-rgb": "#FFFBF5",
		"--main-text-rgb": "#7743DB",
		"--hover-text-rgb": "#C3ACD0",
		"--option-hover-text-rgb": "#FFFBF5",
		"--option-text-rgb": "#7743DB",
		"--input-bg-rgb": "#F7EFE5",
		"is-dark": 0,
		"svg-path": "/icons/sun.svg"
	}
}

function switchTheme(theme) {
	Object.keys(themeMap[theme]).forEach(function (key) {
		document.documentElement.style.setProperty(key, themeMap[theme][key])
	})
	if (client) {
		client.mainTextRgb = themeMap[theme]["--main-text-rgb"];
		client.use_dark_theme = themeMap[theme]["is-dark"];
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
	if (currentPage == "game") {
		displayTournament();
	}
}

swichTheme.addEventListener("click", () => {
	var theme = window.getComputedStyle(document.documentElement).getPropertyValue("--is-dark-theme") == 1 ? false : true;
	var theme_name = window.getComputedStyle(document.documentElement).getPropertyValue("--is-dark-theme") == 1 ? 'light' : 'dark';
	if (client) {
		fetch('/api/user/update', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ is_dark_theme: theme, use_browser_theme: false, theme_name: theme_name }),
			credentials: 'include'
		})
		client.use_browser_theme = false;
	}
	use_browser_theme = false;
	preferedColorSchemeMedia.removeEventListener('change', browserThemeEvent)
	switchTheme(theme_name);
	swichTheme.blur();
})

function browserThemeEvent(event) {
	switchTheme(event.matches == 1 ? 'dark' : 'light');
}

swichTheme.addEventListener("keydown", (e) => {
	if (e.key == "Enter") {
		swichTheme.click();
		swichTheme.focus();
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
		myPushState(`https://${hostname.host}/search?query=${query}`);
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

dropDownLangOption.forEach(function (button) {
	button.addEventListener("click", (e) => {
		(async () => {
			currentLang = `lang/${button.id}.json`;
			try {
				if (client) {
					client.currentLang = `lang/${button.id}.json`;
					fetchResult = await fetch(`https://${hostname.host}/${currentLang}`);
					content = await fetchResult.json();
					client.langJson = content;
				}
				loadCurrentLang();
				if (client) {
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
			catch {
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
	if (document.getElementById("popupErrorContainer"))
		document.getElementById("popupErrorContainer").remove();
	var popupContainer = document.createElement("div");
	popupContainer.id = "popupErrorContainer";
	var popupText = document.createElement("a")
	popupText.innerText = error;
	popupContainer.appendChild(popupText);
	popupContainer.addEventListener("mouseleave", (e) => {
		popupContainer.id = "popupErrorContainerClose"
		setTimeout(() => {
			popupContainer.remove();
		}, 500)
	})
	document.body.appendChild(popupContainer);
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

function sendNotif(message, id, type) {
	var notifContainer = document.createElement("div");
	var notifCenter = document.getElementById("notifCenter");
	notifContainer.classList.add("notifContainer");
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
			sendNotif(`${client.langJson.friends['incoming pending request'].replace("${USERNAME}", data.sender_name)}`, data.sender_name, "friend_request");
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
			body: JSON.stringify({ "user": user, }),
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
						popUpError(client.langJson['friends']['error sending request'])
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

/*
		______ __   __ _   _   ___  ___  ___ _____  _____      ______  _   _  _   _  _____  _____  _____  _____  _   _  _____
		|  _  \\ \ / /| \ | | / _ \ |  \/  ||_   _|/  __ \     |  ___|| | | || \ | |/  __ \|_   _||_   _||  _  || \ | |/  ___|
		| | | | \ V / |  \| |/ /_\ \| .  . |  | |  | /  \/     | |_   | | | ||  \| || /  \/  | |    | |  | | | ||  \| |\ `--.
		| | | |  \ /  | . ` ||  _  || |\/| |  | |  | |         |  _|  | | | || . ` || |      | |    | |  | | | || . ` | `--. \
		| |/ /   | |  | |\  || | | || |  | | _| |_ | \__/\     | |    | |_| || |\  || \__/\  | |   _| |_ \ \_/ /| |\  |/\__/ /
		|___/    \_/  \_| \_/\_| |_/\_|  |_/ \___/  \____/     \_|     \___/ \_| \_/ \____/  \_/   \___/  \___/ \_| \_/\____/
*/


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
			if (currentPage == 'user') {updateUserLang();}
			if (currentPage == 'dashboard') {updateDashboardLang();}
		}
		content = contentJson['index'];
		if (content != null || content != undefined) {
			var searchBar = document.querySelector("#inputSearchUser");
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
		}
	}
}

function setNotifTabIndexes(tabIdx){
	console.log(tabIdx);
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

function createMatchResumeContainer(match, username) {
	matchContainer = ft_create_element("a", {"class" : "matchDescContainer"});

	result = ft_create_element("a", {"class" : "matchDescContainerResult"});

	date = ft_create_element("a", {"class" : "matchDescContainerDate", "innerText" : match.date});
	if (match.type == 'match'){
		scoreContainer = ft_create_element("div", {"class" : "matchDescContainerScore"});
		scoreUser = ft_create_element("div", {"class" : "resultScore"});
		scoreOpponent = ft_create_element("div", {"class" : "resultScore"});

		scoreUserName = ft_create_element("a", {"class" : "resultScoreName", "innerText" : match.player_one == username ? match.player_one : match.player_two, "tabIndex" : "-1"});
		scoreUserScore = ft_create_element("a", {"class" : "resultScoreScore", "innerText" : match.player_one == username ? match.player_one_pts : match.player_two_pts});

		scoreOpponentName = ft_create_element("a", {"class" : "resultScoreName", "innerText" : match.player_one == username ? match.player_two : match.player_one, "tabIndex" : "-1"});
		scoreOpponentScore = ft_create_element("a", {"class" : "resultScoreScore", "innerText" : match.player_one == username ? match.player_two_pts : match.player_one_pts});

		if (scoreUserName.innerText == "deleted"){
			scoreUserName.classList.add("deletedUser");
			scoreUserName.innerText = client.langJson["index"][".deletedUser"];
		}
		else{
			scoreUserName.href = `https://${hostname.host}/user/${scoreUserName.innerText}`
			scoreUserName.setAttribute("aria-label", `${scoreUserName.innerText} ${client.langJson['search']['aria.userResume']}`);
		}


		if (scoreOpponentName.innerText == "deleted"){
			scoreOpponentName.classList.add("deletedUser");
			scoreOpponentName.innerText = client.langJson["index"][".deletedUser"];
		}
		else{
			scoreOpponentName.href = `https://${hostname.host}/user/${scoreOpponentName.innerText}`
			scoreOpponentName.setAttribute("aria-label", `${scoreOpponentName.innerText} ${client.langJson['search']['aria.userResume']}`);
		}

		scoreOpponentName.innerText += ":"
		scoreUserName.innerText += ":"
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
		matchContainer.href = `https://${hostname.host}/match?id=${match.id}`;
	}
	else if (match.type == "tournament"){
		result.classList.add("tournament");
		result.innerHTML = client.langJson['user']['.tournament'];

		matchContainer.href = `https://${hostname.host}/tournament?id=${match.id}`;

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

/*	______  _____  _____  _____  ______ _____ 
	| ___ \|  ___|/  ___||_   _||___  /|  ___|
	| |_/ /| |__  \ `--.   | |     / / | |__  
	|    / |  __|  `--. \  | |    / /  |  __| 
	| |\ \ | |___ /\__/ / _| |_ ./ /___| |___ 
	\_| \_|\____/ \____/  \___/ \_____/\____/ 
 */


function checkResizeWindow(){
	if(currentPage == "dashboard"){
		displayCharts();
	}

	var tmp = document.querySelector("#inputSearchUserContainer");
	var fontSize = parseInt(window.getComputedStyle(document.documentElement).fontSize);
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

	if (client){
		tmp = document.querySelector("#quickSettingContainer");
		var currentFontSize = parseInt(window.getComputedStyle(document.querySelector("#usernameBtn")).fontSize)
		var baseFontSize = parseInt(window.getComputedStyle(document.documentElement).fontSize)
		
		for (let i=0; i<tmp.childElementCount - 1;i++){
			if (tmp.children[i].style.getPropertyValue("display") == "none")
				continue ;
			if (tmp.children[i].getBoundingClientRect().left == tmp.getBoundingClientRect().left)
				break
			
			while (tmp.children[i].getBoundingClientRect().left > tmp.getBoundingClientRect().left && currentFontSize < baseFontSize){
				document.querySelector("#usernameBtn").style.setProperty("font-size", `${currentFontSize}px`)
				currentFontSize += 1;
			}
			while (tmp.children[i].getBoundingClientRect().left < tmp.getBoundingClientRect().left && currentFontSize > 1){
				document.querySelector("#usernameBtn").style.setProperty("font-size", `${currentFontSize}px`)
				currentFontSize -= 1;
			}
		}
	}

	if (currentPage == "home" || currentPage == "user"){
		setTimeout(checkMatchResumeSize, 1)
	}
	if (currentPage == "game")
		checkMatchSize();
	if (currentPage == "game" || currentPage == "tournament")
		setTimeout(checkWinnerDisplaySize, 1)

}

function checkMatchResumeSize(){
	recentMatchHistoryContainer = document.getElementById("recentMatchHistory");
	var matches = recentMatchHistoryContainer.querySelectorAll(".matchDescContainer");
	var baseWidth = 16
	var i = 0;
	ch = 1
	if (matches.length > 0){
		while (i < matches.length && !matches[i].querySelector(".resultScoreName"))
			i++;
		if (i == matches.length)
			return;
		while (1 && ch <= baseWidth){
			var width = matches[i].getBoundingClientRect().width;
			var ch = parseInt(recentMatchHistoryContainer.querySelector(".resultScoreName").style.getPropertyValue("width"))
			
			if (width * 5 <= getWindowWidth() && ch < baseWidth){
				recentMatchHistoryContainer.querySelectorAll(".resultScoreName").forEach(function(elem){
					elem.style.setProperty("width", `${ch + 1}ch`);
				})
				var width = matches[i].getBoundingClientRect().width;
			}
			else
				break;

		}
		while (1 && baseWidth > 1){
			width = matches[i].getBoundingClientRect().width;
			if (width * 5 > getWindowWidth()){
				baseWidth--;
				recentMatchHistoryContainer.querySelectorAll(".resultScoreName").forEach(function(elem){
					elem.style.setProperty("width", `${baseWidth}ch`);
				})
			}
			else
				break
		}					
	}
}

function checkMatchSize(){
	var container = document.querySelector("#gameContainer")
	var baseFontSize = parseInt(window.getComputedStyle(document.documentElement).fontSize) * 1.5;
	var currentFontSize = parseInt(window.getComputedStyle(container.querySelector(".playerName")).fontSize);
	var anchor = document.querySelector("#notifCenterContainer").getBoundingClientRect()
	while (getElemWidth(container) == anchor.right && currentFontSize < baseFontSize){
		container.querySelectorAll(".playerName").forEach(function (elem) {
			elem.style.setProperty("font-size", `${parseInt(window.getComputedStyle(elem).fontSize) + 1}px`)
			currentFontSize += 1;
		})
	}
	while (getElemWidth(container) > anchor.right){
		container.querySelectorAll(".playerName").forEach(function (elem) {
			elem.style.setProperty("font-size", `${parseInt(window.getComputedStyle(elem).fontSize) - 1}px`)
		})
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
	while (container.getBoundingClientRect().width < document.querySelector("#winName").getBoundingClientRect().width && currentFontSize > 1){
		document.querySelector("#winName").style.setProperty("font-size", `${currentFontSize}px`)
		currentFontSize -= 1;
	}
}

window.addEventListener("resize", checkResizeWindow);
