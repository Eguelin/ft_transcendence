deleteAccountBtn = document.getElementById('deleteAccountBtn');
confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
usernameInput = document.getElementById("inputChangeUsername");
saveUsernameBtn = document.getElementById("saveUsernameBtn");
pfpInput = document.getElementById("inputPfp");
pfpInputLabel = document.getElementById("pfpLabel");
lightTheme = document.getElementsByClassName("loadLight");
darkTheme = document.getElementsByClassName("loadDark");
settingsThemeDevice = document.getElementById("settingsThemeDevice");
germanBtn = document.getElementsByClassName("germanBtn");
englishBtn = document.getElementsByClassName("englishBtn");
dropDownContent = document.querySelectorAll(".settingsDropDown, .dropDownLandscape");
settingsSlides = document.querySelectorAll(".settingSlide");
rightSlideBtn = document.getElementById("rightSlideBtn");
leftSlideBtn = document.getElementById("leftSlideBtn");
confirmDeleteInput = document.getElementById("confirmDeleteInput");
confirmPfpBtn = document.getElementById("confirmPfpBtn");
var buf = "";

var slideIdx = 1;
for (i = 0; i < settingsSlides.length; i++)
	settingsSlides[i].style.display = "none";
settingsSlides[slideIdx].style.display = "flex";

document.querySelectorAll("#rightSlideBtn, #leftSlideBtn, #pfpLabel, #saveUsernameBtn, #confirmDeleteBtn").forEach(function (elem){
	elem.addEventListener("keydown", (e) => {
		if (e.key == "Enter")
			elem.click();
	})
})

rightSlideBtn.addEventListener("click", () => {
	slideIdx += 1;
	if (slideIdx > settingsSlides.length - 1)
		slideIdx = 0;
	for (let i = 0; i < settingsSlides.length; i++)
		settingsSlides[i].style.display = "none";
	settingsSlides[slideIdx].style.display = "flex";
});

leftSlideBtn.addEventListener("click", () => {
	slideIdx -= 1;
	if (slideIdx < 0 )
		slideIdx = settingsSlides.length - 1;
	for (let i = 0; i < settingsSlides.length; i++)
		settingsSlides[i].style.display = "none";
	settingsSlides[slideIdx].style.display = "flex";
});

pfpInput.addEventListener("change", (e) => {
	if (pfpInput.files.length >= 1){
		path = pfpInput.files[0];
		pfpInputLabel.innerText = path.name;
		var blob = new Blob([path]);
		var reader = new FileReader();

		reader.readAsDataURL(blob);
		reader.onloadend = function(){
			buf = reader.result;
			buf = buf.substr(buf.indexOf(',') + 1);
			window.removeEventListener("keydown", settingsKeyDownEvent)
			document.getElementById("popupBg").style.setProperty("display", "block");
			document.getElementById("confirmPfpContainer").style.setProperty("display", "flex")
			document.getElementById("confirmPfpImg").setAttribute("src", `data:image/jpg;base64,${buf}`);

		}
	}
})

confirmPfpBtn.addEventListener("click", (e) => {
	fetch('/api/user/update', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({'pfp': buf}),
		credentials: 'include'
	}).then(response => {
		return response.json().then(data => {
			if (!response.ok)
			{
				warning = document.createElement("a");
				warning.className = "warning";
				warning.textContent = data.message;
				if (!pfpInputLabel.previousElementSibling)
					pfpInputLabel.before(warning);
				document.getElementById("popupBg").style.setProperty("display", "none");
				document.getElementById("confirmPfpContainer").style.setProperty("display", "none");
			}
			else
			{
				if (pfpInputLabel.previousElementSibling)
					pfpInputLabel.previousElementSibling.remove();
				document.getElementById("popupBg").style.setProperty("display", "none");
				document.getElementById("confirmPfpContainer").style.setProperty("display", "none");
				(async () => {
					client = await new Client()
					if (!client)
						myReplaceState(`https://${hostname.host}/login`);
				})()
			}
		});
	}).catch(error => {
		console.error('Error during profile update:', error);
		warning = document.createElement("a");
		warning.className = "warning";
		warning.textContent = "An unexpected error occurred.";
		if (!pfpInputLabel.previousElementSibling)
			pfpInputLabel.before(warning);
	});

	window.addEventListener("keydown", settingsKeyDownEvent);
});

