var chartAverage = null, chartAbs = null, chartStats = null;
var width, height, gradient;
var today = new Date();
var customStartDayInput;
var customEndDayInput;

var lastWeekSelection;
var lastMonthSelection;
var lastYearSelection;
var mapAverage = [], mapAbs = [];

var template = `
<div id="pageContentContainer" class="dashboard">
    <div id="timelineSelectionContainer">
        <a id="timelineSelectionText">Display stats from the last </a>
        <div id="timelineSelectorContainer">
            <button tabindex="12" aria-label="Display stats from the last 7 days" class="activeTimeline" id="lastWeekSelection">7 days</button>
            <button tabindex="13" aria-label="Display stats from the last month" id="lastMonthSelection">Month</button>
            <button tabindex="14" aria-label="Display stats from the last year" id="lastYearSelection">Year</button>
			<div id="customPeriod">
				<button tabindex="15" aria-label="Custom period selection" id="customPeriodSelection">+</button>
				<div id="customPeriodSelectionContainer">
					<input autoclomplete="off" tabindex="16" aria-label="Custom start day" id="customStartDay" type="date">
					<input autoclomplete="off" tabindex="17" aria-label="Custom end day" id="customEndDay" type="date">
					<button tabindex="18" aria-label="Search" id="search">Search</button>
				</div>
			</div>
        </div>
    </div>
    <div id="profileGraphs">
        <div id="userStatPieGraphContainer">
			<div class="graphTitle"></div>
			<div class="graphLegendContainer" id="statsLegend"></div>
			<div id="userStatGraphContainer">
            	<canvas width="400" height="200" id="userStatGraph"></canvas>
			</div>
        </div>
		<div id="lineChartsContainer">
			<div id="winLossGraphContainer">
				<div class="graphTitle"></div>
				<div class="graphLegendContainer" id="averageLegend"></div>
				<canvas width="400" height="200" id="winLossGraph"></canvas>
			</div>
			<div id="winLossAbsGraphContainer">
				<div class="graphTitle"></div>
				<div class="graphLegendContainer" id="absLegend"></div>
				<canvas width="400" height="200" id="winLossAbsGraph"></canvas>
			</div>
		</div>
    </div>
    <div id="matchHistoryContainer"></div>
</div>`

{
	document.getElementById("container").innerHTML = template;

    customStartDayInput = document.getElementById("customStartDay");
    customEndDayInput = document.getElementById("customEndDay");
    lastWeekSelection = document.getElementById("lastWeekSelection")
    lastMonthSelection = document.getElementById("lastMonthSelection")
    lastYearSelection = document.getElementById("lastYearSelection")


	inputSearchUserContainer.style.setProperty("display", "none");
	dropDownUserContainer.style.setProperty("display", "flex");
	homeBtn.style.setProperty("display", "block");
	notifCenterContainer.style.setProperty("display", "flex");
    var startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
	setNotifTabIndexes(19);
    loadUserDashboard(startDate, today);
}


document.getElementById("customPeriodSelection").addEventListener("click", (e) => {
    var container = document.getElementById("customPeriodSelectionContainer");
    if (container.classList.contains("active")){
        container.classList.remove("active");
        container.offsetHeight;
        container.classList.add("inactive");
        e.target.innerText = "+";
        setTimeout((container)=>{
            container.classList.remove("inactive");
        }, 1000, container);
    }
    else{
        container.offsetHeight;
        container.classList.add("active");
        e.target.innerText = "-";
    }
})

document.getElementById("search").addEventListener("click", (e)=>{
    if (isNaN(Date.parse(customStartDayInput.value)) || isNaN(Date.parse(customEndDayInput.value))){
		if (langJson && langJson['dashboard']['.invalidDate'])
			popUpError(langJson['dashboard']['.invalidDate']);
		else
        	popUpError("Invalid date");
        return;
    }
    setLoader();
    document.querySelectorAll(".activeTimeline").forEach(function(elem){elem.classList.remove("activeTimeline")});
    document.getElementById("customPeriodSelection").classList.add("activeTimeline");
    customStartDay = new Date(Date.parse(customStartDayInput.value));
    customEndDay = new Date(Date.parse(customEndDayInput.value));
    if((Math.round((customEndDay.getTime() - customStartDay.getTime()) / (1000 * 3600 * 24))) < 0){
        var tmp = customStartDayInput.value;
        customStartDayInput.value = customEndDayInput.value;
        customEndDayInput.value = tmp;
        tmp = customStartDay;
        customStartDay = customEndDay;
        customEndDay = tmp;
    }
    loadUserDashboard(customStartDay, customEndDay);
})

