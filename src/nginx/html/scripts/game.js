var minConnectionWidth = 25;
var playerOneScore;
var playerTwoScore;
var singleRoundDisplayIdx = 0;
maxScore = 5;

var gameContainer;
var tournamentContainer;
var matchContainer;
var treeCanva;

var tournament = null;
var match = null;

var matchInfoChart = null, playerOneInfoChart = null, playerTwoInfoChart = null;

var playerOneInfo = [0,0,0], playerTwoInfo = [0,0,0]

var userContainerAnchor = `
<div class="anchor"></div>
<a tabindex="-1" class="username"></a>
<div class="score"></div>
`

var lobbyPlayerContainer= `
<div class="lobbyPlayerContainer">
	<div class="lobbyPlayer">
		<a class="username"></a>
		<div class="lobbyPlayerPfpContainer">
			<img class="lobbyPlayerPfp">
		</div>
	</div>
</div>
`

var gameContainer = `
<div id="gameContainer">
	<div id="controlerPlayerOne">
		<div class="leftBtnContainer" tabindex="14">
			<button class="leftBtn"></button>
		</div>
		<div class="rightBtnContainer" tabindex="15">
			<button class="rightBtn"></button>
		</div>
	</div>
	<div id="gameDisplay">
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
	<div id="controlerPlayerTwo">
		<div class="leftBtnContainer" tabindex="14">
			<button class="leftBtn"></button>
		</div>
		<div class="rightBtnContainer" tabindex="15">
			<button class="rightBtn"></button>
		</div>
	</div>
</div>`

var matchContainer = `
<div id="matchContainer">
	<div id="matchInfo"> 
		<div id="exchangeContainer">
			<table class="landscape">
				<caption class="exchangeTablesCaption"></caption>
				<tr>
					<th scope="row" id="totalExchangeTitle"></th>
					<td id="totalExchange"></td>
				</tr>
				<tr>
					<th scope="row" id="averageExchangeTitle"></th>
					<td id="averageExchange"></td>
				</tr>
				<tr>
					<th scope="row" id="longestExchangeTitle"></th>						
					<td id="longestExchange"></td>
				</tr>
			</table>
			<table class="portrait">
				<caption class="exchangeTablesCaption"></caption>
				<tr>
					<th scope="col" id="totalExchangeTitle"></th>
					<th scope="col" id="averageExchangeTitle"></th>
					<th scope="col" id="longestExchangeTitle"></th>
					
				</tr>
				<tr>
					<td id="totalExchange"></td>
					<td id="averageExchange"></td>
					<td id="longestExchange"></td>
				</tr>
			</table>
		</div>
		<div id="matchInfoGraphContainer">
			<div id="matchInfoLegendContainer"></div>
			<canvas id="matchInfoGraph"></canvas>
		</div>
	</div>
	<div id="matchPlayersInfo">
		<div class="playerInfoContainer" id="playerOne">
			<div class="playerInfo">
				<div class="playerPfp">
					<img id="playerOnePfp">
				</div>
				<div class="playerNamesContainer">
					<a class="playerName"></a>
					<a class="playerDisplayName"></a>
				</div>
				<h2 class="playerScore">-</h2>
			</div>
			<div id="playerInfoGraphContainer">
				<div id="playerOneLegendContainer"></div>
				<canvas id="playerOneInfoGraph"></canvas>
			</div>
		</div>
		<div class="playerInfoContainer" id="playerTwo">
			<div class="playerInfo">
				<div class="playerPfp">
					<img id="playerTwoPfp">
				</div>
				<div class="playerNamesContainer">
					<a class="playerName"></a>
					<a class="playerDisplayName"></a>
				</div>
				<h2 class="playerScore">-</h2>
			</div>
			<div id="playerInfoGraphContainer">
				<div id="playerTwoLegendContainer"></div>
				<canvas id="playerTwoInfoGraph"></canvas>
			</div>
		</div>
	</div>
</div>`

var tournamentContainer = `
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
			<a class="contestMatchResume quarter match one">
			</a>
			<a class="contestMatchResume quarter match two">
			</a>
		</div>


		<div class="round semi left">
			<a class="contestMatchResume semi match one">
			</a>
		</div>


		<div class="round final">
			<a class="contestMatchResume final match one">
			</a>
		</div>

		<div class="round semi right">
			<a class="contestMatchResume semi match two">
			</a>
		</div>
		<div class="round quarter right">
			<a class="contestMatchResume quarter match three">
			</a>
			<a class="contestMatchResume quarter match four">
			</a>
		</div>
	</div>
</div>`


