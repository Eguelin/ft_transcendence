saveBtn = document.getElementById('saveBtn');
swichTheme = document.getElementById("themeButton");
homeBtn = document.getElementById("goHomeButton");
usernameInput = document.getElementById("inputUsername");
displayInput = document.getElementById("inputDisplayName");
pfpInput = document.getElementById("inputPfp");
pfpInputLabel = document.getElementById("pfpLabel");
lightTheme = document.getElementsByClassName("loadLight");
darkTheme = document.getElementsByClassName("loadDark");
germanBtn = document.getElementsByClassName("germanBtn");
englishBtn = document.getElementsByClassName("englishBtn");
dropDownContent = document.querySelectorAll(".dropDownPortrait, .dropDownLandscape");
settingsSlides = document.querySelectorAll(".settingSlide");
rightSlideBtn = document.getElementById("rightSlideBtn");
leftSlideBtn = document.getElementById("leftSlideBtn");


var slideIdx = 0;
for (i = 0; i < settingsSlides.length; i++)
	settingsSlides[i].style.display = "none";
settingsSlides[slideIdx].style.display = "block";

rightSlideBtn.addEventListener("click", () => {
	slideIdx += 1;
	if (slideIdx > settingsSlides.length - 1) 
		slideIdx = 0;
	for (let i = 0; i < settingsSlides.length; i++)
		settingsSlides[i].style.display = "none";
	settingsSlides[slideIdx].style.display = "block";
});

leftSlideBtn.addEventListener("click", () => {
	slideIdx -= 1;
	if (slideIdx < 0 ) 
		slideIdx = settingsSlides.length - 1;
	for (let i = 0; i < settingsSlides.length; i++)
		settingsSlides[i].style.display = "none";
	settingsSlides[slideIdx].style.display = "block";
});

pfpInputLabel.addEventListener("keydown", (ek) => {
	if (ek.key == "Enter"){
		pfpInput.click();
	}
})

pfpInput.addEventListener("change", (e) => {
	if (pfpInput.files.length >= 1)
		pfpInputLabel.innerHTML = pfpInput.files[0].name;
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
					if (!pfpInputLabel.previousElementSibling)
						pfpInputLabel.before(warning);
				}
				else if (pfpInputLabel.previousElementSibling)
					pfpInputLabel.previousElementSibling.remove();
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
/*
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
				currentLang = text.lang;
				usernameInput.setAttribute('placeholder', text.username);
				loadCurrentLang();
				state = JSON.stringify({"html": document.body.innerHTML, "currentPage": currentPage, "currentLang": currentLang});

				history.replaceState(state, "");
			});
		}
		else {
			console.log("Failed to get user")
			
			fetch ('bodyLess/login.html').then((response) => {
				(response.text().then(response => {
					state = JSON.stringify({"html": document.body.innerHTML, "currentPage": currentPage, "currentLang": currentLang});

					if (container.innerHTML != "")
						history.pushState(state, "");
					else
						history.replaceState(state,"");
					container.innerHTML = response;
					document.getElementById("script").remove();
					var s = document.createElement("script");
					s.setAttribute('id', 'script');
					s.setAttribute('src', `scripts/login.js`);
					document.body.appendChild(s);
					currentPage = "login";
					state = JSON.stringify({"html": document.body.innerHTML, "currentPage": currentPage, "currentLang": currentLang});

					history.replaceState(state, "");
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
				switchTheme(text.is_dark_theme);
				username.setAttribute('placeholder', text.username);
				currentLang = text.lang;
				loadCurrentLang();
				state = JSON.stringify({"html": document.body.innerHTML, "currentPage": currentPage, "currentLang": currentLang});

				history.replaceState(state, "");
			});
		}
		else {
			console.log("Failed to get user")
			
			fetch ('bodyLess/login.html').then((response) => {
				(response.text().then(response => {
					state = JSON.stringify({"html": document.body.innerHTML, "currentPage": currentPage, "currentLang": currentLang});

					if (container.innerHTML != "")
						history.pushState(state, "");
					else
						history.replaceState(state,"");
					container.innerHTML = response;
					document.getElementById("script").remove();
					var s = document.createElement("script");
					s.setAttribute('id', 'script');
					s.setAttribute('src', `scripts/login.js`);
					document.body.appendChild(s);
					currentPage = "login";
					state = JSON.stringify({"html": document.body.innerHTML, "currentPage": currentPage, "currentLang": currentLang});

					history.replaceState(state, "");
				}))
			});	
		}
	})
})
*/


dropDownContent.forEach(function(button) {
	var a = button.getElementsByTagName('a');
	var j = 0;
	button.addEventListener("focus", (even) => {
		j = 0;
		a[0].classList.add("dropDownContentAHover");
	});
	button.addEventListener("keydown", (ek) => {
		if (ek.key == "ArrowDown" || ek.key == "Enter"){
			if (j >= a.length)
				j--;
			if (ek.key == "Enter"){
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
		else if (ek.key == "ArrowUp"){
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
	button.addEventListener("blur", (even) => {
		a[j].classList.remove("dropDownContentAHover");
		j = 0;
	});
});

for (var i = 0 ;i < germanBtn.length; i++)
{
	germanBtn[i].addEventListener("click", (e) => {
		currentLang = "lang/DE_GE.json";
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
		for (var j=0; j< germanBtn.length; j++){
			germanBtn[j].classList.remove("dropDownContentAHover");
			englishBtn[j].classList.remove("dropDownContentAHover");
		}
	})
	
	englishBtn[i].addEventListener("click", (e) => {
		currentLang = "lang/EN_US.json";
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
		for (var j=0; j< germanBtn.length; j++){
			germanBtn[j].classList.remove("dropDownContentAHover");
			englishBtn[j].classList.remove("dropDownContentAHover");
		}
	})
}

for (var i=0; i< lightTheme.length; i++)
{
	lightTheme[i].addEventListener("click", (e) => {
		switchTheme(0);
		const data = {is_dark_theme: 0};
		fetch('/api/user/update', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
			credentials: 'include'
		})
		e.srcElement.classList.remove("dropDownContentAHover");
	})

	darkTheme[i].addEventListener("click", (e) => {
		switchTheme(1);
		const data = {is_dark_theme: 1};
		fetch('/api/user/update', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
			credentials: 'include'
		})
		e.srcElement.classList.remove("dropDownContentAHover");
	})
}
