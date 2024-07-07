container = document.getElementById("container");
registerLink = document.getElementById("registerLink");
loginBtn = document.getElementById('loginBtn');

registerLink.addEventListener("click", (e) => {
	fetch ('bodyLess/register.html').then((response) => {
		return (response.text().then(response => {
			if (container.innerHTML != "")
				history.pushState(response, "");
			else
				history.replaceState(response,"");
			container.innerHTML = response;
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
					}))
				});
				
			} else {
				console.log("Failed to login user")
				return response.json().then((text => {
					warning.text = text.message;
					if (!loginBtn.previousElementSibling)
						loginBtn.before(warning.cloneNode(true));
				
					return (text.message);
				}));
			}
		})
	}
})


async function switchTheme(){
	const style = document.getElementById("style");
	const href = style.getAttribute('href');
	style.setAttribute('href', href == "lightMode.css" ? "darkMode.css" : "lightMode.css");
}

async function loadTheme(wanted){
	const style = document.getElementById("style");
	style.setAttribute('href', `${wanted}Mode.css`);
}

function registerUser(){
	email = document.getElementById('mail').value;
	var lock = 0;
	username = document.getElementById('username').value;
	pw = document.getElementById('password').value;
	cpw = document.getElementById('cPassword').value;
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
		if (document.getElementById('cPassword').previousElementSibling && document.getElementById('cPassword').previousElementSibling.text == "Field can't be empty"){
			document.getElementById('cPassword').previousElementSibling.remove();
		}
		if (!document.getElementById('cPassword').previousElementSibling || document.getElementById('cPassword').previousElementSibling.text != "Passwords do not match"){
			document.getElementById("cPassword").before(warning);
		}
		else if (cpw != "" && document.getElementById('cPassword').previousElementSibling.text == "Field can't be empty"){
			document.getElementById('cPassword').previousElementSibling.remove();
		}
	}
	else if (lock == 0)
		createUser(username, pw);
}

function createUser(username, password)
{
	const data = {username: username, password: password};
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
			loadPage('home');
		} else {
			console.log("Failed to create user")
		}
	})
	.catch(error => {
		console.error('There was a problem with the fetch operation:', error);
	});
}

function getCurrentUser() {
	fetch('/api/user/current', {
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
	})
	.catch(error => {
		console.error('There was a problem with the fetch operation:', error);
	});
}
