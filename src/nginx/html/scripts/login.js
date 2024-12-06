var loginBtn;
var switchThemeBtn;
var fortyTwoLogin;
var loginSlideSelector;

var slides;
var slideIdx;

var template = `
<div id="pageContentContainer">
	<div id="loginPage">
		<div id="loginSlideSelectorContainer">
			<div id="loginSlideSelector">
				<div tabindex="12" id="loginSelector" class="slideSelector activeSelector">
					<div id="loginSelectorText">Login</div>
				</div>
				<div tabindex="13" id="registerSelector" class="slideSelector">
					<div id="registerSelectorText">Register</div>
				</div>
			</div>
		</div>

		<div class="loginSlideContainer">
			<div class="loginOpt" id="internalLoginOpt">Login with credentials</div>
			<div class="loginSlide">
				<div>
					<input autocomplete="username" tabindex="14" type="text" id="inputUsername" class="formInput" name="username" placeholder="Username" aria-label="Login username"/>
				</div>
				<div>
					<input autoclomplete="off" tabindex="15" type="password" id="inputPassword" class="formInput" name="password" placeholder="Password" aria-label="Login password"/>
				</div>
				<div>
					<button tabindex="16" id="loginBtn" class="loginBtn">LOGIN</button>
				</div>
			</div>
			<div tabindex="17" aria-label="Login with 42 account" id="fortyTwoLoginContainer">
				<span id="fortyTwoLoginText">Login with 42 account</span>
				<div id="fortyTwoLogin"></div>
			</div>
		</div>
		<div class="loginSlideContainer">
			<div class="loginOpt" id="createAcc">Create your account</div>
			<div class=loginSlide>
				<div>
					<input autocomplete="username" tabindex="14" type="text" id="inputRegisterUsername" name="username" class="registerFormInput" placeholder="Username" aria-label="Register username"/>
				</div>
				<div>
					<input autoclomplete="off" tabindex="15" type="password" id="inputRegisterPassword" name="password" class="registerFormInput" placeholder="Password" aria-label="Register password"/>
				</div>
				<div>
					<input autoclomplete="off" tabindex="16" type="password" id="inputRegisterCPassword" name="cPassword" class="registerFormInput" placeholder="Confirm password" aria-label="Confirm register password"/>
				</div>
				<div>
					<button tabindex="17" id="registerBtn" class="loginBtn">REGISTER</button>
				</div>
			</div>
		</div>
	</div>
</div>
`

