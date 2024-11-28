var deleteAccountBtn;
var confirmDeleteBtn;
var usernameInput;
var saveUsernameBtn;
var pfpInput;
var pfpInputLabel;
var settingsThemeDevice;
var dropDownContent;
var settingsSlides;
var rightSlideBtn;
var leftSlideBtn;
var confirmDeleteInput;
var confirmPfpBtn;


var accoutSlide = `
<div id="saveUsernameContainer">
	<input autoclomplete="off" tabindex="13" type="text" id="inputChangeUsername" class="formInput" name="username" placeholder="Username"/>
	<div tabindex="14" id="saveUsernameBtn"></div>
</div>

<div id="changePasswordContainer">
	<button tabindex="15" id="changePasswordBtn" >Change password</button>
</div>

<div>
	<label tabindex="19" for="inputPfp" id="pfpLabel" aria-label="Change profile picture">Profile picture</label>
	<input autoclomplete="off" style="display: none;" type="file" accept="image/jpg, image/png, image/jpeg, image/gif" id="inputPfp" class="formInput" name="pfp" placeholder="Profile picture"/>
</div>


<div>
	<button tabindex="20" id="deleteAccountBtn" class="deleteBtn">DELETE ACCOUNT</button>
</div>`

var accessibilitySlide = `
<div style="height: fit-content;" id="fontSizeRangeContainer">
	<span id="fontSizeRangeText">Font size amplifier</span>
	<div>
		<input autoclomplete="off" tabindex="13" id="fontSizeRange" type="range" min="0.5" max="1.5" value="1" step="0.1" list="fontSizeList">
		<datalist id="fontSizeList">
			<option value="0.5" label="XS"></option>
			<option value="1.0" label="M"></option>
			<option value="1.5" label="XL"></option>
		</datalist>
	</div>
</div>


<div id="settingsDropDownContainer" style="height:fit-content;">
	<div id="settingsDropDownTheme" class="settingsDropDown" tabindex="14" aria-label="Theme dropdown menu">
		<div class="dropDownOptionContainer">
			<button tabindex="-1" id="themesDropDown" class="dropDownBtn">Themes</button>
			<div class="dropDownArrow"></div>
		</div>
		<ul class="dropDownContent">
			<li>
				<a class="settingsThemeDropDown" tabindex="15" id="settingsThemeLight" >Light</a>
			</li>
			<li>
				<a class="settingsThemeDropDown" tabindex="16" id="settingsThemeDark"  >Dark</a>
			</li>
			<li>
				<a class="settingsThemeDropDown" tabindex="17" id="settingsThemeHCLight"  >High contrast light</a>
			</li>
			<li>
				<a class="settingsThemeDropDown" tabindex="18" id="settingsThemeHCDark"  >High contrast dark</a>
			</li>
			<li>
				<a class="settingsThemeDropDown" tabindex="19" id="settingsThemeDevice"  >Devices mode</a>
			</li>
		</ul>
	</div>
	<div id="settingsDropDownLang" class="settingsDropDown" tabindex="20" aria-label="Language dropdown menu">
		<div class="dropDownOptionContainer">
			<button tabindex="-1" id="languagesDropDown" class="dropDownBtn">Language</button>
			<div class="dropDownArrow"></div>
		</div>
		<ul class="dropDownContent">
			<li>
				<a id="EN_UK" lang="en-UK" tabindex="21" class="settingsLangDropDown">English</a>
			</li>
			<li>
				<a id="FR_FR" lang="fr" tabindex="22" class="settingsLangDropDown">Français</a>
			</li>
			<li>
				<a id="DE_GE" lang="de" tabindex="23" class="settingsLangDropDown">Deutsch</a>
			</li>
			<li>
				<a id="IT_IT" lang="it" tabindex="24" class="settingsLangDropDown">Italiano</a>
			</li>
			<li>
				<a id="AR_GH" lang="" tabindex="25" class="settingsLangDropDown">Pirate</a>
			</li>
		</ul>
	</div>
</div>`

