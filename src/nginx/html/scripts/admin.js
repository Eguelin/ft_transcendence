var template = `
<div id="pageContentContainer" class="admin">
    <div style="display: flex; flex-direction: column; gap: 3ch;">
        <div style="display: flex;">
            <input id="createUserUsername" type="text" placeholder="name">
            <input id="createUserPassword" type="text" placeholder="password">
            <button id="createUserBtn">create user</button>
        </div>

        <div style="display: flex;">
            <input id="deleteUserUsername" type="text" placeholder="name">
            <button id="deleteUserBtn">delete user</button>
        </div>
        
        <div style="display: flex;">
            <input id="userOne" type="text" placeholder="player one username">
            <input id="userTwo" type="text" placeholder="player two username">
            <input id="range" type="number" placeholder="number of matches">
    
            <button id="createMatchesBtn">create matches</button>
        </div>
        
        <div style="display: flex;">
            <input id="userOneF" type="text" placeholder="player one username">
            <input id="userTwoF" type="text" placeholder="player two username">
    
            <button id="createFriendshipBtn">create friend</button>
        </div>

        <div style="display: flex;">
            <input id="userOneFr" type="text" placeholder="to">
            <input id="userTwoFr" type="text" placeholder="from">
    
            <button id="createFriendshipRequestBtn">create friend request</button>
        </div>

        <div style="display: flex;">
            <input id="userOneBf" type="text" placeholder="player one username">
            <input id="userTwoBf" type="text" placeholder="player two username">
    
            <button id="createblockedFriendshipBtn">create blocked friendship</button>
        </div>
    </div>
</div>
`

{
	document.getElementById("container").innerHTML = template;
	notifCenterContainer.style.setProperty("display", "none");

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
        setLoader()


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
            unsetLoader()
        })
    })

    document.getElementById("createFriendshipBtn").addEventListener("click", (e) => {
        setLoader()


        playerOne = document.getElementById("userOneF").value;
        playerTwo = document.getElementById("userTwoF").value;

        fetch('/api/admin/create_friendship', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({'userOne': playerOne, 'userTwo': playerTwo})
        }).then(() => {
            unsetLoader()
        })
    })

    document.getElementById("createFriendshipRequestBtn").addEventListener("click", (e) => {
        setLoader()


        playerOne = document.getElementById("userOneFr").value;
        playerTwo = document.getElementById("userTwoFr").value;

        fetch('/api/admin/create_friendship_request', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({'to': playerOne, 'from': playerTwo})
    }).then(() => {
            unsetLoader()
        })
    })

    document.getElementById("createblockedFriendshipBtn").addEventListener("click", (e) => {
        setLoader()


        playerOne = document.getElementById("userOneBf").value;
        playerTwo = document.getElementById("userTwoBf").value;

        fetch('/api/admin/create_blocked_friendship', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({'userOne': playerOne, 'userTwo': playerTwo})
    }).then(() => {
            unsetLoader()
        })
    })

    document.getElementById("deleteUserBtn").addEventListener("click", (e) => {
        setLoader()
        fetch('/api/admin/remove_user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({username: document.getElementById("deleteUserUsername").value})
        }).then(() => {
            unsetLoader()
        })
    })
}
