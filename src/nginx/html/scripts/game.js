function game() {
	const canvas = document.getElementById('game');
	const ctx = canvas.getContext('2d');

	canvas.width = 800;
	canvas.height = 600;

	const keysDown = {};
	const paddle = {};
	const player1 = {};
	const player2 = {};
	const ball = {};
	const ballTrail = [];
	let waiting = true;
	let dotCount = 0;
	let waitingInterval;
	let gameInterval;
	let KeyPressInterval;

	const socket = new WebSocket("/ws/game/");

	socket.onopen = function() {
		console.log("Connection established");
	}

	socket.onmessage = function(event) {
		let data = JSON.parse(event.data);
		if (data.type === "game_init") {
			waiting = false;
			clearInterval(waitingInterval);
			gameInit(data.message);
		} else if (data.type === "game_update") {
			updateGame(data.message);
		} else if (data.type === "game_countdown") {
			drawMessage(data.message);
		} else if (data.type === "game_start") {
			gameInterval = setInterval(() => gameRender(), 16);
			KeyPressInterval = setInterval(() => KeyPress(), 16);
		} else if (data.type === "game_end") {
			clearInterval(gameInterval);
			clearInterval(KeyPressInterval);
			drawMessage(data.message);
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

		player2.x = message.player2.x;
		player2.y = message.player2.y;
		player2.score = message.player2.score;

		ball.size = message.ball.size;
		ball.x = message.ball.x;
		ball.y = message.ball.y;

		ctx.fillStyle = client.mainTextRgb;
		ctx.strokeStyle = client.mainTextRgb;
		ctx.lineWidth = paddle.width / 4;
	}

	function updateGame(message) {
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

	function drawMessage(message) {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.font = "80px pong";
		ctx.textAlign = "center";
		ctx.fillText(message, canvas.width / 2, canvas.height / 2);
	}

	function gameRender() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		if (waiting) {
			drawWaitingMessage();
		} else {
			drawScore();
			drawMiddleLine();
			drawBallTrail();
			drawBall();
			drawPaddles();
		}
	}

	function drawScore() {
		ctx.font = "30px pong";
		ctx.textAlign = "center";
		ctx.fillText("Player 1: " + player1.score, canvas.width / 4, 50);
		ctx.fillText("Player 2: " + player2.score, canvas.width * 3 / 4, 50);
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

	function drawWaitingMessage() {
		let dots = '.'.repeat(dotCount % 4);
		let spacing = ' '.repeat(4 - dots.length);
		drawMessage(`  waiting${dots}${spacing}`);
		if (dotCount === 4)
			dotCount = 0;
		else
			dotCount++;
	}

	function cleanup() {
		window.removeEventListener('beforeunload', handleBeforeUnload);
		document.getElementById('goHomeButton').removeEventListener('click', handleGoHomeButton);
		window.removeEventListener('popstate', handlePopState);
		document.removeEventListener("keydown", handleKeyDown);
		document.removeEventListener("keyup", handleKeyUp);

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
		if (event.code === "KeyS" || event.code === "KeyW" || event.code === "ArrowUp" || event.code === "ArrowDown")
			keysDown[event.code] = true;
	}

	function handleKeyUp(event) {
		delete keysDown[event.code];
	}

	function KeyPress() {
		if (Object.keys(keysDown).length > 0)
			gamesend("game_keydown", keysDown);
	}

	window.addEventListener('beforeunload', handleBeforeUnload);
	document.getElementById('goHomeButton').addEventListener('click', handleGoHomeButton);
	window.addEventListener('popstate', handlePopState);
	document.addEventListener("keydown", handleKeyDown);
	document.addEventListener("keyup", handleKeyUp);

	waitingInterval = setInterval(() => gameRender(), 500);
}

game();