var template = `
<div style="height: fit-content; text-align: center; display: flex;">

	<div id="settingSlidesContainer">
		<div id="settingsSlideSelector">
			<div id="accountSelector" class="slideSelector" tabindex="12">
				<div id="accountSelectorText">Account</div>
			</div>
			<div id="accessibilitySelector" class="slideSelector" tabindex="13">
				<div id="accessibilitySelectorText">Accessibility</div>
			</div>
			<div id="slideSelectorBg"></div>
		</div>
		<div style="position: relative;">
			<div id="settingSlides">
				<div class="settingSlide" id="accoutSlide">${accoutSlide}</div>
				<div class="settingSlide" id="accessibilitySlide">${accessibilitySlide}</div>
			</div>
		</div>
	</div>

	<div id="popupBg" style="z-index: 1;">
	</div>

	<div id="confirmPfpContainer" style="z-index: 2;">
		<div style="position: relative;">
			<img id="confirmPfpImg">
			<div class="pfpMask" id="confirmPfpMask"></div>
		</div>
		<button tabindex="16" id="confirmPfpBtn" aria-label="Confirm profile picture">Save</button>
	</div>

	<div id="confirmDeletePopup" style="z-index: 2;">
		<a id="confirmDeleteDialog">To confirm you want to delete your account, please enter </a>
		<a id="confirmDeleteDialogVar" style="background: var(--page-bg-rgb);padding: .3ch;"></a>
		<input autoclomplete="off" tabindex="18" type="text" id="confirmDeleteInput" placeholder="Confirmation" aria-label="Type you username, then press enter to confirm deletion">
		<button tabindex="19" id="confirmDeleteBtn" class="deleteBtn">Confirm delete</button>
	</div>

	<div id="confirmPasswordPopup" style="z-index: 2;">
		<div>
			<input autoclomplete="off" tabindex="15" type="password" id="inputOldPassword" style="anchor-name: --old-password-input;" class="popupInput" name="Old password" placeholder="Old password"/>
		</div>
		<div>
			<input autoclomplete="off" tabindex="16" type="password" id="inputNewPassword" style="anchor-name: --new-password-input;" class="popupInput" name="New password" placeholder="New password"/>
		</div>
		<div>
			<input autoclomplete="off" tabindex="17" type="password" id="inputNewCPassword" style="anchor-name: --new-confirm-password-input;" class="popupInput" name="Confirm new password" placeholder="Confirm new password"/>
		</div>
		<div>
			<button tabindex="18" id="confirmChangePasswordBtn" style="anchor-name: --confirm-new-password-button;" >Change password</button>
		</div>
	</div>
</div>
`

