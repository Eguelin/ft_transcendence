container = document.getElementById("container");
registerLink = document.getElementById("registerLink");
loginBtn = document.getElementById('loginBtn');
swichTheme = document.getElementById("themeButton");
fortyTwoLogin = document.getElementById("fortyTwoLogin");

fortyTwoLogin.addEventListener("click", (e) => {
	fetch('/api/user/get_uri', {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
		credentials: 'include'
	})
	.then(response => {
		if (response.ok) {
			response.json().then(text => {
				window.location.href = text.uri;
			})
		}
	})
});

registerLink.addEventListener("click", (e) => {
	history.pushState("", "", `https://${hostname.host}/register`);
});

fortyTwoLogin.addEventListener("keydown", (e) => {
	if (e.key == "Enter"){
		fortyTwoLogin.click()
	}
});

registerLink.addEventListener("keyup", (e) => {
	if (e.key == "Enter") {
		registerLink.click();
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
