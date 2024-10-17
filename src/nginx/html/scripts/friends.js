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

homeBtn.style.setProperty("display", "block");
inputSearchUserContainer.style.setProperty("display", "block");
dropDownUserContainer.style.setProperty("display", "flex");

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

document.querySelectorAll("#confirmDelete, #confirmBlock, #unblockBtn").forEach(function (elem) {
	elem.addEventListener("focus", (e)=>{
		window.removeEventListener("keydown", friendKeyDownEvent);
	});
	elem.addEventListener("focusout", (e)=>{
		window.addEventListener("keydown", friendKeyDownEvent);
	});
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
		if (e.key == "Tab" && (e.target.id == "confirmDelete" || e.target.id == "confirmBlock")){
			e.preventDefault();
		}
		if (e.key == "Escape"){
			deleteFriendPopup.style.setProperty("display", "none");
			blockFriendPopup.style.setProperty("display", "none");
			var bg = document.getElementById("popupBg");
			if (bg != null)
				bg.remove();
		}
	}
})

var friendTabIdx, pendingFriendTabIdx, blockedUserTabIdx; 

function createUserContainer(user){
	var friendContainer = document.createElement("div");
	var pfpContainer = document.createElement("div");
	var pfp = document.createElement("img");
	var friendName = document.createElement("a");
	var unblockBtn = document.createElement("div");
	var acceptBtn = document.createElement("div");
	var rejectBtn = document.createElement("div");

	var userOptionContainer = document.createElement("div");

	friendContainer.className = "friendContainer"
	friendContainer.id = user.username;

	pfpContainer.className = "pfpContainer";
	pfp.className = "profilePicture";
	addPfpUrlToImgSrc(pfp, user.pfp);

	pfpContainer.appendChild(pfp);

	friendName.innerHTML = user.username;

	friendContainer.appendChild(pfpContainer);
	friendContainer.appendChild(friendName);

	acceptBtn.className = "acceptRequestBtn";
	rejectBtn.className = "rejectRequestBtn";
	unblockBtn.className = "unblockBtn";

	userOptionContainer.className = "friendsOptionContainer";
	userOptionContainer.id = user.username;
	userOptionContainer.appendChild(unblockBtn);
	userOptionContainer.appendChild(acceptBtn);
	userOptionContainer.appendChild(rejectBtn);

	friendContainer.appendChild(userOptionContainer);
	return (friendContainer);
}

function createFriendContainer(user){
	var friendContainer = document.createElement("div");
	var friendsOptionContainer = document.createElement("div");
	var friendsOption = document.createElement("div");
	var moreBtn = document.createElement("div");
	var removeFriendBtn = document.createElement("div");
	var blockFriendBtn = document.createElement("div");

	friendContainer = createUserContainer(user);
	friendContainer.getElementsByClassName("friendsOptionContainer")[0].remove();

	friendsOptionContainer.className = "friendsOptionContainer"

	friendsOption.className = "friendsOption"

	moreBtn.className = "moreBtn";

	friendsOptionContainer.appendChild(moreBtn);
	friendsOptionContainer.appendChild(friendsOption);
	friendsOptionContainer.tabIndex = friendTabIdx;
	friendTabIdx += 1;

	removeFriendBtn.className = "removeFriendBtn";
	removeFriendBtn.tabIndex = friendTabIdx;
	friendTabIdx += 1;

	blockFriendBtn.className = "blockFriendBtn";
	blockFriendBtn.tabIndex = friendTabIdx;
	friendTabIdx += 1;

	friendsOption.id = user.username;

	friendsOption.appendChild(removeFriendBtn);
	friendsOption.appendChild(blockFriendBtn);

	friendContainer.appendChild(friendsOptionContainer);

	if (user.is_active == true){
		onlineFriendListContainer.appendChild(friendContainer.cloneNode(true));
	}

	allFriendListContainer.appendChild(friendContainer);
}

function createFriendRequestContainer(user){
	var friendContainer = createUserContainer(user);

	friendContainer.querySelectorAll(".unblockBtn").forEach(function (elem) {
		elem.remove();
	})

	friendContainer.getElementsByClassName("acceptRequestBtn")[0].tabIndex = pendingFriendTabIdx;
	pendingFriendTabIdx += 1;
	friendContainer.getElementsByClassName("rejectRequestBtn")[0].tabIndex = pendingFriendTabIdx;
	pendingFriendTabIdx += 1;
	pendingFriendRequestListContainer.appendChild(friendContainer);
}

function createBlockedUserContainer(user){
	var friendContainer = createUserContainer(user);

	friendContainer.querySelectorAll(".acceptRequestBtn, .rejectRequestBtn").forEach(function (elem) {
		elem.remove();
	})

	blockedListContainer.appendChild(friendContainer);
}