{
	document.getElementById("container").innerHTML = template;
	var slideIdx = 0;
	const url = new URL(window.location.href);
	if (url.hash == "#accessibility"){
		document.title = client.langJson['settings'][`accessibility title`];
		slideIdx = 1;
		history.replaceState("","",`https://${hostname.host}/${currentLang}/settings#accessibility`)
		Object.keys(accessibilitySlideTabIdxMap).forEach(function (key){
			try{
				document.querySelector(key).tabIndex = accessibilitySlideTabIdxMap[key]
			}
			catch(e){console.error(e)}
		})
		Object.keys(accountSlideTabIdxMap).forEach(function (key){
			try{
				document.querySelector(key).tabIndex = "-1"
			}
			catch(e){console.error(e)}
		})
	}
	else {
		slideIdx = 0;
		document.title = client.langJson['settings'][`account title`];
		history.replaceState("","",`https://${hostname.host}/${currentLang}/settings#account`)
		Object.keys(accountSlideTabIdxMap).forEach(function (key){
			try{
				document.querySelector(key).tabIndex = accountSlideTabIdxMap[key]
			}
			catch(e){console.error(e)}
		})
		Object.keys(accessibilitySlideTabIdxMap).forEach(function (key){
			try{
				document.querySelector(key).tabIndex = "-1"
			}
			catch(e){console.error(e)}
		})
	}

	deleteAccountBtn = document.getElementById('deleteAccountBtn');
	confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
	usernameInput = document.getElementById("inputChangeUsername");
	saveUsernameBtn = document.getElementById("saveUsernameBtn");
	pfpInput = document.getElementById("inputPfp");
	pfpInputLabel = document.getElementById("pfpLabel");
	settingsThemeDevice = document.getElementById("settingsThemeDevice");
	dropDownContent = document.querySelectorAll(".settingsDropDown, .dropDownLandscape");
	settingsSlides = document.querySelectorAll(".settingSlide");
	confirmDeleteInput = document.getElementById("confirmDeleteInput");
	confirmPfpBtn = document.getElementById("confirmPfpBtn");

	inputSearchUserContainer.style.setProperty("display", "none");
	dropDownUserContainer.style.setProperty("display", "flex");
	homeBtn.style.setProperty("display", "block");
	document.getElementById("fontSizeRange").value = client.fontAmplifier;
	notifCenterContainer.style.setProperty("display", "flex");
	window.onkeydown = settingsKeyDownEvent

	settingsSlideSelector = document.querySelectorAll("#settingsSlideSelector .slideSelector");
	document.querySelector("#settingSlides").style.setProperty("left", `-${slideIdx}00vw`)
	document.getElementById("slideSelectorBg").style.setProperty("left", `${50 * slideIdx}%`);
	settingsSlideSelector[slideIdx].classList.add('activeSelector');

	settingsSlideSelector.forEach(function(key) {
		key.addEventListener("click", (e) => {
			save = slideIdx;
			slideIdx = Array.from(e.target.closest(".slideSelector").parentElement.children).indexOf(e.target.closest(".slideSelector"));
			if (save != slideIdx){
				settingsSlideSelector[save].classList.remove("activeSelector");
				settingsSlideSelector[slideIdx].classList.add('activeSelector');
				var tmp = document.querySelector("#settingSlides");
				var left = tmp.getBoundingClientRect().left;
				var move = [
					{ left: `${left}px`},
					{ left: `-${slideIdx}00vw`}
				];
				var time = {
					duration: 500,
					iterations: 1,
				}
				tmp.animate(move, time);
				tmp.style.setProperty("left", `-${slideIdx}00vw`)
				if (slideIdx == 0){
					move = [
						{ left: `50%`},
						{ left: `0%`}
					];
					document.getElementById("slideSelectorBg").animate(move, time);
					document.getElementById("slideSelectorBg").style.setProperty("left", "0");
				}
				else{
					move = [
						{ left: `0%`},
						{ left: `50%`}
					];
					document.getElementById("slideSelectorBg").animate(move, time);
					document.getElementById("slideSelectorBg").style.setProperty("left", "50%");
				}
			}
			if (slideIdx == 0){
				document.title = langJson['settings'][`account title`];
				history.replaceState("","",`https://${hostname.host}/${currentLang}/settings#account`)
				Object.keys(accountSlideTabIdxMap).forEach(function (key){
					try{
						document.querySelector(key).tabIndex = accountSlideTabIdxMap[key]
					}
					catch{}
				})
				Object.keys(accessibilitySlideTabIdxMap).forEach(function (key){
					try{
						document.querySelector(key).tabIndex = "-1"
					}
					catch{}
				})
			}
			else {
				document.title = langJson['settings'][`accessibility title`];
				history.replaceState("","",`https://${hostname.host}/${currentLang}/settings#accessibility`)
				Object.keys(accessibilitySlideTabIdxMap).forEach(function (key){
					try{
						document.querySelector(key).tabIndex = accessibilitySlideTabIdxMap[key]
					}
					catch{}
				})
				Object.keys(accountSlideTabIdxMap).forEach(function (key){
					try{
						document.querySelector(key).tabIndex = "-1"
					}
					catch{}
				})
			}
		})
		key.onkeydown = (e) => {
			if (e.key == "Enter")
				key.click();
		}
	})
	if (client.isRemote){
		document.querySelector("#changePasswordContainer").remove();
	}
	else{
		document.querySelector("#confirmChangePasswordBtn").addEventListener("click", (e) => {
			var oldPasswordInput = document.querySelector("#inputOldPassword");
			var newPasswordInput = document.querySelector("#inputNewPassword");
			var newCPasswordInput = document.querySelector("#inputNewCPassword");
			var lock = 0;
			oldPw = oldPasswordInput.value;
			pw = newPasswordInput.value;
			cpw = newCPasswordInput.value;
			inputs = document.querySelectorAll('#inputOldPassword, #inputNewPassword, #inputNewCPassword');
			warning = document.createElement("a");
			warning.className = "warning";
			warning.text = "Field can't be empty";
			for (i=0;i<inputs.length;i++){
				if (inputs[i].previousElementSibling)
					inputs[i].previousElementSibling.remove();
				if (inputs[i].value == "" && !inputs[i].previousElementSibling){
					warningTmp = warning.cloneNode(true);

					if (langJson)
						warningTmp.text = langJson['settings'][`.${inputs[i].id}CantBeEmpty`];
					if (CSS.supports("position-anchor", "--test")){
						warningTmp.style.setProperty("position-anchor", window.getComputedStyle(inputs[i]).anchorName);
						inputs[i].before(warningTmp);
					}
					else{
						popUpError(warningTmp.text)
					}
					lock = 1;
				}
			}
	
			if (pw != cpw){
				warning = document.createElement("a");
				warning.className = "warning";
				warning.text = "Passwords do not match";
				if (langJson)
					warningTmp.text = langJson['settings'][`.passwordMisMatch`];
				if (CSS.supports("position-anchor", "--test")){
					if (cpwRegisterInput.previousElementSibling && cpwRegisterInput.previousElementSibling.text == langJson['settings']['.inputNewCPasswordCantBeEmpty'])
						cpwRegisterInput.previousElementSibling.remove();
					if (!cpwRegisterInput.previousElementSibling || cpwRegisterInput.previousElementSibling.text != langJson['settings'][`.passwordMisMatch`])
						cpwRegisterInput.before(warning);
					else if (cpw != "" && cpwRegisterInput.previousElementSibling.text == langJson['settings']['.inputNewCPasswordCantBeEmpty'])
						cpwRegisterInput.previousElementSibling.remove();
				}
				else{
					popUpError(warningTmp.text)
				}
			}
			else if (lock == 0){
				setLoader()
				if (e.target.previousElementSibling)
					e.target.previousElementSibling.remove();
				fetch('/api/user/update', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({'password': pw, "old_password":oldPw}),
					credentials: 'include'
				}).then(response => {
					if (response.ok){
						if (e.target.previousElementSibling)
							e.target.previousElementSibling.remove();
						success = document.createElement("a");
						success.className = "success";
						success.text = "password updated";
						if (langJson)
							success.text = langJson['settings']['.passwordUpdated']
						if (CSS.supports("position-anchor", "--test")){
							success.style.setProperty("position-anchor", window.getComputedStyle(e.target).anchorName);
							e.target.before(success);
						}
						else{
							popUpSuccess(success.text);
						}
						(async () => {
							try {
								client = await new Client()
								if (!client)
									myReplaceState(`https://${hostname.host}/${currentLang}/login#login`);
								unsetLoader();
							}
							catch{
								unsetLoader();
							}
						})()
					}
					else {
						response.json().then(response => {
							warning = document.createElement("a");
							warning.className = `warning ${errorMap[response.message]}`;
							warning.text = response.message;
							if (langJson && langJson['settings'][`.${errorMap[response.message]}`])
								warning.text = langJson['settings'][`.${errorMap[response.message]}`]
							if (CSS.supports("position-anchor", "--test")){
								warning.style.setProperty("position-anchor", window.getComputedStyle(e.target).anchorName);
								e.target.before(warning);
							}
							else
								popUpError(warning.text);
							unsetLoader();
						})
	
					}
				})
			}
		})
		document.querySelector("#confirmChangePasswordBtn").addEventListener("keydown", (e) => {if (e.key == "Enter"){e.target.click();}});
	
		document.querySelector("#changePasswordBtn").addEventListener("click", (e) => {
			window.onkeydown = null
			document.getElementById("popupBg").style.setProperty("display", "block");
			document.getElementById("confirmPasswordPopup").style.setProperty("display", "flex");
		});
	}
	setNotifTabIndexes(26);

}


