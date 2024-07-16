container = document.getElementById("container");
registerBtn = document.getElementById("registerBtn");
swichTheme = document.getElementById("themeButton");

window.addEventListener("popstate", (event) => {
	if (event.state){
		const contain = document.getElementById("container");
		contain.innerHTML = event.state;
	}
});

registerBtn.addEventListener("click", (e) => {
	var lock = 0;
	email = document.getElementById('inputMail').value;
	username = document.getElementById('inputUsername').value;
	pw = document.getElementById('inputPassword').value;
	cpw = document.getElementById('inputCPassword').value;
	inputs = document.getElementsByClassName('formInput');
	warning = document.createElement("a");
	warning.className = "warning";
	warning.text = "Field can't be empty";
	for (i=0;i<inputs.length;i++){
		if (inputs[i].previousElementSibling)
			inputs[i].previousElementSibling.remove();
		if (inputs[i].value == "" && !inputs[i].previousElementSibling){
			warningTmp = warning.cloneNode(true);
			inputs[i].before(warningTmp);
			lock = 1;
		}
	}
	
	if (pw != cpw){
		warning = document.createElement("a");
		warning.className = "warning";
		warning.text = "Passwords do not match";
		if (document.getElementById('inputCPassword').previousElementSibling && document.getElementById('inputCPassword').previousElementSibling.text == "Field can't be empty"){
			document.getElementById('inputCPassword').previousElementSibling.remove();
		}
		if (!document.getElementById('inputCPassword').previousElementSibling || document.getElementById('inputCPassword').previousElementSibling.text != "Passwords do not match"){
			document.getElementById("inputCPassword").before(warning);
		}
		else if (cpw != "" && document.getElementById('inputCPassword').previousElementSibling.text == "Field can't be empty"){
			document.getElementById('inputCPassword').previousElementSibling.remove();
		}
	}
	else if (lock == 0){
		const data = {username: username, password: pw};
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
				fetch('/api/user/login', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(data),
					credentials: 'include'
				}).then(response => {
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
							loadCurrentLang("home");
							document.body.appendChild(s);
						}))
					});
				});
			} else {
				console.log("Failed to create user")
			}
		})
		.catch(error => {
			console.error('There was a problem with the fetch operation:', error);
		});
	}
})

swichTheme.addEventListener("click", () => {
	if (window.getComputedStyle(document.documentElement).getPropertyValue("--is-dark-theme") == 0){
		document.documentElement.style.setProperty("--page-bg-rgb", "#110026");
		document.documentElement.style.setProperty("--main-text-rgb", "#FDFDFB");
		document.documentElement.style.setProperty("--input-bg-rgb", "#3A3053");
		document.documentElement.style.setProperty("--is-dark-theme", 1);
		document.getElementById("themeButton").style.maskImage = "url(\"svg/button-night-mode.svg\")";
	}
	else{
		document.documentElement.style.setProperty("--page-bg-rgb", "#FDFDFB");
		document.documentElement.style.setProperty("--main-text-rgb", "#110026");
		document.documentElement.style.setProperty("--input-bg-rgb", "#FFDBDE");
		document.documentElement.style.setProperty("--is-dark-theme", 0);
		document.getElementById("themeButton").style.maskImage = "url(\"svg/button-light-mode.svg\")";
	}
})
