{
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
    }, 0)
    for (var i = 0; i< userResume.length; i++){
        userResume[i].addEventListener("click", (e) => {
            var username = e.target.closest(".userResume").id;
            history.pushState(JSON.stringify({"html": document.body.innerHTML, "currentPage": currentPage, "currentLang": currentLang}), "", `https://${hostname.host}/user/${username}`);
        })
        userResume[i].addEventListener("keydown", (e) => {
            if (e.key == "Enter"){
                var username = e.target.closest(".userResume").id;
                history.pushState(JSON.stringify({"html": document.body.innerHTML, "currentPage": currentPage, "currentLang": currentLang}), "", `https://${hostname.host}/user/${username}`);
            }
        })
    }
}