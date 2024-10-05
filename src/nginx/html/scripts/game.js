function game() {
	const canvas = document.getElementById('game');
	const ctx = canvas.getContext('2d');

	const keysDown = {};
	const paddle = {};
	const player1 = {};
	const player2 = {};
	const ball = {};
	const ballTrail = [];

	const socket = new WebSocket("/ws/game/");

	socket.onopen = function() {
		console.log("Connection established");
	}

	socket.onmessage = function(event) {
		let data = JSON.parse(event.data);
		if (data.type === "game_init") {
			gameInit(data.message);
		}
		if (data.type === "game_update") {
			updateGame(data.message);
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

		setInterval(() => gameRender(), 16);
		setInterval(() => KeyPress(), 16);
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

	function gameRender() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);

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
}

game();
