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

	const socket = new WebSocket("/ws/game/");

	socket.onopen = function() {
		console.log("Connection established");
	}

	socket.onmessage = function(event) {
		let data = JSON.parse(event.data);
		if (data.type === "game_init") {
			waiting = false;
			clearInterval(waitingInterval); // Stop the waiting message interval
			gameInit(data.message);
		} else if (data.type === "game_update") {
			updateGame(data.message);
		} else if (data.type === "game_countdown") {
			gameCountdown(data.message);
		} else if (data.type === "game_start") {
			setInterval(() => gameRender(), 16);
			setInterval(() => KeyPress(), 16);
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

		player2.x = message.player2.x;
		player2.y = message.player2.y;

		ball.size = message.ball.size;
		ball.x = message.ball.x;
		ball.y = message.ball.y;

		ctx.fillStyle = 'white';
		ctx.strokeStyle = 'white';
		ctx.lineWidth = paddle.width / 4;
	}

	function updateGame(message) {
		player1.x = message.player1.x;
		player1.y = message.player1.y;

		player2.x = message.player2.x;
		player2.y = message.player2.y;

		ball.x = message.ball.x;
		ball.y = message.ball.y;

		ballTrail.push({ x: ball.x, y: ball.y });

		if (ballTrail.length > 5) {
			ballTrail.shift();
		}
	}

	function gameCountdown(message) {
		ctx.fillStyle = 'white';
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.font = "100px pong";
		ctx.textAlign = "center";
		ctx.fillText(message, canvas.width / 2, canvas.height / 2);
	}

	function gameRender() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		if (waiting) {
			drawWaitingMessage();
		} else {
			drawMiddleLine();
			drawBallTrail();
			drawBall();
			drawPaddles();
		}
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

	function drawBallTrail() {
		for (let i = 0; i < ballTrail.length; i++) {
			const trail = ballTrail[i];
			const opacity = (i + 1) / ballTrail.length;
			ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
			ctx.beginPath();
			ctx.rect(trail.x, trail.y, ball.size, ball.size);
			ctx.fill();
			ctx.closePath();
		}
		ctx.fillStyle = 'white';
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
		ctx.fillStyle = 'white';
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		ctx.font = "80px pong";
		ctx.textAlign = "center";
		let dots = '.'.repeat(dotCount % 4);
		ctx.fillText(`waiting${dots}`, canvas.width / 2, canvas.height / 2);
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

	waitingInterval = setInterval(() => gameRender(), 500); // Adjust the interval for smoother animation
}

game();
