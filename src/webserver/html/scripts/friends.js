friendCodePopup = document.getElementById("friendCodePopup");
friendRequestPopup = document.getElementById("friendRequestPopup");
deleteRequestPopup = document.getElementById("deleteRequestPopup");
popupBg = document.getElementById("popupBg");
friendCodeBtn = document.getElementById("friendCodeBtn");
pendingRequestBtn = document.getElementById("pendingRequestBtn");
inputCode = document.getElementById("inputCode");
sendFriendRequestBtn = document.getElementById("sendFriendRequestBtn");
friendListContainer = document.getElementById("friendList");
friendInfo = document.getElementById("friendInfo");


document.addEventListener("click", (e) => {
	if (e.target.parentElement == null || e.target.id == "popupBg"){
		friendCodePopup.style.setProperty("display", "none");
		friendRequestPopup.style.setProperty("display", "none");
		deleteFriendPopup.style.setProperty("display", "none");
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
		if (friendRequestPopup.innerHTML != ""){
			friendRequestPopup.style.setProperty("display", "block");
			var bg = document.createElement("div");
			bg.id = "popupBg";
			pos = friendInfo.getBoundingClientRect();
			bg.style.left = `${-pos.left}px`;
			bg.style.top = `${-pos.top}px`;
			friendRequestPopup.before(bg)
		}
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
	if (e.target.id == "confirmDelete"){
		const data = {code: e.target.parentElement.className};
		fetch('/api/user/remove_friend', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
			credentials: 'include'
		})
		var friend = document.getElementById(e.target.parentElement.className);
		deleteFriendPopup.style.setProperty("display", "none");
		var bg = document.getElementById("popupBg");
		if (bg != null)
			bg.remove();
		friend.remove();
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
		deleteFriendPopup.style.setProperty("display", "none");
		var bg = document.getElementById("popupBg");
		if (bg != null)
			bg.remove();
	}
})

function createFriendContainer(friend){
	friendContainer = document.createElement("div");
	friendContainer.className = "friendContainer"
	friendContainer.id = friend.friend_code;
	pfp = document.createElement("img");
	pfp.className = "profilePicture";
	if (friend.pfp != ""){
		var rawPfp = friend.pfp;
		if (rawPfp.startsWith('https://'))
			pfp.setAttribute("src", `${rawPfp}`);
		else
			pfp.setAttribute("src", `data:image/jpg;base64,${rawPfp}`);
	}
	friendName = document.createElement("a");
	friendName.innerHTML = friend.display;

	friendsOptionContainer = document.createElement("div");
	friendsOptionContainer.className = "friendsOptionContainer"

	friendsOption = document.createElement("div");
	friendsOption.className = "friendsOption"
	

	moreBtn = document.createElement("div");
	moreBtn.className = "moreBtn";

	friendsOptionContainer.appendChild(moreBtn);
	friendsOptionContainer.appendChild(friendsOption);

	removeFriendBtn = document.createElement("div");
	removeFriendBtn.className = "removeFriendBtn";
	
	blockFriendBtn = document.createElement("div");
	blockFriendBtn.className = "blockFriendBtn";

	friendsOption.appendChild(removeFriendBtn);
	friendsOption.appendChild(blockFriendBtn);
	
	is_active = document.createElement("a");
	is_active.innerHTML = friend.is_active == true ? "online" : "offline";
	is_active.className = "friendStatus";
	is_active.style.setProperty("color", friend.is_active == true ? "green" : "red");
	
	friendContainer.appendChild(pfp);
	friendContainer.appendChild(friendName);
	friendContainer.appendChild(is_active);
	friendContainer.appendChild(friendsOptionContainer);
	friendListContainer.appendChild(friendContainer);
}

