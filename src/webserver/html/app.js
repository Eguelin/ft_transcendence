//loadPage('login');
loadPage('register');

async function loadPage(wanted){
	const contain = document.getElementById("container");
	const response = await fetch(`bodyLess/${wanted}.html`);
	const txt = await response.text();
	if (contain.innerHTML != "")
		history.pushState(txt, "");
	else
		history.replaceState(txt,"");
	contain.innerHTML=txt;
}

window.addEventListener("popstate", (event) => {
	if (event.state){
		const contain = document.getElementById("container");
		contain.innerHTML = event.state;
	}
});

async function switchTheme(){
	const style = document.getElementById("style");
	const href = style.getAttribute('href');
	style.setAttribute('href', href == "lightMode.css" ? "darkMode.css" : "lightMode.css");
}

async function loadTheme(wanted){
	const style = document.getElementById("style");
	style.setAttribute('href', `${wanted}Mode.css`);
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
			loadPage('home');
		} else {
			console.log("Failed to login user")
		}
	})
	.catch(error => {
		console.error('There was a problem with the fetch operation:', error);
	});
}

function registerUser(){
	email = document.getElementById('mail').value;
	username = document.getElementById('username').value;
	pw = document.getElementById('password').value;
	cpw = document.getElementById('cPassword').value;
	if (pw != cpw)
		return ;
	if (email == "")
		return ;
	if (username == "")
		return ;
	createUser(username, pw);
	loadPage('home');
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
			loadPage('login');
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
