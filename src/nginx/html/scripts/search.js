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

                userResume = document.querySelectorAll(".userResume");
                for (i = 0; i<  userResume.length; i++){
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
            }))
        })
    }
    else{
        history.replaceState("", "", `https://${hostname.host}/home`);
		popUpError("Can't seach empty query");
    }

}


function createUserResumeContainer(user) {
	userResumeContainer = document.createElement("div");
	userResumeContainer.className = "userResumeContainer";

	userResume = document.createElement("div");
	userResume.className = "userResume";
	userResume.id = user.username

	img = document.createElement("img");
	imgContainer = document.createElement("div");
	img.className = "userResumePfp";
	imgContainer.className = "userResumePfpContainer";
    addPfpUrlToImgSrc(img, user.pfp);
	userResumeName = document.createElement("a");
	userResumeName.className = "userResumeName"
	userResumeName.innerHTML = user.username;


	imgContainer.appendChild(img);
	userResume.appendChild(imgContainer);
	userResume.appendChild(userResumeName);
	userResume.setAttribute("tabindex", 10);
	userResumeContainer.appendChild(userResume)
	document.getElementById("resumeContainer").appendChild(userResumeContainer);
}