var deleteRequestPopup;
var blockFriendPopup;
var popupBg;
var allFriendListContainer;
var onlineFriendListContainer;
var pendingFriendRequestListContainer;
var blockedListContainer;
var friendInfo;
var friendSlides;
var slideSelector;
var slideIdx = 0;
var slides;
var baseTabIdx = 15;

var template = `
<div id="friendInfo">
	<div id="friendSlideSelectorContainer">
		<div id="friendSlideSelector">
			<div id="onlineFriendSelector" class="slideSelector" tabindex="12">
				<div id="onlineFriendSelectorText" class="slideSelectorText">Online</div>
				<div id="onlineFriendSelectorCount" class="userSlideCount">(0)</div>
			</div>
			<div id="allFriendSelector" class="slideSelector" tabindex="13">
				<div id="allFriendSelectorText" class="slideSelectorText">All</div>
				<div id="allFriendSelectorCount" class="userSlideCount">(0)</div>
			</div>
			<div id="pendingFriendRequestSelector" class="slideSelector" tabindex="14">
				<div id="pendingFriendRequestSelectorText" class="slideSelectorText">Pending</div>
				<div id="pendingFriendRequestSelectorCount" class="userSlideCount">(0)</div>
			</div>
			<div id="blockedSelector" class="slideSelector" tabindex="15">
				<div id="blockedSelectorText" class="slideSelectorText">Blocked</div>
				<div id="blockedSelectorCount" class="userSlideCount">(0)</div>
			</div>
		</div>
	</div>

	<div id="friendSlidesContainer">
		<div id="friendSlides" style="left: 0vw;">
			<div>
				<div class="gradient"></div>
				<div id="onlineFriendList" class="friendSlide"></div>
				<div class="endGradient"></div>
			</div>
			<div>
				<div class="gradient"></div>
				<div id="allFriendList" class="friendSlide"></div>
				<div class="endGradient"></div>
			</div>
			<div>
				<div class="gradient"></div>
				<div id="pendingFriendRequestList" class="friendSlide"></div>
				<div class="endGradient"></div>
			</div>
			<div>
				<div class="gradient"></div>
				<div id="blockedList" class="friendSlide"></div>
				<div class="endGradient"></div>
			</div>
		</div>
		<div style="z-index: 100; position:relative;">
			<div id="popupBg" style="display: none;"></div>
			<div id="deleteFriendPopup">
				<a id="confirmDeleteQuestion">Are you sure you want to remove this friend</a>
				<button id="confirmDelete" aria-label="Are you sure you want to remove this friend, press enter for 'yes', escape for 'no'">I'm sure</button>
			</div>
			<div id="blockFriendPopup">
				<a id="confirmBlockQuestion">Are you sure you want to block this friend</a>
				<button id="confirmBlock" aria-label="Are you sure you want to block this friend, press enter for 'yes', escape for 'no'">I'm sure</button>
			</div>
		</div>
	</div>
</div>`

