var minConnectionWidth = 25;
var playerOneScore;
var playerTwoScore;
var singleRoundDisplayIdx = 0;
maxScore = 5;

var gameContainer;
var tournamentContainer;
var treeCanva;

var userContainerAnchor = `
<div class="anchor"></div>
<div class="username"> </div>
<div class="score"></div>
`

var lobbyPlayerContainer= `
<div class="lobbyPlayerContainer">
	<div class="lobbyPlayer">
		<div class="username"></div>
		<div class="lobbyPlayerPfpContainer">
			<img class="lobbyPlayerPfp">
		</div>
	</div>
</div>
`

var template = `
<div id="pageContentContainer">
	<div id="gameContainer">
		<div class="playerInfoContainer" id="playerOne">
			<div class="playerPfp">
				<img id="playerOnePfp">
			</div>
			<h2 class="playerName"></h2>
			<h2 class="playerScore">-</h2>
		</div>
		<canvas id="game" class="game">
		</canvas>
		<div class="playerInfoContainer" id="playerTwo">
			<div class="playerPfp">
				<img id="playerTwoPfp">
			</div>
			<h2 class="playerName"></h2>
			<h2 class="playerScore">-</h2>
		</div>
	</div>


	<div id="tournamentContainer">
		<div id="lobby">
			${lobbyPlayerContainer}
			${lobbyPlayerContainer}
			${lobbyPlayerContainer}
			${lobbyPlayerContainer}
			${lobbyPlayerContainer}
			${lobbyPlayerContainer}
			${lobbyPlayerContainer}
			${lobbyPlayerContainer}
		</div>
		<div id="tournament">
			<div class="round quarter left">
				<div class="contestMatchResume quarter match one">
					<div class="contestUserContainer left">${userContainerAnchor}</div>
					<div class="contestUserContainer right">${userContainerAnchor}</div>
				</div>
				<div class="contestMatchResume quarter match two">
					<div class="contestUserContainer left">${userContainerAnchor}</div>
					<div class="contestUserContainer right">${userContainerAnchor}</div>
				</div>
			</div>


			<div class="round semi left">
				<div class="contestMatchResume semi match one">
					<div class="contestUserContainer left">${userContainerAnchor}</div>
					<div class="contestUserContainer right">${userContainerAnchor}</div>
				</div>
			</div>


			<div class="round final">
				<div class="contestMatchResume final match one">
					<div class="contestUserContainer left">${userContainerAnchor}</div>
					<div class="contestUserContainer right">${userContainerAnchor}</div>
				</div>
			</div>

			<div class="round semi right">
				<div class="contestMatchResume semi match two">
					<div class="contestUserContainer left">${userContainerAnchor}</div>
					<div class="contestUserContainer right">${userContainerAnchor}</div>
				</div>
			</div>
			<div class="round quarter right">
				<div class="contestMatchResume quarter match three">
					<div class="contestUserContainer left">${userContainerAnchor}</div>
					<div class="contestUserContainer right">${userContainerAnchor}</div>
				</div>
				<div class="contestMatchResume quarter match four">
					<div class="contestUserContainer left">${userContainerAnchor}</div>
					<div class="contestUserContainer right">${userContainerAnchor}</div>
				</div>
			</div>
		</div>
	</div>
	<div id="controler">
		<div id="leftBtnContainer" tabindex="12" aria-label="Switch tournament section">
			<button id="leftBtn"></button>
		</div>
		<div id="rightBtnContainer" tabindex="13" aria-label="Switch tournament section">
			<button id="rightBtn"></button>
		</div>
	</div>
</div>
`

function leftSlideBtn(){
	var contest = document.querySelector(".singleRoundDisplay");
	if (!contest)
		return
	var left = contest.getBoundingClientRect().left;


	if (singleRoundDisplayIdx <= 0)
		return;

	if (contest.getBoundingClientRect().left + getWindowWidth() <= 0){
		singleRoundDisplayIdx -= 1;
		const move = [
			{ left: `${left}px`},
			{ left: `-${getWindowWidth() * singleRoundDisplayIdx}px`}
		];
		const time = {
			duration: 500,
			iterations: 1,
		}
		contest.animate(move, time);
		
		document.querySelector("#leftBtnContainer").removeEventListener("click", leftSlideBtn);
		document.querySelector("#leftBtnContainer").onkeydown = null;
		document.querySelector("#rightBtnContainer").removeEventListener("click", rightSlideBtn);
		document.querySelector("#rightBtnContainer").onkeydown = null;

		document.querySelector("#treeCanva").animate(move, time);
		contest.style.setProperty("left", `-${getWindowWidth() * singleRoundDisplayIdx}px`)
		/*document.querySelector("#treeCanva").style.setProperty("left", `-${getWindowWidth() * singleRoundDisplayIdx}px`)		*/
		setTimeout(()=>{

			switch (singleRoundDisplayIdx){
				case 0:
					document.querySelector("#subtitle").innerText = `${client.langJson['game']['tournamentSubtitle']} ${client.langJson['game']['quarter']}`
					break ;
				case 1:
					document.querySelector("#subtitle").innerText = `${client.langJson['game']['tournamentSubtitle']} ${client.langJson['game']['semi']}`
					break ;
				case 2:
					document.querySelector("#subtitle").innerText = `${client.langJson['game']['tournamentSubtitle']} ${client.langJson['game']['final']}`
					break ;
			}
			document.querySelector("#leftBtnContainer").addEventListener("click", leftSlideBtn);
			document.querySelector("#leftBtnContainer").onkeydown = leftBtnKeydownEvent;
			document.querySelector("#rightBtnContainer").addEventListener("click", rightSlideBtn);
			document.querySelector("#rightBtnContainer").onkeydown = rightBtnKeydownEvent;
		}, 500);
	}
}

