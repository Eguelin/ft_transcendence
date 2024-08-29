container = document.getElementById("container");
registerBtn = document.getElementById("registerBtn");
swichTheme = document.getElementById("themeButton");
displayInput = document.getElementById('inputDisplayName');
usernameInput = document.getElementById('inputUsername');
pwInput = document.getElementById('inputPassword');
cpwInput = document.getElementById('inputCPassword');

registerBtn.addEventListener("click", (e) => {
	var lock = 0;
	display = displayInput.value;
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
	
	if (display.length > 15){
		warning = document.createElement("a");
		warning.className = "warning";
		warning.text = "Display name must not exceed 15 characters";
		if (!displayInput.previousElementSibling)
			displayInput.before(warning);
		lock = 1;
	}
	else if (displayInput.previousElementSibling)
			displayInput.previousElementSibling.remove();
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
		const data = {username: username, password: pw, displayName: display};
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
					history.replaceState(JSON.stringify({"html": document.body.innerHTML, "currentPage": 'login', "currentLang": currentLang}), "", `https://${hostname.host}/home`);
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
