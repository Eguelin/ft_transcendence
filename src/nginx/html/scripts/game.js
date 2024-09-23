const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

var socket = new WebSocket("/ws/game/");

socket.onopen = function() {
	console.log("Connection established");
	socket.send(JSON.stringify({type: "connect", message: "Hello"}));
}

socket.onmessage = function(event) {
	var data = JSON.parse(event.data);
	console.log(data);
}

socket.onclose = function() {
	console.log("Connection closed");
}