function rightSlideBtn(){
	var contest = document.querySelector(".singleRoundDisplay");
	if (!contest)
		return
	var left = contest.getBoundingClientRect().left;

	if (singleRoundDisplayIdx >= 2)
		return;

	if (contest.getBoundingClientRect().left > -(getWindowWidth() * 2)){
		singleRoundDisplayIdx += 1;
		const move = [
			{ left: `${left}px`},
			{ left: `-${getWindowWidth() * singleRoundDisplayIdx}px`}
		];
		const time = {
			duration: 500,
			iterations: 1,
		}
		contest.animate(move, time);

		document.querySelector("#leftBtnContainer").removeEventListener("click", leftSlideBtn);
		document.querySelector("#leftBtnContainer").onkeydown = null;
		document.querySelector("#rightBtnContainer").removeEventListener("click", rightSlideBtn);
		document.querySelector("#rightBtnContainer").onkeydown = null;

		document.querySelector("#treeCanva").animate(move, time);
		contest.style.setProperty("left", `-${getWindowWidth() * singleRoundDisplayIdx}px`)
		/*document.querySelector("#treeCanva").style.setProperty("left", `-${getWindowWidth() * singleRoundDisplayIdx}px`)*/

		setTimeout(()=>{

			switch (singleRoundDisplayIdx){
				case 0:
					document.querySelector("#subtitle").innerText = `${client.langJson['game']['tournamentSubtitle']} ${client.langJson['game']['quarter']}`
					break ;
				case 1:
					document.querySelector("#subtitle").innerText = `${client.langJson['game']['tournamentSubtitle']} ${client.langJson['game']['semi']}`
					break ;
				case 2:
					document.querySelector("#subtitle").innerText = `${client.langJson['game']['tournamentSubtitle']} ${client.langJson['game']['final']}`
					break ;
			}
			document.querySelector("#leftBtnContainer").addEventListener("click", leftSlideBtn);
			document.querySelector("#leftBtnContainer").onkeydown = leftBtnKeydownEvent;
			document.querySelector("#rightBtnContainer").addEventListener("click", rightSlideBtn);
			document.querySelector("#rightBtnContainer").onkeydown = rightBtnKeydownEvent;
		}, 500);
	}
}

function leftBtnKeydownEvent(e){
	if (e.key == "Enter")
		leftSlideBtn();
}

function rightBtnKeydownEvent(e){
	if (e.key == "Enter")
		rightSlideBtn();
}

var tournament;

