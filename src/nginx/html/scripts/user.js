var pointAppearanceDelay = 25; // default is 50 (higher the delay, slower the points will appeare on graph)
var sendFriendRequestBtn;
var allMatchesButton;

var profileFriendsButton = `
		<div id="profileFriendsButton">
			<button tabindex="12" id="sendFriendRequestBtn">Send friend request</button>
			<button tabindex="12" id="deleteFriendBtn">Remove friend</button>
			<button tabindex="13" id="blockBtn">Block</button>
			<button tabindex="13" id="unblockBtn">Unblock</button>
		</div>
`

var template = `
<div id="pageContentContainer" class="user">
	<div id="profileInfoContainer">
		<div id="profileInfo">
			<div id="profilePfpContainer">
				<img id="profilePfp"></img>
			</div>
			<div id="profileNameContainer">
				<h1 id="profileName">Default</h1>
			</div>
		</div>
		${profileFriendsButton}
	</div>

	<div id="recentMatchHistoryContainer" tabindex="15" aria-label="User today's matches">
		<div id="MatchHistoryTextContainer">
			<div>
				<div id="recentMatchHistoryText">Recent matches</div>
			</div>
			<a> | </a>
			<div>
				<div tabindex="14" id="allMatchesHistoryBtn">All matches</div>
			</div>
		</div>
		<div id="recentMatchHistory">

		</div>
	</div>
	<div style="z-index: 100; position:fixed;">
		<div id="popupBg" style="display: none;"></div>
		<div id="deleteFriendPopup">
			<a id="confirmDeleteQuestion">Are you sure you want to remove this friend</a>
			<button id="confirmDelete" aria-label="Are you sure you want to remove this friend, press enter for 'yes', escape for 'no'">I'm sure</button>
		</div>
		<div id="blockFriendPopup">
			<a id="confirmBlockQuestion">Are you sure you want to block this user</a>
			<button id="confirmBlock" aria-label="Are you sure you want to block this friend, press enter for 'yes', escape for 'no'">I'm sure</button>
		</div>
	</div>
</div>
`

function updateUserLang(){
    var splitPath = window.location.href.split('/');
    if (document.querySelector('#notPlayedToday'))
        document.querySelector('#notPlayedToday').innerText = client.langJson['user']['#notPlayedToday'].replace("${USERNAME}", splitPath[5]);
	document.title = langJson['user'][`user title`].replace("${USERNAME}", splitPath[5]);

}

{
	document.getElementById("container").innerHTML = template;

    sendFriendRequestBtn = document.getElementById("sendFriendRequestBtn");
    allMatchesButton = document.getElementById("allMatchesHistoryBtn");
    removeFriendBtn = document.getElementById("deleteFriendBtn");

	window.onkeydown = function(e){
		if (e.key == "Escape" && document.getElementById("popupBg").style.getPropertyValue("display") != "none"){
			document.getElementById("popupBg").style.setProperty("display", "none");
			document.getElementById("deleteFriendPopup").style.setProperty("display", "none");
			document.getElementById("blockFriendPopup").style.setProperty("display", "none")
		}
	}

    if (sendFriendRequestBtn){
        var splitPath = window.location.href.split('/');
        sendFriendRequestBtn.addEventListener("click", (e) => {
            fetch('/api/user/send_friend_request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({'username': splitPath[5]}),
                credentials: 'include'
            })
        })
    }

	inputSearchUserContainer.style.setProperty("display", "block");
	document.getElementById("inputSearchUser").focus();
	dropDownUserContainer.style.setProperty("display", "flex");
	homeBtn.style.setProperty("display", "block");
	notifCenterContainer.style.setProperty("display", "flex");

    var splitPath = window.location.href.split('/');

	if (splitPath[5] == client.username){
		document.querySelector("#profileFriendsButton").remove();
	}
	else{
		if (client.blocked_user[splitPath[5]] || client.friends[splitPath[5]] != null){
			document.getElementById("sendFriendRequestBtn").style.setProperty("display", "none");
		}
		if (client.blocked_user[splitPath[5]] || client.friends[splitPath[5]] == null){
			document.getElementById("deleteFriendBtn").style.setProperty("display", "none");
		}
		if (!client.blocked_user[splitPath[5]]){
			document.getElementById("unblockBtn").style.setProperty("display", "none");
		}
		else{
			document.getElementById("blockBtn").style.setProperty("display", "none");
		}
	}

    var startDate = new Date();
    startDateStr = `${startDate.getFullYear()}-${startDate.getMonth() + 1}-${startDate.getDate()}`
	var tabIdx = 15;
	history.replaceState("","",`https://${hostname.host}/${currentLang}/user/${splitPath[5]}`)

    fetch('/api/user/get', {
        method: 'POST', //GET forbid the use of body :(
        headers: {'Content-Type': 'application/json',},
        body: JSON.stringify({"name" : splitPath[5], "startDate" : startDateStr, "endDate" : startDateStr}),
        credentials: 'include'
    }).then(user => {
        if (user.ok){
            user.json().then((user) => {
                profilePfp = document.getElementById("profilePfp");
                document.getElementById("profileName").innerHTML = user.username;
                document.getElementById("profilePfp").style.setProperty("display", "block");
                profilePfp.innerHTML = "";
            	addPfpUrlToImgSrc(profilePfp, user.pfp);

                recentMatchHistoryContainer = document.getElementById("recentMatchHistory");
                try{
                    matchObj = user.matches[startDate.getFullYear()][startDate.getMonth() + 1][startDate.getDate()]; // get matches object of today
                    recentMatchHistoryContainer.innerHTML = "";
                    for (var i=0; i<Object.keys(matchObj).length && i<5;i++){
                        recentMatchHistoryContainer.appendChild(createMatchResumeContainer(matchObj[i], user.username, user.display_name));
                    };
					(async () => (loadCurrentLang()))();

                    var container = document.getElementById("recentMatchHistoryContainer");
                    container.addEventListener("keydown", (e) => {
                        if (e.key == "Enter"){
                            document.querySelectorAll(".matchDescContainer").forEach(function (elem) {
                                if (elem.tabIndex <= container.tabIndex){
                                    elem.tabIndex = tabIdx;
                                    tabIdx += 1;
                                }
                            });
                            setNotifTabIndexes(tabIdx);
                        }
                    });
                }
                catch{

					if (!document.querySelector("#notPlayedToday")){
						var messageContainer = document.createElement("div");
						var message = document.createElement("a");
						recentMatchHistoryContainer.style.setProperty("background", "var(--input-bg-rgb)");
						recentMatchHistoryContainer.style.setProperty("align-items", "center");
						recentMatchHistoryContainer.style.setProperty("justify-content", "center");
						messageContainer.id = "notPlayedTodayContainer";
						message.id="notPlayedToday";
						message.innerText = client.langJson['user']['#notPlayedToday'].replace("${USERNAME}", splitPath[5]);
						messageContainer.appendChild(message);
						recentMatchHistoryContainer.appendChild(messageContainer);
					}
                }
				checkMatchResumeSize();
				setNotifTabIndexes(tabIdx);
				checkUserPageSize();
            })
        }
		else if (user.status == 403)
            client.loadPage("/403");
        else{
            client.loadPage("/404");
        }
    })
}