{
	document.getElementById("container").innerHTML = template;

	slides = document.querySelectorAll(".friendSlide");
	deleteRequestPopup = document.getElementById("deleteRequestPopup");
	blockFriendPopup = document.getElementById("blockFriendPopup");
	popupBg = document.getElementById("popupBg");
	allFriendListContainer = document.getElementById("allFriendList");
	onlineFriendListContainer = document.getElementById("onlineFriendList");
	pendingFriendRequestListContainer = document.getElementById("pendingFriendRequestList");
	blockedListContainer = document.getElementById("blockedList");
	friendInfo = document.getElementById("friendInfo");
	friendSlides = document.querySelectorAll(".friendSlide");
	slideSelector = document.querySelectorAll(".slideSelector");
	const url = new URL(window.location.href);
	history.replaceState("","",`https://${hostname.host}/${currentLang}/friends${url.hash}`)
	var slideIdx = 0;
	if (url.hash == "#online")
		slideIdx = 0;
	else if (url.hash == "#all")
		slideIdx = 1;
	else if (url.hash == "#pending")
		slideIdx = 2;
	else if (url.hash == "#blocked")
		slideIdx = 3;
	else{
		slideIdx = 0;
		history.replaceState("","",`https://${hostname.host}/${currentLang}/friends#online`)
	}


	setNotifTabIndexes(16);

	slideSelector[slideIdx].className = `${slideSelector[slideIdx].className} activeSelector`
	document.getElementById("friendSlides").style.setProperty("left", `-${slideIdx}00vw`);
	var bg = window.getComputedStyle(document.documentElement).getPropertyValue("--active-selector-rgb")
	var underline = window.getComputedStyle(document.documentElement).getPropertyValue("--main-text-rgb");

	document.querySelector("#friendSlideSelector").style.background = `linear-gradient(90deg,rgba(0,0,0,0) ${slideIdx * 25}%, ${bg} ${slideIdx * 25}%, ${bg} ${(slideIdx * 25)+25}%, rgba(0,0,0,0) ${(slideIdx * 25)+25}%)`
	document.querySelector("#friendSlideSelectorContainer").style.background = `linear-gradient(90deg,rgba(0,0,0,0) ${slideIdx * 25}%, ${underline} ${slideIdx * 25}%, ${underline} ${(slideIdx * 25)+25}%, rgba(0,0,0,0) ${(slideIdx * 25)+25}%)`

	slideSelector.forEach(function(key) {
		if (currentPage == "friends"){
			key.addEventListener("click", (e) => {
				unsetTabIndexes(slideIdx);
				var save = slideIdx;
				slideSelector[slideIdx].classList.remove("activeSelector");
				slideIdx = Array.from(slideSelector).indexOf(e.target.closest(".slideSelector"));
				slideSelector[slideIdx].blur();
				if (friendSlides[slideIdx].childElementCount > 0){
					friendSlides[slideIdx].firstChild.lastChild.focus();
				}
				slideSelector[slideIdx].classList.add("activeSelector");
				settingsSlide(save, slideIdx);

			})
			key.addEventListener("keydown", (e) => {
				if (e.key == "Enter"){
					key.click();
				}
			})
		}
	})

	inputSearchUserContainer.style.setProperty("display", "block");
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
	setTimeout(checkFriendPageSize, 10);
}



