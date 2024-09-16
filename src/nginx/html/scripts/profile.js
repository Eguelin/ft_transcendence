var splitPath = window.location.href.split('/');
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

function drawWinLossGraph(matches, username){
    graph = document.getElementById("winLossGraph");
    graphAbs = document.getElementById("winLossAbsGraph");
    nbMatch = Object.keys(matches).length;
    var begX = 30, begY = 10;
    var height = graph.height - 20;
    var step =  (graph.width - begX) / nbMatch;
    const ctx = graph.getContext("2d"), ctxAbs = graphAbs.getContext("2d");
    ctx.strokeWidth = 1;
    ctx.strokeStyle = window.getComputedStyle(document.documentElement).getPropertyValue("--page-bg-rgb");
    ctx.fillStyle = window.getComputedStyle(document.documentElement).getPropertyValue("--main-text-rgb");
    
    for (var i=0; i < nbMatch; i++){ //draw vertical lines
        ctx.beginPath();
        ctx.moveTo(begX + (i * step), begY);
        ctx.lineTo(begX + (i * step), graph.height - begY);
        ctx.stroke();
    }
    ctx.font = "10px serif";
    ctx.textAlign = "right";
    for (var i=0, text=1; i <= height; i += height / 4, text -= 1 / 4){ //draw horizontal lines
        ctx.fillText(text, 25, i + (begY * 1.25), 20);
        ctx.beginPath();
        ctx.moveTo(begX, begY + i);
        ctx.lineTo(graph.width, begY + i);
        ctx.stroke();
    }
    ctx.beginPath();    
    var highestAbs = 0;
    for (var i=0; i<nbMatch;i++){
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
        var absResult = (countWin - (countMatch - countWin));
        absResult = absResult >= 0 ? absResult : absResult * -1;
        highestAbs = highestAbs > absResult ? highestAbs : absResult;
        setTimeout((i, ctx, begX, posY, average) => {
            if (average < 0.5)
                ctx.strokeStyle = "red";
            else
                ctx.strokeStyle = "green";
            ctx.fillRect(begX - 1, posY - 2, 2, 2); //begX - 1 and -2 on y, to center point on line (this offset must be half of the point width and height)
                
            if (i == 0)
                ctx.moveTo(begX, posY);
            else {
                ctx.lineTo(begX, posY);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(begX, posY);
            }
        }, i * pointAppearanceDelay, i, ctx, begX, begY + (height - (height * (average))), average);
        begX += step;
    }

    ctxAbs.strokeWidth = 1;
    ctxAbs.strokeStyle = window.getComputedStyle(document.documentElement).getPropertyValue("--page-bg-rgb");
    ctxAbs.fillStyle = window.getComputedStyle(document.documentElement).getPropertyValue("--main-text-rgb");


    var begX = 30, begY = 10;
    for (var i=0; i < nbMatch; i++){ //draw vertical lines
        ctxAbs.beginPath();
        ctxAbs.moveTo(begX + (i * step), begY);
        ctxAbs.lineTo(begX + (i * step), graph.height - begY);
        ctxAbs.stroke();
    }
    ctxAbs.font = "10px serif";
    ctxAbs.textAlign = "right";
    var yStep = height / ((highestAbs * 2));
    for (var i=0, text=highestAbs; i <= height; i += yStep, text -= 1){ //draw horizontal lines
        ctxAbs.fillText(text, 25, i + (begY * 1.25), 20);
        ctxAbs.beginPath();
        ctxAbs.moveTo(begX, begY + i);
        ctxAbs.lineTo(graph.width, begY + i);
        ctxAbs.stroke();
    }
    ctxAbs.beginPath();    

    for (var i=0; i<nbMatch;i++){
        matchObj = matches[Object.keys(matches)[i]];
        var countWin = 0, countMatch = 0;
        for (j = 0; j < Object.keys(matchObj).length; j++){
            if (matchObj[j].player_one == username)
                countWin += matchObj[j].player_one_pts > matchObj[j].player_two_pts;
            else
                countWin += matchObj[j].player_one_pts < matchObj[j].player_two_pts;
            countMatch += 1;
        }
        var absResult = (countWin - (countMatch - countWin)) + highestAbs;
        percent = absResult / (highestAbs * 2);
        setTimeout((i, ctx, begX, posY, average) => {
            if (average < 0.5)
                ctx.strokeStyle = "red";
            else
                ctx.strokeStyle = "green";
            ctx.fillRect(begX - 1, posY - 2, 2, 2); //begX - 1 and -2 on y, to center point on line (this offset must be half of the point width and height)
            
            if (i == 0)
                ctx.moveTo(begX, posY);
            else {
                ctx.lineTo(begX, posY);
                ctx.stroke();
                ctx.beginPath();
                ctx.moveTo(begX, posY);
            }
        }, i * pointAppearanceDelay, i, ctxAbs, begX, begY + (height - (height * percent)), percent);
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
            
            drawWinLossGraph(user.matches, user.username);
            
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

allMatchesButton.addEventListener("click", (e) => {
    history.pushState("", "", `https://${hostname.host}/dashboard/${splitPath[4]}`);
})