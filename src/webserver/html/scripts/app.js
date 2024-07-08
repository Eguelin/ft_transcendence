fetch ('bodyLess/login.html').then((response) => {
	return (response.text().then(response => {
		if (container.innerHTML != "")
			history.pushState(response, "");
		else
			history.replaceState(response,"");
		container.innerHTML = response;
		document.getElementById("script").remove();
		var s = document.createElement("script");
		s.setAttribute('id', 'script');
		s.setAttribute('src', `scripts/login.js`);
		document.body.appendChild(s);
	}))
});

window.addEventListener("popstate", (event) => {
	if (event.state){
		const contain = document.getElementById("container");
		contain.innerHTML = event.state;
	}
});

// MOST OF THAT STUFF NOT BE ON PROD


/*
function createUser(username, password)
{
	const data = {username: username, password: password};
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
			loadPage('home');
		} else {
			console.log("Failed to create user")
		}
	})
	.catch(error => {
		console.error('There was a problem with the fetch operation:', error);
	});
}

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
*/