function setListeners(){
	document.querySelectorAll(".friendsOptionContainer").forEach(function (elem) {
		elem.addEventListener("focus", (e)=>{
			window.removeEventListener("keydown", friendKeyDownEvent);
			document.querySelectorAll(".activeListSelector").forEach(function (active){
				active.classList.remove("activeListSelector");
			})
		});
		
		elem.addEventListener("focusout", (e)=>{
			window.addEventListener("keydown", friendKeyDownEvent);
		});
		elem.addEventListener("keydown", (e) => {
			if (e.key == "Enter")
				elem.click();
		});
		elem.addEventListener("click", (e) => {
			elem.classList.add("activeListSelector");
		})
	})
	document.querySelectorAll(".friendsOption div, .acceptRequestBtn, .rejectRequestBtn").forEach(function (elem) {
		elem.addEventListener("focus", (e)=>{
			window.removeEventListener("keydown", friendKeyDownEvent);
		});
		elem.addEventListener("focusout", (e)=>{
			window.addEventListener("keydown", friendKeyDownEvent);
		});
		elem.addEventListener("keydown", (e) => {
			if (e.key == "Enter"){
				elem.click();
			}

		});
		elem.addEventListener("keyup", (e) => {
			if (elem.className == "removeFriendBtn"){
				document.getElementById("confirmDelete").tabIndex = elem.parentElement.parentElement.tabIndex;
				document.getElementById("confirmDelete").focus();
			}
			else if (elem.className == "blockFriendBtn"){
				document.getElementById("confirmBlock").tabIndex = elem.parentElement.parentElement.tabIndex;
				document.getElementById("confirmBlock").focus();
			}
			if (e.key == "Enter"){
				document.querySelectorAll(".activeListSelector").forEach(function (active){
					active.classList.remove("activeListSelector");
				})
			}
		})
		elem.addEventListener("click", (e) => {
			if (document.getElementById("popupBg")){
				document.getElementById("popupBg").remove();
				blockFriendPopup.style.setProperty("display", "none");
				deleteFriendPopup.style.setProperty("display", "none");
			}
			if (elem.className == "removeFriendBtn"){
				deleteFriendPopup.style.setProperty("display", "flex");
				deleteFriendPopup.className = e.target.parentElement.id;
			}
			else if (elem.className == "blockFriendBtn"){
				blockFriendPopup.style.setProperty("display", "flex");
				blockFriendPopup.className = e.target.parentElement.id;
			}
			var bg = document.createElement("div");
			bg.id = "popupBg";
			bg.style.display = "block";
			pos = friendInfo.getBoundingClientRect();
			bg.style.left = `${-pos.left}px`;
			bg.style.top = `${-pos.top}px`;
			if (elem.className == "removeFriendBtn")
				deleteFriendPopup.before(bg);
			else if (elem.className == "blockFriendBtn")
				blockFriendPopup.before(bg);
		})
	})
}

function checkUpdate(){
	if (currentPage == "friends"){
		friendTabIdx = 12;
		pendingFriendTabIdx = 12;
		blockedUserTabIdx = 12;
	
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
					var friends_request = text.friend_requests;
					var blocked_users = text.blocked_users
					allFriendListContainer.innerText = "";
					onlineFriendListContainer.innerText = ""
					pendingFriendRequestListContainer.innerText = ""
					blockedListContainer.innerText = ""
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

					document.getElementById("onlineFriendSelectorCount").innerHTML = `(${onlineFriendListContainer.childElementCount})`;
					document.getElementById("allFriendSelectorCount").innerHTML = `(${allFriendListContainer.childElementCount})`;
					document.getElementById("pendingFriendRequestSelectorCount").innerHTML = `(${pendingFriendRequestListContainer.childElementCount})`;
					document.getElementById("blockedSelectorCount").innerHTML = `(${blockedListContainer.childElementCount})`;

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
					setListeners();
				});
			}
			else {
				client = null;
				myReplaceState(`https://${hostname.host}/login`);
			}
		})
	}
}

checkUpdate();

function friendKeyDownEvent(e) {
	if (e.key == "ArrowLeft" || e.key == "ArrowRight") {
		friendSlides[friendSlideIdx].className = "friendSlide";
		slideSelector[friendSlideIdx].className = "slideSelector";
		if (e.key == "ArrowLeft")
			friendSlideIdx -= 1;
		else
			friendSlideIdx += 1;
		if (friendSlideIdx > friendSlides.length - 1)
			friendSlideIdx = 0;
		if (friendSlideIdx < 0)
			friendSlideIdx = friendSlides.length - 1;
		friendSlides[friendSlideIdx].className = `${friendSlides[friendSlideIdx].className} activeSlide`
		slideSelector[friendSlideIdx].className = `${slideSelector[friendSlideIdx].className} activeSelector`
	}
}

window.addEventListener("keydown", friendKeyDownEvent);