document.addEventListener("click", (e) => {
	if (currentPage == "friends"){

		if (e.target.parentElement == null || e.target.id == "popupBg"){
			deleteFriendPopup.style.setProperty("display", "none");
			blockFriendPopup.style.setProperty("display", "none");
			document.getElementById("popupBg").style.display = "none";
		}
		if (e.target.id == "confirmDelete"){
			const data = {username: document.getElementById(`a${e.target.parentElement.className}`).textContent};
			fetch('/api/user/remove_friend', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
				credentials: 'include'
			})
			deleteFriendPopup.style.setProperty("display", "none");
			document.getElementById("popupBg").style.display = "none";
		}
		if (e.target.id == "confirmBlock"){
			const data = {username: document.getElementById(`a${e.target.parentElement.className}`).textContent};
			fetch('/api/user/block_friend', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
				credentials: 'include'
			}).then(response => {
				if (response.ok)
				{
					var friend = document.getElementById(e.target.parentElement.className);
					friend.remove();
					var friend = document.getElementById(e.target.parentElement.className);
					friend.remove();
					document.getElementById("allFriendSelectorCount").innerHTML = `(${allFriendListContainer.childElementCount})`;
					document.getElementById("onlineFriendSelectorCount").innerHTML = `(${onlineFriendListContainer.childElementCount})`;
					document.getElementById("blockedSelectorCount").innerHTML = `(${blockedListContainer.childElementCount})`;
				}
			})
			blockFriendPopup.style.setProperty("display", "none");
			document.getElementById("popupBg").style.display = "none";
			fetch('/api/user/current', {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include'
			})
			.then(response => {
				if (response.ok)
				{
					(response.json()).then((text) => {
					blockedUser = Object.values(text.friends).find(user => user.username === data.username);
					if (blockedUser)
					{
						createBlockedUserContainer(blockedUser);
						document.getElementById("blockedSelectorCount").innerHTML = `(${blockedListContainer.childElementCount})`;
					}
					});
				}
			});
		}

		if (e.target.className == "unblockBtn"){
			const data = {username: document.getElementById(`a${e.target.parentElement.id}`).textContent};
			fetch('/api/user/unblock_user', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
				credentials: 'include'
			}).then(response => {
				if (response.ok)
				{
					e.target.closest(".friendContainer").remove();
					document.getElementById("blockedSelectorCount").innerHTML = `(${blockedListContainer.childElementCount})`
				}
			})
		}
		if (e.target.className == "acceptRequestBtn"){
			const data = {username: document.getElementById(`a${e.target.parentElement.id}`).textContent};
			fetch('/api/user/accept_friend_request', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
				credentials: 'include'
			}).then(response => {
				if (response.ok)
				{
					e.target.closest(".friendContainer").remove();
					document.getElementById("pendingFriendRequestSelectorCount").innerHTML = `(${pendingFriendRequestListContainer.childElementCount})`
				}
			})
		}
		if (e.target.className == "rejectRequestBtn"){
			const data = {username: document.getElementById(`a${e.target.parentElement.id}`).textContent};
			fetch('/api/user/reject_friend_request', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
				credentials: 'include'
			}).then(response => {
				if (response.ok)
				{
					e.target.closest(".friendContainer").remove();
					document.getElementById("pendingFriendRequestSelectorCount").innerHTML = `(${pendingFriendRequestListContainer.childElementCount})`
				}
			})
		}
		if (e.target.className == "removeFriendBtn"){
			document.getElementById("popupBg").style.display = "block";
			deleteFriendPopup.style.setProperty("display", "flex");
			deleteFriendPopup.className = e.target.parentElement.id;
			document.querySelector("#confirmDeleteQuestion").innerText = client.langJson['friends']['confirmDeleteQuestion'].replace("${USERNAME}", document.getElementById(`a${e.target.parentElement.id}`).textContent)
			document.querySelector("#confirmDelete").ariaLabel = client.langJson['friends']['aria#confirmDelete'].replace("${USERNAME}", document.getElementById(`a${e.target.parentElement.id}`).textContent);
		}
		if (e.target.className == "blockFriendBtn"){
			document.getElementById("popupBg").style.display = "block"
			blockFriendPopup.style.setProperty("display", "flex");
			blockFriendPopup.className = e.target.parentElement.id;
			document.querySelector("#confirmBlockQuestion").innerText = client.langJson['friends']['confirmBlockQuestion'].replace("${USERNAME}", document.getElementById(`a${e.target.parentElement.id}`).textContent);
			document.querySelector("#confirmBlock").ariaLabel = client.langJson['friends']['aria#confirmBlock'].replace("${USERNAME}", document.getElementById(`a${e.target.parentElement.id}`).textContent);
		}
		if (e.target.closest(".friendsOptionContainer")){
			e.target.closest(".friendsOptionContainer").classList.add("activeListSelector");
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
	var moreBtn = document.createElement("div");

	var userOptionContainer = document.createElement("div");
	var userOption = document.createElement("div");

	friendContainer.className = "friendContainer"
	friendContainer.id = `id${user.id}`;

	friendName.className = "friendName";
	friendName.href = (`https://${hostname.host}/${currentLang}/user/${user.username}`);
	friendName.id = `aid${user.id}`;

	pfpContainer.className = "pfpContainer";
	pfp.className = "profilePicture";
	addPfpUrlToImgSrc(pfp, user.pfp);

	pfpContainer.appendChild(pfp);

	friendName.innerHTML = user.username;

	friendContainer.appendChild(pfpContainer);
	friendContainer.appendChild(friendName);

	moreBtn.className = "moreBtn";

	removeFriendBtn.className = "removeFriendBtn";
	removeFriendBtn.setAttribute("aria-label", client.langJson['friends']['aria.removeFriendBtn']);

	blockFriendBtn.className = "blockFriendBtn";
	blockFriendBtn.setAttribute("aria-label", client.langJson['friends']['aria.blockFriendBtn']);

	acceptBtn.className = "acceptRequestBtn";
	acceptBtn.setAttribute("aria-label", client.langJson['friends']['aria.acceptRequestBtn']);

	rejectBtn.className = "rejectRequestBtn";
	rejectBtn.setAttribute("aria-label", client.langJson['friends']['aria.rejectRequestBtn']);

	unblockBtn.className = "unblockBtn";
	unblockBtn.setAttribute("aria-label", client.langJson['friends']['aria.unblockBtn']);

	userOptionContainer.className = "friendsOptionContainer";
	userOption.className = "friendsOption";
	userOption.id = "id" + user.id;

	userOption.appendChild(unblockBtn);
	userOption.appendChild(acceptBtn);
	userOption.appendChild(rejectBtn);
	userOption.appendChild(removeFriendBtn);
	userOption.appendChild(blockFriendBtn);

	userOptionContainer.appendChild(moreBtn);
	userOptionContainer.appendChild(userOption);

	friendContainer.appendChild(userOptionContainer);

	userOptionContainer.querySelectorAll(".friendsOption div").forEach(function (elem) {
		elem.onfocus = function() {window.onkeydown = null;}
		elem.onblur = function() {window.onkeydown = friendKeyDownEvent;}
		elem.onkeydown = function(e) {if (e.key == "Enter") {elem.click()}}
		elem.onkeyup = function(e){
			if (elem.className == "removeFriendBtn"){
				document.getElementById("confirmDelete").tabIndex = elem.parentElement.parentElement.tabIndex;
				document.getElementById("confirmDelete").focus();
			}
			else if (elem.className == "blockFriendBtn"){
				document.getElementById("confirmBlock").tabIndex = elem.parentElement.parentElement.tabIndex;
				document.getElementById("confirmBlock").focus();
			}
		}
	});

	userOptionContainer.onfocus = function () {
		window.onkeydown = null;
		document.querySelectorAll(".activeListSelector").forEach(function (active){
			active.classList.remove("activeListSelector");
		})
	};
	userOptionContainer.onblur = function () {window.onkeydown = friendKeyDownEvent};
	userOptionContainer.onkeydown = function (e) {
		if (e.key == "Enter"){
			if (e.target.classList.contains("friendsOptionContainer")){	// to prevent this event to apply to children of .friendsOptionContainer
				userOptionContainer.classList.add("activeListSelector");
				userOptionContainer.lastChild.firstChild.focus();
			}
		}
	}

	return (friendContainer);
}

