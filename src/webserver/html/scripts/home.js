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
				loadCurrentLang("home");
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
				history.replaceState(container.innerHTML, "");
			});
		}
		else {
			console.log("Failed to get user")

			fetch ('bodyLess/login.html').then((response) => {
				(response.text().then(response => {
					if (container.innerHTML != "")
						history.pushState(response, "");
					else
						history.replaceState(response,"");
					container.innerHTML = response;
					document.getElementById("script").remove();
					var s = document.createElement("script");
					s.setAttribute('id', 'script');
					s.setAttribute('src', `scripts/login.js`);
					document.body.appendChild(s);
					currentPage = "login";
					history.replaceState(container.innerHTML, "");
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
				loadCurrentLang("home");
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
				history.replaceState(container.innerHTML, "");
			});
		}
		else {
			console.log("Failed to get user")

			fetch ('bodyLess/login.html').then((response) => {
				(response.text().then(response => {
					if (container.innerHTML != "")
						history.pushState(response, "");
					else
						history.replaceState(response,"");
					container.innerHTML = response;
					document.getElementById("script").remove();
					var s = document.createElement("script");
					s.setAttribute('id', 'script');
					s.setAttribute('src', `scripts/login.js`);
					document.body.appendChild(s);
					document.getElementById("pfp").style.setProperty("display", "none");
					document.getElementById("dropDownUser").style.setProperty("display", "none");
					currentPage = "login";
					history.replaceState(container.innerHTML, "");
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
			if (container.innerHTML != "")
				history.pushState(response, "");
			else
				history.replaceState(response,"");
			container.innerHTML = response;
			document.getElementById("script").remove();
			var s = document.createElement("script");
			s.setAttribute('id', 'script');
			s.setAttribute('src', `scripts/login.js`);
			loadCurrentLang("login");
			document.body.appendChild(s);
			document.getElementById("pfp").style.setProperty("display", "none");
			document.getElementById("dropDownUser").style.setProperty("display", "none");
			currentPage = "login";
		}))
	});
});

accSettingsBtn.addEventListener("click", (e) => {
	fetch ('bodyLess/settings.html').then((response) => {
		return (response.text().then(response => {
			if (container.innerHTML != "")
				history.pushState(response, "");
			else
				history.replaceState(response,"");
			container.innerHTML = response;
			document.getElementById("script").remove();
			var s = document.createElement("script");
			s.setAttribute('id', 'script');
			s.setAttribute('src', `scripts/settings.js`);
			loadCurrentLang("settings");
			document.body.appendChild(s);
			document.getElementById("pfp").style.setProperty("display", "none");
			document.getElementById("dropDownUser").style.setProperty("display", "none");
			document.getElementById("goHomeButton").style.setProperty("display", "block");
			currentPage = "settings";
		}))
	});
})

friendsBtn.addEventListener("click", (e) => {
	fetch ('bodyLess/friends.html').then((response) => {
		return (response.text().then(response => {
			if (container.innerHTML != "")
				history.pushState(response, "");
			else
				history.replaceState(response,"");
			container.innerHTML = response;
			document.getElementById("script").remove();
			var s = document.createElement("script");
			s.setAttribute('id', 'script');
			s.setAttribute('src', `scripts/friends.js`);
			loadCurrentLang("friends");
			document.body.appendChild(s);
			document.getElementById("pfp").style.setProperty("display", "none");
			document.getElementById("dropDownUser").style.setProperty("display", "none");
			document.getElementById("goHomeButton").style.setProperty("display", "block");
			currentPage = "friends";
		}))
	});
})