{
	document.getElementById("container").innerHTML = template;

	inputSearchUserContainer.style.setProperty("display", "none");
	homeBtn.style.setProperty("display", "block");
	dropDownUserContainer.style.setProperty("display", "flex");
	notifCenterContainer.style.setProperty("display", "flex");

	playerOneScore = document.querySelector("#playerOne > .playerScore");
	playerTwoScore = document.querySelector("#playerTwo > .playerScore");

	tmp_contest = {
		"round_0": {
			"match_0": {
				"playerLeft": {
					"username": "elise",
					"profile_picture": "/images/defaults/default1.jpg",
					"winner": "left",
					"score": 2
				},
				"playerRight": {
					"username": "test",
					"profile_picture": "/images/defaults/defaultAi.gif",
					"winner": null,
					"score": 0
				}
			},
			"match_1": {
				"playerLeft": {
					"username": "test1",
					"profile_picture": "/images/defaults/defaultAi.gif",
					"winner": null,
					"score": 1
				},
				"playerRight": {
					"username": "test2",
					"profile_picture": "/images/defaults/defaultAi.gif",
					"winner": 'right',
					"score": 2
				}
			},
			"match_2": {
				"playerLeft": {
					"username": "test3",
					"profile_picture": "/images/defaults/defaultAi.gif",
					"winner": 'left',
					"score": 1
				},
				"playerRight": {
					"username": "test4",
					"profile_picture": "/images/defaults/defaultAi.gif",
					"winner": null,
					"score": 0
				}
			},
			"match_3": {
				"playerLeft": {
					"username": "test5",
					"profile_picture": "/images/defaults/defaultAi.gif",
					"winner": null,
					"score": 3
				},
				"playerRight": {
					"username": "test6",
					"profile_picture": "/images/defaults/defaultAi.gif",
					"winner": 'right',
					"score": 4
				}
			}
		},
		"round_1": {
			"match_0": {
				"playerLeft": {
					"username": "elise",
					"profile_picture": "/images/defaults/default1.jpg",
					"winner": "left",
					"score": 4
				},
				"playerRight": {
					"username": "test2",
					"profile_picture": "/images/defaults/defaultAi.gif",
					"winner": null,
					"score": 2
				}
			},
			"match_1": {
				"playerLeft": {
					"username": "test3",
					"profile_picture": "/images/defaults/defaultAi.gif",
					"winner": null,
					"score": 1
				},
				"playerRight": {
					"username": "test6",
					"profile_picture": "/images/defaults/defaultAi.gif",
					"winner": 'right',
					"score": 4
				}
			}
		},
		"round_2": {
			"match_0": {
				"playerLeft": {
					"username": "elise",
					"profile_picture": "/images/defaults/default1.jpg",
					"winner": "left",
					"score": 5
				},
				"playerRight": {
					"username": "test6",
					"profile_picture": "/images/defaults/defaultAi.gif",
					"winner": null,
					"score": 4
				}
			}
		}
	}

	document.querySelector("#leftBtnContainer").addEventListener("click", leftSlideBtn);
	document.querySelector("#leftBtnContainer").onkeydown = leftBtnKeydownEvent;
	document.querySelector("#rightBtnContainer").addEventListener("click", rightSlideBtn);
	document.querySelector("#rightBtnContainer").onkeydown = rightBtnKeydownEvent;
	game();
}

function setTournamentTreeValue(){
	const positionMap = {
		"round_0" : ".contestMatchResume.quarter",
		"round_1" : ".contestMatchResume.semi",
		"round_2" : ".contestMatchResume.final",

		"match_0": ".match.one",
		"match_1": ".match.two",
		"match_2": ".match.three",
		"match_3": ".match.four",

		"playerLeft" : ".contestUserContainer.left",
		"playerRight" : ".contestUserContainer.right",
	}
	var players = 0;
	Object.keys(tournament).forEach(function(round){
		Object.keys(tournament[round]).forEach(function(matchNumber){
			Object.keys(tournament[round][matchNumber]).forEach(function(player){
				var selector = `${positionMap[round]}${positionMap[matchNumber]} ${positionMap[player]}`;
				if (tournament[round][matchNumber][player]['username']){
					if (round == "round_0")
						players += 1;
					document.querySelector(`${selector} .username`).classList.remove("waiting");
					document.querySelector(`${selector} .username`).innerText = tournament[round][matchNumber][player]['username'];
					if (tournament[round][matchNumber][player]['score'] != null){
						document.querySelector(`${selector} .score`).innerText = tournament[round][matchNumber][player]['score'];
						document.querySelector(selector).classList.add(tournament[round][matchNumber][player]['winner'] ? "winner" : "loser");
					}
					else
						document.querySelector(`${selector} .score`).innerText = '-';
				}
				else{
					document.querySelector(`${selector} .username`).innerText = client.langJson['game']['waiting'];
					document.querySelector(`${selector} .username`).classList.add("waiting");
					document.querySelector(`${selector} .score`).innerText = '';
				}
			})
		})
	})
}

function switchTournamentDisplay(){
	tournamentContainer = document.getElementById("tournamentContainer");
	gameContainer = document.getElementById("gameContainer");
	gameContainer.style.setProperty("display", gameContainer.style.getPropertyValue("display") == "none" ? "flex" : "none");
	tournamentContainer.style.setProperty("display", tournamentContainer.style.getPropertyValue("display") == "none" ? "flex" : "none");
}

function checkTournementRound(){
	if (tournament["round_2"]["match_0"]["playerLeft"]["username"] || tournament["round_2"]["match_0"]["playerRight"]["username"]){
		singleRoundDisplayIdx = 2;
	}
	else if (tournament["round_1"]["match_0"]["playerLeft"]["username"] || tournament["round_1"]["match_0"]["playerRight"]["username"] || tournament["round_1"]["match_1"]["playerLeft"]["username"] || tournament["round_1"]["match_1"]["playerRight"]["username"]){
		singleRoundDisplayIdx = 1;
	}

	switch (singleRoundDisplayIdx){
		case 0:
			document.querySelector("#subtitle").innerText = `${client.langJson['game']['tournamentSubtitle']} ${client.langJson['game']['quarter']}`
			break ;
		case 1:
			document.querySelector("#subtitle").innerText = `${client.langJson['game']['tournamentSubtitle']} ${client.langJson['game']['semi']}`
			break ;
		case 2:
			document.querySelector("#subtitle").innerText = `${client.langJson['game']['tournamentSubtitle']} ${client.langJson['game']['final']}`
			break ;
	}
}