function unsetTabIndexes(slideIdx){
	var slide = slides[slideIdx];

	slide.querySelectorAll(".friendsOptionContainer").forEach(function(elem){
		elem.tabIndex = -1;
		if (elem.querySelector(".removeFriendBtn"))
			elem.querySelector(".removeFriendBtn").tabIndex = -1;

		if (elem.querySelector(".blockFriendBtn"))
			elem.querySelector(".blockFriendBtn").tabIndex = -1;

		if (elem.querySelector(".acceptRequestBtn"))
			elem.querySelector(".acceptRequestBtn").tabIndex = -1;

		if (elem.querySelector(".rejectRequestBtn"))
			elem.querySelector(".rejectRequestBtn").tabIndex = -1;

		if (elem.querySelector(".unblockBtn"))
			elem.querySelector(".unblockBtn").tabIndex = -1;
	})
}

function setTabIndexes(slideIdx){
	var slide = slides[slideIdx];
	var tmpIdx = baseTabIdx;

	slide.querySelectorAll(".friendsOptionContainer").forEach(function(elem){
		elem.tabIndex = tmpIdx++;
		if (elem.querySelector(".removeFriendBtn"))
			elem.querySelector(".removeFriendBtn").tabIndex = tmpIdx++;

		if (elem.querySelector(".blockFriendBtn"))
			elem.querySelector(".blockFriendBtn").tabIndex = tmpIdx++;

		if (elem.querySelector(".acceptRequestBtn"))
			elem.querySelector(".acceptRequestBtn").tabIndex = tmpIdx++;

		if (elem.querySelector(".rejectRequestBtn"))
			elem.querySelector(".rejectRequestBtn").tabIndex = tmpIdx++;

		if (elem.querySelector(".unblockBtn"))
			elem.querySelector(".unblockBtn").tabIndex = tmpIdx++;
	})
	setNotifTabIndexes(tmpIdx);
}

