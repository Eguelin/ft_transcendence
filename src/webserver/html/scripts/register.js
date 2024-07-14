container = document.getElementById("container");
registerBtn = document.getElementById("registerBtn");
swichTheme = document.getElementById("themeButton");

window.addEventListener("popstate", (event) => {
	if (event.state){
		const contain = document.getElementById("container");
		contain.innerHTML = event.state;
	}
});

registerBtn.addEventListener("click", (e) => {
	email = document.getElementById('mail').value;
	var lock = 0;
	username = document.getElementById('username').value;
	pw = document.getElementById('password').value;
	cpw = document.getElementById('cPassword').value;
	inputs = document.getElementsByClassName('formInput');
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
	
	if (pw != cpw){
		warning = document.createElement("a");
		warning.className = "warning";
		warning.text = "Passwords do not match";
		if (document.getElementById('cPassword').previousElementSibling && document.getElementById('cPassword').previousElementSibling.text == "Field can't be empty"){
			document.getElementById('cPassword').previousElementSibling.remove();
		}
		if (!document.getElementById('cPassword').previousElementSibling || document.getElementById('cPassword').previousElementSibling.text != "Passwords do not match"){
			document.getElementById("cPassword").before(warning);
		}
		else if (cpw != "" && document.getElementById('cPassword').previousElementSibling.text == "Field can't be empty"){
			document.getElementById('cPassword').previousElementSibling.remove();
		}
	}
	else if (lock == 0){
		const data = {username: username, password: pw};
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
				console.log('User created successfully');
				fetch('/api/user/login', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(data),
					credentials: 'include'
				})
				fetch ('bodyLess/home.html').then((response) => {
					(response.text().then(response => {
						if (container.innerHTML != "")
							history.pushState(response, "");
						else
							history.replaceState(response,"");
						container.innerHTML = response;
						document.getElementById("script").remove();
						var s = document.createElement("script");
						s.setAttribute('id', 'script');
						s.setAttribute('src', `scripts/home.js`);
						document.body.appendChild(s);
					}))
				});
			} else {
				console.log("Failed to create user")
			}
		})
		.catch(error => {
			console.error('There was a problem with the fetch operation:', error);
		});
	}
})

swichTheme.addEventListener("click", () => {
	const style = document.getElementById("style");
	const href = style.getAttribute('href');
	style.setAttribute('href', href == "lightMode.css" ? "darkMode.css" : "lightMode.css");
})

function getCurrentUser() {
	fetch('/api/user/current', {
		method: 'GET',
		headers: {
			'Content-Type': 'application/json',
		},
		credentials: 'include'
	})
	.then(response => {
		if (response.ok) {
			return response.json();
		}
		console.log("Failed to get user")
	})
	.catch(error => {
		console.error('There was a problem with the fetch operation:', error);
	});
}
