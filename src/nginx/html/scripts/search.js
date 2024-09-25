{
    url = new URL(window.location.href);
    if (url.searchParams.get("query")) {
        fetch('/api/user/search_by_username', {
            method: 'POST', //GET forbid the use of body :(
            headers: { 'Content-Type': 'application/json', },
            body: JSON.stringify({ "name": url.searchParams.get("query") }),
            credentials: 'include'
        }).then(user => {
            user.json().then(((user) => {
                document.getElementById("userResumeCount").innerHTML = Object.keys(user).length;
                document.getElementById("userResumeSearch").innerHTML = htmlEncode(url.searchParams.get("query"));
                Object.keys(user).forEach(function (key) {
                    createUserResumeContainer(user[key]);
                })
            }))
        })
    }
    else
        history.replaceState("", "", `https://${hostname.host}/home`);

    userResume = document.querySelectorAll(".userResume");
    userResumePfp = document.querySelectorAll(".userResumePfp");
    testImg = new Image();

    setTimeout(() => {
        for (var i = 0; i< userResumePfp.length; i++){
            testImg.setAttribute("src", userResumePfp[i].getAttribute("src"));
            if (testImg.width > testImg.height){		//this condition does not work if not in a setTimeout. You'll ask why. The answer is : ¯\_(ツ)_/¯
                userResumePfp[i].style.setProperty("height", "100%");
                userResumePfp[i].style.setProperty("width", "unset");
            }
        }
    }, 10)
    for (var i = 0; i< userResume.length; i++){
        userResume[i].addEventListener("click", (e) => {
            var username = e.target.closest(".userResume").id;
            history.pushState("", "", `https://${hostname.host}/user/${username}`);
        })
        userResume[i].addEventListener("keydown", (e) => {
            if (e.key == "Enter"){
                var username = e.target.closest(".userResume").id;
                history.pushState("", "", `https://${hostname.host}/user/${username}`);
            }
        })
    }
}