lastWeekSelection.addEventListener("click", (e) => {
	setLoader();

    var startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    loadUserDashboard(startDate, today);
    document.querySelectorAll(".activeTimeline").forEach(function(elem){elem.classList.remove("activeTimeline")});
    lastWeekSelection.classList.add("activeTimeline");
})

lastMonthSelection.addEventListener("click", (e) => {
	setLoader();
    var startDate = new Date();
    startDate.setDate(startDate.getDate() - 31);
    loadUserDashboard(startDate, today);
    document.querySelectorAll(".activeTimeline").forEach(function(elem){elem.classList.remove("activeTimeline")});
    lastMonthSelection.classList.add("activeTimeline");
})

lastYearSelection.addEventListener("click", (e) => {
	setLoader();
    var startDate = new Date();
    startDate.setDate(startDate.getDate() - 365);
    loadUserDashboard(startDate, today);
    document.querySelectorAll(".activeTimeline").forEach(function(elem){elem.classList.remove("activeTimeline")});
    lastYearSelection.classList.add("activeTimeline");
})

function drawWinLossGraph(matches, username, startDate, endDate, clientMatches, clientUsername){
	document.querySelector("#profileGraphs").style.display = "none";
    if (!(startDate instanceof Date && endDate instanceof Date)){
        return ;
    }

    if (chartAverage){
		if (chartAverage instanceof Chart)
        	chartAverage.destroy();
		else
			chartAverage = null
	}
    if (chartAbs){
		if (chartAbs instanceof Chart)
        	chartAbs.destroy();
		else
			chartAbs = null
	}
	if (chartStats){
		if (chartStats instanceof Chart)
			chartStats.destroy();
		else
			chartStats = null
	}

	if (document.querySelector("#notPlayedPeriod"))
		document.querySelector("#notPlayedPeriod").remove();

    var LastXDaysDisplayed = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24));
    nbMatch = Object.keys(matches).length;
    const clientMapAverage = [], clientMapAbs = [];
    var startedPlaying = false;
	var totalWin = 0, totalMatch = 0, graphLineWidth = .5, graphPointRadius = 2, lineWidth = 2;
	if (isMobile()){
		if (isPortrait()){
			graphLineWidth = 3;
			lineWidth = 4;
		}
		else{
			graphLineWidth = 1;
			lineWidth = 4;
		}
		graphPointRadius = 2;
	}

	var minAbs=0, maxAbs =0;
    while (startDate.getTime() <= endDate.getTime() || startDate.getDate() <= endDate.getDate()){
        var countWin = 0, countMatch = 0;
        var clientCountWin = 0, clientCountMatch = 0;
        try{
            matchObj = matches[startDate.getFullYear()][startDate.getMonth() + 1][startDate.getDate()];
			if (matchObj){
				for (j = 0; j < Object.keys(matchObj).length; j++){
					if (matchObj[j].type == "match"){
						if (matchObj[j].player_one == username)
							countWin += matchObj[j].player_one_pts > matchObj[j].player_two_pts;
						else
							countWin += matchObj[j].player_one_pts < matchObj[j].player_two_pts;
						countMatch += 1;
						totalMatch += 1;
					}
				}
				startedPlaying = true;
			}
        }
        catch{
        }
        try{
            matchObj = clientMatches[startDate.getFullYear()][startDate.getMonth() + 1][startDate.getDate()];
            for (j = 0; j < Object.keys(matchObj).length; j++){
				if (matchObj[j].type == "match"){
					if (matchObj[j].player_one == clientUsername)
						clientCountWin += matchObj[j].player_one_pts > matchObj[j].player_two_pts;
					else
						clientCountWin += matchObj[j].player_one_pts < matchObj[j].player_two_pts;
					clientCountMatch += 1;
				}
            }
            startedPlaying = true;
        }
        catch{
        }
        if (startedPlaying){
			totalWin += countWin;
            average = (countWin / countMatch) * 100;
            absResult = (countWin - (countMatch - countWin));
            mapAverage.push({'date' : `${startDate.getFullYear()}-${startDate.getMonth() + 1}-${startDate.getDate()}`, 'result' : parseInt(average)});
            mapAbs.push({'date' : `${startDate.getFullYear()}-${startDate.getMonth() + 1}-${startDate.getDate()}`, 'result' : absResult});
			minAbs = absResult < minAbs ? absResult : minAbs;
			maxAbs = absResult > maxAbs ? absResult : maxAbs;
            clientAverage = (clientCountWin / clientCountMatch) * 100;
            clientAbsResult = (clientCountWin - (clientCountMatch - clientCountWin));
            clientMapAverage.push({'date' : `${startDate.getFullYear()}-${startDate.getMonth() + 1}-${startDate.getDate()}`, 'result' : parseInt(clientAverage)});
            clientMapAbs.push({'date' : `${startDate.getFullYear()}-${startDate.getMonth() + 1}-${startDate.getDate()}`, 'result' : clientAbsResult});
			minAbs = clientAbsResult < minAbs ? clientAbsResult : minAbs;
			maxAbs = clientAbsResult > maxAbs ? clientAbsResult : maxAbs;
        }
        startDate.setDate(startDate.getDate() + 1);
    }
	if (totalMatch){
		document.querySelector("#profileGraphs").style.display = "flex";
		const totalDuration = (500 / LastXDaysDisplayed);
		const delayBetweenPoints = totalDuration / nbMatch;
		const previousY = (ctx) => ctx.index === 0 ? ctx.chart.scales.y.getPixelForValue(100) : ctx.chart.getDatasetMeta(ctx.datasetIndex).data[ctx.index - 1].getProps(['result'], true).y;

		function drawStats(){
			document.querySelector("#userStatPieGraphContainer .graphTitle").innerText = client.langJson["dashboard"]["CVuserStatsGraph"];
			data = {
				datasets: [{
						data: [totalWin, totalMatch - totalWin],
						backgroundColor: ['green', 'red'],
						borderWidth: 0
					}
				],
				labels: [
					client.langJson["dashboard"]["CVwin"], client.langJson["dashboard"]["CVloss"]
				]
			}
			chartStats = new Chart(document.getElementById("userStatGraph"), {
				type: 'pie',
				data: data,
				options:{
					plugins: {
						legend: {
							display: false,
						},
						htmlLegend:{
							containerID: 'statsLegend'
						}
					},
				},
				plugins: [htmlLegendPlugin]
			});
			document.querySelector("#userStatGraph").innerText = client.langJson["dashboard"]["aria#userStatGraph"].replace("${NB_VICTORIES}", totalWin).replace("${NB_DEFEATS}", totalMatch - totalWin);
		};

		function drawAverage(){
			datasets = [
				{
					label: username,
					data: mapAverage,
					fill: false,
					tension: 0,
					backgroundColor: document.documentElement.style.getPropertyValue("--is-dark-theme") == '1' ? ['green'] : ['red'] ,
					borderColor: document.documentElement.style.getPropertyValue("--is-dark-theme") == '1' ? 'green' : 'red' ,
					borderWidth: lineWidth,
					pointBackgroundColor: document.documentElement.style.getPropertyValue("--is-dark-theme") == '1' ? 'green' : 'red' ,
					pointBorderWidth: 0,
					pointhitRadius: 4,
					pointRadius: LastXDaysDisplayed < 100 ? graphPointRadius : 0,
					pointStyle: 'circle',
					borderJoinStyle: 'round',
					spanGaps: true,
				}
			]

			if (username != clientUsername){
				datasets.push({
					label: client.langJson["dashboard"]["CVwinLossGraphClient"],
					data: clientMapAverage,
					fill: false,
					tension: 0,
					borderColor: "grey",
					borderWidth: lineWidth,
					pointBackgroundColor: "grey",
					pointBorderWidth: 0,
					pointhitRadius: 4,
					pointRadius: LastXDaysDisplayed < 100 ? graphPointRadius : 0,
					pointStyle: 'circle',
					borderJoinStyle: 'round',
					spanGaps: true,
					backgroundColor: ['grey'],
				})
			}

			document.querySelector("#winLossGraphContainer .graphTitle").innerText = client.langJson["dashboard"]["CVwinLossGraph"];


			if (mapAverage.length <= 1){
				if (document.querySelector("#winLossGraph"))
					document.querySelector("#winLossGraph").remove();
				if (document.querySelector("#winLossGraphContainer .graphLegendContainer"))
					document.querySelector("#winLossGraphContainer .graphLegendContainer").remove();
				if (!document.querySelector("#winLossGraphContainer .notEnoughData")){
					var message = document.createElement("a");
					message.className="notEnoughData";
					message.innerText = client.langJson['dashboard']['.notEnoughData'].replace("${VALUE}", mapAverage[0]['result']).replace("${DATE}", mapAverage[0]['date']);
					document.querySelector("#winLossGraphContainer").appendChild(message);
					document.querySelector("#lineChartsContainer").classList.add("notEnoughDataContainer");
				}
			}
			else if (document.getElementById("winLossGraph")){
				chartAverage = new Chart(document.getElementById("winLossGraph"), {
					type: 'line',
					data: {
						datasets: datasets
					},
					options:{
						parsing: {
							xAxisKey: 'date',
							yAxisKey: 'result'
						},
						plugins: {
							legend: {
								display: false,
							},
							htmlLegend:{
								containerID: 'averageLegend'
							}
						},
						scales: {
							y: {
								ticks: {
									color: window.getComputedStyle(document.documentElement).getPropertyValue("--main-text-rgb"),
									font: {
										family : "pong",
										size : window.getComputedStyle(document.documentElement).fontSize.replace("px", "") / 1.5
									},
								},
								grid: {
									color: window.getComputedStyle(document.documentElement).getPropertyValue("--hover-text-rgb"),
									lineWidth:graphLineWidth,
									drawTicks: false,
								},
								min: 0,
								max: 100,
							},
							x: {
								ticks: {
									display : false
								},
								grid: {
									color: window.getComputedStyle(document.documentElement).getPropertyValue("--hover-text-rgb"),
									lineWidth:graphLineWidth,
								}
							}
						}
					},
					plugins: [htmlLegendPlugin]
				});
			}
			var aria = client.langJson["dashboard"]["aria#winLossGraph"];
			Object.keys(mapAverage).forEach(function(key){
				if (!isNaN(mapAverage[key]['result']))
					aria += client.langJson["dashboard"]["aria_winLossGraphBis"].replace("${VALUE}", mapAverage[key]['result']).replace("${DATE}", mapAverage[key]['date'])
			})
			if (document.querySelector("#winLossGraph"))
				document.querySelector("#winLossGraph").setAttribute("aria-label", aria);
			else if (document.querySelector("#winLossGraphContainer .notEnoughData"))
				document.querySelector("#winLossGraphContainer .notEnoughData").setAttribute("aria-label", aria);
		}

		function drawAbs(){
			datasets = [
				{
					label: username,
					data: mapAbs,
					fill: false,
					tension: 0,
					backgroundColor: document.documentElement.style.getPropertyValue("--is-dark-theme") == '1' ? ['green'] : ['red'] ,
					borderColor: document.documentElement.style.getPropertyValue("--is-dark-theme") == '1' ? 'green' : 'red' ,
					borderWidth: lineWidth,
					pointBackgroundColor: document.documentElement.style.getPropertyValue("--is-dark-theme") == '1' ? 'green' : 'red' ,
					pointBorderWidth: 0,
					pointhitRadius: 4,
					pointRadius: LastXDaysDisplayed < 100 ? graphPointRadius : 0,
					pointStyle: 'circle',
					borderJoinStyle: 'round',
					spanGaps: true
				}
			]

			if (username != clientUsername){
				datasets.push({
					label: client.langJson["dashboard"]["CVwinLossAbsGraphClient"],
					data: clientMapAbs,
					fill: false,
					tension: 0,
					borderColor: "grey",
					borderWidth: lineWidth,
					pointBackgroundColor: "grey",
					pointBorderWidth: 0,
					pointhitRadius: 4,
					pointRadius: LastXDaysDisplayed < 100 ? graphPointRadius : 0,
					pointStyle: 'circle',
					borderJoinStyle: 'round',
					spanGaps: true,
					backgroundColor: ['grey'],
				})
			}

			document.querySelector("#winLossAbsGraphContainer .graphTitle").innerText = client.langJson["dashboard"]["CVwinLossAbsGraph"];

			if (mapAbs.length <= 1){
				if (document.querySelector("#winLossAbsGraph"))
					document.querySelector("#winLossAbsGraph").remove();
				if (document.querySelector("#winLossAbsGraphContainer .graphLegendContainer"))
					document.querySelector("#winLossAbsGraphContainer .graphLegendContainer").remove();
				if (!document.querySelector("#winLossAbsGraphContainer .notEnoughData")){
					var message = document.createElement("a");
					message.className="notEnoughData";
					message.innerText = client.langJson['dashboard']['.notEnoughData'].replace("${VALUE}", mapAbs[0]['result']).replace("${DATE}", mapAbs[0]['date']);
					document.querySelector("#winLossAbsGraphContainer").appendChild(message);
					document.querySelector("#lineChartsContainer").classList.add("notEnoughDataContainer");
				}
			}
			else{
				chartAbs = new Chart(document.getElementById("winLossAbsGraph"), {
					type: 'line',
					data: {
						datasets: datasets
					},
					options:{
						parsing: {
							xAxisKey: 'date',
							yAxisKey: 'result'
						},
						plugins: {
							legend: {
								display: false,
							},
							htmlLegend:{
								containerID: 'absLegend'
							}
						},
						scales: {
							y: {
								ticks: {
									color: window.getComputedStyle(document.documentElement).getPropertyValue("--main-text-rgb"),
									font: {
										family : "pong",
										size : window.getComputedStyle(document.documentElement).fontSize.replace("px", "") / 1.5
									},
								},
								grid: {
									color: window.getComputedStyle(document.documentElement).getPropertyValue("--hover-text-rgb"),
									lineWidth:graphLineWidth,
									drawTicks: false,
								},
								min: Math.abs(minAbs) > Math.abs(maxAbs) ? minAbs : -maxAbs,
								max: Math.abs(minAbs) > Math.abs(maxAbs) ? -minAbs : maxAbs
							},
							x: {
								ticks: {
									display : false
								},
								grid: {
									color: window.getComputedStyle(document.documentElement).getPropertyValue("--hover-text-rgb"),
									lineWidth:graphLineWidth,
								}
							}
						}
					},
					plugins: [htmlLegendPlugin]
				});
			}
			var aria = client.langJson["dashboard"]["aria#winLossAbsGraph"];
			Object.keys(mapAbs).forEach(function(key){
				aria += client.langJson["dashboard"]["aria_winLossGraphBis"].replace("${VALUE}", mapAbs[key]['result']).replace("${DATE}", mapAbs[key]['date'])
			})
			if (document.querySelector("#winLossAbsGraph"))
				document.querySelector("#winLossAbsGraph").setAttribute("aria-label", aria);
			else if (document.querySelector("#winLossAbsGraphContainer .notEnoughData"))
				document.querySelector("#winLossAbsGraphContainer .notEnoughData").setAttribute("aria-label", aria);

		}

		drawStats();
		drawAverage();
		drawAbs();

	}
	else{
		var tmp = document.createElement("a");
		tmp.id = 'notPlayedPeriod';
		tmp.innerText = client.langJson['dashboard']['#notPlayedPeriod'].replace("${USERNAME}", username);
		document.getElementById("pageContentContainer").appendChild(tmp);
	}
}

