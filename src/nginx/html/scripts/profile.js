sendFriendRequestBtn = document.getElementById("sendFriendRequestBtn");

if (sendFriendRequestBtn){
    sendFriendRequestBtn.addEventListener("click", (e) => {
        const data = {username: sendFriendRequestBtn.className};
        fetch('/api/user/send_friend_request', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
            credentials: 'include'
        })
    })   
}

{
    var splitPath = window.location.href.split('/');
    fetch('/api/user/get', {
        method: 'POST', //GET forbid the use of body :(
        headers: {'Content-Type': 'application/json',},
        body: JSON.stringify({"name" : splitPath[4]}),
        credentials: 'include'
    }).then(user => {
        user.json().then((user) => {
            profilePfp = document.getElementById("profilePfp");
            document.getElementById("profileName").innerHTML = user.username;
            document.getElementById("profilePfp").style.setProperty("display", "block");
            profilePfp.innerHTML = "";
            if (user.pfp != ""){
                var rawPfp = user.pfp;
                if (rawPfp.startsWith('https://'))
                    profilePfp.setAttribute("src", `${rawPfp}`);
                else
                    profilePfp.setAttribute("src", `data:image/jpg;base64,${rawPfp}`);

                testImg = new Image();
                testImg.setAttribute("src", `data:image/jpg;base64,${rawPfp}`)
                setTimeout(() => {
                    if (testImg.width > testImg.height){		//this condition does not work if not in a setTimeout. You'll ask why. The answer is : ¯\_(ツ)_/¯
                        profilePfp.style.setProperty("height", "100%");
                        profilePfp.style.setProperty("width", "unset");
                    }
                }, 0)
            }
            else
                profilePfp.style.setProperty("display", "none");
            recentMatchHistoryContainer = document.getElementById("recentMatchHistoryContainer");
            var countWin = 0, countLost = 0;
            for (var i=0; i<Object.keys(user.matches).length && i<5;i++){
                createMatchResumeContainer(user.matches[i]);
            };
            for (var i=0; i<Object.keys(user.matches).length;i++){
                if (user.matches[i].player_one == user.username){
                    countWin += user.matches[i].player_one_pts > user.matches[i].player_two_pts;
                    countLost += user.matches[i].player_one_pts < user.matches[i].player_two_pts;
                }
                else{
                    countWin += user.matches[i].player_one_pts < user.matches[i].player_two_pts;
                    countLost += user.matches[i].player_one_pts > user.matches[i].player_two_pts;
                }
            }
            document.getElementById("ratioContainer").innerHTML += `${countWin / Object.keys(user.matches).length}%`
            document.getElementById("nbWinContainer").innerHTML += `${countWin}`
            document.getElementById("nbLossContainer").innerHTML += `${countLost}`
            document.getElementById("nbMatchContainer").innerHTML += `${Object.keys(user.matches).length}`
            matchUsersName = document.querySelectorAll(".resultScoreName")
            Object.keys(matchUsersName).forEach(function(key){
                matchUsersName[key].addEventListener("click", (e) => {
                    history.pushState(JSON.stringify({"html": document.body.innerHTML, "currentPage": 'login', "currentLang": currentLang}), "", `https://${hostname.host}/user/${matchUsersName[key].innerHTML}`);
                })
            })
        })
    })
}