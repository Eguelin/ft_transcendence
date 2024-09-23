function game() {
	const canvas = document.getElementById('game');
	const ctx = canvas.getContext('2d');

	var socket = new WebSocket("/ws/game/");

	socket.onopen = function() {
		console.log("Connection established");
	}

	socket.onmessage = function(event) {
		var data = JSON.parse(event.data);
		console.log(data);
	}

	socket.onclose = function() {
		console.log("Connection closed");
	}

	// Close the socket when the user leaves the page
	window.addEventListener('beforeunload', function() {
		socket.close();
	});

	// Close the socket when the user clicks the "goHomeButton"
	document.getElementById('goHomeButton').addEventListener('click', function() {
		socket.close();
	});

	// Close the socket when the user uses the browser's back button
	window.addEventListener('popstate', function() {
		socket.close();
	});
}

game();