saveUsernameBtn.addEventListener("click", (e) => {
	username = usernameInput.value;

	if (usernameInput.previousElementSibling)
		usernameInput.previousElementSibling.remove();

	if (username != ""){
			fetch('/api/user/update', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({'username': username}),
				credentials: 'include'
			}).then(response => {
				if (response.ok){
					if (usernameInput.previousElementSibling)
						usernameInput.previousElementSibling.remove();
					success = document.createElement("a");
					success.className = "success";
					success.text = "username successfully updated";
					usernameInput.before(success);

					(async () => {
						client = await new Client();
						if (!client)
							myReplaceState(`https://${hostname.host}/login`);
					})()
				}
				else {
					response.json().then(response => {
					warning = document.createElement("a");
					warning.className = "warning";
					warning.text = response.message;
					usernameInput.before(warning);
					})
				}
			})
	}
	else{
		warning = document.createElement("a");
		warning.className = "warning";
		warning.text = "username can't be empty";
		usernameInput.before(warning);
	}
})

deleteAccountBtn.addEventListener("click", (e) => {
	window.removeEventListener("keydown", settingsKeyDownEvent)
	document.getElementById("popupBg").style.setProperty("display", "block");
	document.getElementById("confirmDeletePopup").style.setProperty("display", "flex");
	document.getElementById("confirmDeleteDialogVar").innerText = client.username;
	confirmDeleteInput.focus();
})


confirmDeleteBtn.addEventListener("click", (e) => {
	val = confirmDeleteInput.value;
	deleteRequest();
})

confirmDeleteBtn.addEventListener("keydown", (e) => {
	if (e.key == "Tab"){
		e.preventDefault();
		confirmDeleteInput.focus();
	}
})
confirmDeleteInput.addEventListener("keydown", (e) => {
	if (e.key == "Tab"){
		e.preventDefault();
		confirmDeleteBtn.focus();
	}
})

function deleteRequest(){
	if (val == document.getElementById("confirmDeleteDialogVar").innerText){
		fetch('/api/user/delete_user', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include'
		}).then(response => {
			if (response.ok){
				myPushState(`https://${hostname.host}/login`);
			}
		})
	}
}

document.addEventListener("keydown", (e) => {
	if (currentPage == "settings"){
		if (e.key == "Escape" &&
			document.getElementById("popupBg").style.getPropertyValue("display") != "none"){
			document.getElementById("popupBg").style.setProperty("display", "none");
			document.getElementById("confirmDeletePopup").style.setProperty("display", "none");
			document.getElementById("confirmPfpContainer").style.setProperty("display", "none")
			window.addEventListener("keydown", settingsKeyDownEvent)
		}
	}
})

document.addEventListener("click", (e) => {
	if (currentPage == "settings"){
		if (e.target.parentElement == null || e.target.id == "popupBg"){
			document.getElementById("popupBg").style.setProperty("display", "none");
			document.getElementById("confirmDeletePopup").style.setProperty("display", "none");
			document.getElementById("confirmPfpContainer").style.setProperty("display", "none")
		}
		if (!e.target.closest(".settingsDropDown")){
			document.querySelectorAll(".settingsDropDown.activeDropDown").forEach(function(elem) {
				elem.classList.remove("activeDropDown");
				void elem.offsetWidth;
				elem.classList.add("inactiveSettingsDropDown");
	
				setTimeout((elem) => {
					elem.classList.remove("inactiveSettingsDropDown");
				}, 300, elem);
			});
		}
	}
})

document.querySelectorAll(".settingsLangDropDown").forEach(function(elem){
	elem.addEventListener("click", (e) => {
		(async() => {
			currentLang = `lang/${elem.id}.json`;
			try{
				if (client){
					client.currentLang = `lang/${elem.id}.json`;
					fetchResult = await fetch(`https://${hostname.host}/${currentLang}`);
					content = await fetchResult.json();
					client.langJson = content;
				}
				loadCurrentLang();
				if (client){
					fetch('/api/user/update', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({ language_pack: currentLang }),
						credentials: 'include'
					})
					dropDownLangBtn.style.setProperty("background-image", `url(https://${hostname.host}/icons/${elem.id}.svg)`);
				}
			}
			catch{
				popUpError(`Could not load ${elem.id} language pack`);
			}
		})();
	})
	elem.addEventListener("keydown", (e) => {
		if (e.key == "Enter")
			elem.click();
	})
})

