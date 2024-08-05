friendCodeSpan = document.getElementById("friendCode");
friendCodePopup = document.getElementById("friendCodePopup");
friendCodeBtn = document.getElementById("friendCodeBtn");

friendCodeBtn.addEventListener("click", (e) => {
	friendCodePopup.style.setProperty("display", "block");
})

{
	fetch('/api/user/current', {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
		credentials: 'include'
	})
	.then(response => {
		if (response.ok) {
			(response.json()).then((text) => {
				switchTheme(text.is_dark_theme);
				loadCurrentLang("friends");
				code = document.createElement("a");
				code.innerHTML = text.friend_code;
				friendCodePopup.appendChild(code);
				history.replaceState(container.innerHTML, "");
			});
		}
		else {
			console.log("Failed to get user")

			fetch ('bodyLess/login.html').then((response) => {
				(response.text().then(response => {
					if (container.innerHTML != "")
						history.pushState(response, "");
					else
						history.replaceState(response,"");
					container.innerHTML = response;
					document.getElementById("script").remove();
					var s = document.createElement("script");
					s.setAttribute('id', 'script');
					s.setAttribute('src', `scripts/login.js`);
					document.body.appendChild(s);
					document.getElementById("pfp").style.setProperty("display", "none");
					document.getElementById("dropDownUser").style.setProperty("display", "none");
					history.replaceState(container.innerHTML, "");
				}))
			});
		}
		return (null);
	})
}
