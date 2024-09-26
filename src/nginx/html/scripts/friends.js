deleteRequestPopup = document.getElementById("deleteRequestPopup");
blockFriendPopup = document.getElementById("blockFriendPopup");
popupBg = document.getElementById("popupBg");
sendFriendRequestBtn = document.getElementById("sendFriendRequestBtn");
allFriendListContainer = document.getElementById("allFriendList");
onlineFriendListContainer = document.getElementById("onlineFriendList");
pendingFriendRequestListContainer = document.getElementById("pendingFriendRequestList");
blockedListContainer = document.getElementById("blockedList");
friendInfo = document.getElementById("friendInfo");

friendSlides = document.querySelectorAll(".friendSlide");
slideSelector = document.querySelectorAll(".slideSelector");
var friendSlideIdx = 0;
friendSlides[friendSlideIdx].className = `${friendSlides[friendSlideIdx].className} activeSlide`
slideSelector[friendSlideIdx].className = `${slideSelector[friendSlideIdx].className} activeSelector`

Object.keys(slideSelector).forEach(function(key) {
	if (currentPage == "friends"){
		slideSelector[key].addEventListener("click", (e) => {
			friendSlides[friendSlideIdx].className = "friendSlide";
			slideSelector[friendSlideIdx].className = "slideSelector";
			friendSlideIdx = Array.from(e.target.parentElement.children).indexOf(e.target);
			friendSlides[friendSlideIdx].className = `${friendSlides[friendSlideIdx].className} activeSlide`
			slideSelector[friendSlideIdx].className = `${slideSelector[friendSlideIdx].className} activeSelector`
		})
	}
})


document.addEventListener("click", (e) => {
	if (currentPage == "friends"){
		if (e.target.parentElement == null || e.target.id == "popupBg"){
			deleteFriendPopup.style.setProperty("display", "none");
			blockFriendPopup.style.setProperty("display", "none");
			var bg = document.getElementById("popupBg");
			if (bg != null)
				bg.remove();
		}
		if (e.target.id == "confirmDelete"){
			const data = {username: e.target.parentElement.className};
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
		if (e.target.id == "confirmBlock"){
			const data = {username: e.target.parentElement.className};
			fetch('/api/user/block_friend', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
				credentials: 'include'
			})
			var friend = document.getElementById(e.target.parentElement.className);
			blockFriendPopup.style.setProperty("display", "none");
			var bg = document.getElementById("popupBg");
			if (bg != null)
				bg.remove();
			friend.remove();
		}
		if (e.target.className == "unblockBtn"){
			const data = {username: e.target.parentElement.id};
			fetch('/api/user/unblock_user', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
				credentials: 'include'
			})
			e.target.parentElement.remove();
		}
	}
})

window.addEventListener("resize", (e) => {
	if (currentPage == "friends"){
		var bg = document.getElementById("popupBg");
		if (bg != null){
			pos = friendInfo.getBoundingClientRect();
			bg.style.left = `${-pos.left}px`;
			bg.style.top = `${-pos.top}px`;
		}
	}
})

document.addEventListener("keydown", (e) => {
	if (currentPage == "friends"){
		if (e.key == "Escape"){
			deleteFriendPopup.style.setProperty("display", "none");
			blockFriendPopup.style.setProperty("display", "none");
			var bg = document.getElementById("popupBg");
			if (bg != null)
				bg.remove();
		}
	}
})

function createFriendContainer(friend){
	friendContainer = document.createElement("div");
	friendContainer.className = "friendContainer"
	friendContainer.id = friend.username;
	pfpContainer = document.createElement("div");
	pfpContainer.className = "pfpContainer";
	pfpStatus = document.createElement("div");
	pfpStatus.className = friend.is_active == true ? "friendStatusOnlinePfpMask" : "friendStatusOfflinePfpMask";
	pfpMask = document.createElement("div");
	pfpMask.className = "friendPfpMask";
	pfp = document.createElement("img");
	pfp.className = "profilePicture";
	if (friend.pfp != ""){
			pfp.setAttribute("src", `https://${hostname.host}/${friend.pfp}`);
	}
	pfpContainer.appendChild(pfp);
	pfpContainer.appendChild(pfpStatus)
	//pfpContainer.appendChild(pfpMask)

	friendName = document.createElement("a");
	friendName.innerHTML = friend.username;

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

	friendsOption.id = friend.username;

	friendsOption.appendChild(removeFriendBtn);
	friendsOption.appendChild(blockFriendBtn);

	friendContainer.appendChild(pfpContainer);
	friendContainer.appendChild(friendName);
	friendContainer.appendChild(friendsOptionContainer);

	if (friend.is_active == true){
		onlineFriendListContainer.appendChild(friendContainer.cloneNode(true));
	}

	allFriendListContainer.appendChild(friendContainer);
}

function createFriendRequestContainer(user){
	friendContainer = document.createElement("div");
	friendContainer.className = "friendContainer"
	friendContainer.id = user.username;
	pfpContainer = document.createElement("div");
	pfpContainer.className = "pfpContainer";
	pfpStatus = document.createElement("div");
	pfpStatus.className = user.is_active == true ? "pfpStatusOnline" : "pfpStatusOffline";
	pfp = document.createElement("img");
	pfp.className = "profilePicture";
	if (user.pfp != ""){
		pfp.setAttribute("src", `https://${hostname.host}/${user.pfp}`);
	}
	
	pfpMask = document.createElement("div");
	pfpMask.className = "pfpMask";
	pfpMask.style.setProperty("background","radial-gradient(circle, rgba(255,255,255,0) 70%, var(--input-bg-rgb) 70%)");
	
	pfpContainer.appendChild(pfp);
	pfpContainer.appendChild(pfpMask);
	pfpContainer.appendChild(pfpStatus)
	friendName = document.createElement("a");
	friendName.innerHTML = user.username;
	friendContainer.appendChild(pfpContainer);
	friendContainer.appendChild(friendName);

	requestOptionContainer = document.createElement("div");
	requestOptionContainer.className = "requestOptionContainer";

	acceptBtn = document.createElement("div");
	acceptBtn.className = "acceptRequestBtn";
	requestOptionContainer.appendChild(acceptBtn);

	rejectBtn = document.createElement("div");
	rejectBtn.className = "rejectRequestBtn";
	requestOptionContainer.appendChild(rejectBtn);

	requestOptionContainer.id = user.username;

	friendContainer.appendChild(requestOptionContainer);

	pendingFriendRequestListContainer.appendChild(friendContainer);
}

