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
