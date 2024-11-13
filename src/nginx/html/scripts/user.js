var pointAppearanceDelay = 25; // default is 50 (higher the delay, slower the points will appeare on graph)
var sendFriendRequestBtn;
var allMatchesButton;

var template = `
<div id="pageContentContainer">
    <div id="profileInfoContainer">
        <div id="profilePfpContainer">
            <img id="profilePfp"></img>
        </div>
        <div id="profileNameContainer">
            <h1 id="profileName">Default</h1>
        </div>
        <button tabindex="12" id="sendFriendRequestBtn">Send friend request</button>
        <button tabindex="12" id="deleteFriendBtn">Remove friend</button>
    </div>

    <div id="recentMatchHistoryContainer" tabindex="14" aria-label="User today's matches">
        <div id="MatchHistoryTextContainer">
            <div id="recentMatchHistoryText">Recent matches</div>
            <a> | </a>
            <div tabindex="13" id="allMatchesHistoryBtn">All matches</div>
        </div>
        <div id="recentMatchHistory">
            
        </div>
    </div>
</div>
`

{
	document.getElementById("container").innerHTML = template;

    sendFriendRequestBtn = document.getElementById("sendFriendRequestBtn");
    allMatchesButton = document.getElementById("allMatchesHistoryBtn");

    if (sendFriendRequestBtn){
        var splitPath = window.location.href.split('/');
        sendFriendRequestBtn.addEventListener("click", (e) => {
            fetch('/api/user/send_friend_request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({'username': splitPath[4]}),
                credentials: 'include'
            }).then(response => {
                if (response.ok){
                    sendFriendRequest(splitPath[4]);
                }
            })
        })
    }

	inputSearchUserContainer.style.setProperty("display", "block");
	document.getElementById("inputSearchUser").focus();
	dropDownUserContainer.style.setProperty("display", "flex");
	homeBtn.style.setProperty("display", "block");
	notifCenterContainer.style.setProperty("display", "flex");

    var splitPath = window.location.href.split('/');

    if (splitPath[4] == client.username || client.friends[splitPath[4]] != null) {
        document.getElementById("sendFriendRequestBtn").remove();
    }
    if (splitPath[4] == client.username || client.friends[splitPath[4]] == null)
        document.getElementById("deleteFriendBtn").remove();

    var endDate = new Date();
    var startDate = new Date();
    startDate = `${startDate.getFullYear()}-${startDate.getMonth() + 1}-${startDate.getDate()}`
    endDate = `${endDate.getFullYear()}-${endDate.getMonth() + 1}-${endDate.getDate()}`
    fetch('/api/user/get', {
        method: 'POST', //GET forbid the use of body :(
        headers: {'Content-Type': 'application/json',},
        body: JSON.stringify({"name" : splitPath[4], "startDate" : startDate, "endDate" : endDate}),
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
                endDate = new Date();
                try{
                    matchObj = user.matches[endDate.getFullYear()][endDate.getMonth() + 1][endDate.getDate()]; // get matches object of today
                    for (var i=0; i<Object.keys(matchObj).length && i<5;i++){
                        recentMatchHistoryContainer.appendChild(createMatchResumeContainer(matchObj[i], splitPath[4]));
                    };
                    document.querySelectorAll(".matchDescContainer").forEach(function (elem) {
                        elem.addEventListener("keydown", (e) => {
                            if (e.key == "Enter"){
								if (elem.querySelector(".tournament")){
									elem.querySelector(".tournament").click();
								}
								else{
									var idx = elem.tabIndex + 1
									elem.querySelectorAll(".resultScoreName").forEach(function (names){
										names.tabIndex = idx;
										idx++;
									})
								}
                            }
                        })
                    });

                    document.getElementById("recentMatchHistoryContainer").addEventListener("keydown", (e) => {
                        var tabIdx = 14;
                        if (e.key == "Enter"){
                            document.querySelectorAll(".matchDescContainer").forEach(function (elem) {
                                elem.tabIndex = tabIdx;
                                tabIdx += 3;
                            });
                        }
                    });
                }
                catch{
                    var messageContainer = document.createElement("div");
                    var message = document.createElement("a");
                    recentMatchHistoryContainer.style.setProperty("background", "var(--input-bg-rgb)");
                    recentMatchHistoryContainer.style.setProperty("align-items", "center");
                    messageContainer.id = "notPlayedTodayContainer";
                    message.id="notPlayedToday";
			        message.innerText = client.langJson['user']['#notPlayedToday'].replace("USER", splitPath[4]);
                    messageContainer.appendChild(message);
                    recentMatchHistoryContainer.appendChild(messageContainer);
                }
            })
        }
        else{
            client.loadPage("/404");
        }
    })
}

allMatchesButton.addEventListener("click", (e) => {
    myPushState(`https://${hostname.host}/dashboard/${splitPath[4]}`);
})

allMatchesButton.addEventListener("keydown", (e) => {
    if (e.key == "Enter")
        myPushState(`https://${hostname.host}/dashboard/${splitPath[4]}`);
})
