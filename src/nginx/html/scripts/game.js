playerOneScore = document.querySelector("#playerOne > h1");
playerTwoScore = document.querySelector("#playerTwo > h1");
maxScore = 5;
{
	inputSearchUserContainer.style.setProperty("display", "none");
	homeBtn.style.setProperty("display", "block");
	dropDownUserContainer.style.setProperty("display", "flex");
	notifCenterContainer.style.setProperty("display", "flex");
}

function game() {
	const url =  new URL(window.location.href);
	const mode = url.searchParams.get("mode");
	document.querySelector("#subtitle").innerText = client.langJson['game'][url.searchParams.get("mode")];
	const socket = new WebSocket("/ws/game/");
	const canvas = document.getElementById('game');
	const ctx = canvas.getContext('2d');
	const keysDown = {
		"KeyS" : false,
		"KeyW" : false,
		"KeyA" : false,
		"KeyD" : false,
		"ArrowUp" : false,
		"ArrowDown" : false,
		"ArrowLeft" : false,
		"ArrowRight" : false,
	};
	const mapAvailableKeyCode = {
		"KeyS" : 1,
		"KeyW" : 1,
		"KeyA" : 1,
		"KeyD" : 1,
		"ArrowUp" : 1,
		"ArrowDown" : 1,
		"ArrowLeft" : 1,
		"ArrowRight" : 1,
	}
	const paddle = {};
	const player1 = {};
	const player2 = {};
	const ball = {};
	const ballTrail = [];
	let KeyPressInterval;
	let oldKeysDown = {};
	let countdown = "";

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
		setInterval(() => gameRender(), 16);
	}

	socket.onmessage = function(event) {
		let data = JSON.parse(event.data);
		if (data.type === "game_init") {
			gameInit(data.message);
		} else if (data.type === "game_countdown") {
			countdown = data.message;
		} else if (data.type === "game_update") {
			countdown = "";
			updateGame(data.message);
		} else if (data.type === "game_start") {
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
		
		if (mode == "game_local"){
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
		
		document.querySelector("#playerOne > h2").innerText = player1.name;
		document.querySelector("#playerTwo > h2").innerText = player2.name;

		if (mode == "game_full_ai")
			document.getElementById("playerOnePfp").style.setProperty("transform", "rotateY(180deg)");

		document.querySelectorAll(".playerScore").forEach(function (e){e.innerText = "-";});

		var countdownBg = document.createElement("div");
		countdownBg.id = "countdownContainer";
		countdownBg.innerHTML = `<div id=countdownBlur></div><h1 id="countdownText"></h1>`
		document.body.appendChild(countdownBg);
		gamesend("game_ready");
	}

	function updateGame(message) {

		if (url.searchParams.get("mode") != "game_full_ai"){
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
		
		document.querySelector("#playerOne > h2").innerText = client.username;
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
		if (mode == "game_local")
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

game();
