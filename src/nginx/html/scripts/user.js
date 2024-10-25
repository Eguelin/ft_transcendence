var pointAppearanceDelay = 25; // default is 50 (higher the delay, slower the points will appeare on graph)
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
        })
    })
}

{
	inputSearchUserContainer.style.setProperty("display", "block");
	document.getElementById("inputSearchUser").focus();
	dropDownUserContainer.style.setProperty("display", "flex");
	homeBtn.style.setProperty("display", "block");
	
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
                        recentMatchHistoryContainer.appendChild(createMatchResumeContainer(matchObj[i]));
                    };
                    document.querySelectorAll(".matchDescContainer").forEach(function (elem) {
                        elem.addEventListener("keydown", (e) => {
                            if (e.key == "Enter"){
                                var idx = elem.tabIndex + 1
                                elem.querySelectorAll(".resultScoreName").forEach(function (names){
                                    names.tabIndex = idx;
                                    idx++;
                                })
                            }
                        })
                    });
                    
                    document.getElementById("recentMatchHistoryContainer").addEventListener("keydown", (e) => {
                        var tabIdx = 14;
                        console.log(e.key);
                        if (e.key == "Enter"){
                            document.querySelectorAll(".matchDescContainer").forEach(function (elem) {
                                elem.tabIndex = tabIdx;
                                tabIdx += 3;
                            });
                        }
                    });
                    matchUsersName = document.querySelectorAll(".resultScoreName")
                    Object.keys(matchUsersName).forEach(function(key){
                        if (!matchUsersName[key].classList.contains("deletedUser")){
                            matchUsersName[key].addEventListener("click", (e) => {
                                myPushState(`https://${hostname.host}/user/${matchUsersName[key].innerHTML}`);	
                            })
                            matchUsersName[key].addEventListener("keydown", (e) => {
                                if (e.key == "Enter")
                                    matchUsersName[key].click();
                            })
                        }
                        else{
                            matchUsersName[key].innerText = client.langJson["index"][".deletedUser"];
                        }
                    })
                }
                catch{
                    var messageContainer = document.createElement("div");
                    var messageUsername = document.createElement("a");
                    var message = document.createElement("a");
                    recentMatchHistoryContainer.style.setProperty("background", "var(--input-bg-rgb)");
                    recentMatchHistoryContainer.style.setProperty("align-items", "center");
                    messageContainer.id = "notPlayedTodayContainer";
                    messageUsername.innerText = splitPath[4]
                    message.id="notPlayedToday";
			        message.innerText = client.langJson['user']['#notPlayedToday'];
                    messageContainer.appendChild(messageUsername);
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
