lightTheme = document.getElementsByClassName("loadLight");
darkTheme = document.getElementsByClassName("loadDark");
homeBtn = document.getElementById("goHomeButton");
germanBtn = document.getElementsByClassName("germanBtn");
englishBtn = document.getElementsByClassName("englishBtn");
dropDownContent = document.getElementsByClassName("dropDownPortrait");

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

for (const e of dropDownContent) {
	var a = e.getElementsByTagName('a');
	var j = 0;
	e.addEventListener("focus", (even) => {
		j = 0;
		a[0].classList.add("dropDownContentAHover");	
		e.addEventListener("keydown", (ek) => {
			if (ek.keyCode == 40 || ek.keyCode == 13){
//				console.log(j);
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
		});

	});
	e.addEventListener("focusout", (even) => {
//		console.log("unfocus");
		a[j].classList.remove("dropDownContentAHover");
	});
}
