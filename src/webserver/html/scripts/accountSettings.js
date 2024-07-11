container = document.getElementById("container");
saveBtn = document.getElementById('saveBtn');
swichTheme = document.getElementById("themeButton");
homeBtn = document.getElementById("goHomeButton");
usernameInput = document.getElementById("usernameInput");


swichTheme.addEventListener("click", () => {
	const style = document.getElementById("style");
	const href = style.getAttribute('href');
	style.setAttribute('href', href == "lightMode.css" ? "darkMode.css" : "lightMode.css");
})

homeBtn.addEventListener("click", (e) => {
	fetch ('bodyLess/home.html').then((response) => {
		return (response.text().then(response => {
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
		}))
	});	
})

saveBtn.addEventListener("click", (e) => {
	var data = {};
	username = usernameInput.value;
	if (username != "")
		data['username'] = username;
	fetch('/api/user/update', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
		credentials: 'include'
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
				if (text.theme == true)
					document.getElementById("style").setAttribute('href', 'darkMode.css');
				else
					document.getElementById("style").setAttribute('href', 'lightMode.css');	
				usernameInput.setAttribute('placeholder', text.username);
				history.replaceState(container.innerHTML, "");
			});
		}
	})
}


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
				if (text.theme == true)
					document.getElementById("style").setAttribute('href', 'darkMode.css');
				else
					document.getElementById("style").setAttribute('href', 'lightMode.css');	
				username.setAttribute('placeholder', text.username);
				history.replaceState(container.innerHTML, "");
			});
		}
	})
})