document.getElementById("settingsThemeLight").addEventListener("click", (e) => {
	switchTheme('light');
	
	preferedColorSchemeMedia.removeEventListener('change', browserThemeEvent);
	fetch('/api/user/update', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ is_dark_theme: false, use_browser_theme: false}),
		credentials: 'include'
	})
	client.use_browser_theme = false;
})
document.getElementById("settingsThemeDark").addEventListener("click", (e) => {
	switchTheme('dark');

	preferedColorSchemeMedia.removeEventListener('change', browserThemeEvent);
	fetch('/api/user/update', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ is_dark_theme: true, use_browser_theme: false}),
		credentials: 'include'
	})
	client.use_browser_theme = false;
})

settingsThemeDevice.addEventListener("click", (e) => {
	preferedColorSchemeMedia.removeEventListener('change', browserThemeEvent);
	if (window.matchMedia) {
		switchTheme(window.matchMedia('(prefers-color-scheme: dark)').matches == true ? 'dark' : 'light');
	}
	preferedColorSchemeMedia.addEventListener('change', browserThemeEvent);
	var theme = window.getComputedStyle(document.documentElement).getPropertyValue("--is-dark-theme") == 1 ? false : true;
	fetch('/api/user/update', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ is_dark_theme: theme, use_browser_theme: true}),
		credentials: 'include'
	})
	client.use_browser_theme = true;
})

document.querySelectorAll(".settingsThemeDropDown").forEach(function (elem) {
	elem.addEventListener("keydown", (e) => {
		if (e.key == "Enter")
			elem.click();
	})
})

document.querySelectorAll(".settingsDropDown").forEach(function (elem) {
	elem.addEventListener("keydown", (e) => {
		if (!e.target.closest(".dropDownContent")){
			if (e.key == "Enter")
				elem.click();
		}
	})
	elem.addEventListener("click", (e) => {
		if (!e.target.closest(".dropDownContent")){
			if (elem.classList.contains("activeDropDown")){
				elem.classList.remove("activeDropDown");
				void elem.offsetWidth;
				elem.classList.add("inactiveSettingsDropDown");

				setTimeout((elem) => {
					elem.classList.remove("inactiveSettingsDropDown");
				}, 300, elem);
			}
			else{
				document.querySelectorAll(".activeDropDown").forEach(function(elem) {
					elem.classList.remove("activeDropDown");
					void elem.offsetWidth;
					elem.classList.add("inactiveSettingsDropDown");
		
					setTimeout((elem) => {
						elem.classList.remove("inactiveSettingsDropDown");
					}, 300, elem);
				});
				elem.classList.add("activeDropDown");
			}
		}
	})
})

function settingsKeyDownEvent(e) {
	if (e.key == "ArrowLeft" || e.key == "ArrowRight") {
		if (e.key == "ArrowLeft")
			slideIdx -= 1;
		else
			slideIdx += 1;
		if (slideIdx > settingsSlides.length - 1)
			slideIdx = 0;
		if (slideIdx < 0)
			slideIdx = settingsSlides.length - 1;
		for (let i = 0; i < settingsSlides.length; i++)
			settingsSlides[i].style.display = "none";
		settingsSlides[slideIdx].style.display = "flex";
	}
}

{
	inputSearchUserContainer.style.setProperty("display", "none");
	dropDownUserContainer.style.setProperty("display", "flex");
	homeBtn.style.setProperty("display", "block");
	homeBtn.focus();
	document.getElementById("fontSizeRange").value = client.fontAmplifier;
	window.addEventListener("keydown", settingsKeyDownEvent)
}

document.getElementById("fontSizeRange").addEventListener("input", (e) => {
	fetch('/api/user/update', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ "font_amplifier":  e.target.value}),
		credentials: 'include'
	})
	client.fontAmplifier = e.target.value;
	document.documentElement.style.setProperty("--font-size-amplifier", e.target.value);
})

document.getElementById("fontSizeRange").addEventListener("focus", (e) =>{
	window.removeEventListener("keydown", settingsKeyDownEvent)
})

document.getElementById("fontSizeRange").addEventListener("focusout", (e) =>{
	window.addEventListener("keydown", settingsKeyDownEvent)
})

usernameInput.addEventListener("focus", (e) => {
	window.removeEventListener("keydown", settingsKeyDownEvent)
})

usernameInput.addEventListener("focusout", (e) => {
	window.addEventListener("keydown", settingsKeyDownEvent)
})