var buf = "";

document.querySelectorAll("#pfpLabel, #saveUsernameBtn, #confirmDeleteBtn").forEach(function (elem){
	elem.addEventListener("keydown", (e) => {
		if (e.key == "Enter")
			elem.click();
	})
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
			window.onkeydown = null
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

			if (pfpInputLabel.previousElementSibling)
				pfpInputLabel.previousElementSibling.remove();
			if (!response.ok)
			{
				warning = document.createElement("a");
				warning.className = `warning ${errorMap[data.message]}`;
				if (langJson && langJson['settings'][`.${errorMap[data.message]}`])
					warning.text = langJson['settings'][`.${errorMap[data.message]}`];
				else
					warning.text = data.message;
				if (CSS.supports("position-anchor", "--test")){
					warning.style.setProperty("position-anchor", "--pfp-label")
					pfpInputLabel.before(warning);
				}
				else
					popUpError(warning.text)
				document.getElementById("popupBg").style.setProperty("display", "none");
				document.getElementById("confirmPfpContainer").style.setProperty("display", "none");
			}
			else
			{
				document.getElementById("popupBg").style.setProperty("display", "none");
				document.getElementById("confirmPfpContainer").style.setProperty("display", "none");
				(async () => {
					try {
						client = await new Client()
						if (!client)
							myReplaceState(`https://${hostname.host}/${currentLang}/login#login`);
					}
					catch{
						unsetLoader();
					}
				})()
			}
		});
	}).catch(error => {
		console.error('Error during profile update:', error);

		if (pfpInputLabel.previousElementSibling)
			pfpInputLabel.previousElementSibling.remove();
		
		warning = document.createElement("a");

		warning.className = `warning unexpectedProfileUpdateError`;
		if (langJson && langJson['settings'][`.unexpectedProfileUpdateError`])
			warning.text = langJson['settings'][`.unexpectedProfileUpdateError`];
		else
			warning.text = "An unexpected error occurred during profile update";
		if (CSS.supports("position-anchor", "--test")){
			warning.style.setProperty("position-anchor", "--pfp-label")
			pfpInputLabel.before(warning);
		}
		else
			popUpError(warning.text)

	});

	window.onkeydown = settingsKeyDownEvent;
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
					success.className = "success userNameUpdated";
					if (langJson)
						success.text = langJson['settings']['.usernameUpdated']
					else
						success.text = "username successfully updated";
					if (CSS.supports("position-anchor", "--test")){
						success.style.setProperty("position-anchor", "--input-change-name");
						usernameInput.before(success);
					}
					else
						popUpSuccess(success.text);

					(async () => {
						try {
							client = await new Client()
							if (!client)
								myReplaceState(`https://${hostname.host}/${currentLang}/login#login`);
						}
						catch (e){
							console.error(e);
							unsetLoader();
						}
					})()
				}
				else {
					response.json().then(response => {
						warning = document.createElement("a");
						if (errorMap[response.message]){
							warning.className = `warning ${errorMap[response.message]}`;
							if (langJson && langJson['settings'][errorMap[response.message]])
								warning.text = langJson['settings'][errorMap[response.message]];
							else
								warning.text = response.message;
						}
						else{
							warning.className = `warning ${errorMap[response.message]}`;
							warning.text = response.message;
						}
						if (CSS.supports("position-anchor", "--test")){
							warning.style.setProperty("position-anchor", "--input-change-name");
							warning.style.setProperty("top", "calc(anchor(top) - 3vh)");
							usernameInput.before(warning);
						}
						else{
							popUpError(warning.text)
						}
					})
				}
			})
	}
	else{
		warning = document.createElement("a");
		warning.className = "warning usernameCantBeEmpty";

		if (langJson)
			warning.text = langJson['settings']['.usernameCantBeEmpty']
		else
			warning.text = "Username name can't be empty";
		if (CSS.supports("position-anchor", "--test")){
			warning.style.setProperty("position-anchor", "--input-change-name");
			warning.style.setProperty("top", "calc(anchor(top) - 3vh)");
			usernameInput.before(warning);
		}
		else{
			popUpError(warning.text);
		}
	}
})

