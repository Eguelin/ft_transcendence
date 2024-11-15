var chartAverage = null, chartAbs = null, chartStats = null;
var width, height, gradient;
var today = new Date();
var customStartDayInput;
var customEndDayInput;

var lastWeekSelection;
var lastMonthSelection;
var lastYearSelection;

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
					<input tabindex="16" aria-label="Custom start day" id="customStartDay" type="date">
					<input tabindex="17" aria-label="Custom end day" id="customEndDay" type="date">
					<button tabindex="18" aria-label="Search" id="search">Search</button>
				</div>
			</div>
        </div>
    </div>
    <div id="profileGraphs">
        <div id="userStatPieGraphContainer">
            <canvas width="400" height="200" id="userStatGraph">
            </canvas>
        </div>
		<div id="lineChartsContainer">
			<div id="winLossGraphContainer">
				<canvas width="400" height="200" id="winLossGraph">
				</canvas>
			</div>
			<div id="winLossAbsGraphContainer">
				<canvas width="400" height="200" id="winLossAbsGraph">
				</canvas>
			</div>
		</div>
    </div>
    <div id="matchHistoryContainer"></div>
</div>`

class Dashboard{
	startDate;
	endDate;
	startDateStr;
	endDateStr;
	username;
	matches;
	clientUsername;
	clientMatches;

	constructor (startDate, endDate, username, clientUsername){
		return (async () =>{
			try {
				this.startDate = startDate;
				this.endDate = endDate;
				this.startDateStr = `${startDate.getFullYear()}-${startDate.getMonth() + 1}-${startDate.getDate()}`
				this.endDateStr = `${endDate.getFullYear()}-${endDate.getMonth() + 1}-${endDate.getDate()}`
				this.username = username;
				this.clientUsername = clientUsername;
				const matchesFetch = await fetch('/api/user/get', {
					method: 'POST', //GET forbid the use of body :(
					headers: {'Content-Type': 'application/json',},
					body: JSON.stringify({"name" : username, "startDate" : this.startDateStr, "endDate" : this.endDateStr}),
					credentials: 'include'
				})
				this.matches = await matchesFetch.json();
				this.matches = this.matches.matches;

				const clientMatchesFetch = await fetch('/api/user/get', {
					method: 'POST', //GET forbid the use of body :(
					headers: {'Content-Type': 'application/json',},
					body: JSON.stringify({"name" : this.clientUsername, "startDate" : this.startDateStr, "endDate" : this.endDateStr}),
					credentials: 'include'
				})
				this.clientMatches = await clientMatchesFetch.json();
				this.clientMatches = this.clientMatches.matches;
			}
			catch{
				var template = `
				<div id="pageContentContainer">
					<h2 id="NotFoundtitle">Error while connecting to server :(</h2>
				</div>
				`
				document.getElementById("container").innerHTML = template;
				throw new Error("Error while reaching server");
			}
			return (this);
		})();
	}
}

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


function getGradient(ctx, chartArea) {
  const chartWidth = chartArea.right - chartArea.left;
  const chartHeight = chartArea.bottom - chartArea.top;
  if (!gradient || width !== chartWidth || height !== chartHeight) {
    width = chartWidth;
    height = chartHeight;
    gradient = ctx.createLinearGradient(0, chartArea.bottom, 0, chartArea.top);
    gradient.addColorStop(0, "red");
    gradient.addColorStop(0.5, "orange");
    gradient.addColorStop(1, "green");
  }

  return gradient;
}



function drawWinLossGraph(matches, username, startDate, endDate, clientMatches, clientUsername){
    if (!(startDate instanceof Date && endDate instanceof Date)){
        return ;    
    }
        
    if (chartAverage)
        chartAverage.destroy();
    if (chartAbs)
        chartAbs.destroy();
	if (chartStats)
		chartStats.destroy();

	if (document.querySelector("#notPlayedPeriod"))
		document.querySelector("#notPlayedPeriod").remove();

    var LastXDaysDisplayed = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)); 
    nbMatch = Object.keys(matches).length;
    const mapAverage = [], mapAbs = [], clientMapAverage = [], clientMapAbs = [];
    var startedPlaying = false;
	var totalWin = 0, totalMatch = 0, graphLineWidth = .5, graphPointRadius = 2, lineWidth = 2;
	if (window.getComputedStyle(document.documentElement).getPropertyValue("--is-mobile") == 1){
		graphLineWidth = 3;
		graphPointRadius = 0;
		lineWidth = 4;
	}


	//console.log(matches, username, startDate, endDate, clientMatches, clientUsername);
    while (startDate.getDate() <= endDate.getDate()){
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
            mapAverage.push({'date' : `${startDate.getFullYear()}-${startDate.getMonth() + 1}-${startDate.getDate()}`, 'result' : average});
            mapAbs.push({'date' : `${startDate.getFullYear()}-${startDate.getMonth() + 1}-${startDate.getDate()}`, 'result' : absResult});
            clientAverage = (clientCountWin / clientCountMatch) * 100;
            clientAbsResult = (clientCountWin - (clientCountMatch - clientCountWin));
            clientMapAverage.push({'date' : `${startDate.getFullYear()}-${startDate.getMonth() + 1}-${startDate.getDate()}`, 'result' : clientAverage});
            clientMapAbs.push({'date' : `${startDate.getFullYear()}-${startDate.getMonth() + 1}-${startDate.getDate()}`, 'result' : clientAbsResult});
        }
        startDate.setDate(startDate.getDate() + 1);
    }

	if (totalMatch){

		const totalDuration = (500 / LastXDaysDisplayed);
		const delayBetweenPoints = totalDuration / nbMatch;
		const previousY = (ctx) => ctx.index === 0 ? ctx.chart.scales.y.getPixelForValue(100) : ctx.chart.getDatasetMeta(ctx.datasetIndex).data[ctx.index - 1].getProps(['result'], true).y;
		const animation = {
		  x: {
			type: 'number',
			easing: 'linear',
			duration: delayBetweenPoints,
			from: NaN, // the point is initially skipped
			delay(ctx) {
			  if (ctx.type !== 'data' || ctx.xStarted) {
				return 0;
			  }
			  ctx.xStarted = true;
			  return ctx.index * delayBetweenPoints;
			}
		  },
		  y: {
			type: 'number',
			easing: 'linear',
			duration: delayBetweenPoints,
			from: previousY,
			delay(ctx) {
			  if (ctx.type !== 'data' || ctx.yStarted) {
				return 0;
			  }
			  ctx.yStarted = true;
			  return ctx.index * delayBetweenPoints;
			}
		  }
		}
	
		function drawStats(){
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
						title: {
							color: window.getComputedStyle(document.documentElement).getPropertyValue("--main-text-rgb"),
							text: client.langJson["dashboard"]["CVuserStatsGraph"],
							font: {
								family : "pong",
								size : window.getComputedStyle(document.documentElement).fontSize.replace("px", "") / 1.25
							},
							display: true,
						},
						legend: {
							labels: {
								font: {
									family : "pong",
									size : window.getComputedStyle(document.documentElement).fontSize.replace("px", "") / 1.5
								},
							}
						}
					},
				}
			});
		};
	
		function drawAverage(){
			datasets = [
				{
					label: username,
					data: mapAverage,
					fill: false,
					tension: 0,
					borderColor: function(context){
						const chart = context.chart;
						const {ctx, chartArea} = chart;
		
						if (!chartArea)
							return ;
						return (getGradient(ctx, chartArea));
					},
					borderWidth: lineWidth,
					pointBackgroundColor: function(context){
						const chart = context.chart;
						const {ctx, chartArea} = chart;
		
						if (!chartArea)
							return ;
						return (getGradient(ctx, chartArea));
					},
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
					spanGaps: true
				})
			}
		
			chartAverage = new Chart(document.getElementById("winLossGraph"), {
				type: 'line',
				data: {
					datasets: datasets
				},
				options:{
					animation,
					parsing: {
						xAxisKey: 'date',
						yAxisKey: 'result'
					},
					plugins: {
						title: {
							color: window.getComputedStyle(document.documentElement).getPropertyValue("--main-text-rgb"),
							text: client.langJson["dashboard"]["CVwinLossGraph"],
							font: {
								family : "pong",
								size : window.getComputedStyle(document.documentElement).fontSize.replace("px", "") / 1.25
							},
							display: true,
						},
						legend: {
							labels: {
								font: {
									family : "pong",
									size : window.getComputedStyle(document.documentElement).fontSize.replace("px", "") / 1.5
								},
							}
						}
					},
					scales: {
						y: {
							ticks: {
								color: window.getComputedStyle(document.documentElement).getPropertyValue("--main-text-rgb"),
								font: {
									family : "pong",
									size : window.getComputedStyle(document.documentElement).fontSize.replace("px", "") / 2
								},
							},
							grid: {
								color: window.getComputedStyle(document.documentElement).getPropertyValue("--main-text-rgb"),
								lineWidth:graphLineWidth,
								drawTicks: false,
							},
							min: 0,
							max: 100,
						},
						x: {
							ticks: {
								color: window.getComputedStyle(document.documentElement).getPropertyValue("--main-text-rgb"),
								font: {
									family : "pong",
									size : window.getComputedStyle(document.documentElement).fontSize.replace("px", "") / 2
								},
							},
							grid: {
								color: window.getComputedStyle(document.documentElement).getPropertyValue("--main-text-rgb"),
								lineWidth:graphLineWidth,
							}
						}
					}
				}
			});
		
		}
	
		function drawAbs(){
			datasets = [
				{
					label: username,
					data: mapAbs,
					fill: false,
					tension: 0,
					borderColor: function(context){
						const chart = context.chart;
						const {ctx, chartArea} = chart;
		
						if (!chartArea)
							return ;
						return (getGradient(ctx, chartArea));
					},
					borderWidth: lineWidth,
					pointBackgroundColor: function(context){
						const chart = context.chart;
						const {ctx, chartArea} = chart;
		
						if (!chartArea)
							return ;
						return (getGradient(ctx, chartArea));
					},
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
					spanGaps: true
				})
			}
		
			chartAbs = new Chart(document.getElementById("winLossAbsGraph"), {
				type: 'line',
				data: {
					datasets: datasets
				},
				options:{
					animation,
					parsing: {
						xAxisKey: 'date',
						yAxisKey: 'result'
					},
					plugins: {
						title: {
							color: window.getComputedStyle(document.documentElement).getPropertyValue("--main-text-rgb"),
							font: {
								family : "pong",
								size : window.getComputedStyle(document.documentElement).fontSize.replace("px", "") / 1.25
							},
							text: client.langJson["dashboard"]["CVwinLossAbsGraph"],
							display: true,
		
						},
						legend: {
							labels: {
								font: {
									family : "pong",
									size : window.getComputedStyle(document.documentElement).fontSize.replace("px", "") / 1.5
								},
							}
						}
					},
					scales: {
						y: {
							ticks: {
								color: window.getComputedStyle(document.documentElement).getPropertyValue("--main-text-rgb"),
								font: {
									family : "pong",
									size : window.getComputedStyle(document.documentElement).fontSize.replace("px", "") / 2
								},
							},
							grid: {
								color: window.getComputedStyle(document.documentElement).getPropertyValue("--main-text-rgb"),
								lineWidth:graphLineWidth,
								drawTicks: false,
							}
						},
						x: {
							ticks: {
								color: window.getComputedStyle(document.documentElement).getPropertyValue("--main-text-rgb"),
								font: {
									family : "pong",
									size : window.getComputedStyle(document.documentElement).fontSize.replace("px", "") / 2
								},
							},
							grid: {
								color: window.getComputedStyle(document.documentElement).getPropertyValue("--main-text-rgb"),
								lineWidth:graphLineWidth,
							}
						}
					}
				}
			});
		
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
		document.querySelector("#notPlayedPeriod").innerText = client.langJson['dashboard']['#notPlayedPeriod'].replace("${USERNAME}", splitPath[4]);
	}
	
	if (chartAverage){
		chartAverage.titleBlock.options.text = content["CVwinLossGraph"];
		if (chartAverage.config._config.data.datasets.length > 1)
			chartAverage.config._config.data.datasets[1].label = content["CVwinLossGraphClient"];
		chartAverage.update();
	}
	if (chartAbs){
		chartAbs.titleBlock.options.text = content["CVwinLossAbsGraph"];
		if (chartAverage.config._config.data.datasets.length > 1)
			chartAbs.config._config.data.datasets[1].label = content["CVwinLossAbsGraphClient"];
		chartAbs.update();
	}
	if (chartStats){
		chartStats.titleBlock.options.text = content["CVuserStatsGraph"];
		chartStats.config._config.data.labels[0] = content["CVwin"];
		chartStats.config._config.data.labels[1] = content["CVloss"];
		chartStats.update();
	}	
}

var dashboard = null;



function displayCharts(){
	if (dashboard && dashboard instanceof Dashboard)
	{
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

		if (window.getComputedStyle(document.documentElement).getPropertyValue("--is-mobile") == 0){
			wLGraph.width = x * 30;
			wLAbsGraph.width = x * 30;
			userStatGraph.width = x * 30;
			wLGraph.height = y * 21;
			wLAbsGraph.height = y * 21;
			userStatGraph.height = y * 21;
		}
		else{
			wLGraph.width = x * 70;
			wLAbsGraph.width = x * 70;
			userStatGraph.width = x * 70;
			wLGraph.height = y * 21;
			wLAbsGraph.height = y * 21;
			userStatGraph.height = y * 21;
		}

		document.getElementById("userStatPieGraphContainer").appendChild(userStatGraph);
		document.getElementById("winLossGraphContainer").appendChild(wLGraph);
		document.getElementById("winLossAbsGraphContainer").appendChild(wLAbsGraph);
		drawWinLossGraph(dashboard.matches, dashboard.username, new Date(dashboard.startDate), dashboard.endDate, dashboard.clientMatches, dashboard.clientUsername);
	}
}

function loadUserDashboard(startDate, endDate){


    var splitPath = window.location.href.split('/');
	(async () => {
		dashboard = await new Dashboard(startDate, endDate, splitPath[4], client.username);
		unsetLoader();
		displayCharts();

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
			if (!elem.classList.contains("deletedUser")){
				elem.addEventListener("click", (e) => {
					myPushState(`https://${hostname.host}/user/${elem.innerHTML}`);	
				})
				elem.addEventListener("keydown", (e) => {
					if (e.key == "Enter")
						elem.click();
				})
			}
			else{
				elem.innerText = client.langJson["index"][".deletedUser"];
			}
		})
	})()
}