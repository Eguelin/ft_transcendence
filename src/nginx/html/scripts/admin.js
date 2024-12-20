var template = `
<div id="pageContentContainer" class="admin">
	<div style="display: flex; flex-direction: column; gap: 3ch;">
		<div style="display: flex;">
			<input autoclomplete="off" id="createUserUsername" type="text" placeholder="name">
			<input autoclomplete="off" id="createUserPassword" type="text" placeholder="password">
			<button id="createUserBtn">create user</button>
		</div>

		<div style="display: flex;">
			<input autoclomplete="off" id="changePasswordUserUsername" type="text" placeholder="name">
			<input autoclomplete="off" id="changePasswordUserPassword" type="text" placeholder="password">
			<button id="setUserPasswordBtn">Set password</button>
		</div>

		<div style="display: flex;">
			<input autoclomplete="off" id="deleteUserUsername" type="text" placeholder="name">
			<button id="deleteUserBtn">delete user</button>
		</div>
		
		<div style="display: flex;">
			<input autoclomplete="off" id="inputToggleStaffUsername" type="text" placeholder="name">
			<button id="toggleStaffBtn">Toggle staff on user</button>
		</div>

		<div style="display: flex;">
			<input autoclomplete="off" id="userOne" type="text" placeholder="player one username">
			<input autoclomplete="off" id="userTwo" type="text" placeholder="player two username">
			<input autoclomplete="off" id="range" type="number" placeholder="number of matches">
	
			<button id="createMatchesBtn">create matches</button>
		</div>
		
		<div style="display: flex;">
			<input autoclomplete="off" id="userOneF" type="text" placeholder="player one username">
			<input autoclomplete="off" id="userTwoF" type="text" placeholder="player two username">
	
			<button id="createFriendshipBtn">create friend</button>
		</div>

		<div style="display: flex;">
			<input autoclomplete="off" id="userOneFr" type="text" placeholder="to">
			<input autoclomplete="off" id="userTwoFr" type="text" placeholder="from">
	
			<button id="createFriendshipRequestBtn">create friend request</button>
		</div>

		<div style="display: flex;">
			<input autoclomplete="off" id="userOneBf" type="text" placeholder="player one username">
			<input autoclomplete="off" id="userTwoBf" type="text" placeholder="player two username">
	
			<button id="createblockedFriendshipBtn">create blocked friendship</button>
		</div>
	</div>
</div>
`

{
	history.replaceState("","",`https://${hostname.host}/${currentLang}/admin`)
	document.getElementById("container").innerHTML = template;
	notifCenterContainer.style.setProperty("display", "none");
	inputSearchUserContainer.style.setProperty("display", "none");
	dropDownUserContainer.style.setProperty("display", "flex");
	homeBtn.style.setProperty("display", "block");

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
            body: JSON.stringify({username: username, password: password, lang: "EN_UK", theme_name: "dark"})
        })
    })

    document.getElementById("setUserPasswordBtn").addEventListener("click", (e) => {
        username = document.getElementById("changePasswordUserUsername").value;
        password = document.getElementById("changePasswordUserPassword").value;
		setLoader();
        fetch('/api/admin/set_user_password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({username: username, password: password})
        }).then(response => {
			if (!response.ok)
				response.json().then(data => {popUpError(data.message)})
			unsetLoader();
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
	document.querySelector("#toggleStaffBtn").addEventListener("click", (e) => {
		setLoader()
        fetch('/api/admin/toggle_staff', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({username: document.getElementById("inputToggleStaffUsername").value})
        }).then(() => {
            unsetLoader()
        })
	})
}
