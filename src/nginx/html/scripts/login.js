var loginBtn;
var swichTheme;
var fortyTwoLogin;
var loginSlideSelector;

var slides;
var slideIdx;

var template = `
<div id="pageContentContainer" style="width: fit-content;left: 50%;position: relative;translate: -50%;min-width: 40vw;">
	<div id="loginSlideSelector">
		<div tabindex="12" id="loginSelector" class="slideSelector activeSelector">
			<div id="loginSelectorText">Login</div>
		</div>
		<div tabindex="13" id="registerSelector" class="slideSelector">
			<div id="registerSelectorText">Register</div>
		</div>
		<div id="slideSelectorBg"></div>
	</div>

	<div class="loginSlide">
		<div class="loginOpt" id="internalLoginOpt">Login with credentials</div>
			<div>
				<input autocomplete="username" tabindex="14" type="text" id="inputUsername" class="formInput" name="username" placeholder="Username" aria-label="Login username"/>
			</div>
			<div>
				<input tabindex="15" type="password" id="inputPassword" class="formInput" name="password" placeholder="Password" aria-label="Login password"/>
			</div>
			<div>
				<button tabindex="16" id="loginBtn" class="loginBtn">LOGIN</button>
			</div>
		<div class="loginOpt" id="externalLoginOpt">Other login options</div>
		<div id="externalLogin">
			<div tabindex="17" id="fortyTwoLogin" aria-label="Login with 42 account"></div>
		</div>
	</div>
	<div class="loginSlide">
		<div class="loginOpt" id="createAcc">Create your account</div>
			<div>
				<input tabindex="14" type="text" id="inputRegisterUsername" name="username" class="registerFormInput" placeholder="Username" aria-label="Register username"/>
			</div>
			<div>
				<input tabindex="15" type="password" id="inputRegisterPassword" name="password" class="registerFormInput" placeholder="Password" aria-label="Register password"/>
			</div>
			<div>
				<input tabindex="16" type="password" id="inputRegisterCPassword" name="cPassword" class="registerFormInput" placeholder="Confirm password" aria-label="Confirm register password"/>
			</div>
			<div>
				<button tabindex="17" id="registerBtn" class="loginBtn">REGISTER</button>
			</div>
	</div>
</div>
`

