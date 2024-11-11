var deleteRequestPopup;
var blockFriendPopup;
var popupBg;
var sendFriendRequestBtn;
var allFriendListContainer;
var onlineFriendListContainer;
var pendingFriendRequestListContainer;
var blockedListContainer;
var friendInfo;
var friendSlides;
var slideSelector;
var friendSlideIdx = 0;
var slides;

var template = `
<div id="friendInfo">
	<div id="friendSlideSelector">
		<div id="onlineFriendSelector" class="slideSelector" tabindex="12">
			<div id="onlineFriendSelectorText">Online</div>
			<div id="onlineFriendSelectorCount" class="userSlideCount">(0)</div>
		</div>
		<div id="allFriendSelector" class="slideSelector" tabindex="13">
			<div id="allFriendSelectorText">All</div>
			<div id="allFriendSelectorCount" class="userSlideCount">(0)</div>
		</div>
		<div id="pendingFriendRequestSelector" class="slideSelector" tabindex="14">
			<div id="pendingFriendRequestSelectorText">Pending</div>
			<div id="pendingFriendRequestSelectorCount" class="userSlideCount">(0)</div>
		</div>
		<div id="blockedSelector" class="slideSelector" tabindex="15">
			<div id="blockedSelectorText">Blocked</div>
			<div id="blockedSelectorCount" class="userSlideCount">(0)</div>
		</div>
		<div id="slideSelectorBg"></div>
	</div>

	<div id="friendSlides">
		<div>
			<div id="onlineFriendList" class="friendSlide activeSlide"></div>
		</div>
		<div>
			<div id="allFriendList" class="friendSlide"></div>
		</div>
		<div>
			<div id="pendingFriendRequestList" class="friendSlide"></div>
		</div>
		<div>
			<div id="blockedList" class="friendSlide"></div>
		</div>
	<div>

</div>
<div style="z-index: 1;">
	<div id="popupBg" style="display: none;"></div>
	<div id="deleteFriendPopup">
		<a id="confirmDeleteQuestion">Are you sure you want to remove this friend</a>
		<button id="confirmDelete" aria-label="Are you sure you want to remove this friend, press enter for 'yes', escape for 'no'">I'm sure</button>
	</div>
	<div id="blockFriendPopup">
		<a id="confirmBlockQuestion">Are you sure you want to block this friend</a>
		<button id="confirmBlock" aria-label="Are you sure you want to block this friend, press enter for 'yes', escape for 'no'">I'm sure</button>
	</div>
</div>`

{	
	document.getElementById("container").innerHTML = template;

	slides = document.querySelectorAll(".friendSlide");
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

	friendSlides[friendSlideIdx].className = `${friendSlides[friendSlideIdx].className} activeSlide`
	slideSelector[friendSlideIdx].className = `${slideSelector[friendSlideIdx].className} activeSelector`
	
	slideSelector.forEach(function(key) {
		if (currentPage == "friends"){
			key.addEventListener("click", (e) => {
				var save = friendSlideIdx;
				slideSelector[friendSlideIdx].classList.remove("activeSelector");
				friendSlideIdx = Array.from(slideSelector).indexOf(e.target.closest(".slideSelector"));
				if (friendSlides[friendSlideIdx].childElementCount > 0){
					friendSlides[friendSlideIdx].firstChild.lastChild.focus();
				}
				slideSelector[friendSlideIdx].classList.add("activeSelector");
				var tmp = document.querySelector("#friendSlides");
				var left = tmp.getBoundingClientRect().left;
				var move = [
					{ left: `${left}px`},
					{ left: `-${friendSlideIdx}00vw`}
				];
				var time = {
					duration: 500,
					iterations: 1,
				}
				tmp.animate(move, time);
				tmp.style.setProperty("left", `-${friendSlideIdx}00vw`)

				tmp = document.querySelector("#slideSelectorBg");
				move = [
					{ left: `${save * 25}%`},
					{ left: `${friendSlideIdx * 25}%`}
				];
				time = {
					duration: 500,
					iterations: 1,
				}
				tmp.animate(move, time);
				tmp.style.setProperty("left", `${friendSlideIdx * 25}%`)
			})
			key.addEventListener("keydown", (e) => {
				if (e.key == "Enter"){
					key.click();
				}
			})
		}
	})

	inputSearchUserContainer.style.setProperty("display", "block");
	slideSelector[friendSlideIdx].focus();
	dropDownUserContainer.style.setProperty("display", "flex");
	homeBtn.style.setProperty("display", "block");
	notifCenterContainer.style.setProperty("display", "flex");

	checkUpdate();

	document.querySelectorAll("#confirmDelete, #confirmBlock, #unblockBtn").forEach(function (elem) {
		elem.addEventListener("focus", (e)=>{
			window.onkeydown = null;
		});
		elem.addEventListener("focusout", (e)=>{
			window.onkeydown = friendKeyDownEvent;
		});
	})
}



