loadPage('login', false);

async function loadPage(wanted, save){
	const contain = document.getElementById("container");
	const response = await fetch(`bodyLess/${wanted}.html`);
	const txt = await response.text();
	contain.innerHTML=txt;
	console.log(`addstate ${save}: ${txt}`);
	if (save == true)
		history.pushState(txt, "");
	else
		history.replaceState(txt,"");
}

window.addEventListener("popstate", (event) => {
	console.log(`popstate: ${event.state}`);
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
