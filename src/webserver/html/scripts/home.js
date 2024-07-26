container = document.getElementById("container");
logOutBtn = document.getElementById('logOutBtn');
swichTheme = document.getElementById("themeButton");
userBtn = document.getElementById("usernameBtn");
dpUserBtn = document.getElementById("dropDownUser");
accSettingsBtn = document.getElementById("accountSettingsBtn");

swichTheme.addEventListener("click", () => {
	var theme = window.getComputedStyle(document.documentElement).getPropertyValue("--is-dark-theme")
	const data = {dark_theme: theme};
	fetch('/api/user/update', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
		credentials: 'include'
	})
	switchTheme(theme);
})

swichTheme.addEventListener("keydown", (e) => {
	if (e.keyCode == 13)
		swichTheme.click();
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
				switchTheme(text.theme);
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
				switchTheme(text.theme);
				loadCurrentLang("home");
				document.getElementById("usernameBtn").innerHTML = text.display;
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
