container = document.getElementById("container");
logOutBtn = document.getElementById('logOutBtn');
swichTheme = document.getElementById("themeButton");
userBtn = document.getElementById("usernameBtn");
dpUserBtn = document.getElementById("dropDownUser");
accSettingsBtn = document.getElementById("settingsBtn");
friendsBtn = document.getElementById("friendsBtn");

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
		if (response.ok) {
			(response.json()).then((text) => {
				switchTheme(text.is_dark_theme);
				currentLang = text.lang;
				loadCurrentLang();
				document.getElementById("usernameBtn").innerHTML = text.display;
				document.getElementById("pfp").style.setProperty("display", "block");
				document.getElementById("dropDownUser").style.setProperty("display", "block");
				if (text.pfp != ""){
					var rawPfp = text.pfp;
					if (rawPfp.startsWith('https://'))
						document.getElementById("pfp").setAttribute("src", `${rawPfp}`);
					else
						document.getElementById("pfp").setAttribute("src", `data:image/jpg;base64,${rawPfp}`);
				}
				else
					document.getElementById("pfp").style.setProperty("display", "none");
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
					document.getElementById("pfp").style.setProperty("display", "none");
					document.getElementById("dropDownUser").style.setProperty("display", "none");
					currentPage = "login";
					state = JSON.stringify({"html": document.body.innerHTML, "currentPage": currentPage, "currentLang": currentLang});

					history.replaceState(state, "");
				}))
			});
		}
		return (null);
	})
}

logOutBtn.addEventListener("click", (e) => {
	fetch('/api/user/logout', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		credentials: 'include'
	});

	fetch ('bodyLess/login.html').then((response) => {
		return (response.text().then(response => {
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
			currentPage = "login";
			loadCurrentLang();
			document.body.appendChild(s);
			document.getElementById("pfp").style.setProperty("display", "none");
			document.getElementById("dropDownUser").style.setProperty("display", "none");
		}))
	});
});

accSettingsBtn.addEventListener("click", (e) => {
	fetch ('bodyLess/settings.html').then((response) => {
		return (response.text().then(response => {
			state = JSON.stringify({"html": document.body.innerHTML, "currentPage": currentPage, "currentLang": currentLang});

			if (container.innerHTML != "")
				history.pushState(state, "");
			else
				history.replaceState(state,"");
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
})

friendsBtn.addEventListener("click", (e) => {
	fetch ('bodyLess/friends.html').then((response) => {
		return (response.text().then(response => {
			state = JSON.stringify({"html": document.body.innerHTML, "currentPage": currentPage, "currentLang": currentLang});

			if (container.innerHTML != "")
				history.pushState(state, "");
			else
				history.replaceState(state,"");
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
})
