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
	username = document.getElementById('inputUsername').value;
	pw = document.getElementById('inputPassword').value;
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
						loadCurrentLang("home");
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

swichTheme.addEventListener("click", (e) => {
	console.log(window.getComputedStyle(document.documentElement).getPropertyValue("--is-dark-theme"));
	if (window.getComputedStyle(document.documentElement).getPropertyValue("--is-dark-theme") == 0){
		document.documentElement.style.setProperty("--page-bg-rgb", "#110026");
		document.documentElement.style.setProperty("--main-text-rgb", "#FDFDFB");
		document.documentElement.style.setProperty("--input-bg-rgb", "#3A3053");
		document.documentElement.style.setProperty("--is-dark-theme", 1);
		document.getElementById("themeButton").style.maskImage = "url(\"svg/button-night-mode.svg\")"
	}
	else{
		document.documentElement.style.setProperty("--page-bg-rgb", "#FDFDFB");
		document.documentElement.style.setProperty("--main-text-rgb", "#110026");
		document.documentElement.style.setProperty("--input-bg-rgb", "#FFDBDE");
		document.documentElement.style.setProperty("--is-dark-theme", 0);
		document.getElementById("themeButton").style.maskImage = "url(\"svg/button-light-mode.svg\")"
	}
})
