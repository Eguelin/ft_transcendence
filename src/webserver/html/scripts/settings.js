lightTheme = document.getElementById("loadLight");
darkTheme = document.getElementById("loadDark");
homeBtn = document.getElementById("goHomeButton");


lightTheme.addEventListener("click", (e) => {
	document.getElementById("style").setAttribute('href', 'lightMode.css');
})

darkTheme.addEventListener("click", (e) => {
	document.getElementById("style").setAttribute('href', 'darkMode.css');
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
			
			
			var user = fetch('/api/user/current', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include'
			})
			.then(response => {
				if (response.ok) {
					return response.json();
				}
				console.log("Failed to get user")
				return (null);
			})
			user.then((text) => {
				document.getElementById("usernameBtn").innerHTML = text.username;
			})
			
		}))
	});	
})