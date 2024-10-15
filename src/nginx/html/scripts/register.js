container = document.getElementById("container");
registerBtn = document.getElementById("registerBtn");
swichTheme = document.getElementById("themeButton");
usernameInput = document.getElementById('inputUsername');
pwInput = document.getElementById('inputPassword');
cpwInput = document.getElementById('inputCPassword');

{
	if (client){
		fetch('/api/user/logout', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include'
		}).then(response => {
			inputSearchUserContainer.style.setProperty("display", "none");
			dropDownUserContainer.style.setProperty("display", "none");
		});
		client = null;
	}
	
	inputSearchUserContainer.style.setProperty("display", "none");
	dropDownUserContainer.style.setProperty("display", "none");
}
