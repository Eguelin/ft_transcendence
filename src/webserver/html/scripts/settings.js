lightTheme = document.getElementById("loadLight");
darkTheme = document.getElementById("loadDark");

lightTheme.addEventListener("click", (e) => {
	document.getElementById("style").setAttribute('href', 'lightMode.css');
})

darkTheme.addEventListener("click", (e) => {
	document.getElementById("style").setAttribute('href', 'darkMode.css');
})
