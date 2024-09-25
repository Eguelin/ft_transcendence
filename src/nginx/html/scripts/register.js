container = document.getElementById("container");
registerBtn = document.getElementById("registerBtn");
swichTheme = document.getElementById("themeButton");
usernameInput = document.getElementById('inputUsername');
pwInput = document.getElementById('inputPassword');
cpwInput = document.getElementById('inputCPassword');

registerBtn.addEventListener("click", (e) => {
	var lock = 0;
	username = usernameInput.value;
	pw = pwInput.value;
	cpw = cpwInput.value;
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

	if (username.length > 15){
		warning = document.createElement("a");
		warning.className = "warning";
		warning.text = "username name must not exceed 15 characters";
		if (!usernameInput.previousElementSibling)
			usernameInput.before(warning);
		lock = 1;
	}
	else if (username != "" && usernameInput.previousElementSibling)
			usernameInput.previousElementSibling.remove();
	if (pw != cpw){
		warning = document.createElement("a");
		warning.className = "warning";
		warning.text = "Passwords do not match";
		if (cpwInput.previousElementSibling && cpwInput.previousElementSibling.text == "Field can't be empty"){
			cpwInput.previousElementSibling.remove();
		}
		if (!cpwInput.previousElementSibling || cpwInput.previousElementSibling.text != "Passwords do not match"){
			cpwInput.before(warning);
		}
		else if (cpw != "" && cpwInput.previousElementSibling.text == "Field can't be empty"){
			cpwInput.previousElementSibling.remove();
		}
	}
	else if (lock == 0){
		document.getElementById("loaderBg").style.setProperty("display", "block");
		if (registerBtn.previousElementSibling)
			registerBtn.previousElementSibling.remove();

		const data = {username: username, password: pw, 'lang': currentLang};
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
					document.getElementById("loaderBg").style.setProperty("display", "none");
					history.replaceState("", "", `https://${hostname.host}/home`);
				});
			} else {
				response.json().then(response => {
					document.getElementById("loaderBg").style.setProperty("display", "none");
					warning = document.createElement("a");
					warning.className = "warning";
					warning.text = response.message;
					if (!registerBtn.previousElementSibling)
						registerBtn.before(warning);
				})

			}
		})
		.catch(error => {
			console.error('There was a problem with the fetch operation:', error);
		});
	}
})

{
	if (client){
		fetch('/api/user/logout', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include'
		}).then(response => {
			inputSearchUser.style.setProperty("display", "none");
			dropDownUserContainer.style.setProperty("display", "none");
		});
		client = null;
	}
	
	inputSearchUser.style.setProperty("display", "none");
	dropDownUserContainer.style.setProperty("display", "none");
}
