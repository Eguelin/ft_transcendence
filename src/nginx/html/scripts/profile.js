var splitPath = window.location.href.split('/');
sendFriendRequestBtn = document.getElementById("sendFriendRequestBtn");

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

function drawWinLoseGraph(matches, username){
    graph = document.getElementById("winLoseGraph");
    nbMatch = Object.keys(matches).length;
    var height = graph.height - 10;
    var step =  graph.width / nbMatch;
    var begX = 5;
    const ctx = graph.getContext("2d");
    ctx.strokeStyle = window.getComputedStyle(document.documentElement).getPropertyValue("--page-bg-rgb");
    ctx.strokeWidth = 1;
    ctx.beginPath();
    for (var i=0; i<Object.keys(matches).length;i++){
        matchObj = matches[Object.keys(matches)[i]];
        var countWin = 0, countLost = 0, countMatch = 0;
        for (j = 0; j < Object.keys(matchObj).length; j++){
            if (matchObj[j].player_one == username){
                countWin += matchObj[j].player_one_pts > matchObj[j].player_two_pts;
                countLost += matchObj[j].player_one_pts < matchObj[j].player_two_pts;
            }
            else{
                countWin += matchObj[j].player_one_pts < matchObj[j].player_two_pts;
                countLost += matchObj[j].player_one_pts > matchObj[j].player_two_pts;
            }
            countMatch += 1;
        }
        average = countWin / countMatch;
        setTimeout((i, ctx, begX, height, average) => {
            if (average < 0.5)
                ctx.strokeStyle = "red";
            else
                ctx.strokeStyle = "green";
            ctx.strokeRect(begX - 1, (height - (height * (average))) + 4, 2, 2); //begX - 1 and +4 on y instead of + 5, to center point on line (this offset must be half of the point width and height)
                
            if (i == 0)
                ctx.moveTo(begX, (height - (height * (average))) + 5);
            else
                ctx.lineTo(begX, (height - (height * (average))) + 5);
            if (i > 0){
                ctx.strokeStyle = window.getComputedStyle(document.documentElement).getPropertyValue("--main-text-rgb");
                ctx.stroke();
            }
        }, i * 50, i, ctx, begX, height, average);
        
        begX += step;
    }

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
            var countWin = 0, countLost = 0, countMatch = 0;
            matchObj = user.matches[Object.keys(user.matches)[Object.keys(user.matches).length - 1]] // get matches object of highest date 
            for (var i=0; i<Object.keys(matchObj).length && i<5;i++){
                createMatchResumeContainer(matchObj[i]);
            };
            for (var i=0; i<Object.keys(user.matches).length;i++){
                matchObj = user.matches[Object.keys(user.matches)[i]];
                for (j = 0; j < Object.keys(matchObj).length; j++){
                    if (matchObj[j].player_one == user.username){
                        countWin += matchObj[j].player_one_pts > matchObj[j].player_two_pts;
                        countLost += matchObj[j].player_one_pts < matchObj[j].player_two_pts;
                    }
                    else{
                        countWin += matchObj[j].player_one_pts < matchObj[j].player_two_pts;
                        countLost += matchObj[j].player_one_pts > matchObj[j].player_two_pts;
                    }
                    countMatch += 1;
                }
            }
            
            drawWinLoseGraph(user.matches, user.username);
            
            document.getElementById("ratioContainer").innerHTML += `${countWin / countMatch}%`
            document.getElementById("nbWinContainer").innerHTML += `${countWin}`
            document.getElementById("nbLossContainer").innerHTML += `${countLost}`
            document.getElementById("nbMatchContainer").innerHTML += `${countMatch}`
            matchUsersName = document.querySelectorAll(".resultScoreName")
            Object.keys(matchUsersName).forEach(function(key){
                matchUsersName[key].addEventListener("click", (e) => {
                    history.pushState("", "", `https://${hostname.host}/user/${matchUsersName[key].innerHTML}`);
                })
            })
        })
    })
}