function displayTournament(){
	document.querySelectorAll(".loser, .winner").forEach(function(elem){
		elem.classList.remove("loser");
		elem.classList.remove("winner");
	})
	var playersCount = 0;
	Object.keys(tournament['round_0']).forEach(function(matchNumber){
		Object.keys(tournament['round_0'][matchNumber]).forEach(function(player){
			if (tournament['round_0'][matchNumber][player]['username']){
					playersCount += 1;
			}
		})
	})
	document.getElementById("leftBtnContainer").onmousedown = function() {};
	document.getElementById("leftBtnContainer").onmouseup = function() {};
	document.getElementById("rightBtnContainer").onmousedown = function() {};
	document.getElementById("rightBtnContainer").onmouseup = function() {};
	setTournamentTreeValue();
	if (playersCount == 8/* || 1*/){

		document.getElementById("leftBtnContainer").onclick = leftSlideBtn;
		document.getElementById("rightBtnContainer").onclick = rightSlideBtn;
		document.getElementById("leftBtnContainer").onkeydown = leftBtnKeydownEvent;
		document.getElementById("rightBtnContainer").onkeydown = rightBtnKeydownEvent;

		document.querySelector("#lobby").style.setProperty("display", "none");
		document.querySelector("#tournament").style.setProperty("display", "flex");
		var minFullTreeWidth = 870;
		gameContainer = document.getElementById("gameContainer");
		tournamentContainer = document.getElementById("tournamentContainer");

		gameContainer.style.setProperty("display", "none");
		tournamentContainer.style.setProperty("display", "flex");

		const contestMatchPlacementMap = {
			".quarter.three" : {full : ".quarter.right", semi : ".quarter.left"},
			".quarter.four" : {full : ".quarter.right", semi : ".quarter.left"},

			".semi.two" : {full : ".semi.right", semi : ".semi.left"},
		}

		const tournamentAnchorMap = {
			".quarter.one .left .anchor" : ".semi .one .left .anchor",
			".quarter.one .right .anchor" : ".semi .one .left .anchor",

			".quarter.two .left .anchor" : ".semi .one .right .anchor",
			".quarter.two .right .anchor" : ".semi .one .right .anchor",

			".quarter.three .left .anchor" : ".semi .two .left .anchor",
			".quarter.three .right .anchor" : ".semi .two .left .anchor",

			".quarter.four .left .anchor" : ".semi .two .right .anchor",
			".quarter.four .right .anchor" : ".semi .two .right .anchor",

			".semi.one .left .anchor" : ".final .left .anchor",
			".semi.one .right .anchor" : ".final .left .anchor",

			".semi.two .left .anchor" : ".final .right .anchor",
			".semi.two .right .anchor" : ".final .right .anchor",
		}


		minFullTreeWidth = (document.querySelector(".quarter.one").getBoundingClientRect().width * 5) + (minConnectionWidth * 4);
		minSemiTreeWidth = (document.querySelector(".quarter.one").getBoundingClientRect().width * 3) + minConnectionWidth;

		Object.keys(contestMatchPlacementMap).forEach(function (key){
			var full = document.querySelector(contestMatchPlacementMap[key].full);
			var semi = document.querySelector(contestMatchPlacementMap[key].semi);
			if (getWindowWidth() < minFullTreeWidth && full.querySelector(key)){
				semi.appendChild(full.querySelector(key).cloneNode(true));
				full.querySelector(key).remove();
				full.classList.add("unused");
			}
			else if (getWindowWidth() >= minFullTreeWidth && semi.querySelector(key)){
				full.appendChild(semi.querySelector(key).cloneNode(true));
				full.classList.remove("unused");
				semi.querySelector(key).remove();
			}
		})

		if (getWindowWidth() < minSemiTreeWidth || screen.availWidth < minSemiTreeWidth){
			tournamentContainer.classList.add("singleRoundDisplay")
		}
		else {
			tournamentContainer.classList.remove("singleRoundDisplay")
			tournamentContainer.style.setProperty("left", `0px`)
			if (document.getElementById("treeCanva"))
				document.querySelector("#treeCanva").style.setProperty("left", `0px`)
		}

		if (getWindowWidth() < minFullTreeWidth)
			document.querySelector(".final.match").style.setProperty("top", "0")
		else
			document.querySelector(".final.match").style.setProperty("top", "-4.2rem")

		if (document.getElementById("treeCanva"))
			document.getElementById("treeCanva").remove();
		treeCanva = document.createElement("canvas");
		treeCanva.id = "treeCanva";
		treeCanva.width = tournamentContainer.getBoundingClientRect().width;
		treeCanva.height = document.body.clientHeight;
		tournamentContainer.appendChild(treeCanva);

		treeCtx = treeCanva.getContext("2d");
		treeCtx.strokeStyle = client.mainTextRgb;
		treeCtx.lineWidth = 3;
		var offset = 0;
		if (getWindowWidth() < minSemiTreeWidth || screen.availWidth < minSemiTreeWidth){
			document.querySelector("#tournamentContainer").style.setProperty("left", `-${getWindowWidth() * singleRoundDisplayIdx}px`)
			offset = getWindowWidth() * singleRoundDisplayIdx;
		}
		Object.keys(tournamentAnchorMap).forEach(function (key){
			pointOne = document.querySelector(key);
			if (pointOne.parentElement.classList.contains("winner")){
				pointTwo = document.querySelector(tournamentAnchorMap[key]);
				treeCtx.beginPath();
				rect = pointOne.getBoundingClientRect();
				startPoint = {x : rect.left + offset, y : rect.top + ((rect.bottom - rect.top) / 2)};
				rect = pointTwo.getBoundingClientRect();
				endPoint = {x : rect.left + offset, y : rect.top + ((rect.bottom - rect.top) / 2)};
				midX = startPoint.x + ((endPoint.x - startPoint.x) / 2)
				treeCtx.moveTo(startPoint.x, startPoint.y);
				treeCtx.lineTo(midX, startPoint.y);
				treeCtx.lineTo(midX, endPoint.y);
				treeCtx.lineTo(endPoint.x, endPoint.y);
				treeCtx.stroke();
				treeCtx.closePath();
			}
		})
	}
	else{
		document.querySelector("#subtitle").innerText = `${client.langJson['game']['tournamentLobby']} ${playersCount}/8`
		document.querySelector("#tournamentContainer").style.setProperty("left", `0px`)
		document.querySelector("#tournamentContainer").classList.remove("singleRoundDisplay")
		if (document.getElementById("treeCanva"))
			document.getElementById("treeCanva").remove();
		document.querySelector("#lobby").style.setProperty("display", "flex");
		document.querySelector("#tournament").style.setProperty("display", "none");
		var idx = 0;
		lobbyPlayerElem = document.querySelectorAll(".lobbyPlayer");
		Object.keys(tournament["round_0"]).forEach(function(matchNumber){
			Object.keys(tournament["round_0"][matchNumber]).forEach(function(player){
				if (tournament["round_0"][matchNumber][player]['username']){
					lobbyPlayerElem[idx].querySelector(".username").innerText = tournament["round_0"][matchNumber][player]['username'];
					if (lobbyPlayerElem[idx].querySelector(".lobbyPlayerPfp").src != tournament["round_0"][matchNumber][player]['profile_picture'])
						addPfpUrlToImgSrc(lobbyPlayerElem[idx].querySelector(".lobbyPlayerPfp"), tournament["round_0"][matchNumber][player]['profile_picture']);
				}
				else{
					lobbyPlayerElem[idx].querySelector(".username").innerText = "";
					lobbyPlayerElem[idx].querySelector(".lobbyPlayerPfp").src = "";
				}
				idx += 1;
			})
		})
	}
}