{
	const url = new URL(window.location.href);
	if (url.hash == "#register"){
		history.replaceState("","",`https://${hostname.host}/${currentLang}/login#register`)
		slideIdx = 1;
	}
	else {
		history.replaceState("","",`https://${hostname.host}/${currentLang}/login#login`)
		slideIdx = 0;
	}
	window.onkeydown = loginKeyDownEvent;
	document.getElementById("container").innerHTML = template;

	if (client){
		fetch('/api/user/logout', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include'
		}).then(response => {
			inputSearchUserContainer.style.setProperty("display", "none");
			dropDownUserContainer.style.setProperty("display", "none");
		});
		client = null;
	}

	inputSearchUserContainer.style.setProperty("display", "none");
	homeBtn.style.setProperty("display", "none");
	dropDownLangBtn.focus();
	dropDownUserContainer.style.setProperty("display", "none");
	notifCenterContainer.style.setProperty("display", "none");

	loginBtn = document.getElementById('loginBtn')
	switchThemeBtn = document.getElementById("themeButton")
	fortyTwoLogin = document.getElementById("fortyTwoLoginContainer")
	loginSlideSelector = document.querySelectorAll(".slideSelector")
	slides = document.querySelectorAll(".loginSlideContainer")

	usernameLogin = document.getElementById('inputUsername');
	pwLogin = document.getElementById('inputPassword');
	usernameRegisterInput = document.getElementById('inputRegisterUsername');
	pwRegisterInput = document.getElementById('inputRegisterPassword');
	cpwRegisterInput = document.getElementById('inputRegisterCPassword');


	for (i = 0; i < slides.length; i++)
		slides[i].style.display = "none";
	slides[slideIdx].style.display = "flex";

	var bg = window.getComputedStyle(document.documentElement).getPropertyValue("--active-selector-rgb")
	var underline = window.getComputedStyle(document.documentElement).getPropertyValue("--main-text-rgb");
	if (slideIdx == 1){
		document.querySelector("#loginSlideSelector").style.background = `linear-gradient(90deg,rgba(0,0,0,0) 50%, ${bg} 50%, ${bg} 100%, rgba(0,0,0,0) 100%)`;
		document.querySelector("#loginSlideSelectorContainer").style.background = `linear-gradient(90deg,rgba(0,0,0,0) 50%, ${underline} 50%, ${underline} 100%, rgba(0,0,0,0) 100%)`;
	}
	else{
		document.querySelector("#loginSlideSelector").style.background = `linear-gradient(90deg,rgba(0,0,0,0) 0%, ${bg} 0%, ${bg} 50%, rgba(0,0,0,0) 50%)`;
		document.querySelector("#loginSlideSelectorContainer").style.background = `linear-gradient(90deg,rgba(0,0,0,0) 0%, ${underline} 0%, ${underline} 50%, rgba(0,0,0,0) 50%)`;
	}
	
	
	loginSlideSelector.forEach(function(key) {
		key.addEventListener("click", (e) => {
			save = slideIdx;
			slideIdx = Array.from(e.target.parentElement.children).indexOf(e.target);
			if (save != slideIdx){
				loginSlideSelector[save].classList.remove("activeSelector");
				for (i = 0; i < slides.length; i++)
					slides[i].style.display = "none";
				slides[slideIdx].style.display = "flex";
				loginSlideSelector[slideIdx].classList.add('activeSelector');
				loginSlide(save, slideIdx)
			}
		})
		key.onkeydown = (e) => {
			if (e.key == "Enter")
				key.click();
		}
	})

	fortyTwoLogin.addEventListener("click", (e) => {
		fetch('/api/user/getClientId')
			.then(response => response.json())
			.then(data => {
				const url = `https://${hostname.host}/`;
				const encodedUrl = encodeURIComponent(url);
				const authUrl = `https://api.intra.42.fr/oauth/authorize?client_id=${data.clientId}&redirect_uri=${encodedUrl}&response_type=code`;
				window.location.href = authUrl;
			})
			.catch(error => {
				console.error('Error:', error);
			});
	});

	fortyTwoLogin.addEventListener("keydown", (e) => {
		if (e.key == "Enter"){
			fortyTwoLogin.click()
		}
	});


	usernameLogin.addEventListener("keydown", (e) => {
		usernameRegisterInput.value = usernameLogin.value;
		if (e.key == "Enter")
			login();
	})

	usernameRegisterInput.addEventListener("keydown", (e) => {
		usernameLogin.value = usernameRegisterInput.value;
		if (e.key == "Enter")
			register();
	})


	pwLogin.addEventListener("keydown", (e) => {
		if(e.key == "Enter"){
			login();
		}
		else
			pwRegisterInput.value = pwLogin.value;
	})

	pwRegisterInput.addEventListener("keydown", (e) => {
		pwLogin.value = pwRegisterInput.value;
		if (e.key == "Enter")
			register();
	})


	cpwRegisterInput.addEventListener("keydown", (e) => {
		if(e.key == "Enter"){
			register();
		}
	})

	loginBtn.addEventListener("click", (e) => {
		login()
	})

	registerBtn = document.getElementById("registerBtn");

	registerBtn.addEventListener("click", (e) => {
		register()
	})

	inputs = document.querySelectorAll("input");
	inputs.forEach(function (input) {
		input.addEventListener("focus", (e) => {
			window.onkeydown = null;
		})
		input.addEventListener("focusout", (e) => {
			window.onkeydown = loginKeyDownEvent;
		})
	});

	function login(){
		username = document.getElementById('inputUsername').value;
		pw = document.getElementById('inputPassword').value;
		inputs = document.getElementsByClassName('formInput');
		if (loginBtn.previousElementSibling)
			loginBtn.previousElementSibling.remove();
		for (i=0;i<inputs.length;i++){
			if (inputs[i].value == ""){
				if (langJson && langJson['login'][`.${inputs[i].id}CantBeEmpty`])
					popUpError(langJson['login'][`.${inputs[i].id}CantBeEmpty`]);
				else{
					popUpError("Field can't be empty")
				}
			}
		}
		if (username != "" && pw != ""){
			const data = {username: username, password: pw};
			setLoader();
			fetch('/api/user/login', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
				credentials: 'include'
			})
			.then(response => {
				if (response.ok) {
					response.json().then(response => {
						if (response.logged == 0){
							if (errorMap[response.message] && langJson && langJson['login'][`.${errorMap[response.message]}`])
								popUpError(langJson['login'][`.${errorMap[response.message]}`]);
							else
								popUpError(response.message);
						}
						else{
							(async () => {
								try {
									client = await new Client()
									slideIdx = 0;
									window.onkeydown = null
									if (client == null){
										myReplaceState(`https://${hostname.host}/${currentLang}/login#login`);
									}
									else{
										myReplaceState(`https://${hostname.host}/${currentLang}/home`);
										friendUpdate();
									}
								}
								catch{
									unsetLoader();
								}
							})();
						}
					})
				}
				else
				{
					unsetLoader();
					response.json().then(response => {
						if (errorMap[response.message] && langJson && langJson['login'][`.${errorMap[response.message]}`])
							popUpError(langJson['login'][`.${errorMap[response.message]}`]);
						else
							popUpError(response.message);
					})
				}
			})
			.catch(error => {
				console.error('Error:', error);
			});
		}
	}

	function register(){
		var lock = 0;
		username = usernameRegisterInput.value;
		pw = pwRegisterInput.value;
		cpw = cpwRegisterInput.value;
		inputs = document.getElementsByClassName('registerFormInput');
		for (i=0;i<inputs.length;i++){
			if (inputs[i].value == "" && !inputs[i].previousElementSibling){
				if (langJson && langJson['login'][`.${inputs[i].id}CantBeEmpty`])
					popUpError(langJson['login'][`.${inputs[i].id}CantBeEmpty`]);
				else{
					popUpError("Field can't be empty")
				}
				lock = 1;
			}
		}

		if (username.length > 15){
			if (langJson && langJson['login'][`.usernameTooLong`])
				popUpError(langJson['login'][`.usernameTooLong`]);
			else
				popUpError("Username must be 15 characters or fewer");
			lock = 1;
		}
		if (pw != cpw){
			if (langJson && langJson['login'][`.mismatchPassword`])
				popUpError(langJson['login'][`.mismatchPassword`]);
			else
				popUpError("Passwords do not match");
		}
		else if (lock == 0){
			setLoader()

			const data = {username: username, password: pw, 'lang': currentLang, theme_name: currentTheme};
			fetch('/api/user/create', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
				body: JSON.stringify(data)
			})
			.then(response => {
				if (response.ok) {
					fetch('/api/user/login', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
						},
						body: JSON.stringify(data),
						credentials: 'include'
					}).then(response => {
						(async () => {
							try {
								client = await new Client()
								if (client == null){
									slideIdx = 1;
									window.onkeydown = null
									myReplaceState(`https://${hostname.host}/${currentLang}/login#login`);
								}
								else{
									slideIdx = 0;
									window.onkeydown = null
									myReplaceState(`https://${hostname.host}/${currentLang}/home`);
									friendUpdate();
								}
							}
							catch{
								unsetLoader();
							}
						})();
					});
				} else {
					response.json().then(response => {
						unsetLoader()
						if (errorMap[response.message] && langJson && langJson['login'][`.${errorMap[response.message]}`])
							popUpError(langJson['login'][`.${errorMap[response.message]}`]);
						else
							popUpError(response.message);
					})

				}
			})
			.catch(error => {
				console.error('There was a problem with the fetch operation:', error);
			});
		}
	}
}