document.addEventListener("click", (e) => {
	if (currentPage == "friends"){
		if (e.target.parentElement == null || e.target.id == "popupBg"){
			deleteFriendPopup.style.setProperty("display", "none");
			blockFriendPopup.style.setProperty("display", "none");
			document.getElementById("popupBg").style.display = "none";
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
			document.getElementById("popupBg").style.display = "none";
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
			document.getElementById("popupBg").style.display = "none";
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
			e.target.closest(".friendContainer").remove();
		}
		if (e.target.className == "acceptRequestBtn"){
			const data = {username: e.target.parentElement.id};
			fetch('/api/user/accept_friend_request', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
				credentials: 'include'
			})
			e.target.closest(".friendContainer").remove();
		}
		if (e.target.className == "rejectRequestBtn"){
			const data = {username: e.target.parentElement.id};
			fetch('/api/user/reject_friend_request', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
				credentials: 'include'
			})
			e.target.closest(".friendContainer").remove();
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
			document.getElementById("popupBg").style.display = "none";
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
	var removeFriendBtn = document.createElement("div");
	var blockFriendBtn = document.createElement("div");
	var friendsOption = document.createElement("div");
	var moreBtn = document.createElement("div");

	var userOptionContainer = document.createElement("div");
	var userOption = document.createElement("div");

	friendContainer.className = "friendContainer"
	friendContainer.id = user.username;

	pfpContainer.className = "pfpContainer";
	pfp.className = "profilePicture";
	addPfpUrlToImgSrc(pfp, user.pfp);

	pfpContainer.appendChild(pfp);

	friendName.innerHTML = user.username;

	friendContainer.appendChild(pfpContainer);
	friendContainer.appendChild(friendName);

	friendsOption.className = "friendsOption"
	moreBtn.className = "moreBtn";

	removeFriendBtn.className = "removeFriendBtn";
	removeFriendBtn.setAttribute("aria-label", client.langJson['friends']['aria.removeFriendBtn']);

	blockFriendBtn.className = "blockFriendBtn";
	blockFriendBtn.setAttribute("aria-label", client.langJson['friends']['aria.blockFriendBtn']);

	acceptBtn.className = "acceptRequestBtn";
	acceptBtn.setAttribute("aria-label", client.langJson['friends']['aria.acceptFriendBtn']);

	rejectBtn.className = "rejectRequestBtn";
	rejectBtn.setAttribute("aria-label", client.langJson['friends']['aria.rejectFriendBtn']);

	unblockBtn.className = "unblockBtn";
	unblockBtn.setAttribute("aria-label", client.langJson['friends']['aria.unblockBtn']);

	userOptionContainer.className = "friendsOptionContainer";
	userOption.className = "friendsOption";
	userOption.id = user.username;

	userOption.appendChild(unblockBtn);
	userOption.appendChild(acceptBtn);
	userOption.appendChild(rejectBtn);
	userOption.appendChild(removeFriendBtn);
	userOption.appendChild(blockFriendBtn);

	userOptionContainer.appendChild(moreBtn);
	userOptionContainer.appendChild(userOption);

	friendContainer.appendChild(userOptionContainer);
	return (friendContainer);
}

function createFriendContainer(user){
	var friendContainer = document.createElement("div");
	var friendsOptionContainer = document.createElement("div");
	var removeFriendBtn = document.createElement("div");
	var blockFriendBtn = document.createElement("div");

	friendContainer = createUserContainer(user);

	friendContainer.querySelectorAll(".unblockBtn, .acceptRequestBtn, .rejectRequestBtn").forEach(function (elem) {
		elem.remove();
	})
	friendsOptionContainer = friendContainer.getElementsByClassName("friendsOptionContainer")[0];

	friendsOptionContainer.setAttribute("aria-label", `${user.username} ${client.langJson['friends']['ariaAll.friendsOptionContainer']}`);
	friendsOptionContainer.tabIndex = friendTabIdx;
	friendTabIdx += 1;

	removeFriendBtn = friendsOptionContainer.getElementsByClassName("removeFriendBtn")[0];
	removeFriendBtn.tabIndex = friendTabIdx;
	friendTabIdx += 1;

	blockFriendBtn = friendsOptionContainer.getElementsByClassName("blockFriendBtn")[0];
	blockFriendBtn.tabIndex = friendTabIdx;
	friendTabIdx += 1;

	if (user.is_active == true || true){ //DEBUG
		var clone = friendContainer.cloneNode(true);
		var img = clone.querySelector(".profilePicture");
		addPfpUrlToImgSrc(img, `${img.src}`);
		onlineFriendListContainer.appendChild(clone);
	}
	allFriendListContainer.appendChild(friendContainer);
}

function createFriendRequestContainer(user){
	var friendContainer = createUserContainer(user);

	friendContainer.querySelectorAll(".unblockBtn, .removeFriendBtn, .blockFriendBtn").forEach(function (elem) {
		elem.remove();
	})
	var friendsOptionContainer = friendContainer.getElementsByClassName("friendsOptionContainer")[0];
	friendsOptionContainer.setAttribute("aria-label", `${user.username} ${client.langJson['friends']['ariaPending.friendsOptionContainer']}`);
	friendsOptionContainer.tabIndex = pendingFriendTabIdx;
	pendingFriendTabIdx += 1;
	friendContainer.getElementsByClassName("acceptRequestBtn")[0].tabIndex = pendingFriendTabIdx;
	pendingFriendTabIdx += 1;
	friendContainer.getElementsByClassName("rejectRequestBtn")[0].tabIndex = pendingFriendTabIdx;
	pendingFriendTabIdx += 1;
	pendingFriendRequestListContainer.appendChild(friendContainer);
}

function createBlockedUserContainer(user){
	var friendContainer = createUserContainer(user);

	friendContainer.querySelectorAll(".acceptRequestBtn, .rejectRequestBtn, .removeFriendBtn, .blockFriendBtn").forEach(function (elem) {
		elem.remove();
	})

	var friendsOptionContainer = friendContainer.getElementsByClassName("friendsOptionContainer")[0];

	friendsOptionContainer.setAttribute("aria-label", `${user.username} ${client.langJson['friends']['ariaBlocked.friendsOptionContainer']}`);
	friendsOptionContainer.tabIndex = blockedUserTabIdx;
	blockedUserTabIdx += 1;

	friendContainer.getElementsByClassName("unblockBtn")[0].tabIndex = blockedUserTabIdx;
	blockedUserTabIdx += 1;

	blockedListContainer.appendChild(friendContainer);
}

function setListeners(){
	document.querySelectorAll(".friendsOptionContainer").forEach(function (elem) {
		elem.addEventListener("focus", (e)=>{
			window.onkeydown = null;
			document.querySelectorAll(".activeListSelector").forEach(function (active){
				active.classList.remove("activeListSelector");
			})
		});

		elem.addEventListener("focusout", (e)=>{
			window.onkeydown = friendKeyDownEvent;
		});
		elem.addEventListener("keydown", (e) => {
			if (e.key == "Enter"){
				if (e.target.classList.contains("friendsOptionContainer")){	// to prevent this event to apply to children of .friendsOptionContainer
					elem.classList.add("activeListSelector");
					elem.lastChild.firstChild.focus();
				}
			}
		});
		elem.addEventListener("click", (e) => {
			elem.classList.add("activeListSelector");
		})
	})

	document.querySelectorAll(".friendsOption div, .acceptRequestBtn, .rejectRequestBtn, .unblockBtn").forEach(function (elem) {
		elem.addEventListener("focus", (e)=>{
			window.onkeydown = null;
		});
		elem.addEventListener("focusout", (e)=>{
			window.onkeydown = friendKeyDownEvent;
		});
		elem.addEventListener("keydown", (e) => {
			if (e.key == "Enter"){
				elem.click();
			}
		});
	});
	document.querySelectorAll(".friendsOption div").forEach(function (elem) {
		elem.addEventListener("keyup", (e) => {
			if (elem.className == "removeFriendBtn"){
				document.getElementById("confirmDelete").tabIndex = elem.parentElement.parentElement.tabIndex;
				document.getElementById("confirmDelete").focus();
			}
			else if (elem.className == "blockFriendBtn"){
				document.getElementById("confirmBlock").tabIndex = elem.parentElement.parentElement.tabIndex;
				document.getElementById("confirmBlock").focus();
			}
		})
		elem.addEventListener("click", (e) => {
			if (document.getElementById("popupBg").style.getPropertyValue("display") == "block"){
				document.getElementById("popupBg").style.display = "none";
				blockFriendPopup.style.setProperty("display", "none");
				deleteFriendPopup.style.setProperty("display", "none");
			}
			if (elem.className == "removeFriendBtn"){
				document.getElementById("popupBg").style.display = "block";
				deleteFriendPopup.style.setProperty("display", "flex");
				deleteFriendPopup.className = e.target.parentElement.id;
			}
			else if (elem.className == "blockFriendBtn"){
				document.getElementById("popupBg").style.display = "block"
				blockFriendPopup.style.setProperty("display", "flex");
				blockFriendPopup.className = e.target.parentElement.id;
			}
		})
	})
}

function checkUpdate(){
	if (currentPage == "friends"){
		friendTabIdx = 15;
		pendingFriendTabIdx = 15;
		blockedUserTabIdx = 15;

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
					switchTheme(text.theme_name);
					currentLang = text.lang;
					allFriendListContainer.innerText = "";
					onlineFriendListContainer.innerText = ""
					pendingFriendRequestListContainer.innerText = ""
					blockedListContainer.innerText = ""
					Object.keys(text.friends).forEach(function(key) {
						createFriendContainer(text.friends[key]);
					});
					Object.keys(text.friend_requests).forEach(function(key) {
						createFriendRequestContainer(text.friend_requests[key]);
					});

					Object.keys(text.blocked_users).forEach(function(key) {
						createBlockedUserContainer(text.blocked_users[key]);
					});
					loadCurrentLang();
					document.getElementById("onlineFriendSelectorCount").innerHTML = `(${onlineFriendListContainer.childElementCount})`;
					document.getElementById("allFriendSelectorCount").innerHTML = `(${allFriendListContainer.childElementCount})`;
					document.getElementById("pendingFriendRequestSelectorCount").innerHTML = `(${pendingFriendRequestListContainer.childElementCount})`;
					document.getElementById("blockedSelectorCount").innerHTML = `(${blockedListContainer.childElementCount})`;
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


function friendKeyDownEvent(e) {
	if (e.key == "ArrowLeft" || e.key == "ArrowRight") {
		var save = friendSlideIdx;
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
		/*friendSlides[friendSlideIdx].className = `${friendSlides[friendSlideIdx].className} activeSlide`*/
		slideSelector[friendSlideIdx].className = `${slideSelector[friendSlideIdx].className} activeSelector`
		slideSelector[friendSlideIdx].focus();

		var tmp = document.querySelector("#friendSlides");
		var left = tmp.getBoundingClientRect().left;
		var move = [
			{ left: `${left}px`},
			{ left: `-${friendSlideIdx}00%`}
		];
		var time = {
			duration: 500,
			iterations: 1,
		}
		tmp.animate(move, time);
		tmp.style.setProperty("left", `-${friendSlideIdx}00%`)

		tmp = document.querySelector("#slideSelectorBg");
		move = [
			{ left: `${save * 25}%`},
			{ left: `${friendSlideIdx * 25}%`}
		];
		time = {
			duration: 500,
			iterations: 1,
		}
		tmp.animate(move, time);
		tmp.style.setProperty("left", `${friendSlideIdx * 25}%`)
	}
}

window.onkeydown = friendKeyDownEvent;

async function updateFriendsAriaLabel(key, content){
	if (key.startsWith("All"))
		document.querySelectorAll(key.substring(3)).forEach(function (elem) {
			elem.setAttribute("aria-label", `${elem.parentElement.id} ${content}`);
	})
	if (key.startsWith("Pending") || key.startsWith("Blocked"))
		document.querySelectorAll(key.substring(7)).forEach(function (elem) {
			elem.setAttribute("aria-label", `${elem.parentElement.id} ${content}`);
	})
}