deleteAccountBtn.addEventListener("click", (e) => {
	window.onkeydown = null
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
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include'
		}).then(response => {
			if (response.ok){
				myPushState(`https://${hostname.host}/${currentLang}/login#login`);
			}
		})
	}
}

document.addEventListener("click", (e) => {
	if (currentPage == "settings"){
		if (e.target.parentElement == null || e.target.id == "popupBg"){
			document.getElementById("popupBg").style.setProperty("display", "none");
			document.getElementById("confirmDeletePopup").style.setProperty("display", "none");
			document.getElementById("confirmPfpContainer").style.setProperty("display", "none")
			document.getElementById("confirmPasswordPopup").style.setProperty("display", "none");
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
			currentLangPack = `lang/${elem.id}.json`;
			try{
				if (client){
					client.currentLangPack = `lang/${elem.id}.json`;
					fetchResult = await fetch(`https://${hostname.host}/${currentLangPack}`);
					content = await fetchResult.json();
					client.langJson = content;
				}
				loadCurrentLang();
				document.documentElement.setAttribute("lang", langMap[elem.id]);

				url = new URL(window.location.href);
				history.replaceState("","",`https://${hostname.host}${url.pathname.replace(currentLang, elem.id)}`);
				currentLang = elem.id;
				if (client){
					fetch('/api/user/update', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({ language_pack: currentLangPack }),
						credentials: 'include'
					})
					dropDownLangBtn.style.setProperty("background-image", `url(https://${hostname.host}/icons/${elem.id}.svg)`);
				}
			}
			catch (error){
				console.error(error);
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
		body: JSON.stringify({ theme_name: 'light'}),
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
		body: JSON.stringify({ theme_name: 'dark'}),
		credentials: 'include'
	})
	client.use_browser_theme = false;
})