var template = `
<div id="pageContentContainer">
	${gameContainer}
	${matchContainer}
	${tournamentContainer}
	<div id="controlerSlide">
		<div class="leftBtnContainer" tabindex="12" aria-label="Switch tournament section">
			<button class="leftBtn"></button>
		</div>
		<div class="rightBtnContainer" tabindex="13" aria-label="Switch tournament section">
			<button class="rightBtn"></button>
		</div>
	</div>
</div>
`

function leftSlideBtn(){
	var contest = document.querySelector(".singleRoundDisplay#tournamentContainer");
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

		document.querySelector("#controlerSlide .leftBtnContainer").removeEventListener("click", leftSlideBtn);
		document.querySelector("#controlerSlide .leftBtnContainer").onkeydown = null;
		document.querySelector("#controlerSlide .rightBtnContainer").removeEventListener("click", rightSlideBtn);
		document.querySelector("#controlerSlide .rightBtnContainer").onkeydown = null;

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
			document.querySelector("#controlerSlide .leftBtnContainer").addEventListener("click", leftSlideBtn);
			document.querySelector("#controlerSlide .leftBtnContainer").onkeydown = leftBtnKeydownEvent;
			document.querySelector("#controlerSlide .rightBtnContainer").addEventListener("click", rightSlideBtn);
			document.querySelector("#controlerSlide .rightBtnContainer").onkeydown = rightBtnKeydownEvent;
		}, 500);
	}
}

function rightSlideBtn(){
	var contest = document.querySelector(".singleRoundDisplay#tournamentContainer");
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

		document.querySelector("#controlerSlide .leftBtnContainer").removeEventListener("click", leftSlideBtn);
		document.querySelector("#controlerSlide .leftBtnContainer").onkeydown = null;
		document.querySelector("#controlerSlide .rightBtnContainer").removeEventListener("click", rightSlideBtn);
		document.querySelector("#controlerSlide .rightBtnContainer").onkeydown = null;

		document.querySelector("#treeCanva").animate(move, time);
		contest.style.setProperty("left", `-${getWindowWidth() * singleRoundDisplayIdx}px`)

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
			document.querySelector("#controlerSlide .leftBtnContainer").addEventListener("click", leftSlideBtn);
			document.querySelector("#controlerSlide .leftBtnContainer").onkeydown = leftBtnKeydownEvent;
			document.querySelector("#controlerSlide .rightBtnContainer").addEventListener("click", rightSlideBtn);
			document.querySelector("#controlerSlide .rightBtnContainer").onkeydown = rightBtnKeydownEvent;
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

	document.querySelector("#controlerSlide .leftBtnContainer").addEventListener("click", leftSlideBtn);
	document.querySelector("#controlerSlide .leftBtnContainer").onkeydown = leftBtnKeydownEvent;
	document.querySelector("#controlerSlide .rightBtnContainer").addEventListener("click", rightSlideBtn);
	document.querySelector("#controlerSlide .rightBtnContainer").onkeydown = rightBtnKeydownEvent;
	document.querySelectorAll(".contestMatchResume").forEach(function (elem){
		elem.innerHTML = `
		<div class="contestUserContainer left">${userContainerAnchor}</div>
		<div class="contestUserContainer right">${userContainerAnchor}</div>
		`
	})
	setNotifTabIndexes(14);
	game();
}

