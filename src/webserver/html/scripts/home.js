container = document.getElementById("container");
settingsBtn = document.getElementById("settingsBtn");
logOutBtn = document.getElementById('logOutBtn');
swichTheme = document.getElementById("themeButton");
userBtn = document.getElementById("usernameBtn");
dpUserBtn = document.getElementById("dropDownUser");
accSettingsBtn = document.getElementById("accountSettingsBtn");


settingsBtn.addEventListener("click", (e) => {
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
		}))
	});
})

swichTheme.addEventListener("click", () => {
	if (window.getComputedStyle(document.documentElement).getPropertyValue("--is-dark-theme") == 0){
		document.documentElement.style.setProperty("--page-bg-rgb", "#110026");
		document.documentElement.style.setProperty("--main-text-rgb", "#FDFDFB");
		document.documentElement.style.setProperty("--input-bg-rgb", "#3A3053");
		document.documentElement.style.setProperty("--is-dark-theme", 1);
		document.getElementById("themeButton").style.maskImage = "url(\"svg/button-night-mode.svg\")";
		const data = {dark_theme: 1};
		fetch('/api/user/update', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
			credentials: 'include'
		})
	}
	else{
		document.documentElement.style.setProperty("--page-bg-rgb", "#FDFDFB");
		document.documentElement.style.setProperty("--main-text-rgb", "#110026");
		document.documentElement.style.setProperty("--input-bg-rgb", "#FFDBDE");
		document.documentElement.style.setProperty("--is-dark-theme", 0);
		document.getElementById("themeButton").style.maskImage = "url(\"svg/button-light-mode.svg\")";
		const data = {dark_theme: 0};
		fetch('/api/user/update', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
			credentials: 'include'
		})
	}
})

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
				if (text.theme){
					document.documentElement.style.setProperty("--page-bg-rgb", "#110026");
					document.documentElement.style.setProperty("--main-text-rgb", "#FDFDFB");
					document.documentElement.style.setProperty("--input-bg-rgb", "#3A3053");
					document.getElementById("themeButton").style.maskImage = "url(\"svg/button-night-mode.svg\")";
				}
				else{
					document.documentElement.style.setProperty("--page-bg-rgb", "#FDFDFB");
					document.documentElement.style.setProperty("--main-text-rgb", "#110026");
					document.documentElement.style.setProperty("--input-bg-rgb", "#FFDBDE");
					document.getElementById("themeButton").style.maskImage = "url(\"svg/button-light-mode.svg\")";
				}
				loadCurrentLang("home");
				document.getElementById("pfp").setAttribute("src", `data:image/jpg;base64,${text.pfp}`);
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
				if (text.theme){
					document.documentElement.style.setProperty("--page-bg-rgb", "#110026");
					document.documentElement.style.setProperty("--main-text-rgb", "#FDFDFB");
					document.documentElement.style.setProperty("--input-bg-rgb", "#3A3053");
					document.getElementById("themeButton").style.maskImage = "url(\"svg/button-night-mode.svg\")";
				}
				else{
					document.documentElement.style.setProperty("--page-bg-rgb", "#FDFDFB");
					document.documentElement.style.setProperty("--main-text-rgb", "#110026");
					document.documentElement.style.setProperty("--input-bg-rgb", "#FFDBDE");
					document.getElementById("themeButton").style.maskImage = "url(\"svg/button-light-mode.svg\")";
				}
				loadCurrentLang("home");
				document.getElementById("usernameBtn").innerHTML = text.display;
				document.getElementById("pfp").setAttribute("src", `data:image/jpg;base64,${text.pfp}`);
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
			document.body.appendChild(s);
		}))
	});
});

accSettingsBtn.addEventListener("click", (e) => {
	fetch ('bodyLess/accountSettings.html').then((response) => {
		return (response.text().then(response => {
			if (container.innerHTML != "")
				history.pushState(response, "");
			else
				history.replaceState(response,"");
			container.innerHTML = response;
			document.getElementById("script").remove();
			var s = document.createElement("script");
			s.setAttribute('id', 'script');
			s.setAttribute('src', `scripts/accountSettings.js`);
			loadCurrentLang("accountSettings");
			document.body.appendChild(s);
		}))
	});
})
