saveBtn = document.getElementById('saveBtn');
swichTheme = document.getElementById("themeButton");
homeBtn = document.getElementById("goHomeButton");
usernameInput = document.getElementById("inputUsername");
pfpInput = document.getElementById("inputPfp");

swichTheme.addEventListener("click", () => {
	if (window.getComputedStyle(document.documentElement).getPropertyValue("--is-dark-theme") == 0){
		document.documentElement.style.setProperty("--page-bg-rgb", "#110026");
		document.documentElement.style.setProperty("--main-text-rgb", "#FDFDFB");
		document.documentElement.style.setProperty("--input-bg-rgb", "#3A3053");
		document.documentElement.style.setProperty("--is-dark-theme", 1);
		document.getElementById("themeButton").style.maskImage = "url(\"svg/button-night-mode.svg\")"
	}
	else{
		document.documentElement.style.setProperty("--page-bg-rgb", "#FDFDFB");
		document.documentElement.style.setProperty("--main-text-rgb", "#110026");
		document.documentElement.style.setProperty("--input-bg-rgb", "#FFDBDE");
		document.documentElement.style.setProperty("--is-dark-theme", 0);
		document.getElementById("themeButton").style.maskImage = "url(\"svg/button-light-mode.svg\")"
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
			fetch('/api/user/current', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include'
			}).then(response => {
				if (response.ok) {
					(response.json()).then((text) => {
						fetch(text.lang).then(response => {
							response.json().then((text) => {
								content = text['home'];
								Object.keys(content).forEach(function(key) {
									if (key.startsWith('input'))
										document.getElementById(key).placeholder = content[key];
									else
										document.getElementById(key).innerHTML = content[key];
								});
							})
						})
					})
				};
			});
			document.body.appendChild(s);
		}))
	});	
})

saveBtn.addEventListener("click", (e) => {
	var data = {};
	username = usernameInput.value;
	if (username != "")
		data['username'] = username;
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
				history.replaceState(container.innerHTML, "");
			});
		}
	})
})
