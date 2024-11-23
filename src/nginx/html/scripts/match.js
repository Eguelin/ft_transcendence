var playerOneInfo = [0,0,0], playerTwoInfo = [0,0,0]

var template = `
<div id="pageContentContainer">
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
				<div class="matchGraphContainer">
					<div class="graphTitle"></div>
					<div class="canvaContainer">
						<canvas id="matchInfoGraph"></canvas>
					</div>
				</div>
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
				<div class="playerInfoGraphContainer">
					<div class="playerLegendContainer" id="playerOneLegendContainer"></div>
					<div class="playerGraphContainer">
						<div class="graphTitle"></div>
						<div class="canvaContainer">
							<canvas id="playerOneInfoGraph"></canvas>
						</div>
					</div>
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
				<div class="playerInfoGraphContainer">
					<div class="playerLegendContainer" id="playerTwoLegendContainer"></div>
					<div class="playerGraphContainer">
						<div class="graphTitle"></div>
						<div class="canvaContainer">
							<canvas id="playerTwoInfoGraph"></canvas>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>`


{
	document.getElementById("container").innerHTML = template;
	const url =  new URL(window.location.href);

	inputSearchUserContainer.style.setProperty("display", "none");
	homeBtn.style.setProperty("display", "block");
	dropDownUserContainer.style.setProperty("display", "flex");
	notifCenterContainer.style.setProperty("display", "flex");
	
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
		history.replaceState("","",`https://${hostname.host}/match?id=${url.searchParams.get("id")}`)
		const result = await fetchResult.json();
		if (fetchResult.ok){
			match = result;
			addPfpUrlToImgSrc(document.querySelector("#matchContainer #playerOnePfp"), match.player_one_profile_picture);
			addPfpUrlToImgSrc(document.querySelector("#matchContainer #playerTwoPfp"), match.player_two_profile_picture);

			document.querySelector("#matchContainer #playerOne .playerInfo .playerNamesContainer > .playerName").innerText = match.player_one;
			document.querySelector("#matchContainer #playerOne .playerInfo .playerNamesContainer > .playerDisplayName").innerText = `${match.player_one_display_name != match.player_one ? match.player_one_display_name : ""}`;
			
			document.querySelector("#matchContainer #playerOne .playerInfo .playerNamesContainer > .playerName").href = `https://${hostname.host}/user/${match.player_one}`;
			document.querySelector("#matchContainer #playerOne .playerInfo .playerNamesContainer > .playerDisplayName").href = `https://${hostname.host}/user/${match.player_one}`;
			
			document.querySelector("#matchContainer #playerTwo .playerInfo .playerNamesContainer > .playerName").innerText = match.player_two;
			document.querySelector("#matchContainer #playerTwo .playerInfo .playerNamesContainer > .playerDisplayName").innerText = `${match.player_two_display_name != match.player_two ? match.player_two_display_name : ""}`;
			
			document.querySelector("#matchContainer #playerTwo .playerInfo .playerNamesContainer > .playerName").href = `https://${hostname.host}/user/${match.player_two}`;
			document.querySelector("#matchContainer #playerTwo .playerInfo .playerNamesContainer > .playerDisplayName").href = `https://${hostname.host}/user/${match.player_two}`;

			if (document.querySelector("#matchContainer #playerOne .playerInfo .playerNamesContainer > .playerName").innerText == "deleted"){
				document.querySelector("#matchContainer #playerOne .playerInfo .playerNamesContainer > .playerName").classList.add("deletedUser");
				document.querySelector("#matchContainer #playerOne .playerInfo .playerNamesContainer > .playerName").innerText = client.langJson["index"][".deletedUser"];
			}
			
			if (document.querySelector("#matchContainer #playerTwo .playerInfo .playerNamesContainer > .playerName").innerText == "deleted"){
				document.querySelector("#matchContainer #playerTwo .playerInfo .playerNamesContainer > .playerName").classList.add("deletedUser");
				document.querySelector("#matchContainer #playerTwo .playerInfo .playerNamesContainer > .playerName").innerText = client.langJson["index"][".deletedUser"];
			}
			
			document.querySelector("#matchContainer #playerOne .playerInfo > .playerScore").innerText = client.langJson['match']['points'].replace("${POINTS}", match.player_one_pts);
			document.querySelector("#matchContainer #playerTwo .playerInfo > .playerScore").innerText = client.langJson['match']['points'].replace("${POINTS}", match.player_two_pts);
			
			document.querySelector("#matchContainer .portrait #totalExchange").innerText = match.exchanges;
			document.querySelector("#matchContainer .portrait #averageExchange").innerText = (match.exchanges / (match.player_one_pts + match.player_two_pts)).toFixed(2);
			document.querySelector("#matchContainer .portrait #longestExchange").innerText = match.exchangesMax;

			document.querySelector("#matchContainer .landscape #totalExchange").innerText = match.exchanges;
			document.querySelector("#matchContainer .landscape #averageExchange").innerText = (match.exchanges / (match.player_one_pts + match.player_two_pts)).toFixed(2);
			document.querySelector("#matchContainer .landscape #longestExchange").innerText = match.exchangesMax;
			document.querySelectorAll(".graphTitle").forEach(function(elem){elem.innerText = client.langJson['match']['CVmatchInfoGraph']})
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

function drawMatchInfoGraph(size = 300, matchChartSize = 400){
	setLoader();
	if (document.getElementById("matchInfoGraph"))
		document.getElementById("matchInfoGraph").remove();

	if (document.querySelector("#playerOneInfoGraph"))
		document.querySelector("#playerOneInfoGraph").remove();
	if (document.querySelector("#playerTwoInfoGraph"))
		document.querySelector("#playerTwoInfoGraph").remove();

	matchInfoContainer = document.querySelector("#matchInfoGraphContainer .matchGraphContainer .canvaContainer");

	playerOneInfoGraphContainer = document.querySelector("#matchContainer #playerOne .playerInfoGraphContainer .playerGraphContainer .canvaContainer");
	playerTwoInfoGraphContainer = document.querySelector("#matchContainer #playerTwo .playerInfoGraphContainer .playerGraphContainer .canvaContainer");

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
	unsetLoader()
}