allMatchesButton.addEventListener("click", (e) => {
    myPushState(`https://${hostname.host}/${currentLang}/dashboard/${splitPath[5]}`);
})

allMatchesButton.addEventListener("keydown", (e) => {
    if (e.key == "Enter")
        myPushState(`https://${hostname.host}/${currentLang}/dashboard/${splitPath[5]}`);
})

document.addEventListener("click", (e) => {
	if (currentPage == "user"){
		var splitPath = window.location.href.split('/');
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
			.then(response => {
				if (response.ok){
					document.getElementById("unblockBtn").style.setProperty("display", "none");
					document.getElementById("blockBtn").style.setProperty("display", "block");
					document.getElementById("sendFriendRequestBtn").style.setProperty("display", "block");
					deleteFriendPopup.style.setProperty("display", "none");
					document.getElementById("popupBg").style.display = "none";
				}
			})
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
			.then(response => {
				if (response.ok)
				{
					document.getElementById("unblockBtn").style.setProperty("display", "block");
					document.getElementById("blockBtn").style.setProperty("display", "none");
					document.getElementById("sendFriendRequestBtn").style.setProperty("display", "none");
					blockFriendPopup.style.setProperty("display", "none");
				}
				else
				{
					if (response.status == 401)
					{
						popUpError(client.langJson['friends']['blockError']);
					}
					blockFriendPopup.style.setProperty("display", "none");
					document.getElementById("popupBg").style.display = "none";
				}
			})
		}

		if (e.target.id == "deleteFriendBtn"){
			document.getElementById("popupBg").style.display = "block";
			deleteFriendPopup.style.setProperty("display", "flex");
			deleteFriendPopup.className = splitPath[5];
			document.querySelector("#confirmDeleteQuestion").innerText = client.langJson['friends']['confirmDeleteQuestion'].replace("${USERNAME}", splitPath[5]);
			document.querySelector("#confirmDelete").ariaLabel = client.langJson['friends']['aria#confirmDelete'].replace("${USERNAME}", splitPath[5]);
		}
		if (e.target.id == "blockBtn"){
			document.getElementById("popupBg").style.display = "block"
			blockFriendPopup.style.setProperty("display", "flex");
			blockFriendPopup.className = splitPath[5];
			document.querySelector("#confirmBlockQuestion").innerText = client.langJson['friends']['confirmBlockQuestion'].replace("${USERNAME}", splitPath[5]);
			document.querySelector("#confirmBlock").ariaLabel = client.langJson['friends']['aria#confirmBlock'].replace("${USERNAME}", splitPath[5]);
		}
		if (e.target.id == "unblockBtn"){
			const data = {username: splitPath[5]};
			fetch('/api/user/unblock_user', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(data),
				credentials: 'include'
			})
			.then (response => {
				if (response.ok){
					document.getElementById("unblockBtn").style.setProperty("display", "none");
					document.getElementById("blockBtn").style.setProperty("display", "block");
					document.getElementById("sendFriendRequestBtn").style.setProperty("display", "block");
				}
			})
		}
	}
})
