deleteAccountBtn = document.getElementById('deleteAccountBtn');
confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
usernameInput = document.getElementById("inputChangeUsername");
saveUsernameBtn = document.getElementById("saveUsernameBtn");
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
confirmDeleteInput = document.getElementById("confirmDeleteInput");
confirmPfpBtn = document.getElementById("confirmPfpBtn");
var buf = "";

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
	if (pfpInput.files.length >= 1){
		path = pfpInput.files[0];
		pfpInputLabel.innerText = path.name;
		var blob = new Blob([path]);
		var reader = new FileReader();

		reader.readAsDataURL(blob);
		reader.onloadend = function(){
			buf = reader.result;
			buf = buf.substr(buf.indexOf(',') + 1);
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
		if (!response.ok){
			warning = document.createElement("a");
			warning.className = "warning";
			warning.text = "File is too heavy";
			if (!pfpInputLabel.previousElementSibling)
				pfpInputLabel.before(warning);
		}
		else{
			if (pfpInputLabel.previousElementSibling)
				pfpInputLabel.previousElementSibling.remove();
			document.getElementById("popupBg").style.setProperty("display", "none");
			document.getElementById("confirmPfpContainer").style.setProperty("display", "none")
		}
	})
})

saveUsernameBtn.addEventListener("keydown", (e) => {
	if (e.key == "Enter")
		saveUsernameBtn.click();
})

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
	document.getElementById("popupBg").style.setProperty("display", "block");
	document.getElementById("confirmDeletePopup").style.setProperty("display", "flex");
	document.getElementById("confirmDeleteDialogVar").innerText = 'delete';
})


confirmDeleteBtn.addEventListener("click", (e) => {
	val = confirmDeleteInput.value;
	deleteRequest();
})

confirmDeleteInput.addEventListener("keydown", (e) => {
	if (e.key == "Enter"){
		val = confirmDeleteInput.value;
		deleteRequest();
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
		if (e.key == "Escape"){
			document.getElementById("popupBg").style.setProperty("display", "none");
			document.getElementById("confirmDeletePopup").style.setProperty("display", "none");
			document.getElementById("confirmPfpContainer").style.setProperty("display", "none")
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
	}
})

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
		(async() => {
			currentLang = `lang/DE_GE.json`;
			try{
				if (client){
					client.currentLang = currentLang;
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
					langDropDownBtn.style.setProperty("background-image", `url(https://${hostname.host}/icons/DE_GE.svg)`);
				}
			}
			catch{
				popUpError(`Could not load DE_GE language pack`);
			}
		})();
		for (var j=0; j< germanBtn.length; j++){
			germanBtn[j].classList.remove("dropDownContentAHover");
			englishBtn[j].classList.remove("dropDownContentAHover");
		}
		langDropDownBtn.style.setProperty("background-image", `url(icons/DE_GE.svg)`);
	})

	englishBtn[i].addEventListener("click", (e) => {
		(async() => {
			currentLang = `lang/EN_UK.json`;
			try{
				if (client){
					client.currentLang = currentLang;
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
					langDropDownBtn.style.setProperty("background-image", `url(https://${hostname.host}/icons/EN_UK.svg)`);
				}
			}
			catch{
				popUpError(`Could not load EN_UK language pack`);
			}
		})();
		for (var j=0; j< germanBtn.length; j++){
			germanBtn[j].classList.remove("dropDownContentAHover");
			englishBtn[j].classList.remove("dropDownContentAHover");
		}
		langDropDownBtn.style.setProperty("background-image", `url(icons/EN_UK.svg)`);
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

{
	inputSearchUserContainer.style.setProperty("display", "none");
	dropDownUserContainer.style.setProperty("display", "flex");
	homeBtn.style.setProperty("display", "block");
}

window.addEventListener("keydown", settingsKeyDownEvent)

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
		settingsSlides[slideIdx].style.display = "block";
	}
}