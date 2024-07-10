container = document.getElementById("container");
registerLink = document.getElementById("registerLink");
loginBtn = document.getElementById('loginBtn');
swichTheme = document.getElementById("themeButton");
fortyTwoLogin = document.getElementById("fortyTwoLogin");

fortyTwoLogin.addEventListener("click", (e) => {
	const authUrl = `https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-cb9676bf45bf8955cbb6ab78a74a365e69a9f11a901301c48e5f5f5ee1a7c144&redirect_uri=https%3A%2F%2Flocalhost%3A49300%2F&response_type=code`;
	window.location.href = authUrl;
});

function handleToken() {
	const code = window.location.href.split("code=")[1];

	if (code)
	{
		fetch('/api/user/fortyTwo/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},

			body: JSON.stringify({ code: code }),
			credentials: 'include'
		})
		.then(response => response.json())
		.then(data => {
			if (data.access_token) {
				console.log('Data:', data)
				window.history.replaceState({}, document.title, "/");
			} else {
				console.error('Failed to get access token');
				console.log('Data:', data)
			}
		})
		.catch(error => console.error('Error:', error));
		console.log('fortytwo')
	}
}

window.addEventListener('load', handleToken());

registerLink.addEventListener("click", (e) => {
	fetch ('bodyLess/register.html').then((response) => {
		return (response.text().then(response => {
			if (container.innerHTML != "")
				history.pushState(response, "");
			else
				history.replaceState(response,"");
			container.innerHTML = response;
			document.getElementById("script").remove();
			var s = document.createElement("script");
			s.setAttribute('id', 'script');
			s.setAttribute('src', `scripts/register.js`);
			document.body.appendChild(s);
		}))
	});
});

loginBtn.addEventListener("click", (e) => {
	username = document.getElementById('username').value;
	pw = document.getElementById('password').value;
	inputs = document.getElementsByClassName('formInput');
	warning = document.createElement("a");
	warning.className = "warning";
	warning.text = "Field can't be empty";
	if (e.previousElementSibling)
		e.previousElementSibling.remove();
	for (i=0;i<inputs.length;i++){
		if (inputs[i].value == "" && !inputs[i].previousElementSibling){
			warningTmp = warning.cloneNode(true);
			inputs[i].before(warningTmp);
		}
		if (inputs[i].value != "" && inputs[i].previousElementSibling){
			inputs[i].previousElementSibling.remove();
		}
	}
	if (username != "" && pw != ""){
		const data = {username: username, password: pw};
		fetch('/api/user/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
			credentials: 'include'
		})
		.then(response => {
			if (response.ok) {
				console.log('User logged in successfully');

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
							document.getElementById("username").innerHTML = text.username;
						})
					}))
				});

			} else {
				console.log("Failed to login user")
				if (response.status != 500){
					return response.json().then((text => {
						warning.text = text.message;
						if (!loginBtn.previousElementSibling)
							loginBtn.before(warning.cloneNode(true));

						return (text.message);
					}));
				}
			}
		})
	}
})

swichTheme.addEventListener("click", () => {
	const style = document.getElementById("style");
	const href = style.getAttribute('href');
	style.setAttribute('href', href == "lightMode.css" ? "darkMode.css" : "lightMode.css");
})
