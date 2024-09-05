sendFriendRequestBtn = document.getElementById("sendFriendRequestBtn");

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