function loginKeyDownEvent(e) {
	if (e.key == "ArrowLeft" || e.key == "ArrowRight") {
		save = slideIdx;
		loginSlideSelector[slideIdx].classList.remove('activeSelector');
		if (e.key == "ArrowLeft")
			slideIdx -= 1;
		else
			slideIdx += 1;
		if (slideIdx > slides.length - 1)
			slideIdx = 0;
		if (slideIdx < 0)
			slideIdx = slides.length - 1;
		for (let i = 0; i < slides.length; i++)
			slides[i].style.display = "none";
		loginSlide();
		loginSlideSelector[slideIdx].classList.add('activeSelector');
		slides[slideIdx].style.display = "flex";
		loginSlideSelector[slideIdx].focus();
	}
}

function loginSlide(){
	var bg = window.getComputedStyle(document.documentElement).getPropertyValue("--active-selector-rgb")
	var underline = window.getComputedStyle(document.documentElement).getPropertyValue("--main-text-rgb");
	var move = [], moveUnderline = [];
	var increment = slideIdx == 1 ? 1 : -1;
	let i = slideIdx == 1 ? 0 : 50;
	for (;i<=50 && i >= 0;i += increment){
		move.push({ background : `linear-gradient(90deg,rgba(0,0,0,0) ${i}%, ${bg} ${i}%, ${bg} ${i + 50}%, rgba(0,0,0,0) ${i + 50}%)`});
		moveUnderline.push({ background : `linear-gradient(90deg,rgba(0,0,0,0) ${i}%, ${underline} ${i}%, ${underline} ${i + 50}%, rgba(0,0,0,0) ${i + 50}%)`});
	}
	var time = {
		duration: 500,
		iterations: 1,
	}
	document.querySelector("#loginSlideSelector").animate(move, time);
	document.querySelector("#loginSlideSelector").style.background = move[move.length - 1].background;
	document.querySelector("#loginSlideSelectorContainer").animate(moveUnderline, time);
	document.querySelector("#loginSlideSelectorContainer").style.background = moveUnderline[move.length - 1].background;
	
	if (slideIdx == 1){
		history.replaceState("","",`https://${hostname.host}/${currentLang}/login#register`);
		document.title = langJson['login'][`register title`];
	}
	else{
		history.replaceState("","",`https://${hostname.host}/${currentLang}/login#login`);
		document.title = langJson['login'][`login title`];
	}
}