document.getElementById("settingsThemeHCLight").addEventListener("click", (e) => {
	switchTheme('high_light');

	preferedColorSchemeMedia.removeEventListener('change', browserThemeEvent);
	fetch('/api/user/update', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ theme_name: 'high_light'}),
		credentials: 'include'
	})
	client.use_browser_theme = false;
})
document.getElementById("settingsThemeHCDark").addEventListener("click", (e) => {
	switchTheme('high_dark');

	preferedColorSchemeMedia.removeEventListener('change', browserThemeEvent);
	fetch('/api/user/update', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ theme_name: 'high_dark'}),
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
		body: JSON.stringify({ theme_name: "browser" }),
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
	if (e.key == "Escape" && document.getElementById("popupBg").style.getPropertyValue("display") != "none"){
		document.getElementById("popupBg").style.setProperty("display", "none");
		document.getElementById("confirmDeletePopup").style.setProperty("display", "none");
		document.getElementById("confirmPasswordPopup").style.setProperty("display", "none");
		document.getElementById("confirmPfpContainer").style.setProperty("display", "none")
		window.onkeydown = settingsKeyDownEvent
	}
	if (e.key == "ArrowLeft" || e.key == "ArrowRight") {
		var save = slideIdx;
		var tmp = document.querySelector("#settingSlides");
		if (e.key == "ArrowLeft")
			slideIdx -= 1;
		else
			slideIdx += 1;
		if (slideIdx > 1)
			slideIdx = 0;
		if (slideIdx < 0)
			slideIdx = 1;
		settingsSlideSelector[save].classList.remove("activeSelector");
		settingsSlideSelector[slideIdx].classList.add('activeSelector');
		var left = tmp.getBoundingClientRect().left;
		var move = [
			{ left: `${left}px`},
			{ left: `-${slideIdx}00vw`}
		];
		var time = {
			duration: 500,
			iterations: 1,
		}
		tmp.animate(move, time);
		tmp.style.setProperty("left", `-${slideIdx}00vw`)
		if (slideIdx == 0){
			move = [
				{ left: `50%`},
				{ left: `0%`}
			];
			document.getElementById("slideSelectorBg").animate(move, time);
			document.getElementById("slideSelectorBg").style.setProperty("left", "0");
		}
		else{
			move = [
				{ left: `0%`},
				{ left: `50%`}
			];
			document.getElementById("slideSelectorBg").animate(move, time);
			document.getElementById("slideSelectorBg").style.setProperty("left", "50%");
		}
		if (slideIdx == 0){
			document.title = langJson['settings'][`account title`];
			history.replaceState("","",`https://${hostname.host}/${currentLang}/settings#account`)
			Object.keys(accountSlideTabIdxMap).forEach(function (key){
				try{
					document.querySelector(key).tabIndex = accountSlideTabIdxMap[key]
				}
				catch{}
			})
			Object.keys(accessibilitySlideTabIdxMap).forEach(function (key){
				try{
					document.querySelector(key).tabIndex = "-1"
				}
				catch{}
			})
		}
		else {
			document.title = langJson['settings'][`accessibility title`];
			history.replaceState("","",`https://${hostname.host}/${currentLang}/settings#accessibility`)
			Object.keys(accessibilitySlideTabIdxMap).forEach(function (key){
				try{
					document.querySelector(key).tabIndex = accessibilitySlideTabIdxMap[key]
				}
				catch{}
			})
			Object.keys(accountSlideTabIdxMap).forEach(function (key){
				try{
					document.querySelector(key).tabIndex = "-1"
				}
				catch{}
			})
		}
	}
}

document.getElementById("fontSizeRange").addEventListener("input", (e) => {
	fetch('/api/user/update', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ "font_amplifier":  parseFloat(e.target.value)}),
		credentials: 'include'
	})
	client.fontAmplifier = e.target.value;
	document.documentElement.style.setProperty("--font-size-amplifier", e.target.value);
})

document.getElementById("fontSizeRange").addEventListener("focus", (e) =>{
	window.onkeydown = null
})

document.getElementById("fontSizeRange").addEventListener("focusout", (e) =>{
	window.onkeydown = settingsKeyDownEvent
})

usernameInput.addEventListener("focus", (e) => {
	window.onkeydown = null
})

usernameInput.addEventListener("focusout", (e) => {
	window.onkeydown = settingsKeyDownEvent
})