function createBlockedUserContainer(user){
	friendContainer = document.createElement("div");
	friendContainer.className = "friendContainer"
	friendContainer.id = user.username;

	pfpContainer = document.createElement("div");
	pfpContainer.className = "pfpContainer";
	pfpStatus = document.createElement("div");
	pfpStatus.className = friend.is_active == true ? "pfpStatusOnline" : "pfpStatusOffline";
	pfp = document.createElement("img");
	pfp.className = "profilePicture";
	if (user.pfp != ""){
		pfp.setAttribute("src", `https://${hostname.host}/${user.pfp}`);
	}
	
	pfpMask = document.createElement("div");
	pfpMask.className = "pfpMask";
	pfpMask.style.setProperty("background","radial-gradient(circle, rgba(255,255,255,0) 70%, var(--input-bg-rgb) 70%)");
	
	
	pfpContainer.appendChild(pfp);
	pfpContainer.appendChild(pfpMask);
	pfpContainer.appendChild(pfpStatus)

	friendName = document.createElement("a");
	friendName.innerHTML = user.username;
	friendContainer.appendChild(pfpContainer);
	friendContainer.appendChild(friendName);

	unblockBtn = document.createElement("div");
	unblockBtn.className = "unblockBtn";

	requestOptionContainer = document.createElement("div");
	requestOptionContainer.className = "requestOptionContainer";
	requestOptionContainer.id = user.username;
	requestOptionContainer.appendChild(unblockBtn);

	friendContainer.appendChild(requestOptionContainer);
	blockedListContainer.appendChild(friendContainer);
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
					var friends = text.friends;
					var friends_request = text.friend_request;
					var blocked_users = text.blocked_users
					allFriendListContainer.innerHTML = "";
					onlineFriendListContainer.innerHTML = ""
					pendingFriendRequestListContainer.innerHTML = ""
					blockedListContainer.innerHTML = ""
					Object.keys(friends).forEach(function(key) {
						createFriendContainer(friends[key]);
					});
					Object.keys(friends_request).forEach(function(key) {
						createFriendRequestContainer(friends_request[key]);
					});

					Object.keys(blocked_users).forEach(function(key) {
						createBlockedUserContainer(blocked_users[key]);
					});
					acceptRequestBtn = document.querySelectorAll(".acceptRequestBtn");
					rejectRequestBtn = document.querySelectorAll(".rejectRequestBtn");
					removeFriendBtn = document.querySelectorAll(".removeFriendBtn");
					blockFriendBtn = document.querySelectorAll(".blockFriendBtn");
					unblockBtn = document.querySelectorAll(".unblockBtn");


					profilePictures = document.querySelectorAll(".profilePicture");
					testImg = new Image();

					setTimeout(() => {
						for (var i = 0; i< profilePictures.length; i++){
							testImg.setAttribute("src", profilePictures[i].getAttribute("src"));
							if (testImg.width > testImg.height){		//this condition does not work if not in a setTimeout. You'll ask why. The answer is : ¯\_(ツ)_/¯
								profilePictures[i].style.setProperty("height", "100%");
								profilePictures[i].style.setProperty("width", "unset");
							}
						}
					}, 10)

					document.getElementById("onlineFriendSelectorCount").innerHTML = `(${onlineFriendListContainer.childElementCount})`;
					document.getElementById("allFriendSelectorCount").innerHTML = `(${allFriendListContainer.childElementCount})`;
					document.getElementById("pendingFriendRequestSelectorCount").innerHTML = `(${pendingFriendRequestListContainer.childElementCount})`;
					document.getElementById("blockedSelectorCount").innerHTML = `(${blockedListContainer.childElementCount})`;

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
						blockFriendBtn[i].addEventListener("click", (e) => {
							blockFriendPopup.style.setProperty("display", "flex");
							blockFriendPopup.className = e.srcElement.parentElement.id;

							var bg = document.createElement("div");
							bg.id = "popupBg";
							pos = friendInfo.getBoundingClientRect();
							bg.style.left = `${-pos.left}px`;
							bg.style.top = `${-pos.top}px`;
							blockFriendPopup.before(bg);
						})
					}

					for (var i = 0; i < acceptRequestBtn.length; i++){
						acceptRequestBtn[i].addEventListener("click", (e) => {
							const data = {username: e.srcElement.parentElement.id};
							fetch('/api/user/accept_friend_request', {
								method: 'POST',
								headers: {
									'Content-Type': 'application/json',
								},
								body: JSON.stringify(data),
								credentials: 'include'
							})
						})
						rejectRequestBtn[i].addEventListener("click", (e) => {
							const data = {username: e.srcElement.parentElement.id};
							fetch('/api/user/reject_friend_request', {
								method: 'POST',
								headers: {
									'Content-Type': 'application/json',
								},
								body: JSON.stringify(data),
								credentials: 'include'
							})
						})
					}
				});
			}
			else {
				client = null;
				history.replaceState("", "", `https://${hostname.host}/login`);
			}
		})
	}
}

checkUpdate();
