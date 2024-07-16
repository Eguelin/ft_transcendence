container = document.getElementById("container");
fetch('/api/user/current', {
	method: 'GET',
	headers: {
		'Content-Type': 'application/json',
	},
	credentials: 'include'
})
.then(response => {
	console.log(response);
	if (response.ok) {
		(response.json()).then((text) => {	
			fetch ('bodyLess/home.html').then((response) => {
				(response.text().then(response => {
					if (container.innerHTML != "")
						history.pushState(response, "");
					else
						history.replaceState(response,"");
					container.innerHTML = response;
					document.getElementById("script").remove();
					var s = document.createElement("script");
					s.setAttribute('id', 'script');
					s.setAttribute('src', `scripts/home.js`);
					document.body.appendChild(s);
					document.getElementById("usernameBtn").innerHTML = text.username;
					document.getElementById("pfp").style.backgroundImage = `url(${text.pfp})`;
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
					history.replaceState(container.innerHTML, "");
				}))
			});	

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
				loadCurrentLang("login");
				history.replaceState(container.innerHTML, "");
			}))
		});
	}
	return (null);
})
.catch(error => {
	console.error('There was a problem with the fetch operation:', error);
	return (null);
});

window.addEventListener("popstate", (event) => {
	if (event.state){
		const contain = document.getElementById("container");
		contain.innerHTML = event.state;
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
					loadCurrentLang("login");
					history.replaceState(container.innerHTML, "");
				}))
			});
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
		};
	});
}

// MOST OF THAT STUFF NOT BE ON PROD


/*
function createUser(username, password)
{
	const data = {username: username, password: password};
	fetch('/api/user/create', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		credentials: 'include',
		body: JSON.stringify(data)
	})
	.then(response => {
		if (response.ok) {
			console.log('User created successfully');
			loadPage('home');
		} else {
			console.log("Failed to create user")
		}
	})
	.catch(error => {
		console.error('There was a problem with the fetch operation:', error);
	});
}
*/
