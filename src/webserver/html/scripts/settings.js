lightTheme = document.getElementsByClassName("loadLight");
darkTheme = document.getElementsByClassName("loadDark");
homeBtn = document.getElementById("goHomeButton");
germanBtn = document.getElementsByClassName("germanBtn");
englishBtn = document.getElementsByClassName("englishBtn");
dropDownContent = document.querySelectorAll(".dropDownPortrait, .dropDownLandscape");

dropDownContent.forEach(function(button) {
	var a = button.getElementsByTagName('a');
	var j = 0;
	button.addEventListener("focus", (even) => {
		j = 0;
		a[0].classList.add("dropDownContentAHover");
	});
	button.addEventListener("keydown", (ek) => {
		if (ek.keyCode == 40 || ek.keyCode == 13){
			if (j >= a.length)
				j--;
			if (ek.keyCode == 13){
				a[j].click();
			}
			else if (j == a.length - 1){
				a[j].classList.remove("dropDownContentAHover");
				j = 0;
			}
			else {
				a[j].classList.remove("dropDownContentAHover");
				j += 1;
			}
			a[j].classList.add("dropDownContentAHover");	
		}
		else if (ek.keyCode == 38){
			if (j == 0){
				a[j].classList.remove("dropDownContentAHover");
				j = a.length - 1;
			}
			else {
				a[j].classList.remove("dropDownContentAHover");
				j--;
			}
			a[j].classList.add("dropDownContentAHover");	
			
		}
	});
	button.addEventListener("focusout", (even) => {
		a[j].classList.remove("dropDownContentAHover");
		j = 0;
	});
});

for (var i = 0 ;i < germanBtn.length; i++)
{
	germanBtn[i].addEventListener("click", (e) => {
		const data = {language_pack: "lang/DE_GE.json"};
		fetch("lang/DE_GE.json").then(response => {
			response.json().then((text) => {
				content = text['settings'];
				Object.keys(content).forEach(function(key) {
					if (key.startsWith('input'))
						document.getElementById(key).placeholder = content[key];
					else
						document.getElementById(key).innerHTML = content[key];
				});
			})
		})
		fetch('/api/user/update', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
			credentials: 'include'
		})
	})
	
	englishBtn[i].addEventListener("click", (e) => {
		const data = {language_pack: "lang/EN_US.json"};
		fetch("lang/EN_US.json").then(response => {
			response.json().then((text) => {
				content = text['settings'];
				Object.keys(content).forEach(function(key) {
					if (key.startsWith('input'))
						document.getElementById(key).placeholder = content[key];
					else
						document.getElementById(key).innerHTML = content[key];
				});
			})
		})
		fetch('/api/user/update', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
			credentials: 'include'
		})
	})
}

for (var i=0; i< lightTheme.length; i++)
{
	lightTheme[i].addEventListener("click", (e) => {
		document.documentElement.style.setProperty("--page-bg-rgb", "#FDFDFB");
		document.documentElement.style.setProperty("--main-text-rgb", "#110026");
		document.documentElement.style.setProperty("--input-bg-rgb", "#FFDBDE");
		document.documentElement.style.setProperty("--is-dark-theme", 0);
		const data = {dark_theme: 0};
		fetch('/api/user/update', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
			credentials: 'include'
		})
	})

	darkTheme[i].addEventListener("click", (e) => {
		document.documentElement.style.setProperty("--page-bg-rgb", "#110026");
		document.documentElement.style.setProperty("--main-text-rgb", "#FDFDFB");
		document.documentElement.style.setProperty("--input-bg-rgb", "#3A3053");
		document.documentElement.style.setProperty("--is-dark-theme", 1);
		const data = {dark_theme: 1};
		fetch('/api/user/update', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
			credentials: 'include'
		})
	})
}

homeBtn.addEventListener("click", (e) => {
	fetch ('bodyLess/home.html').then((response) => {
		return (response.text().then(response => {
			if (container.innerHTML != "")
				history.pushState(response, "");
			else
				history.replaceState(response,"");
			container.innerHTML = response;
			document.getElementById("script").remove();
			var s = document.createElement("script");
			s.setAttribute('id', 'script');
			s.setAttribute('src', `scripts/home.js`);
			loadCurrentLang("home");
			document.body.appendChild(s);
		}))
	});	
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
				if (text.theme){
					document.documentElement.style.setProperty("--page-bg-rgb", "#110026");
					document.documentElement.style.setProperty("--main-text-rgb", "#FDFDFB");
					document.documentElement.style.setProperty("--input-bg-rgb", "#3A3053");
				}
				else{
					document.documentElement.style.setProperty("--page-bg-rgb", "#FDFDFB");
					document.documentElement.style.setProperty("--main-text-rgb", "#110026");
					document.documentElement.style.setProperty("--input-bg-rgb", "#FFDBDE");
				}
				usernameInput.setAttribute('placeholder', text.username);
				loadCurrentLang("settings");
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
					history.replaceState(container.innerHTML, "");
				}))
			});	
		}
	})
}


window.addEventListener("load", () => {
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
				if (text.theme){
					document.documentElement.style.setProperty("--page-bg-rgb", "#110026");
					document.documentElement.style.setProperty("--main-text-rgb", "#FDFDFB");
					document.documentElement.style.setProperty("--input-bg-rgb", "#3A3053");
				}
				else{
					document.documentElement.style.setProperty("--page-bg-rgb", "#FDFDFB");
					document.documentElement.style.setProperty("--main-text-rgb", "#110026");
					document.documentElement.style.setProperty("--input-bg-rgb", "#FFDBDE");
				}
				username.setAttribute('placeholder', text.username);
				loadCurrentLang("settings");
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
					history.replaceState(container.innerHTML, "");
				}))
			});	
		}
	})
})
