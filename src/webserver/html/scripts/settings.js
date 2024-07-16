lightTheme = document.getElementById("loadLight");
darkTheme = document.getElementById("loadDark");
homeBtn = document.getElementById("goHomeButton");
germanBtn = document.getElementById("germanBtn");
englishBtn = document.getElementById("englishBtn");

germanBtn.addEventListener("click", (e) => {
	const data = {language_pack: "lang/DE_GE.json"};
	fetch('/api/user/update', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
		credentials: 'include'
	})
})

englishBtn.addEventListener("click", (e) => {
	const data = {language_pack: "lang/EN_US.json"};
	fetch('/api/user/update', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(data),
		credentials: 'include'
	})
})

lightTheme.addEventListener("click", (e) => {
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

darkTheme.addEventListener("click", (e) => {
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