function updateDashboardLang(){
    var splitPath = window.location.href.split('/');
	if (document.querySelector("#notPlayedPeriod")){
		document.querySelector("#notPlayedPeriod").innerText = client.langJson['dashboard']['#notPlayedPeriod'].replace("${USERNAME}", splitPath[5]);
	}
	displayCharts();
	document.title = langJson['dashboard'][`dashboard title`].replace("${USERNAME}", splitPath[5]);
	
	if (mapAverage.length <= 1){
		if (document.querySelector("#winLossGraphContainer .notEnoughData")){
			document.querySelector("#winLossGraphContainer .notEnoughData").innerText = client.langJson['dashboard']['.notEnoughData'].replace("${VALUE}", mapAverage[0]['result']).replace("${DATE}", mapAverage[0]['date']);
		}
	}
	if (mapAbs.length <= 1){
		if (document.querySelector("#winLossAbsGraphContainer .notEnoughData")){
			document.querySelector("#winLossAbsGraphContainer .notEnoughData").innerText = client.langJson['dashboard']['.notEnoughData'].replace("${VALUE}", mapAbs[0]['result']).replace("${DATE}", mapAbs[0]['date']);
		}
	}
}

var dashboard = null;



function displayCharts(){
	if (dashboard && dashboard instanceof Dashboard)
	{
		mapAverage = [];
		mapAbs = [];
		if (document.getElementById("winLossGraph"))
			document.getElementById("winLossGraph").remove();
		if (document.getElementById("winLossAbsGraph"))
			document.getElementById("winLossAbsGraph").remove();
		if (document.getElementById("userStatGraph"))
			document.getElementById("userStatGraph").remove();

		wLGraph = document.createElement("canvas");
		wLGraph.id = "winLossGraph";
		wLAbsGraph = document.createElement("canvas");
		wLAbsGraph.id = "winLossAbsGraph";
		userStatGraph = document.createElement("canvas");
		userStatGraph.id = "userStatGraph";

		var w = window,
		d = document,
		e = d.documentElement,
		g = d.getElementsByTagName('body')[0],
		x = (w.innerWidth || e.clientWidth || g.clientWidth) / 100,
		y = (w.innerHeight|| e.clientHeight|| g.clientHeight) / 100;

		if (isMobile() && isPortrait()){
			wLGraph.width = x * 80;
			wLAbsGraph.width = x * 80;
			wLGraph.height = y * 40;
			wLAbsGraph.height = y * 40;
		}
		else{
			wLGraph.width = x * 30;
			wLAbsGraph.width = x * 30;
			if (isMobile()){
				wLGraph.height = y * (25) / client.fontAmplifier;
				wLAbsGraph.height = y * (25) / client.fontAmplifier;
			}
			else{
				wLGraph.height = y * 21;
				wLAbsGraph.height = y * 21;
			}
		}
		document.getElementById("userStatGraphContainer").appendChild(userStatGraph);
		document.getElementById("winLossGraphContainer").appendChild(wLGraph);
		document.getElementById("winLossAbsGraphContainer").appendChild(wLAbsGraph);
		drawWinLossGraph(dashboard.matches, dashboard.username, new Date(dashboard.startDate), dashboard.endDate, dashboard.clientMatches, dashboard.clientUsername);
	}
}