function createFriendContainer(user){
	var friendContainer = document.createElement("div");
	var friendsOptionContainer = document.createElement("div");

	friendContainer = createUserContainer(user);

	friendContainer.querySelectorAll(".unblockBtn, .acceptRequestBtn, .rejectRequestBtn").forEach(function (elem) {
		elem.remove();
	})
	friendsOptionContainer = friendContainer.getElementsByClassName("friendsOptionContainer")[0];

	friendsOptionContainer.setAttribute("aria-label", `${user.username} ${client.langJson['friends']['aria#allFriendList .friendsOptionContainer']}`);

	if (user.is_active == true){
		var clone = friendContainer.cloneNode(true);
		var img = clone.querySelector(".profilePicture");
		addPfpUrlToImgSrc(img, `${img.src}`);
		clone.querySelectorAll(".friendsOption div").forEach(function (elem) {
			elem.onfocus = function() {window.onkeydown = null;}
			elem.onblur = function() {window.onkeydown = friendKeyDownEvent;}
			elem.onkeydown = function(e) {if (e.key == "Enter") {elem.click()}}
			elem.onkeyup = function(e){
				if (elem.className == "removeFriendBtn"){
					document.getElementById("confirmDelete").tabIndex = elem.parentElement.parentElement.tabIndex;
					document.getElementById("confirmDelete").focus();
				}
				else if (elem.className == "blockFriendBtn"){
					document.getElementById("confirmBlock").tabIndex = elem.parentElement.parentElement.tabIndex;
					document.getElementById("confirmBlock").focus();
				}
			}
		});
		clone.querySelectorAll(".friendsOptionContainer").forEach(function (elem){
			elem.onfocus = function () {
				window.onkeydown = null;
				document.querySelectorAll(".activeListSelector").forEach(function (active){
					active.classList.remove("activeListSelector");
				})
			};
			elem.onblur = function () {window.onkeydown = friendKeyDownEvent};
			elem.onkeydown = function (e) {
				if (e.key == "Enter"){
					if (e.target.classList.contains("friendsOptionContainer")){	// to prevent this event to apply to children of .friendsOptionContainer
						elem.classList.add("activeListSelector");
						elem.lastChild.firstChild.focus();
					}
				}
			}


		})
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
	friendsOptionContainer.setAttribute("aria-label", `${user.username} ${client.langJson['friends']['aria #pendingFriendRequestList .friendsOptionContainer']}`);
	pendingFriendRequestListContainer.appendChild(friendContainer);
}

function createBlockedUserContainer(user){
	var friendContainer = createUserContainer(user);

	friendContainer.querySelectorAll(".acceptRequestBtn, .rejectRequestBtn, .removeFriendBtn, .blockFriendBtn").forEach(function (elem) {
		elem.remove();
	})

	var friendsOptionContainer = friendContainer.getElementsByClassName("friendsOptionContainer")[0];

	friendsOptionContainer.setAttribute("aria-label", `${user.username} ${client.langJson['friends']['aria #blockedList .friendsOptionContainer']}`);

	blockedListContainer.appendChild(friendContainer);
	document.getElementById("blockedSelectorCount").innerHTML = `(${blockedListContainer.childElementCount})`;
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
					baseTabIdx = 15;
					switchTheme(text.theme_name);
					currentLangPack = text.lang;
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
					for (var i=0; i<4;i++)
						unsetTabIndexes(i)
					setTabIndexes(slideIdx);
				});
			}
			else {
				client = null;
				myReplaceState(`https://${hostname.host}/${currentLang}/login#login`);
			}
		})
	}
}


