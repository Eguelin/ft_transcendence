createUserBtn = document.getElementById("createUserBtn");
createUserBtn.addEventListener("click", (e) => {
    username = document.getElementById("createUserUsername").value;
    password = document.getElementById("createUserPassword").value;

    fetch('/api/user/admin_create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({username: username, password: password})
    })
})