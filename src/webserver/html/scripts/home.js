container = document.getElementById("container");
settingsBtn = document.getElementById("settingsBtn");
logOutBtn = document.getElementById('logOutBtn');
swichTheme = document.getElementById("themeButton");
userBtn = document.getElementById("usernameBtn");
dpUserBtn = document.getElementById("dropDownUser");

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
			document.body.appendChild(s);
		}))
	});
})

swichTheme.addEventListener("click", () => {
	const style = document.getElementById("style");
	const href = style.getAttribute('href');
	style.setAttribute('href', href == "lightMode.css" ? "darkMode.css" : "lightMode.css");
})

dpUserBtn.addEventListener("click", (e) => {
	document.getElementById("dropDownUser").focus();
})

{
	var user = fetch('/api/user/current', {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
		credentials: 'include'
	})
	.then(response => {
		if (response.ok) {
			return (response.json());
		}
		console.log("Failed to get user")
		return (null);
	})
	user.then((text) => {
		document.getElementById("usernameBtn").innerHTML = text.username;
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