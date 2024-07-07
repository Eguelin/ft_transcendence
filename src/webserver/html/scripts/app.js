loadPage('login');
//loadPage('register');

async function loadPage(wanted){
	const contain = document.getElementById("container");
	const response = await fetch(`bodyLess/${wanted}.html`);
	const txt = await response.text();
	if (contain.innerHTML != "")
		history.pushState(txt, "");
	else
		history.replaceState(txt,"");
	contain.innerHTML=txt;
	document.getElementById("script").remove();
	var s = document.createElement("script");
	s.setAttribute('id', 'script');
	s.setAttribute('src', `scripts/${wanted}.js`);
	document.body.appendChild(s);
	//document.getElementById("script").setAttribute('src', `scripts/${wanted}.js`);
}

window.addEventListener("popstate", (event) => {
	if (event.state){
		const contain = document.getElementById("container");
		contain.innerHTML = event.state;
	}
});