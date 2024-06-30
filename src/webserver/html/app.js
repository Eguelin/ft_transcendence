loadPage('login');


async function loadPage(wanted){
	const contain = document.getElementById("container");
	const response = await fetch(`bodyLess/${wanted}.html`);
	const txt = await response.text();
	history.pushState(txt, "");
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
	if (href == "lightMode.css")
		style.setAttribute('href', "darkMode.css");
	else
		style.setAttribute('href', "lightMode.css");
}

async function loadTheme(wanted){
	const style = document.getElementById("style");
	style.setAttribute('href', `${wanted}Mode.css`);
}
