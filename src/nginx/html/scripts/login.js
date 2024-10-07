container = document.getElementById("container");
loginBtn = document.getElementById('loginBtn');
swichTheme = document.getElementById("themeButton");
fortyTwoLogin = document.getElementById("fortyTwoLogin");

slides = document.querySelectorAll(".loginSlide");
var slideIdx = 0;
for (i = 0; i < slides.length; i++)
	slides[i].style.display = "none";
slides[slideIdx].style.display = "block";


fortyTwoLogin.addEventListener("click", (e) => {
	const authUrl = `https://api.intra.42.fr/oauth/authorize?client_id=u-s4t2ud-cb9676bf45bf8955cbb6ab78a74a365e69a9f11a901301c48e5f5f5ee1a7c144&redirect_uri=https%3A%2F%2Flocalhost%3A49300%2F&response_type=code`;
	window.location.href = authUrl;
});

fortyTwoLogin.addEventListener("keydown", (e) => {
	if (e.key == "Enter"){
		fortyTwoLogin.click()
	}
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
				response.json().then(text => {
					if (text.logged == 0){
						warning.text = text.message;
						if (!loginBtn.previousElementSibling)
							loginBtn.before(warning.cloneNode(true));
					}
					else{
						(async () => {
							client = await new Client()	
							if (client == null)
								history.replaceState("", "", `https://${hostname.host}/login`);
							else
								history.replaceState("", "", `https://${hostname.host}/home`);
						})();
					}
				})
			}
			else
			{
				response.json().then(text => {
					warning.text = text.message;
					if (!loginBtn.previousElementSibling)
						loginBtn.before(warning.cloneNode(true));
				})
			}
		})
		.catch(error => {
			console.error('Error:', error);
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


registerBtn = document.getElementById("registerBtn");
usernameRegisterInput = document.getElementById('inputRegisterUsername');
pwRegisterInput = document.getElementById('inputRegisterPassword');
cpwRegisterInput = document.getElementById('inputRegisterCPassword');

registerBtn.addEventListener("click", (e) => {
	var lock = 0;
	username = usernameRegisterInput.value;
	pw = pwRegisterInput.value;
	cpw = cpwRegisterInput.value;
	inputs = document.getElementsByClassName('registerFormInput');
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
		if (!usernameRegisterInput.previousElementSibling)
			usernameRegisterInput.before(warning);
		lock = 1;
	}
	else if (username != "" && usernameRegisterInput.previousElementSibling)
			usernameRegisterInput.previousElementSibling.remove();
	if (pw != cpw){
		warning = document.createElement("a");
		warning.className = "warning";
		warning.text = "Passwords do not match";
		if (cpwRegisterInput.previousElementSibling && cpwRegisterInput.previousElementSibling.text == "Field can't be empty")
			cpwRegisterInput.previousElementSibling.remove();
		if (!cpwRegisterInput.previousElementSibling || cpwRegisterInput.previousElementSibling.text != "Passwords do not match")
			cpwRegisterInput.before(warning);
		else if (cpw != "" && cpwRegisterInput.previousElementSibling.text == "Field can't be empty")
			cpwRegisterInput.previousElementSibling.remove();
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
				fetch('/api/user/login', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(data),
					credentials: 'include'
				}).then(response => {
					(async () => {
						client = await new Client()	
						if (client == null)
							history.replaceState("", "", `https://${hostname.host}/login`);
						else
							history.replaceState("", "", `https://${hostname.host}/home`);
					})();
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
