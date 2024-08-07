friendCodePopup = document.getElementById("friendCodePopup");
friendRequestPopup = document.getElementById("friendRequestPopup");
popupBg = document.getElementById("popupBg");
friendCodeBtn = document.getElementById("friendCodeBtn");
pendingRequestBtn = document.getElementById("pendingRequestBtn");
inputCode = document.getElementById("inputCode");
sendFriendRequestBtn = document.getElementById("sendFriendRequestBtn");
friendListContainer = document.getElementById("friendList");
friendInfo = document.getElementById("friendInfo");

document.addEventListener("click", (e) => {
	if (e.target.parentElement == null || (e.target.parentElement.id != "friendCodePopup" && e.target.parentElement.id != "friendRequestPopup")){
		friendCodePopup.style.setProperty("display", "none");
		friendRequestPopup.style.setProperty("display", "none");
		var bg = document.getElementById("popupBg");
		if (bg != null)
			bg.remove();
	}
	if (e.target.id == "friendCodeBtn") {
		friendCodePopup.style.setProperty("display", "block");
		var bg = document.createElement("div");
		bg.id = "popupBg";
		pos = friendInfo.getBoundingClientRect();
		bg.style.left = `${-pos.left}px`;
		bg.style.top = `${-pos.top}px`;
		friendCodePopup.before(bg)
	}
	if (e.target.id == "pendingRequestBtn") {
		friendRequestPopup.style.setProperty("display", "block");
		var bg = document.createElement("div");
		bg.id = "popupBg";
		pos = friendInfo.getBoundingClientRect();
		bg.style.left = `${-pos.left}px`;
		bg.style.top = `${-pos.top}px`;
		friendRequestPopup.before(bg)
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

window.addEventListener("resize", (e) => {
	var bg = document.getElementById("popupBg");
	if (bg != null){
		pos = friendInfo.getBoundingClientRect();
		bg.style.left = `${-pos.left}px`;
		bg.style.top = `${-pos.top}px`;
	}
})

document.addEventListener("keydown", (e) => {
	if (e.key == "Escape"){
		friendCodePopup.style.setProperty("display", "none");
		friendRequestPopup.style.setProperty("display", "none");
		var bg = document.getElementById("popupBg");
		if (bg != null)
			bg.remove();
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
				friendCodePopup.lastElementChild.innerHTML = text.friend_code;
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
				var friends_request = text.friend_request;
				Object.keys(friends_request).forEach(function(key) {
					friendContainer = document.createElement("div");
					friendContainer.className = "friendContainer"
					pfp = document.createElement("img");
					pfp.className = "profilePicture";
					if (friends_request[key].pfp != ""){
						var rawPfp = friends_request[key].pfp;
						if (rawPfp.startsWith('https://'))
							pfp.setAttribute("src", `${rawPfp}`);
						else
							pfp.setAttribute("src", `data:image/jpg;base64,${rawPfp}`);
					}
					friendName = document.createElement("a");
					friendName.innerHTML = friends_request[key].display;
					friendContainer.appendChild(pfp);
					friendContainer.appendChild(friendName);
					friendRequestPopup.appendChild(friendContainer);
				});

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
