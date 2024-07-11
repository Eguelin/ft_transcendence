container = document.getElementById("container");
registerLink = document.getElementById("registerLink");
loginBtn = document.getElementById('loginBtn');
swichTheme = document.getElementById("themeButton");


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
			console.log(response);
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