{
	window.onkeydown = loginKeyDownEvent;
	document.getElementById("container").innerHTML = template;
	slideIdx = 0;

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
	swichTheme = document.getElementById("themeButton")
	fortyTwoLogin = document.getElementById("fortyTwoLogin")
	loginSlideSelector = document.querySelectorAll(".slideSelector")
	slides = document.querySelectorAll(".loginSlide")

	usernameLogin = document.getElementById('inputUsername');
	pwLogin = document.getElementById('inputPassword');
	usernameRegisterInput = document.getElementById('inputRegisterUsername');
	pwRegisterInput = document.getElementById('inputRegisterPassword');
	cpwRegisterInput = document.getElementById('inputRegisterCPassword');


	for (i = 0; i < slides.length; i++)
		slides[i].style.display = "none";
	slides[slideIdx].style.display = "flex";

	loginSlideSelector.forEach(function(key) {
		if (currentPage == "login"){
			key.addEventListener("click", (e) => {
				save = slideIdx;
				slideIdx = Array.from(e.target.parentElement.children).indexOf(e.target);
				if (save != slideIdx){
					loginSlideSelector[save].classList.remove("activeSelector");
					for (i = 0; i < slides.length; i++)
						slides[i].style.display = "none";
					slides[slideIdx].style.display = "flex";
					loginSlideSelector[slideIdx].classList.add('activeSelector');

					const time = {
						duration: 300,
						iterations: 1,
					}
					if (loginSlideSelector[slideIdx].id == "loginSelector"){
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
			})
			key.addEventListener("keydown", (e) => {
				if (e.key == "Enter")
					key.click();
			})
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
	})

	usernameRegisterInput.addEventListener("keydown", (e) => {
		usernameLogin.value = usernameRegisterInput.value;
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
		warning = document.createElement("a");
		warning.className = "warning";
		warning.text = "Field can't be empty";
		if (loginBtn.previousElementSibling)
			loginBtn.previousElementSibling.remove();
		for (i=0;i<inputs.length;i++){
			if (inputs[i].value == "" && !inputs[i].previousElementSibling){
				warningTmp = warning.cloneNode(true);
				inputs[i].before(warningTmp);
			}
			if (inputs[i].value != "" && inputs[i].previousElementSibling){
				inputs[i].previousElementSibling.remove();
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
					response.json().then(text => {
						if (text.logged == 0){
							warning.text = text.message;
							if (!loginBtn.previousElementSibling)
								loginBtn.before(warning.cloneNode(true));
						}
						else{
							(async () => {
								client = await new Client()
								if (client == null){
									slideIdx = 0;
									window.onkeydown = null
									myReplaceState(`https://${hostname.host}/login`);
								}
								else{
									slideIdx = 0;
									window.onkeydown = null
									myReplaceState(`https://${hostname.host}/home`);
								}
							})();
						}
					})
				}
				else
				{
					response.json().then(text => {
						warning.text = text.message;
						if (!loginBtn.previousElementSibling)
							loginBtn.before(warning.cloneNode(true));
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
		warning = document.createElement("a");
		warning.className = "warning";
		warning.text = "Field can't be empty";
		for (i=0;i<inputs.length;i++){
			if (inputs[i].previousElementSibling)
				inputs[i].previousElementSibling.remove();
			if (inputs[i].value == "" && !inputs[i].previousElementSibling){
				warningTmp = warning.cloneNode(true);
				inputs[i].before(warningTmp);
				lock = 1;
			}
		}

		if (username.length > 15){
			warning = document.createElement("a");
			warning.className = "warning";
			warning.text = "username name must not exceed 15 characters";
			if (!usernameRegisterInput.previousElementSibling)
				usernameRegisterInput.before(warning);
			lock = 1;
		}
		else if (username != "" && usernameRegisterInput.previousElementSibling)
				usernameRegisterInput.previousElementSibling.remove();
		if (pw != cpw){
			warning = document.createElement("a");
			warning.className = "warning";
			warning.text = "Passwords do not match";
			if (cpwRegisterInput.previousElementSibling && cpwRegisterInput.previousElementSibling.text == "Field can't be empty")
				cpwRegisterInput.previousElementSibling.remove();
			if (!cpwRegisterInput.previousElementSibling || cpwRegisterInput.previousElementSibling.text != "Passwords do not match")
				cpwRegisterInput.before(warning);
			else if (cpw != "" && cpwRegisterInput.previousElementSibling.text == "Field can't be empty")
				cpwRegisterInput.previousElementSibling.remove();
		}
		else if (lock == 0){
			setLoader()
			if (registerBtn.previousElementSibling)
				registerBtn.previousElementSibling.remove();

			const data = {username: username, password: pw, 'lang': currentLang, use_browser_theme: use_browser_theme};
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
							client = await new Client()
							
							if (client == null){
								slideIdx = 1;
								window.onkeydown = null
								myReplaceState(`https://${hostname.host}/login`);
							}
							else{
								slideIdx = 0;
								window.onkeydown = null
								myReplaceState(`https://${hostname.host}/home`);
							}
						})();
					});
				} else {
					response.json().then(response => {
						unsetLoader()
						warning = document.createElement("a");
						warning.className = "warning";
						warning.text = response.message;
						if (!registerBtn.previousElementSibling)
							registerBtn.before(warning);
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
		loginSlideSelector[slideIdx].classList.add('activeSelector');

		const time = {
			duration: 300,
			iterations: 1,
		}
		if (loginSlideSelector[slideIdx].id == "loginSelector"){
			const move = [
				{ left: `50%`},
				{ left: `0%`}
			];
			document.getElementById("slideSelectorBg").animate(move, time);
			document.getElementById("slideSelectorBg").style.setProperty("left", "0");
		}
		else{
			const move = [
				{ left: `0%`},
				{ left: `50%`}
			];
			document.getElementById("slideSelectorBg").animate(move, time);
			document.getElementById("slideSelectorBg").style.setProperty("left", "50%");
		}
		slides[slideIdx].style.display = "flex";
		loginSlideSelector[slideIdx].focus();
	}
}