function game() {
	const url =  new URL(window.location.href);

	var tournamentContainer = document.getElementById("tournamentContainer");
	var gameContainer = document.getElementById("gameContainer");
	if (url.pathname.startsWith("/game")){
		document.querySelector("#subtitle").innerText = client.langJson['game'][url.searchParams.get("mode")];
		const mode = url.searchParams.get("mode");
		const socket = new WebSocket("/ws/game/");
		const canvas = document.getElementById('game');
		const ctx = canvas.getContext('2d');
		const keysDown = {"KeyS" : false, "KeyW" : false, "KeyA" : false, "KeyD" : false, "ArrowUp" : false, "ArrowDown" : false, "ArrowLeft" : false, "ArrowRight" : false,};
		const mapAvailableKeyCode = {"KeyS" : 1, "KeyW" : 1, "KeyA" : 1, "KeyD" : 1, "ArrowUp" : 1, "ArrowDown" : 1, "ArrowLeft" : 1, "ArrowRight" : 1,}
		const paddle = {};
		const player1 = {};
		const player2 = {};
		const ball = {};
		const ballTrail = [];
		let KeyPressInterval;
		let displayInterval;
		let oldKeysDown = {};
		let countdown = "";
	
		if (mode == "local"){
			document.querySelectorAll(".playerPfp").forEach(function (elem){
				elem.style.setProperty("display", "none");
			})
			document.querySelectorAll(".playerInfoContainer").forEach(function (elem) {
				elem.style.setProperty("justify-content", "center");
			});
		}
		else{
			document.querySelectorAll(".playerPfp").forEach(function (elem){
				elem.style.setProperty("display", "block");
			})
		}
	
		window.addEventListener('beforeunload', handleBeforeUnload);
		document.getElementById('goHomeButton').addEventListener('click', handleGoHomeButton);
		window.addEventListener('popstate', handlePopState);
		document.addEventListener("keydown", handleKeyDown);
		document.addEventListener("keyup", handleKeyUp);
	
		socket.onopen = function() {
			console.log("Connection established");
			gamesend(mode, url.searchParams.get("room"));
			if (mode == "game_remote"){
				displayWaiting();
			}
			displayInterval = setInterval(() => gameRender(), 16);
		}
	
		socket.onmessage = function(event) {
			let data = JSON.parse(event.data);
			if (data.type === "error"){
				popUpError(data.message);
				cleanup();
				myPushState(`https://${hostname.host}/home`);
			}
			if (data.type === "game_init") {
				window.removeEventListener("resize", displayTournament);
				gameContainer.style.setProperty("display", "flex");
				tournamentContainer.style.setProperty("display", "none");
				if (mode == "tournament")
					checkTournementRound();
				gameInit(data.message);
			} else if (data.type === "game_countdown") {
				countdown = data.message;
			} else if (data.type === "game_update") {
				countdown = "";
				updateGame(data.message);
			} else if (data.type === "game_start") {
				var leftBtnInterval;
				var rightBtnInterval;
	
				document.getElementById("leftBtnContainer").onclick = function() {};
				document.getElementById("leftBtnContainer").onkeydown = function() {};
				document.getElementById("rightBtnContainer").onclick = function() {};
				document.getElementById("rightBtnContainer").onkeydown = function() {};
				document.getElementById("leftBtnContainer").onpointerdown = function() {
					keysDown['KeyA'] = true;
					leftBtnInterval = setInterval(() => gamesend("game_keydown", keysDown), 3);
				};
				document.getElementById("leftBtnContainer").onpointerup = function() {
					keysDown['KeyA'] = false;
					gamesend("game_keydown", keysDown); clearInterval(leftBtnInterval);
				};
	
				document.getElementById("rightBtnContainer").onpointerdown = function() {
					keysDown['KeyD'] = true;
					rightBtnInterval = setInterval(() => gamesend("game_keydown", keysDown), 3);
				};
				document.getElementById("rightBtnContainer").onpointerup = function() {
					keysDown['KeyD'] = false;
					gamesend("game_keydown", keysDown); clearInterval(rightBtnInterval);
				};
	
				document.getElementById("leftBtnContainer").oncontextmenu = function(event) {
					event.preventDefault();
					event.stopPropagation();
					return false;
				};
				document.getElementById("rightBtnContainer").oncontextmenu = function(event) {
					event.preventDefault();
					event.stopPropagation();
					return false;
				};
	
				KeyPressInterval = setInterval(() => KeyPress(), 16);
				if(document.getElementById("countdownContainer"))
					document.getElementById("countdownContainer").remove();
			} else if (data.type === "game_end") {
				clearInterval(KeyPressInterval);
				endMessage = data.message.winner;
				if (endMessage == "left")
					displayWinner(player1.name, player1.profile_picture)
				else
					displayWinner(player2.name, player2.profile_picture)
			} else if (data.type === "tournament") {
				tournament = data.message;
				// tournament = tmp_contest;
				checkTournementRound();
				displayTournament();
				gameContainer.style.setProperty("display", "none");
				tournamentContainer.style.setProperty("display", "flex");
				window.addEventListener("resize", displayTournament);
			} else if (data.type === "tournament_end") {
				gameContainer.style.setProperty("display", "none");
				tournamentContainer.style.setProperty("display", "flex");
				checkTournementRound();
				displayWinner(data.message.winner, data.message.profile_picture)
				window.addEventListener("resize", displayTournament);
			}
		}
	
		socket.onclose = function() {
			console.log("Connection closed");
		}
	
		socket.onerror = function(error) {
			console.log("Error: " + error.message);
		}
	
		function gamesend(type, message) {
			if (socket.readyState === WebSocket.OPEN)
				socket.send(JSON.stringify({
					type: type,
					message: message
				}));
		}
	
		function gameInit(message) {
			canvas.width = message.canvas.width;
			canvas.height = message.canvas.height;
	
			paddle.height = message.paddle.height;
			paddle.width = message.paddle.width;
	
			player1.x = message.player1.x;
			player1.y = message.player1.y;
			player1.score = message.player1.score;
			player1.name = message.player1.user.username;
			player1.profile_picture = message.player1.user.profile_picture;
	
			player2.x = message.player2.x;
			player2.y = message.player2.y;
			player2.score = message.player2.score;
			player2.name = message.player2.user.username;
			player2.profile_picture = message.player2.user.profile_picture;
	
			ball.size = message.ball.size;
			ball.x = message.ball.x;
			ball.y = message.ball.y;
	
			ctx.lineWidth = paddle.width / 4;
	
			if (mode == "local"){
				player1.profile_picture = "";
				player2.profile_picture = "";
				player1.name = client.langJson['game']['playerOne'];
				player2.name = client.langJson['game']['playerTwo'];
	
			}
			if (mode == "game_remote"){
				if (document.getElementById("waitContainer"))
					document.getElementById("waitContainer").remove();
			}
			window.removeEventListener("keydown", keydownExitEventListener);
			addPfpUrlToImgSrc(document.getElementById("playerOnePfp"), player1.profile_picture);
			addPfpUrlToImgSrc(document.getElementById("playerTwoPfp"), player2.profile_picture);
	
			document.querySelector("#playerOne > .playerName").innerText = player1.name;
			document.querySelector("#playerTwo > .playerName").innerText = player2.name;
	
			if (mode == "full_ai")
				document.getElementById("playerOnePfp").style.setProperty("transform", "rotateY(180deg)");
	
			document.querySelectorAll(".playerScore").forEach(function (e){e.innerText = "-";});
	
			var countdownBg = document.createElement("div");
			countdownBg.id = "countdownContainer";
			countdownBg.innerHTML = `<div id=countdownBlur></div><h1 id="countdownText"></h1>`
			document.body.appendChild(countdownBg);
			gamesend("game_ready");
		}
	
		function updateGame(message) {
	
			if (url.searchParams.get("mode") != "full_ai"){
				playerOneScore.innerText = `${message.player1.score}/${maxScore}`;
				playerTwoScore.innerText = `${message.player2.score}/${maxScore}`;
			}
			else{
				playerOneScore.innerText = message.player1.score;
				playerTwoScore.innerText = message.player2.score;
			}
			player1.x = message.player1.x;
			player1.y = message.player1.y;
			player1.score = message.player1.score;
	
			player2.x = message.player2.x;
			player2.y = message.player2.y;
			player2.score = message.player2.score;
	
			ball.x = message.ball.x;
			ball.y = message.ball.y;
	
			ballTrail.push({ x: ball.x, y: ball.y });
	
			if (ballTrail.length > 5) {
				ballTrail.shift();
			}
		}
	
		function gameRender() {
			ctx.fillStyle = client.mainTextRgb;
			ctx.strokeStyle = client.mainTextRgb;
			ctx.clearRect(0, 0, canvas.width, canvas.height);
	
			if (countdown !== "" && document.getElementById("countdownText"))
				document.getElementById("countdownText").innerText = countdown;
			drawMiddleLine();
			drawBallTrail();
			drawBall();
			drawPaddles();
		}
	
		function drawMiddleLine() {
			ctx.beginPath();
			ctx.setLineDash([ball.size, ball.size]);
			ctx.moveTo(canvas.width / 2, ball.size / 2);
			ctx.lineTo(canvas.width / 2, canvas.height);
			ctx.stroke();
			ctx.closePath();
		}
	
		function drawBall() {
			ctx.beginPath();
			ctx.rect(ball.x, ball.y, ball.size, ball.size);
			ctx.fill();
			ctx.closePath();
		}
	
		function hexToRgb(hex) {
			hex = hex.replace(/^#/, '');
	
			let bigint = parseInt(hex, 16);
			let r = (bigint >> 16) & 255;
			let g = (bigint >> 8) & 255;
			let b = bigint & 255;
	
			return [r, g, b];
		}
	
		function drawBallTrail() {
			const rgb = hexToRgb(client.mainTextRgb);
			for (let i = 0; i < ballTrail.length; i++) {
				const trail = ballTrail[i];
				const opacity = (i + 1) / ballTrail.length;
				ctx.fillStyle = `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${opacity})`;
				ctx.beginPath();
				ctx.rect(trail.x, trail.y, ball.size, ball.size);
				ctx.fill();
				ctx.closePath();
			}
			ctx.fillStyle = client.mainTextRgb;
		}
	
		function drawPaddles() {
			ctx.beginPath();
			ctx.rect(player1.x, player1.y, paddle.width, paddle.height);
			ctx.fill();
			ctx.closePath();
	
			ctx.beginPath();
			ctx.rect(player2.x, player2.y, paddle.width, paddle.height);
			ctx.fill();
			ctx.closePath();
		}
	
		function cleanup() {
			window.removeEventListener('beforeunload', handleBeforeUnload);
			document.getElementById('goHomeButton').removeEventListener('click', handleGoHomeButton);
			window.removeEventListener('popstate', handlePopState);
			document.removeEventListener("keydown", handleKeyDown);
			document.removeEventListener("keyup", handleKeyUp);
			window.removeEventListener("keydown", keydownExitEventListener);
			window.removeEventListener("click", clickExitEventListener);
			if (document.querySelector("#countdownContainer"))
				document.querySelector("#countdownContainer").remove();
			if (document.querySelector("#winContainer"))
				document.querySelector("#winContainer").remove();
			clearInterval(displayInterval);
			socket.close();
		}
	
		function handleBeforeUnload() {
			cleanup();
		}
	
		function handleGoHomeButton() {
			cleanup();
		}
	
		function handlePopState() {
			cleanup();
		}
	
		function handleKeyDown(event) {
			if (mapAvailableKeyCode[event.code])
				keysDown[event.code] = true;
		}
	
		function handleKeyUp(event) {
			if (mapAvailableKeyCode[event.code])
				keysDown[event.code] = false;
		}
	
		function KeyPress() {
			if (JSON.stringify(keysDown) !== JSON.stringify(oldKeysDown)) {
				gamesend("game_keydown", keysDown);
				oldKeysDown = JSON.parse(JSON.stringify(keysDown));
			}
		}
	
	
		function keydownExitEventListener(event){
			if (event.key == "Escape"){
				cleanup();
				myPushState(`https://${hostname.host}/home`);
				document.querySelectorAll("#winContainer, #waitContainer").forEach(function (elem){
					elem.remove();
				})
			}
		}
	
		function clickExitEventListener(event){
			if (event.target.id == "winBlur"){
				cleanup();
				myPushState(`https://${hostname.host}/home`);
				document.querySelectorAll("#winContainer, #waitContainer").forEach(function (elem){
					elem.remove();
				})
			}
		}
	
		function displayWaiting(){
			var container = document.createElement("div");
			container.id = "waitContainer";
			container.innerHTML = `<div id="waitBlur"></div>
				<div id="wait">${client.langJson['game']['wait']}</div>
			`
			document.body.appendChild(container);
			window.addEventListener("keydown", keydownExitEventListener);
			document.querySelectorAll(".playerScore").forEach(function (e){e.innerText = "-";});
			document.querySelectorAll(".playerName").forEach(function (e){e.innerText = "";});
	
			document.querySelector("#playerOne > .playerName").innerText = client.username;
			addPfpUrlToImgSrc(document.getElementById("playerOnePfp"), client.pfpUrl);
			addPfpUrlToImgSrc(document.getElementById("playerTwoPfp"), "");
		}
	
		function displayWinner(username, profile_picture){
			var container = document.createElement("div");
			container.id = "winContainer";
			container.innerHTML = `<div id=winBlur></div>
			<div id="winBg">
				<div>
					<div id="winPfpContainer">
						<img id="winPfp">
					</div>
					<h1 id="winName">${username} ${client.langJson['game']['winnedText']}</h1>
					<button id="replayButton">${client.langJson['game']['replay']}</button>
				</div>
			</div>`;
			if (mode == "local")
				container.querySelector("#winPfpContainer").remove();
			else
				addPfpUrlToImgSrc(container.querySelector("#winPfp"), profile_picture);
			document.body.appendChild(container);
			container.querySelector("#replayButton").addEventListener("click", (e) => {
				window.removeEventListener("keydown", keydownExitEventListener);
				window.removeEventListener("click", clickExitEventListener);
				gamesend(url.searchParams.get("mode"), url.searchParams.get("room"))
				document.getElementById("winContainer").remove();
				if (mode == "game_remote"){
					displayWaiting();
				}
			})
	
			confetti({
				particleCount: 500,
				spread: 40,
				origin: { y: 1, x: -0.1 },
				startVelocity : 100,
				angle: 45
			})
	
			confetti({
				particleCount: 500,
				spread: 40,
				origin: { y: 1, x: 1.1 },
				startVelocity : 100,
				angle: -225
			})
			window.addEventListener("keydown", keydownExitEventListener);
			window.addEventListener("click", clickExitEventListener);
		}
	}
	else if (url.pathname.startsWith("/tournament")){
		document.querySelector("#subtitle").innerText = client.langJson['game']['tournamentSubtitle'];
		(async () => {
			const fetchResult = await fetch('/api/user/get_tournament', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ "id": url.searchParams.get("id")}),
				credentials: 'include'
			})
			const result = await fetchResult.json();
			if (fetchResult.ok){
				tournament = result;
			}
			gameContainer.style.setProperty("display", "none");
			tournamentContainer.style.setProperty("display", "flex");
			displayTournament();
			window.addEventListener("resize", displayTournament);
		})()
	}
}
