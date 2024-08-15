container = document.getElementById("container");
homeBtn = document.getElementById("goHomeButton");
swichTheme = document.getElementById("themeButton");
var currentPage = "";

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
			fetch ('bodyLess/home.html').then((response) => {
				(response.text().then(response => {
					state = JSON.stringify({"html": document.body.innerHTML, "currentPage": currentPage})
					if (container.innerHTML != "")
						history.pushState(state, "");
					else
						history.replaceState(state,"");
					container.innerHTML = response;
					document.getElementById("script").remove();
					var s = document.createElement("script");
					s.setAttribute('id', 'script');
					s.setAttribute('src', `scripts/home.js`);
					document.body.appendChild(s);
					currentPage = "home";
					state = JSON.stringify({"html": document.body.innerHTML, "currentPage": currentPage})
					history.replaceState(state, "");
				}))
			});	

		});
		fetch('/api/user/update', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({"is_active": true}),
			credentials: 'include'
		})
	}
	else {
		console.log("Failed to get user")
		
		fetch ('bodyLess/login.html').then((response) => {
			(response.text().then(response => {
				state = JSON.stringify({"html": document.body.innerHTML, "currentPage": currentPage})
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
				loadCurrentLang("login");
				currentPage = "login";
				state = JSON.stringify({"html": document.body.innerHTML, "currentPage": currentPage})
				history.replaceState(state, "");
			}))
		});
	}
	return (null);
})
.catch(error => {
	console.error('There was a problem with the fetch operation:', error);
	return (null);
});

window.addEventListener("beforeunload", (e) => {
	fetch('/api/user/update', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({"is_active": false}),
		credentials: 'include'
	})
})

homeBtn.addEventListener("click", (e) => {
	fetch ('bodyLess/home.html').then((response) => {
		return (response.text().then(response => {
			state = JSON.stringify({"html": document.body.innerHTML, "currentPage": currentPage})
			if (container.innerHTML != "")
				history.pushState(state, "");
			else
				history.replaceState(state,"");
			container.innerHTML = response;
			document.getElementById("script").remove();
			var s = document.createElement("script");
			s.setAttribute('id', 'script');
			s.setAttribute('src', `scripts/home.js`);
			loadCurrentLang("home");
			document.body.appendChild(s);
			currentPage = "home";
			homeBtn.style.setProperty("display", "none");
		}))
	});	
})

homeBtn.addEventListener("keydown", (e) => {
	if (e.key == "Enter")
		homeBtn.click();
})

function switchTheme(darkTheme){
	if (darkTheme == 1 || darkTheme == true){
		document.documentElement.style.setProperty("--page-bg-rgb", "#110026");
		document.documentElement.style.setProperty("--main-text-rgb", "#FDFDFB");
		document.documentElement.style.setProperty("--hover-text-rgb", "#3A3053");
		document.documentElement.style.setProperty("--option-hover-text-rgb", "#110026");
		document.documentElement.style.setProperty("--option-text-rgb", "#FDFDFB");
		document.documentElement.style.setProperty("--input-bg-rgb", "#3A3053");
		document.documentElement.style.setProperty("--is-dark-theme", 1);
		if (document.getElementById("themeButton"))
			document.getElementById("themeButton").style.maskImage = "url(\"svg/button-night-mode.svg\")";
	}
	else{
		document.documentElement.style.setProperty("--page-bg-rgb", "#FDFDFB");
		document.documentElement.style.setProperty("--main-text-rgb", "#110026");
		document.documentElement.style.setProperty("--hover-text-rgb", "#FFDBDE");
		document.documentElement.style.setProperty("--option-hover-text-rgb", "#110026");
		document.documentElement.style.setProperty("--option-text-rgb", "#FDFDFB");
		document.documentElement.style.setProperty("--input-bg-rgb", "#FFDBDE");
		if (document.getElementById("themeButton"))
			document.getElementById("themeButton").style.maskImage = "url(\"svg/button-light-mode.svg\")";
		document.documentElement.style.setProperty("--is-dark-theme", 0);
	}
}

window.addEventListener("popstate", (event) => {
	if (event.state){
		var obj = JSON.parse(event.state);
		document.body.innerHTML = obj['html'];
		currentPage = obj['currentPage'];

		document.getElementById("script").remove();
		var s = document.createElement("script");
		s.setAttribute('id', 'script');
		s.setAttribute('src', `scripts/${currentPage}.js`);
		document.body.appendChild(s);
		loadCurrentLang(currentPage);
	}
	fetch('/api/user/current', {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
		credentials: 'include'
	})
	.then(response => {
		if (!response.ok) {
			fetch ('bodyLess/login.html').then((response) => {
				(response.text().then(response => {
					state = JSON.stringify({"html": document.body.innerHTML, "currentPage": currentPage})
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
					loadCurrentLang("login");
					currentPage = "login";
					state = JSON.stringify({"html": document.body.innerHTML, "currentPage": currentPage})
					history.replaceState(state, "");
				}))
			});
		}
		else{
			fetch('/api/user/update', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({"is_active": true}),
				credentials: 'include'
			})
		}
	})
});

function loadCurrentLang(page){ //just for better readability before prod, don't care about efficiency
	fetch('/api/user/current', {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
		credentials: 'include'
	}).then(response => {
		if (response.ok) {
			(response.json()).then((text) => {
				fetch(text.lang).then(response => {
					response.json().then((text) => {
						content = text[page];
						Object.keys(content).forEach(function(key) {
							if (key.startsWith('input'))
								document.getElementById(key).placeholder = content[key];
							else
								document.getElementById(key).innerHTML = content[key];
						});
					})
				})
			})
		}
		else{
			fetch("lang/EN_US.json").then(response => {
				response.json().then((text) => {
					content = text[page];
					Object.keys(content).forEach(function(key) {
						if (key.startsWith('input'))
							document.getElementById(key).placeholder = content[key];
						else
							document.getElementById(key).innerHTML = content[key];
					});
				})
			})
		}
	});
}

swichTheme.addEventListener("click", () => {
	var theme = window.getComputedStyle(document.documentElement).getPropertyValue("--is-dark-theme") == 1 ? false : true;
	const data = {is_dark_theme: theme};
	fetch('/api/user/update', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
		credentials: 'include'
	})
	switchTheme(theme);
	swichTheme.blur();
})

swichTheme.addEventListener("keydown", (e) => {
	if (e.key == "Enter"){
		swichTheme.click();
		swichTheme.focus();
	}
})

