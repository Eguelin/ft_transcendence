friendCodeSpan = document.getElementById("friendCode");
friendCodePopup = document.getElementById("friendCodePopup");
popupBg = document.getElementById("popupBg");
friendCodeBtn = document.getElementById("friendCodeBtn");
inputCode = document.getElementById("inputCode");
sendFriendRequestBtn = document.getElementById("sendFriendRequestBtn");
friendListContainer = document.getElementById("friendList");

document.addEventListener("click", (e) => {
	if (e.target.parentElement == null || e.target.parentElement.id != "friendCodePopup"){
		friendCodePopup.style.setProperty("display", "none");
		popupBg.style.setProperty("display", "none");
	}
	if (e.target.id == "friendCodeBtn") {
		popupBg.style.setProperty("display", "block");
		friendCodePopup.style.setProperty("display", "block");
	}
	if (e.target.id == "sendFriendRequestBtn"){
		const data = {code: inputCode.value};
		fetch('/api/user/send_friend_request', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
			credentials: 'include'
		})
	}
})

document.addEventListener("keydown", (e) => {
	if (e.key == "Escape"){
		friendCodePopup.style.setProperty("display", "none");
		popupBg.style.setProperty("display", "none");
	}
})

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
				loadCurrentLang("friends");
				code = document.createElement("a");
				code.innerHTML = text.friend_code;
				friendCodePopup.appendChild(code);
				var friends = text.friends;
				Object.keys(friends).forEach(function(key) {
					friendContainer = document.createElement("div");
					friendContainer.className = "friendContainer"
					pfp = document.createElement("img");
					pfp.className = "profilePicture";
					if (friends[key].pfp != ""){
						var rawPfp = friends[key].pfp;
						if (rawPfp.startsWith('https://'))
							pfp.setAttribute("src", `${rawPfp}`);
						else
							pfp.setAttribute("src", `data:image/jpg;base64,${rawPfp}`);
					}
					friendName = document.createElement("a");
					friendName.innerHTML = friends[key].display;
					friendContainer.appendChild(pfp);
					friendContainer.appendChild(friendName);
					friendListContainer.appendChild(friendContainer);
				});
				console.log(friends);
				history.replaceState(container.innerHTML, "");
			});
		}
		else {
			console.log("Failed to get user")

			fetch ('bodyLess/login.html').then((response) => {
				(response.text().then(response => {
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
					document.getElementById("pfp").style.setProperty("display", "none");
					document.getElementById("dropDownUser").style.setProperty("display", "none");
					history.replaceState(container.innerHTML, "");
				}))
			});
		}
	})
}