function setTournamentTreeValue(is_finished){
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
	Object.keys(tournament).forEach(function(round){
		Object.keys(tournament[round]).forEach(function(matchNumber){
			Object.keys(tournament[round][matchNumber]).forEach(function(player){
				var selector = `${positionMap[round]}${positionMap[matchNumber]} ${positionMap[player]}`;
				if (player != 'id'){
					if (tournament[round][matchNumber][player]['username']){
						document.querySelector(`${selector} .username`).classList.remove("waiting");
						if (tournament[round][matchNumber][player]['username'] == tournament[round][matchNumber][player]['display_name'])
							document.querySelector(`${selector} .username`).innerText = tournament[round][matchNumber][player]['username'];
						else{
							document.querySelector(`${selector} .username`).classList.add("displayName")
							document.querySelector(`${selector} .username`).innerText = tournament[round][matchNumber][player]['display_name'];
						}
						if (is_finished)
							document.querySelector(`${selector} .username`).href = `https://${hostname.host}/user/${tournament[round][matchNumber][player]['username']}`;
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
				}
				else{
					document.querySelector(`${positionMap[round]}${positionMap[matchNumber]}`).href = `https://${hostname.host}/match?id=${tournament[round][matchNumber][player]}`;

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

function displayTournament(is_finished = false){
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
	document.querySelector("#controlerSlide .leftBtnContainer").onmousedown = function() {};
	document.querySelector("#controlerSlide .leftBtnContainer").onmouseup = function() {};
	document.querySelector("#controlerSlide .rightBtnContainer").onmousedown = function() {};
	document.querySelector("#controlerSlide .rightBtnContainer").onmouseup = function() {};
	setTournamentTreeValue(is_finished);
	if (playersCount == 8/* || 1*/){

		document.querySelector("#controlerSlide .leftBtnContainer").onclick = leftSlideBtn;
		document.querySelector("#controlerSlide .rightBtnContainer").onclick = rightSlideBtn;
		document.querySelector("#controlerSlide .leftBtnContainer").onkeydown = leftBtnKeydownEvent;
		document.querySelector("#controlerSlide .rightBtnContainer").onkeydown = rightBtnKeydownEvent;

		document.querySelector("#lobby").style.setProperty("display", "none");
		document.querySelector("#tournament").style.setProperty("display", "flex");
		var minFullTreeWidth = 870;
		gameContainer = document.getElementById("gameContainer");
		tournamentContainer = document.getElementById("tournamentContainer");
		matchContainer = document.getElementById("matchContainer");

		gameContainer.style.setProperty("display", "none");
		matchContainer.style.setProperty("display", "none");
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
			document.querySelector("#controlerSlide").classList.add("singleRoundDisplay");
			tournamentContainer.classList.add("singleRoundDisplay");
		}
		else {
			tournamentContainer.classList.remove("singleRoundDisplay");
			document.querySelector("#controlerSlide").classList.remove("singleRoundDisplay");
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
		document.querySelector("#controlerSlide").classList.remove("singleRoundDisplay")
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
var playerKeyMap, playerTouchMap;

function game() {
	const url =  new URL(window.location.href);

	var tournamentContainer = document.getElementById("tournamentContainer");
	var matchContainer = document.getElementById("matchContainer");
	var gameContainer = document.getElementById("gameContainer");
	matchContainer.style.setProperty("display", "none");
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
		playerKeyMap = keyMap;
		playerTouchMap = keyMap;
		if (isMobile()){
			document.querySelector("#controlerPlayerOne").style.setProperty("display", "flex");
//			document.querySelector("#controlerSlide").style.setProperty("display", "flex");
		}

		if (mode == "local"){
			document.querySelector("#gameContainer").classList.add("local");
			document.querySelectorAll("#gameContainer .playerPfp").forEach(function (elem){
				elem.style.setProperty("display", "none");
			})
			document.querySelectorAll("#gameContainer .playerInfoContainer").forEach(function (elem) {
				elem.style.setProperty("justify-content", "center");
			});
			if (isMobile()){
				document.querySelector("#controlerPlayerTwo").style.setProperty("display", "flex");
			}
		}
		else{
			document.querySelectorAll("#gameContainer .playerPfp").forEach(function (elem){
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
			if (mode == "remote"){
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
				document.querySelector("#game").style.setProperty("display", "block");
				window.removeEventListener("resize", displayTournament);
				gameContainer.style.setProperty("display", "flex");
				matchContainer.style.setProperty("display", "none");
				tournamentContainer.style.setProperty("display", "none");
				checkGameSize();
				if (mode == "tournament")
					checkTournementRound();
				gameInit(data.message);
			} else if (data.type === "game_countdown") {
				countdown = data.message;
			} else if (data.type === "game_update") {
				countdown = "";
				updateGame(data.message);
			} else if (data.type === "game_start") {
				var leftBtnInterval, p2leftBtnInterval;
				var rightBtnInterval, p2rightBtnInterval;

				if ((mode=="local" || client.username == player2.name) && isMobile()){
					document.querySelector("#controlerPlayerTwo").style.setProperty("display", "flex");
					if (mode != "local"){
						document.querySelector("#controlerPlayerOne").style.setProperty("display", "none");
						playerTouchMap = FullInversedKeyMap;
					}
					document.querySelector("#controlerPlayerTwo .leftBtnContainer").onpointerdown = function() {
						keysDown[playerTouchMap['ArrowUp']] = true;
						p2leftBtnInterval = setInterval(() => gamesend("game_keydown", keysDown), 3);
					};
					document.querySelector("#controlerPlayerTwo .leftBtnContainer").onpointerup = function() {
						keysDown[playerTouchMap['ArrowUp']] = false;
						gamesend("game_keydown", keysDown); clearInterval(p2leftBtnInterval);
					};
					
					document.querySelector("#controlerPlayerTwo .rightBtnContainer").onpointerdown = function() {
						keysDown[playerTouchMap['ArrowDown']] = true;
						p2rightBtnInterval = setInterval(() => gamesend("game_keydown", keysDown), 3);
					};
					document.querySelector("#controlerPlayerTwo .rightBtnContainer").onpointerup = function() {
						keysDown[playerTouchMap['ArrowDown']] = false;
						gamesend("game_keydown", keysDown); clearInterval(p2rightBtnInterval);
					};
				}
				else{
					document.querySelector("#controlerPlayerTwo").style.setProperty("display", "none");
					document.querySelector("#controlerPlayerTwo .leftBtnContainer").onpointerdown = null;
					document.querySelector("#controlerPlayerTwo .leftBtnContainer").onpointerup = null;
					
					document.querySelector("#controlerPlayerTwo .rightBtnContainer").onpointerdown = null;
					document.querySelector("#controlerPlayerTwo .rightBtnContainer").onpointerup = null;
				}

				document.querySelector("#controlerPlayerOne .leftBtnContainer").onpointerdown = function() {
					keysDown[playerTouchMap['KeyD']] = true;
					leftBtnInterval = setInterval(() => gamesend("game_keydown", keysDown), 3);
				};
				document.querySelector("#controlerPlayerOne .leftBtnContainer").onpointerup = function() {
					keysDown[playerTouchMap['KeyD']] = false;
					gamesend("game_keydown", keysDown); clearInterval(leftBtnInterval);
				};
				

				document.querySelector("#controlerPlayerOne .rightBtnContainer").onpointerdown = function() {
					keysDown[playerTouchMap['KeyA']] = true;
					rightBtnInterval = setInterval(() => gamesend("game_keydown", keysDown), 3);
				};
				document.querySelector("#controlerPlayerOne .rightBtnContainer").onpointerup = function() {
					keysDown[playerTouchMap['KeyA']] = false;
					gamesend("game_keydown", keysDown); clearInterval(rightBtnInterval);
				};

				document.querySelectorAll(".leftBtnContainer, .rightBtnContainer").forEach(function (elem){
					elem.oncontextmenu = function(e){e.preventDefault();e.stopPropagation();return false;};
				})
				
				checkGameSize();
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
				matchContainer.style.setProperty("display", "none");
				tournamentContainer.style.setProperty("display", "flex");
				window.addEventListener("resize", displayTournament);
			} else if (data.type === "tournament_end") {
				gameContainer.style.setProperty("display", "none");
				matchContainer.style.setProperty("display", "none");
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
			if (mode == "remote"){
				if (document.getElementById("waitingContainer"))
					document.getElementById("waitingContainer").remove();
			}
			window.removeEventListener("keydown", keydownExitEventListener);
		
			addPfpUrlToImgSrc(document.querySelector("#gameContainer #playerOnePfp"), player1.profile_picture);
			addPfpUrlToImgSrc(document.querySelector("#gameContainer #playerTwoPfp"), player2.profile_picture);

			document.querySelector("#gameContainer #playerOne > .playerName").innerText = player1.name;
			document.querySelector("#gameContainer #playerTwo > .playerName").innerText = player2.name;
		
			if (mode == "full_ai")
				document.querySelector("#gameContainer #playerOnePfp").style.setProperty("transform", "rotateY(180deg)");

			document.querySelectorAll("#gameContainer .playerScore").forEach(function (e){e.innerText = "-";});

			var countdownBg = document.createElement("div");
			countdownBg.id = "countdownContainer";
			countdownBg.innerHTML = `<div id=countdownBlur></div><h1 id="countdownText"></h1>`
			document.body.appendChild(countdownBg);
			checkGameSize();
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
			if (document.querySelector("#waitingContainer"))
				document.querySelector("#waitingContainer").remove();
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
			if (mapAvailableKeyCode[event.code]){
				keysDown[playerKeyMap[event.code]] = true;
			}
		}

		function handleKeyUp(event) {
			if (mapAvailableKeyCode[event.code]){
				keysDown[playerKeyMap[event.code]] = false;
			}
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
				document.querySelectorAll("#winContainer, #waitingContainer").forEach(function (elem){
					elem.remove();
				})
			}
		}

		function clickExitEventListener(event){
			if (event.target.id == "winBlur"){
				cleanup();
				myPushState(`https://${hostname.host}/home`);
				document.querySelectorAll("#winContainer, #waitingContainer").forEach(function (elem){
					elem.remove();
				})
			}
		}

		function displayWaiting(){
			var container = document.createElement("div");
			container.id = "waitingContainer";
			container.innerHTML = `<div id="waitBlur"></div>
				<div id="waitContainer">
					<div id="wait">${client.langJson['game']['wait']}</div>
					<button id="quitWaitBtn">${client.langJson['game']['quit']}</button>
				</div>
			`
			container.querySelector("#quitWaitBtn").onclick = function(){
				cleanup()
				myPushState(`https://${hostname.host}/home`);				
			};
			document.body.appendChild(container);
			window.addEventListener("keydown", keydownExitEventListener);
			document.querySelectorAll("#gameContainer .playerScore").forEach(function (e){e.innerText = "-";});
			document.querySelectorAll("#gameContainer .playerName").forEach(function (e){e. innerText = "";});

			document.querySelector("#gameContainer #playerOne > .playerName").innerText = client.username;
			addPfpUrlToImgSrc(document.querySelector("#gameContainer #playerOnePfp"), client.pfpUrl);
			addPfpUrlToImgSrc(document.querySelector("#gameContainer #playerTwoPfp"), "");
			checkGameSize();
			document.querySelector("#game").style.setProperty("display", "none");
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
			document.querySelector("#replayButton").focus();
			document.querySelector("#replayButton").onkeydown = function(e){
				if (e.key == "Tab")
					e.preventDefault();
			}
			checkWinnerDisplaySize();
			container.querySelector("#replayButton").addEventListener("click", (e) => {
				window.removeEventListener("keydown", keydownExitEventListener);
				window.removeEventListener("click", clickExitEventListener);
				gamesend(mode, url.searchParams.get("room"))
				document.getElementById("winContainer").remove();
				if (mode == "remote"){
					addPfpUrlToImgSrc(document.querySelector("#gameContainer #playerOnePfp"), "");
					addPfpUrlToImgSrc(document.querySelector("#gameContainer #playerTwoPfp"), "");
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
			matchContainer.style.setProperty("display", "none");
			tournamentContainer.style.setProperty("display", "flex");
			tournamentContainer.classList.add("selectable");
			document.querySelector(".contestMatchResume.quarter.match.one").tabIndex = 12;
			document.querySelector(".contestMatchResume.quarter.match.two").tabIndex = 15;
			document.querySelector(".contestMatchResume.quarter.match.three").tabIndex = 18;
			document.querySelector(".contestMatchResume.quarter.match.four").tabIndex = 21;
			document.querySelector(".contestMatchResume.semi.match.one").tabIndex = 24;
			document.querySelector(".contestMatchResume.semi.match.two").tabIndex = 27;
			document.querySelector(".contestMatchResume.final.match.one").tabIndex = 30;

			document.querySelectorAll(".contestMatchResume").forEach(function (elem){
				elem.onkeydown = function (e){
					if (e.target.classList.contains("contestMatchResume") && e.key == "Enter"){
						try{
							elem.querySelector(".winner .username").tabIndex = elem.tabIndex + 1;
							elem.querySelector(".loser .username").tabIndex = elem.tabIndex + 2;
						}catch {
							popUpError("Error tab indexes on user redirection");
						}
					}
				}
			})
			setNotifTabIndexes(33);
			(async () => (loadCurrentLang()))();
			displayTournament(true);
			setTournamentAriaLabeL();
			window.addEventListener("resize", displayTournament);

		})()
	}
	else if (url.pathname.startsWith("/match")){
		document.querySelector("#subtitle").innerText = client.langJson['game']['matchSubtitle'];
		(async () => {
			const fetchResult = await fetch('/api/user/get_match', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({ "id": url.searchParams.get("id")}),
				credentials: 'include'
			})
			const result = await fetchResult.json();
			if (fetchResult.ok){

				gameContainer.style.setProperty("display", "none");
				matchContainer.style.setProperty("display", "flex");
				tournamentContainer.style.setProperty("display", "none");
				match = result;
				addPfpUrlToImgSrc(document.querySelector("#matchContainer #playerOnePfp"), match.player_one_profile_picture);
				addPfpUrlToImgSrc(document.querySelector("#matchContainer #playerTwoPfp"), match.player_two_profile_picture);
	
				document.querySelector("#matchContainer #playerOne .playerInfo .playerNamesContainer > .playerName").innerText = match.player_one;
				document.querySelector("#matchContainer #playerOne .playerInfo .playerNamesContainer > .playerDisplayName").innerText = `${match.player_one_display_name}`;
				
				document.querySelector("#matchContainer #playerOne .playerInfo .playerNamesContainer > .playerName").href = `https://${hostname.host}/user/${match.player_one}`;
				document.querySelector("#matchContainer #playerOne .playerInfo .playerNamesContainer > .playerDisplayName").href = `https://${hostname.host}/user/${match.player_one}`;
				
				document.querySelector("#matchContainer #playerTwo .playerInfo .playerNamesContainer > .playerName").innerText = match.player_two;
				document.querySelector("#matchContainer #playerTwo .playerInfo .playerNamesContainer > .playerDisplayName").innerText = `${match.player_two_display_name}`;
				
				document.querySelector("#matchContainer #playerTwo .playerInfo .playerNamesContainer > .playerName").href = `https://${hostname.host}/user/${match.player_two}`;
				document.querySelector("#matchContainer #playerTwo .playerInfo .playerNamesContainer > .playerDisplayName").href = `https://${hostname.host}/user/${match.player_two}`;
				
				
				document.querySelector("#matchContainer #playerOne .playerInfo > .playerScore").innerText = client.langJson['match']['points'].replace("${POINTS}", match.player_one_pts);
				document.querySelector("#matchContainer #playerTwo .playerInfo > .playerScore").innerText = client.langJson['match']['points'].replace("${POINTS}", match.player_two_pts);
				
				document.querySelector("#matchContainer .portrait #totalExchange").innerText = match.exchanges;
				document.querySelector("#matchContainer .portrait #averageExchange").innerText = (match.exchanges / (match.player_one_pts + match.player_two_pts)).toFixed(2);
				document.querySelector("#matchContainer .portrait #longestExchange").innerText = match.exchangesMax;

				document.querySelector("#matchContainer .landscape #totalExchange").innerText = match.exchanges;
				document.querySelector("#matchContainer .landscape #averageExchange").innerText = (match.exchanges / (match.player_one_pts + match.player_two_pts)).toFixed(2);
				document.querySelector("#matchContainer .landscape #longestExchange").innerText = match.exchangesMax;
				playerOneInfo[0] = match.player_one_goals_up;
				playerOneInfo[1] = match.player_one_goals_mid;
				playerOneInfo[2] = match.player_one_goals_down;
				playerTwoInfo[0] = match.player_two_goals_up;
				playerTwoInfo[1] = match.player_two_goals_mid;
				playerTwoInfo[2] = match.player_two_goals_down;
				drawMatchInfoGraph(300)
				checkMatchSize()

			}
			
			setNotifTabIndexes(12);
			(async () => (loadCurrentLang()))();
		})()
	}
}


function drawMatchInfoGraph(size, matchChartSize){
	if (document.getElementById("matchInfoGraph"))
		document.getElementById("matchInfoGraph").remove();

	if (document.querySelector("#playerOneInfoGraph"))
		document.querySelector("#playerOneInfoGraph").remove();
	if (document.querySelector("#playerTwoInfoGraph"))
		document.querySelector("#playerTwoInfoGraph").remove();

	matchInfoContainer = document.getElementById("matchInfoGraphContainer");

	playerOneInfoGraphContainer = document.querySelector("#matchContainer #playerOne #playerInfoGraphContainer");
	playerTwoInfoGraphContainer = document.querySelector("#matchContainer #playerTwo #playerInfoGraphContainer");

	matchInfoGraph = document.createElement("canvas");
	matchInfoGraph.id = "matchInfoGraph";

	playerOneInfoGraph = document.createElement("canvas");
	playerOneInfoGraph.id = "playerOneInfoGraph";
	playerTwoInfoGraph = document.createElement("canvas");
	playerTwoInfoGraph.id = "playerTwoInfoGraph";

	matchInfoGraph.height= matchChartSize;
	matchInfoGraph.width = matchInfoGraph.height;	
	playerOneInfoGraph.height = size;
	playerOneInfoGraph.width = size;
	playerTwoInfoGraph.height = size;
	playerTwoInfoGraph.width = size;



	matchInfoContainer.appendChild(matchInfoGraph);
	playerOneInfoGraphContainer.appendChild(playerOneInfoGraph);
	playerTwoInfoGraphContainer.appendChild(playerTwoInfoGraph);

	const getOrCreateLegendList = (chart, id) => {
		const legendContainer = document.getElementById(id);
		let listContainer = legendContainer.querySelector('ul');
	  
		if (!listContainer) {
		  listContainer = document.createElement('ul');
		  listContainer.className = "legendContainer"
	  
		  legendContainer.appendChild(listContainer);
		}
	  
		return listContainer;
	};

	const htmlLegendPlugin = {
		id: 'htmlLegend',
		afterUpdate(chart, args, options) {
		  const ul = getOrCreateLegendList(chart, options.containerID);
	  
		  // Remove old legend items
		  while (ul.firstChild) {
			ul.firstChild.remove();
		  }
	  
		  // Reuse the built-in legendItems generator
		  const items = chart.options.plugins.legend.labels.generateLabels(chart);
	  
		  items.forEach(item => {
			const li = document.createElement('li');
			li.style.alignItems = 'center';
			li.style.cursor = 'pointer';
			li.style.display = 'flex';
			li.style.flexDirection = 'row';
			li.style.marginLeft = '10px';
	  
			li.onclick = () => {
			  const {type} = chart.config;
			  if (type === 'pie' || type === 'doughnut') {
				// Pie and doughnut charts only have a single dataset and visibility is per item
				chart.toggleDataVisibility(item.index);
			  } else {
				chart.setDatasetVisibility(item.datasetIndex, !chart.isDatasetVisible(item.datasetIndex));
			  }
			  chart.update();
			};
	  
			// Color box
			const boxSpan = document.createElement('span');
			boxSpan.style.background = item.fillStyle;
			boxSpan.style.borderColor = item.strokeStyle;
			boxSpan.style.borderWidth = item.lineWidth + 'px';
			boxSpan.style.display = 'inline-block';
			boxSpan.style.flexShrink = 0;
			boxSpan.style.height = '20px';
			boxSpan.style.marginRight = '10px';
			boxSpan.style.width = '20px';
	  
			// Text
			const textContainer = document.createElement('p');
			textContainer.style.color = item.fontColor;
			textContainer.style.margin = 0;
			textContainer.style.padding = 0;
			textContainer.style.textDecoration = item.hidden ? 'line-through' : '';
	  
			const text = document.createTextNode(item.text);
			textContainer.appendChild(text);
	  
			li.appendChild(boxSpan);
			li.appendChild(textContainer);
			ul.appendChild(li);
		  });
		}
	  };

	if (matchInfoChart){
		if (matchInfoChart instanceof Chart)
			matchInfoChart.destroy();
		else
			matchInfoChart = null;
	}
	if (playerOneInfoChart){
		if (playerOneInfoChart instanceof Chart)
			playerOneInfoChart.destroy();
		else
			playerOneInfoChart = null;
	}
	if (playerTwoInfoChart){
		if (playerTwoInfoChart instanceof Chart)
			playerTwoInfoChart.destroy();
		else
			playerTwoInfoChart = null;
	}

	function drawPlayerOneInfo(){
		const options = {
			plugins: {
				htmlLegend:{
					containerID: 'playerOneLegendContainer'
				},
				title: {
					color: window.getComputedStyle(document.documentElement).getPropertyValue("--main-text-rgb"),
					text: client.langJson["match"]["CVmatchInfoGraph"],
					font: {
						family : "pong",
						size : window.getComputedStyle(document.documentElement).fontSize.replace("px", "") / 1.25
					},
					display: true,
				},
				legend: {
					display: false,
				}
			},
		}
		const data = {
			datasets: [{
				data : playerOneInfo,
				backgroundColor : ['red','purple', 'blue'],
				borderWidth : 0
			}],
			labels : [	
				client.langJson["match"]["up"], client.langJson["match"]["mid"], client.langJson["match"]["down"]
			]
		}

		playerOneInfoChart = new Chart(document.querySelector("#playerOneInfoGraph"), {
			type: 'pie',
			data: data,
			options: options,
			plugins: [htmlLegendPlugin]
		});
	}

	function drawPlayerTwoInfo(){
		const options = {
			plugins: {
				title: {
					color: window.getComputedStyle(document.documentElement).getPropertyValue("--main-text-rgb"),
					text: client.langJson["match"]["CVmatchInfoGraph"],
					font: {
						family : "pong",
						size : window.getComputedStyle(document.documentElement).fontSize.replace("px", "") / 1.25
					},
					display: true,
				},
				legend: {
					display: false
				},
				htmlLegend:{
					containerID : 'playerTwoLegendContainer'
				}
			},
		}
		const data = {
			datasets: [{
				data : playerTwoInfo,
				backgroundColor : ['red','purple', 'blue'],
				borderWidth : 0
			}],
			labels : [	
				client.langJson["match"]["up"], client.langJson["match"]["mid"], client.langJson["match"]["down"]
			]
		}

		playerTwoInfoChart = new Chart(document.querySelector("#playerTwoInfoGraph"), {
			type: 'pie',
			data: data,
			options: options,
			plugins: [htmlLegendPlugin]
		});
	}

	function drawMatchInfo(){
		const options = {
			plugins: {
				title: {
					color: window.getComputedStyle(document.documentElement).getPropertyValue("--main-text-rgb"),
					text: client.langJson["match"]["CVmatchInfoGraph"],
					font: {
						family : "pong",
						size : window.getComputedStyle(document.documentElement).fontSize.replace("px", "") / 1.25
					},
					display: true,
				},
				legend: {
					display: false
				},
				htmlLegend:{
					containerID : 'matchInfoLegendContainer'
				}
			},
		}

		const data = {
			datasets: [{
				data : [playerOneInfo[0] + playerTwoInfo[0], playerOneInfo[1] + playerTwoInfo[1], playerOneInfo[2] + playerTwoInfo[2]],
				backgroundColor : ['red','purple', 'blue'],
				borderWidth : 0
			}],
			labels : [	
				client.langJson["match"]["up"], client.langJson["match"]["mid"], client.langJson["match"]["down"]
			]
		}

		matchInfoChart = new Chart(document.getElementById("matchInfoGraph"), {
			type: 'pie',
			data: data,
			options: options,
			plugins: [htmlLegendPlugin]
		});
	}
	drawMatchInfo();
	drawPlayerOneInfo();
	drawPlayerTwoInfo();
	matchInfoChart.resize(matchChartSize,matchChartSize);
	playerOneInfoChart.resize(size,size);
	playerTwoInfoChart.resize(size,size);
}

function setTournamentAriaLabeL(){
	content = client.langJson['tournament'];
	document.querySelectorAll(".contestMatchResume").forEach(function (elem){
		try {
			elem.setAttribute("aria-label", 
				content["matchResume"]
				.replace("${MATCH_NUMBER}", content[elem.classList[3]])
				.replace("${ROUND}", content[elem.classList[1]])
				.replace("${WINNER_USERNAME}", elem.querySelector(".winner .username").innerText)
				.replace("${LOSER_USERNAME}", elem.querySelector(".loser .username").innerText))	
		} catch {
			popUpError("Error setting aria labels");
		}
	})
	document.querySelectorAll(".contestMatchResume .username").forEach(function (elem){
		elem.setAttribute("aria-label", content["profile_redirection"].replace("${USERNAME}", elem.innerText));
	})
}
