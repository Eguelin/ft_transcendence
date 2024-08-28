container = document.getElementById("container");
logOutBtn = document.getElementById('logOutBtn');
swichTheme = document.getElementById("themeButton");
userBtn = document.getElementById("usernameBtn");
dpUserBtn = document.getElementById("dropDownUser");
accSettingsBtn = document.getElementById("settingsBtn");
friendsBtn = document.getElementById("friendsBtn");
recentMatchHistoryContainer = document.getElementById("recentMatchHistoryContainer");
playBtn = document.getElementById("playBtn");


dpUserBtn.addEventListener("click", (e) => {
	document.getElementById("dropDownUser").focus();
})

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
			history.replaceState(JSON.stringify({"html": document.body.innerHTML, "currentPage": 'login', "currentLang": currentLang}), "", `https://${hostname.host}/login`);
		}
	})
}

logOutBtn.addEventListener("click", (e) => {
	history.replaceState(JSON.stringify({"html": document.body.innerHTML, "currentPage": 'login', "currentLang": currentLang}), "", `https://${hostname.host}/login`);
});

accSettingsBtn.addEventListener("click", (e) => {
	history.replaceState(JSON.stringify({"html": document.body.innerHTML, "currentPage": 'login', "currentLang": currentLang}), "", `https://${hostname.host}/settings`);
})

friendsBtn.addEventListener("click", (e) => {
	history.pushState(JSON.stringify({"html": document.body.innerHTML, "currentPage": 'login', "currentLang": currentLang}), "", `https://${hostname.host}/friends`);
})

playBtn.addEventListener("click", (e) => {
	history.pushState(JSON.stringify({"html": document.body.innerHTML, "currentPage": 'login', "currentLang": currentLang}), "", `https://${hostname.host}/game`);
})