function loadUserDashboard(startDate, endDate){
	dashboard = null;

    var splitPath = window.location.href.split('/');
	(async () => {
		dashboard = await new Dashboard(startDate, endDate, splitPath[5], client.username);
		if (!dashboard)
			return ;
		setTimeout(function(){unsetLoader();displayCharts()}, 500);

		matchObj = dashboard.matches[Object.keys(dashboard.matches)[Object.keys(dashboard.matches).length - 1]] // get matches object of highest date

		var historyContainer = document.getElementById("matchHistoryContainer");
		historyContainer.innerHTML = "";
		for (var i=0; i<Object.keys(dashboard.matches).length;i++){
			yearObj = dashboard.matches[Object.keys(dashboard.matches)[i]];
			for (j = 0; j < Object.keys(yearObj).length; j++){
				monthObj = yearObj[Object.keys(yearObj)[j]];
				for (k = 0; k < Object.keys(monthObj).length; k++){
					dayObj = monthObj[Object.keys(monthObj)[k]];
					for (l = 0; l < Object.keys(dayObj).length; l++){
						historyContainer.appendChild(createMatchResumeContainer(dayObj[Object.keys(dayObj)[l]], dashboard.username));
					}
				}
			}
		}

		document.querySelectorAll(".matchDescContainer").forEach(function (elem) {
			elem.addEventListener("keydown", (e) => {
				if (e.key == "Enter"){
					var idx = elem.tabIndex + 1
					elem.querySelectorAll(".resultScoreName").forEach(function (names){
						names.tabIndex = idx;
						idx++;
					})
				}
			})
		});
		var tabIdx = 19;
		document.querySelectorAll(".matchDescContainer").forEach(function (elem) {
			elem.tabIndex = tabIdx;
			tabIdx += 3;
		});
		setNotifTabIndexes(tabIdx);

		document.querySelectorAll(".resultScoreName").forEach(function (elem){
			if (elem.classList.contains("deletedUser")){
				elem.innerText = client.langJson["index"][".deletedUser"];
			}
			if (elem.classList.contains("blockedUser")){
				elem.innerText = client.langJson["index"][".blockedUser"];
			}
		})
	})()
}
