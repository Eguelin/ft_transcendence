saveBtn = document.getElementById('saveBtn');
swichTheme = document.getElementById("themeButton");
homeBtn = document.getElementById("goHomeButton");
usernameInput = document.getElementById("inputUsername");
displayInput = document.getElementById("inputDisplayName");
pfpInput = document.getElementById("inputPfp");

swichTheme.addEventListener("click", () => {
	if (window.getComputedStyle(document.documentElement).getPropertyValue("--is-dark-theme") == 0){
		document.documentElement.style.setProperty("--page-bg-rgb", "#110026");
		document.documentElement.style.setProperty("--main-text-rgb", "#FDFDFB");
		document.documentElement.style.setProperty("--input-bg-rgb", "#3A3053");
		document.documentElement.style.setProperty("--is-dark-theme", 1);
		document.getElementById("themeButton").style.maskImage = "url(\"svg/button-night-mode.svg\")"
		const data = {dark_theme: 1};
		fetch('/api/user/update', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
			credentials: 'include'
		})
	}
	else{
		document.documentElement.style.setProperty("--page-bg-rgb", "#FDFDFB");
		document.documentElement.style.setProperty("--main-text-rgb", "#110026");
		document.documentElement.style.setProperty("--input-bg-rgb", "#FFDBDE");
		document.documentElement.style.setProperty("--is-dark-theme", 0);
		document.getElementById("themeButton").style.maskImage = "url(\"svg/button-light-mode.svg\")"
		const data = {dark_theme: 0};
		fetch('/api/user/update', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
			credentials: 'include'
		})
	}
})

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

saveBtn.addEventListener("click", (e) => {
	var data = {};
	var username = usernameInput.value;
	var display = displayInput.value;
	if (username != "")
		data['username'] = username;
	if (display != ""){
		if (display.length > 15){
			warning = document.createElement("a");
			warning.className = "warning";
			warning.text = "Display name must not exceed 15 characters";
			if (!displayInput.previousElementSibling)
				displayInput.before(warning);
		}
		else{
			if (displayInput.previousElementSibling)
				displayInput.previousElementSibling.remove();
			data['display'] = display;
		}
	}
	if (pfpInput.value != ""){ // this should always be the last check
		path = pfpInput.files[0];
		var blob = new Blob([path]);
		var reader = new FileReader();
		
		reader.readAsDataURL(blob);
		reader.onloadend = function(){
			var buf = reader.result;
			data['pfp'] = buf.substr(buf.indexOf(',') + 1);
			fetch('/api/user/update', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
				credentials: 'include'
			}).then(response => {
				if (!response.ok){
					warning = document.createElement("a");
					warning.className = "warning";
					warning.text = "File is too heavy";
					if (!pfpInput.previousElementSibling)
						pfpInput.before(warning);
				}
				else if (pfpInput.previousElementSibling)
					pfpInput.previousElementSibling.remove();
			})
		}
		
	}
	else {
		fetch('/api/user/update', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
			credentials: 'include'
		})
	}
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
				loadCurrentLang("accountSettings");
				history.replaceState(container.innerHTML, "");
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
				loadCurrentLang("accountSettings");
				history.replaceState(container.innerHTML, "");
			});
		}
	})
})