function friendKeyDownEvent(e) {
	if (e.key == "ArrowLeft" || e.key == "ArrowRight") {
		var save = slideIdx;
		unsetTabIndexes(slideIdx)
		friendSlides[slideIdx].className = "friendSlide";
		slideSelector[slideIdx].className = "slideSelector";
		if (e.key == "ArrowLeft")
			slideIdx -= 1;
		else
			slideIdx += 1;
		if (slideIdx > friendSlides.length - 1)
			slideIdx = 0;
		if (slideIdx < 0)
			slideIdx = friendSlides.length - 1;
		slideSelector[slideIdx].className = `${slideSelector[slideIdx].className} activeSelector`
		slideSelector[slideIdx].focus();
		settingsSlide(save, slideIdx)
	}
}

window.onkeydown = friendKeyDownEvent;

async function updateFriendsAriaLabel(key, content){
	document.querySelectorAll(key).forEach(function (elem) {
		elem.setAttribute("aria-label", `${elem.parentElement.id} ${content}`);
	})
}

function settingsSlide(formerIdx, newerIdx){

	var tmp = document.querySelector("#friendSlides");
	var left = tmp.getBoundingClientRect().left;
	var move = [
		{ left: `${left}px`},
		{ left: `-${slideIdx}00%`}
	];
	var time = {
		duration: 500,
		iterations: 1,
	}
	tmp.animate(move, time);
	tmp.style.setProperty("left", `-${slideIdx}00%`)


	var bg = window.getComputedStyle(document.documentElement).getPropertyValue("--active-selector-rgb");
	var underline = window.getComputedStyle(document.documentElement).getPropertyValue("--main-text-rgb");
	var move = [], moveUnderline = [];
	var increment = (formerIdx < newerIdx ? 1 : -1) * Math.abs(formerIdx - newerIdx);
	let i = formerIdx * 25
	for (let count = 0;count <= 25 ;i += increment, count++){
		move.push({background : `linear-gradient(90deg,rgba(0,0,0,0) ${i}%, ${bg} ${i}%, ${bg} ${i + 25}%, rgba(0,0,0,0) ${i + 25}%)`});
		moveUnderline.push({background : `linear-gradient(90deg,rgba(0,0,0,0) ${i}%, ${underline} ${i}%, ${underline} ${i + 25}%, rgba(0,0,0,0) ${i + 25}%)`});
	}
	var time = {
		duration: 500,
		iterations: 1,
	}
	document.querySelector("#friendSlideSelector").animate(move, time);
	document.querySelector("#friendSlideSelector").style.background = move[move.length - 1].background;

	document.querySelector("#friendSlideSelectorContainer").animate(moveUnderline, time);
	document.querySelector("#friendSlideSelectorContainer").style.background = moveUnderline[moveUnderline.length - 1].background;

	history.replaceState("","",`https://${hostname.host}/${currentLang}/friends${friendHashMap[newerIdx]}`)
	document.title = langJson['friends'][`${friendHashMap[newerIdx].replace("#","")} title`];
	setTabIndexes(slideIdx);
}
