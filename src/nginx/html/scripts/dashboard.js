var chartAverage, chartAbs;
var width, height, gradient;
var today = new Date();
var customStartDayInput = document.getElementById("customStartDay");
var customEndDayInput = document.getElementById("customEndDay");
chartAverage = null;
chartAbs = null;

lastWeekSelection = document.getElementById("lastWeekSelection");
lastMonthSelection = document.getElementById("lastMonthSelection");
lastYearSelection = document.getElementById("lastYearSelection");

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
        console.log("Wrong arguments");
        return ;    
    }
        
    if (chartAverage)
        chartAverage.destroy();
    if (chartAbs)
        chartAbs.destroy();
    var LastXDaysDisplayed = Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 3600 * 24)); 
    nbMatch = Object.keys(matches).length;
    const mapAverage = [], mapAbs = [], clientMapAverage = [], clientMapAbs = [];
    var startedPlaying = false;
    while (startDate.valueOf() <= endDate.valueOf()){
        var countWin = 0, countMatch = 0;
        var clientCountWin = 0, clientCountMatch = 0;
        try{
            matchObj = matches[startDate.getFullYear()][startDate.getMonth() + 1][startDate.getDate()];
            for (j = 0; j < Object.keys(matchObj).length; j++){
                if (matchObj[j].player_one == username)
                    countWin += matchObj[j].player_one_pts > matchObj[j].player_two_pts;
                else
                    countWin += matchObj[j].player_one_pts < matchObj[j].player_two_pts;
                countMatch += 1;
            }
            startedPlaying = true;
        }
        catch{
        }
        try{
            matchObj = clientMatches[startDate.getFullYear()][startDate.getMonth() + 1][startDate.getDate()];
            for (j = 0; j < Object.keys(matchObj).length; j++){
                if (matchObj[j].player_one == clientUsername)
                    clientCountWin += matchObj[j].player_one_pts > matchObj[j].player_two_pts;
                else
                    clientCountWin += matchObj[j].player_one_pts < matchObj[j].player_two_pts;
                clientCountMatch += 1;
            }
            startedPlaying = true;
        }
        catch{
        }
        if (startedPlaying){
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
    };
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
            borderWidth: 2,
            pointBackgroundColor: function(context){
                const chart = context.chart;
                const {ctx, chartArea} = chart;

                if (!chartArea)
                    return ;
                return (getGradient(ctx, chartArea));
            },
            pointBorderWidth: 0,
            pointhitRadius: 4,
            pointRadius: LastXDaysDisplayed < 100 ? 2 : 0,
            pointStyle: 'circle',
            borderJoinStyle: 'round',
            spanGaps: true
        }
    ]

    if (username != clientUsername){
        datasets.push({
            label: client.langJson["dashboard"]["CVwinLossGraphClient"],
            data: clientMapAverage,
            fill: false,
            tension: 0,
            borderColor: "grey",
            borderWidth: 2,
            pointBackgroundColor: "grey",
            pointBorderWidth: 0,
            pointhitRadius: 4,
            pointRadius: LastXDaysDisplayed < 100 ? 2 : 0,
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
                    display: true,

                }
            },
            scales: {
                y: {
                    ticks: {
                        color: window.getComputedStyle(document.documentElement).getPropertyValue("--main-text-rgb")
                    },
                    grid: {
                        color: window.getComputedStyle(document.documentElement).getPropertyValue("--main-text-rgb"),
                        lineWidth: .5,
                        drawTicks: false,
                    },
                    min: 0,
                    max: 100,
                },
                x: {
                    ticks: {
                        color: window.getComputedStyle(document.documentElement).getPropertyValue("--main-text-rgb")
                    },
                    grid: {
                        color: window.getComputedStyle(document.documentElement).getPropertyValue("--main-text-rgb"),
                        lineWidth: .5,
                    }
                }
            }
        }
    });


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
            borderWidth: 2,
            pointBackgroundColor: function(context){
                const chart = context.chart;
                const {ctx, chartArea} = chart;

                if (!chartArea)
                    return ;
                return (getGradient(ctx, chartArea));
            },
            pointBorderWidth: 0,
            pointhitRadius: 4,
            pointRadius: LastXDaysDisplayed < 100 ? 2 : 0,
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
            borderWidth: 2,
            pointBackgroundColor: "grey",
            pointBorderWidth: 0,
            pointhitRadius: 4,
            pointRadius: LastXDaysDisplayed < 100 ? 2 : 0,
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
                    text: client.langJson["dashboard"]["CVwinLossAbsGraph"],
                    display: true,

                }
            },
            scales: {
                y: {
                    ticks: {
                        color: window.getComputedStyle(document.documentElement).getPropertyValue("--main-text-rgb")
                    },
                    grid: {
                        color: window.getComputedStyle(document.documentElement).getPropertyValue("--main-text-rgb"),
                        lineWidth: .5,
                        drawTicks: false,
                    }
                },
                x: {
                    ticks: {
                        color: window.getComputedStyle(document.documentElement).getPropertyValue("--main-text-rgb")
                    },
                    grid: {
                        color: window.getComputedStyle(document.documentElement).getPropertyValue("--main-text-rgb"),
                        lineWidth: .5,
                    }
                }
            }
        }
    });

}

