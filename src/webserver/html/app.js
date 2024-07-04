loadPage('login');

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

function login(){
	username = document.getElementById('username').value;
	pw = document.getElementById('password').value;
	if (pw == "" || username == ""){
		warning = document.createElement("a");
		warning.className = "warning";
		warning.text = "Field can't be empty";
		
		if (pw == "" && document.getElementById("warningEmptyPassword") == null){
			warningP = warning.cloneNode(true);
			warningP.id = "warningEmptyPassword";
			document.getElementById("password").before(warningP);
		}
		else if (pw != "" && document.getElementById("warningEmptyPassword")){
			document.getElementById("warningEmptyPassword").remove();
		}
		
		if (username == "" && document.getElementById("warningEmptyUsername") == null){
			warning.id = "warningEmptyUsername";
			document.getElementById("username").before(warning);
		}
		else if (username != "" && document.getElementById("warningEmptyUsername")){
			document.getElementById("warningEmptyUsername").remove();
		}
	}
	else
		loginUser(username, pw);
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
	if (pw == "" || cpw == "" || username == "" || email == ""){
		warning = document.createElement("a");
		warning.className = "warning";
		warning.text = "Field can't be empty";
		
		if (pw == "" && document.getElementById("warningEmptyPassword") == null){
			warningP = warning.cloneNode(true);
			warningP.id = "warningEmptyPassword";
			document.getElementById("password").before(warningP);
		}
		else if (pw != "" && document.getElementById("warningEmptyPassword")){
			document.getElementById("warningEmptyPassword").remove();
		}
		
		if (cpw == "" && document.getElementById("warningEmptyCPassword") == null){
			warningCP = warning.cloneNode(true);
			warningCP.id = "warningEmptyCPassword";
			document.getElementById("cPassword").before(warningCP);
		}
		else if (cpw != "" && document.getElementById("warningEmptyCPassword")){
			document.getElementById("warningEmptyCPassword").remove();
		}
		
		if (email == "" && document.getElementById("warningEmptyMail") == null){
			warningM = warning.cloneNode(true);
			warningM.id = "warningEmptyMail";
			document.getElementById("mail").before(warningM);
		}
		else if (email != "" && document.getElementById("warningEmptyMail")){
			document.getElementById("warningEmptyMail").remove();
		}
		
		if (username == "" && document.getElementById("warningEmptyUsername") == null){
			warning.id = "warningEmptyUsername";
			document.getElementById("username").before(warning);
		}
		else if (username != "" && document.getElementById("warningEmptyUsername")){
			document.getElementById("warningEmptyUsername").remove();
		}
	}
	else if (pw != cpw){
		warning = document.createElement("a");
		warning.className = "warning";
		warning.text = "Passwords do not match";
		if (document.getElementById("warningEmptyCPassword"))
			document.getElementById("warningEmptyCPassword").remove();
		
		if (document.getElementById("warningPasswordDoNotMatch") == null){
			warning.id = "warningPasswordDoNotMatch";
			document.getElementById("cPassword").before(warning);
		}
		else if (cpw != "" && document.getElementById("warningEmptyCPassword")){
			document.getElementById("warningEmptyCPassword").remove();
		}
	}
	else
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
			console.log(response.json())
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
