lightTheme = document.getElementById("loadLight");
darkTheme = document.getElementById("loadDark");
homeBtn = document.getElementById("goHomeButton");


lightTheme.addEventListener("click", (e) => {
	document.getElementById("style").setAttribute('href', 'lightMode.css');
	const data = {dark_theme: 0};
	fetch('/api/user/update', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
		credentials: 'include'
	})
})

darkTheme.addEventListener("click", (e) => {
	document.getElementById("style").setAttribute('href', 'darkMode.css');
	const data = {dark_theme: 1};
	fetch('/api/user/update', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
		credentials: 'include'
	})
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