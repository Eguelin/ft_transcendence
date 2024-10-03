createUserBtn = document.getElementById("createUserBtn");
createUserBtn.addEventListener("click", (e) => {
    username = document.getElementById("createUserUsername").value;
    password = document.getElementById("createUserPassword").value;

    fetch('/api/admin/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({username: username, password: password})
    })
})

createMatchesBtn = document.getElementById("createMatchesBtn");
createMatchesBtn.addEventListener("click", (e) => {
    document.getElementById("loaderBg").style.setProperty("display", "block");


    playerOne = document.getElementById("userOne").value;
    playerTwo = document.getElementById("userTwo").value;
    range = document.getElementById("range").value;

    fetch('/api/admin/create_match', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({'userOne': playerOne, 'userTwo': playerTwo, 'range': range - 0})
    }).then(() => {
        document.getElementById("loaderBg").style.setProperty("display", "none");
    })
})