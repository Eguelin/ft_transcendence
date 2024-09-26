var splitPath = window.location.href.split('/');
console.log(splitPath);
var pointAppearanceDelay = 25; // default is 50 (higher the delay, slower the points will appeare on graph)
sendFriendRequestBtn = document.getElementById("sendFriendRequestBtn");
allMatchesButton = document.getElementById("allMatchesHistoryBtn");


if (sendFriendRequestBtn){
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
	inputSearchUser.style.setProperty("display", "block");
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
                if (user.pfp != ""){
                    testImg = new Image();
                    testImg.setAttribute("src", `https://${hostname.host}/${user.pfp}`);
                    profilePfp.setAttribute("src", `https://${hostname.host}/${user.pfp}`);
                    setTimeout(() => {
                        if (testImg.width > testImg.height){		//this condition does not work if not in a setTimeout. You'll ask why. The answer is : ¯\_(ツ)_/¯
                            profilePfp.style.setProperty("height", "100%");
                            profilePfp.style.setProperty("width", "unset");
                        }
                    }, 10)
                }
                else
                    profilePfp.style.setProperty("display", "none");
                recentMatchHistoryContainer = document.getElementById("recentMatchHistoryContainer");
                endDate = new Date();
                matchObj = user.matches[endDate.getFullYear()][endDate.getMonth() + 1][endDate.getDate()]; // get matches object of today
                for (var i=0; i<Object.keys(matchObj).length && i<5;i++){
                    createMatchResumeContainer(matchObj[i]);
                };
                matchUsersName = document.querySelectorAll(".resultScoreName")
                Object.keys(matchUsersName).forEach(function(key){
                    matchUsersName[key].addEventListener("click", (e) => {
                        history.pushState("", "", `https://${hostname.host}/user/${matchUsersName[key].innerHTML}`);
                    })
                })
            })
        }
        else{
            history.replaceState("","", `https://${hostname.host}/home`);   // TODO replace with page 404
        }
    })
}

allMatchesButton.addEventListener("click", (e) => {
    history.pushState("", "", `https://${hostname.host}/dashboard/${splitPath[4]}`);
})