function checkUpdate(){
	if (currentPage == "friends"){
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
					loadCurrentLang();
					friendCodePopup.lastElementChild.innerHTML = text.friend_code;
					var friends = text.friends;
					friendListContainer.innerHTML = "";
					friendRequestPopup.innerHTML = "";
					Object.keys(friends).forEach(function(key) {
						createFriendContainer(friends[key]);
					});
					var friends_request = text.friend_request;
					notificationDot = document.getElementById("notificationDot");
					notificationDot.style.setProperty("display", Object.keys(friends_request).length > 0 ? "block" : "none");
					Object.keys(friends_request).forEach(function(key) {
						friendContainer = document.createElement("div");
						friendContainer.className = "friendContainer"
						friendContainer.id = friends_request[key].friend_code;
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
						acceptBtn = document.createElement("div");
						acceptBtn.className = "acceptRequestBtn";
						friendContainer.appendChild(acceptBtn);
						
						rejectBtn = document.createElement("div");
						rejectBtn.className = "rejectRequestBtn";
						friendContainer.appendChild(rejectBtn);
						
						friendRequestPopup.appendChild(friendContainer);
					});
					acceptRequestBtn = document.querySelectorAll(".acceptRequestBtn");
					rejectRequestBtn = document.querySelectorAll(".rejectRequestBtn");
					removeFriendBtn = document.querySelectorAll(".removeFriendBtn");
					
					for (var i = 0; i < removeFriendBtn.length; i++){
						removeFriendBtn[i].addEventListener("click", (e) => {
							deleteFriendPopup.style.setProperty("display", "flex");
							deleteFriendPopup.className = e.srcElement.parentElement.id;

							var bg = document.createElement("div");
							bg.id = "popupBg";
							pos = friendInfo.getBoundingClientRect();
							bg.style.left = `${-pos.left}px`;
							bg.style.top = `${-pos.top}px`;
							deleteFriendPopup.before(bg);
						})
					}
					
					for (var i = 0; i < acceptRequestBtn.length; i++){
						acceptRequestBtn[i].addEventListener("click", (e) => {
							const data = {code: e.srcElement.parentElement.id};
							fetch('/api/user/accept_friend_request', {
								method: 'POST',
								headers: {
									'Content-Type': 'application/json',
								},
								body: JSON.stringify(data),
								credentials: 'include'
							})
							const parent = e.srcElement.parentElement;
							friendContainer = document.createElement("div");
							friendContainer.className = "friendContainer"
							pfp = document.createElement("img");
							pfp.className = "profilePicture";
							pfp.setAttribute("src", parent.children[0].getAttribute("src"));
							friendName = document.createElement("a");
							friendName.innerHTML = parent.children[1].innerHTML;
							friendContainer.appendChild(pfp);
							friendContainer.appendChild(friendName);
							friendListContainer.appendChild(friendContainer);
							
							e.srcElement.parentElement.remove();
							if (friendRequestPopup.innerHTML == ""){
								friendRequestPopup.style.setProperty("display", "none");
								notificationDot.style.setProperty("display", "none");
								var bg = document.getElementById("popupBg");
								if (bg != null)
									bg.remove();
							}
						})
						rejectRequestBtn[i].addEventListener("click", (e) => {
							const data = {code: e.srcElement.parentElement.id};
							fetch('/api/user/reject_friend_request', {
								method: 'POST',
								headers: {
									'Content-Type': 'application/json',
								},
								body: JSON.stringify(data),
								credentials: 'include'
							})
							e.srcElement.parentElement.remove();
							if (friendRequestPopup.innerHTML == ""){
								friendRequestPopup.style.setProperty("display", "none");
								notificationDot.style.setProperty("display", "none");
								var bg = document.getElementById("popupBg");
								if (bg != null)
									bg.remove();
							}
						})
					}
					
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
						document.getElementById("pfp").style.setProperty("display", "none");
						document.getElementById("dropDownUser").style.setProperty("display", "none");
						currentPage = "login";
						state = JSON.stringify({"html": document.body.innerHTML, "currentPage": currentPage, "currentLang": currentLang});

						history.replaceState(state, "");
					}))
				});
			}
		})
	}
}

//var checkUpdateInterval = setInterval(checkUpdate, 10000);

checkUpdate();