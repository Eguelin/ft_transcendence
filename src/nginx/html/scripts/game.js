function game() {
	const canvas = document.getElementById('game');
	const ctx = canvas.getContext('2d');

	const keysDown = {};
	const paddle = {};
	const player1 = {};
	const player2 = {};
	const ball = {};

	const socket = new WebSocket("/ws/game/");

	socket.onopen = function() {
		console.log("Connection established");
		gamesend("game_init", {});
	}

	socket.onmessage = function(event) {
		let data = JSON.parse(event.data);
		console.log(data);
		if (data.type === "game_init") {
			gameInit(data.message);
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
		gameRender();
	}


	function gameRender() {
		ctx.beginPath();

		// Clear the canvas
		ctx.clearRect(0, 0, canvas.width, canvas.height);


		// Middle line
		ctx.fillStyle = 'white';
		ctx.strokeStyle = 'white';
		ctx.lineWidth = paddle.width / 4;
		ctx.setLineDash([ball.size, ball.size]);
		ctx.moveTo(canvas.width / 2, ball.size / 2);
		ctx.lineTo(canvas.width / 2, canvas.height);
		ctx.stroke();

		// Score
		// scoreRender();

		// Ball
		ctx.rect(ball.x, ball.y, ball.size, ball.size);

		// Right paddle
		ctx.rect(player1.x, player1.y, paddle.width, paddle.height);

		// Left paddle
		ctx.rect(player2.x, player2.y, paddle.width, paddle.height);

		ctx.closePath();
		ctx.fill();
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
		if (Object.keys(keysDown).length > 0)
			gamesend("game_keydown", keysDown);
	}

	function handleKeyUp(event) {
		delete keysDown[event.code];
	}

	window.addEventListener('beforeunload', handleBeforeUnload);
	document.getElementById('goHomeButton').addEventListener('click', handleGoHomeButton);
	window.addEventListener('popstate', handlePopState);
	document.addEventListener("keydown", handleKeyDown);
	document.addEventListener("keyup", handleKeyUp);
}

game();

// const canvas = document.getElementById('pong');
// const ctx = canvas.getContext('2d');

// const keysDown = {};

// const paddle = {
// 	height: 500,
// 	width: 50,
// 	speed: 30,
// 	left: {},
// 	right: {}
// };

// paddle.left = {
// 	x: 20,
// 	y: (canvas.height - paddle.height )/ 2,
// 	score: 0
// };

// paddle.right = {
// 	x: canvas.width - paddle.width - 20,
// 	y: (canvas.height - paddle.height )/ 2,
// 	score: 0
// };

// const ball = {
// 	x: (canvas.width - paddle.width) / 2,
// 	y: (canvas.height - paddle.width) / 2,
// 	dx: 0,
// 	dy: 0,
// 	speed: 20,
// 	angle: Math.PI + (Math.random() * 2 - 1) * Math.PI / 3,
// 	size: paddle.width
// };

// ctx.strokeStyle = 'white';
// ctx.lineWidth = 20;

// // Configuration de la ligne pointillée
// ctx.setLineDash([paddle.width, paddle.width]);

// function gameRender() {
// 	ctx.beginPath();

// 	// Background
// 	ctx.fillStyle = 'black';
// 	ctx.fillRect(0, 0, canvas.width, canvas.height);

// 	// Middle line
// 	ctx.fillStyle = 'white';
// 	ctx.moveTo(canvas.width / 2, paddle.width / 2);
// 	ctx.lineTo(canvas.width / 2, canvas.height);
// 	ctx.stroke();

// 	// Score
// 	scoreRender();

// 	// Ball
// 	ctx.rect(ball.x, ball.y, ball.size, ball.size);

// 	// Right paddle
// 	ctx.rect(paddle.right.x, paddle.right.y, paddle.width, paddle.height);

// 	// Left paddle
// 	ctx.rect(paddle.left.x, paddle.left.y, paddle.width, paddle.height);

// 	ctx.closePath();
// 	ctx.fill();
// }

// function KeyPress() {
// 	for (const key of Object.keys(keysDown)) {
// 		if (key === "KeyS" && paddle.left.y + paddle.height < canvas.height) {
// 			paddle.left.y += paddle.speed;
// 		} else if (key === "KeyW" && paddle.left.y > 0) {
// 			paddle.left.y -= paddle.speed;
// 		} else if (key === "ArrowUp" && paddle.right.y > 0) {
// 			paddle.right.y -= paddle.speed;
// 		} else if (key === "ArrowDown" && paddle.right.y + paddle.height < canvas.height) {
// 			paddle.right.y += paddle.speed;
// 		}
// 	}
// }

// function ballMove() {
// 	if (ball.y + ball.dy > canvas.height - ball.size || ball.y + ball.dy < 0) {
// 		ball.angle = -ball.angle;
// 	} else if (ball.x + ball.dx > canvas.width - ball.size || ball.x + ball.dx < 0) {
// 		if (ball.x > canvas.width / 2) {
// 			ball.angle = (Math.random() * 2 - 1) * Math.PI / 3;
// 			paddle.left.score++;

// 		} else {
// 			ball.angle = Math.PI + (Math.random() * 2 - 1) * Math.PI / 3;
// 			paddle.right.score++;
// 		}
// 		if (paddle.right.score === 10 || paddle.left.score === 10) {
// 			paddle.right.score = 0;
// 			paddle.left.score = 0;
// 		}
// 		ball.x = (canvas.width - paddle.width) / 2;
// 		ball.y = (canvas.height - paddle.width) / 2;
// 		ball.speed = 20;
// 	} else if ((ball.x + ball.dx + ball.size > paddle.right.x && paddleCollision(paddle.right))
// 		|| (ball.x + ball.dx < paddle.left.x + paddle.width && paddleCollision(paddle.left))) {
// 		if (ball.x > canvas.width / 2)
// 			ballrebond(paddle.right, "right");
// 		else
// 			ballrebond(paddle.left, "left");
// 		ball.speed += 1;
// 	}

// 	ball.dx = ball.speed * Math.cos(ball.angle);
// 	ball.dy = ball.speed * Math.sin(ball.angle);

// 	ball.x += ball.dx;
// 	ball.y += ball.dy;
// }

// function ballrebond(pad, side) {
// 	const demiePaddle = (paddle.height + ball.size) / 2;
// 	const middlePad = pad.y + demiePaddle;
// 	const ballImpact = ball.y + ball.size - middlePad;

// 	ball.angle = (ballImpact / demiePaddle) * (Math.PI / 2.5);
// 	if (side === "right")
// 		ball.angle = -ball.angle + Math.PI;
// }

// function paddleCollision(pad) {
// 	if (ball.y + ball.dy + ball.size > pad.y && ball.y + ball.dy < pad.y + paddle.height)
// 		return true;
// 	return false;
// }

// function scoreRender() {
// 	ctx.font = "500px TeenyTinyPixls";
// 	ctx.fillText(paddle.left.score, canvas.width / 2 - 500, 600);
// 	ctx.fillText(paddle.right.score, canvas.width / 2 + 200, 600);
// }

// document.addEventListener("keydown", event => {
//   keysDown[event.code] = true;
// });

// document.addEventListener("keyup", event => {
//   delete keysDown[event.code];
// });

// function loopRender() {
// 	gameRender();
// 	ballMove();
// 	KeyPress();

// }

// setInterval(() => loopRender(), 1000 / 60);
