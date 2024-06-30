changeToLogin();

async function changeToLogin(){
	const contain = document.getElementById("container");
	const response = await fetch("bodyLess/login.html");
	const txt = await response.text();

	contain.innerHTML=txt;
}

async function changeToRegister(){
	const contain = document.getElementById("container");
	const response = await fetch("bodyLess/register.html");
	const txt = await response.text();

	contain.innerHTML=txt;
}

async function changeToSettings(){
	const contain = document.getElementById("container");
	const response = await fetch("bodyLess/settings.html");
	const txt = await response.text();

	contain.innerHTML=txt;
}

async function changeToHome(){
	const contain = document.getElementById("container");
	const response = await fetch("bodyLess/home.html");
	const txt = await response.text();

	contain.innerHTML=txt;
}

async function changeTheme(){
	const style = document.getElementById("style");
	const href = style.getAttribute('href');
	if (href == "lightMode.css")
		style.setAttribute('href', "darkMode.css");
	else
		style.setAttribute('href', "lightMode.css");
}

async function changeToDarkMode(){
	const style = document.getElementById("style");
	style.setAttribute('href', "darkMode.css");
}

async function changeToLightMode(){
	const style = document.getElementById("style");
	style.setAttribute('href', "lightMode.css");
}

function loginUser(username, password)
{
	const data = {username: username, password: password};
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
			changeToHome();
		} else {
			console.log("Failed to login user")
		}
	})
	.catch(error => {
		console.error('There was a problem with the fetch operation:', error);
	});
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
			changeToLogin();
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
	.then(data => {
		console.log('User ID:', data.id);
		console.log('Username:', data.username);
		console.log('Email:', data.email);
	})
	.catch(error => {
		console.error('There was a problem with the fetch operation:', error);
	});
}
