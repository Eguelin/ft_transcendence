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
			history.replaceState(JSON.stringify({"html": document.body.innerHTML, "currentPage": 'login', "currentLang": currentLang}), "", 'https://localhost:49300/login');
		}
	})
}

logOutBtn.addEventListener("click", (e) => {
	history.replaceState(JSON.stringify({"html": document.body.innerHTML, "currentPage": 'login', "currentLang": currentLang}), "", 'https://localhost:49300/login');
});

accSettingsBtn.addEventListener("click", (e) => {
	history.replaceState(JSON.stringify({"html": document.body.innerHTML, "currentPage": 'login', "currentLang": currentLang}), "", 'https://localhost:49300/settings');
})

friendsBtn.addEventListener("click", (e) => {
	history.replaceState(JSON.stringify({"html": document.body.innerHTML, "currentPage": 'login', "currentLang": currentLang}), "", 'https://localhost:49300/friends');
})