function loadUserDashboard(startDate, endDate){

    wLGraph = document.getElementById("winLossGraph").remove();
    wLAbsGraph = document.getElementById("winLossAbsGraph").remove();

    wLGraph = document.createElement("canvas");
    wLGraph.id = "winLossGraph";
    wLAbsGraph = document.createElement("canvas");
    wLAbsGraph.id = "winLossAbsGraph";

    var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    x = (w.innerWidth || e.clientWidth || g.clientWidth) / 100,
    y = (w.innerHeight|| e.clientHeight|| g.clientHeight) / 100;

    wLGraph.width = x * 42;
    wLAbsGraph.width = x * 42;
    wLGraph.height = y * 21;
    wLAbsGraph.height = y * 21;

    document.getElementById("winLossGraphContainer").appendChild(wLGraph);
    document.getElementById("winLossAbsGraphContainer").appendChild(wLAbsGraph);


    var splitPath = window.location.href.split('/');
    var startDateStr = `${startDate.getFullYear()}-${startDate.getMonth() + 1}-${startDate.getDate()}`
    var endDateStr = `${endDate.getFullYear()}-${endDate.getMonth() + 1}-${endDate.getDate()}`
    fetch('/api/user/get', {
        method: 'POST', //GET forbid the use of body :(
        headers: {'Content-Type': 'application/json',},
        body: JSON.stringify({"name" : splitPath[4], "startDate" : startDateStr, "endDate" : endDateStr}),
        credentials: 'include'
    }).then(user => {
        if (user.ok){
            user.json().then((user) => {
                fetch('/api/user/get', {
                    method: 'POST', //GET forbid the use of body :(
                    headers: {'Content-Type': 'application/json',},
                    body: JSON.stringify({"name" : document.getElementById("usernameBtn").innerText, "startDate" : startDateStr, "endDate" : endDateStr}),
                    credentials: 'include'
                }).then(client => {
                    if (client.ok){
                        client.json().then((client) => {
                            unsetLoader()
                            drawWinLossGraph(user.matches, user.username, startDate, endDate, client.matches, client.username);
                        })
                    }
                    else
                        unsetLoader()
                })
                var countWin = 0, countLost = 0, countMatch = 0;
                matchObj = user.matches[Object.keys(user.matches)[Object.keys(user.matches).length - 1]] // get matches object of highest date

                var historyContainer = document.getElementById("matchHistoryContainer");
                historyContainer.innerHTML = "";
                for (var i=0; i<Object.keys(user.matches).length;i++){
                    yearObj = user.matches[Object.keys(user.matches)[i]];
                    for (j = 0; j < Object.keys(yearObj).length; j++){
                        monthObj = yearObj[Object.keys(yearObj)[j]];
                        for (k = 0; k < Object.keys(monthObj).length; k++){
                            dayObj = monthObj[Object.keys(monthObj)[k]];
                            for (l = 0; l < Object.keys(dayObj).length; l++){
                                matchObj = dayObj[Object.keys(dayObj)[l]];
                                if (matchObj.player_one == user.username)
                                    countWin += matchObj.player_one_pts > matchObj.player_two_pts;
                                else
                                    countWin += matchObj.player_one_pts < matchObj.player_two_pts;
                                countMatch += 1;
                                historyContainer.appendChild(createMatchResumeContainer(matchObj));
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

                if (countMatch == 0)
                    document.getElementById("ratioValue").innerHTML = `100%`;
                else
                    document.getElementById("ratioValue").innerHTML = `${Math.floor((countWin / countMatch) * 1000) / 10}%`;
                document.getElementById("nbWinValue").innerHTML = `${countWin}`;
                document.getElementById("nbLossValue").innerHTML = `${countMatch - countWin}`;
                document.getElementById("nbMatchValue").innerHTML = `${countMatch}`;
            })
        }
        else
		    myPushState(`https://${hostname.host}/home`);
    })
}

{
	inputSearchUserContainer.style.setProperty("display", "none");
	dropDownUserContainer.style.setProperty("display", "flex");
	homeBtn.style.setProperty("display", "block");
	notifCenterContainer.style.setProperty("display", "flex");
    var startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    loadUserDashboard(startDate, today);
}
