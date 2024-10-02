var splitPath = window.location.href.split('/');
var pointAppearanceDelay = 25; // default is 50 (higher the delay, slower the points will appeare on graph)
var chartAverage, chartAbs;
const defaultLastXDaysDisplayed = 7;
let width, height, gradient;
chartAverage = null;
chartAbs = null;

lastWeekSelection = document.getElementById("lastWeekSelection");
lastMonthSelection = document.getElementById("lastMonthSelection");
lastYearSelection = document.getElementById("lastYearSelection");
timelineDropdownBtn = document.getElementById("timelineDropdownBtn");
timelineDropdown = document.getElementById("timelineDropdownContainer")

lastWeekSelection.addEventListener("click", (e) => {
	document.getElementById("loaderBg").style.setProperty("display", "block");
    loadUserDashboard(7);
    if (lastMonthSelection.classList.contains("activeTimeline"))
        lastMonthSelection.classList.remove("activeTimeline");
    if (lastYearSelection.classList.contains("activeTimeline"))
        lastYearSelection.classList.remove("activeTimeline");
    lastWeekSelection.classList.add("activeTimeline");
})

lastMonthSelection.addEventListener("click", (e) => {
	document.getElementById("loaderBg").style.setProperty("display", "block");
    loadUserDashboard(31);
    if (lastWeekSelection.classList.contains("activeTimeline"))
        lastWeekSelection.classList.remove("activeTimeline");
    if (lastYearSelection.classList.contains("activeTimeline"))
        lastYearSelection.classList.remove("activeTimeline");
    lastMonthSelection.classList.add("activeTimeline");
})

lastYearSelection.addEventListener("click", (e) => {
	document.getElementById("loaderBg").style.setProperty("display", "block");
    loadUserDashboard(365);
    if (lastWeekSelection.classList.contains("activeTimeline"))
        lastWeekSelection.classList.remove("activeTimeline");
    if (lastMonthSelection.classList.contains("activeTimeline"))
        lastMonthSelection.classList.remove("activeTimeline");
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

function drawWinLossGraph(matches, username, LastXDaysDisplayed, clientMatches, clientUsername){
    if (chartAverage)
        chartAverage.destroy();
    if (chartAbs)
        chartAbs.destroy();
    var endDate = new Date();
    var startDate = new Date();
    startDate.setDate(startDate.getDate() - LastXDaysDisplayed);
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

function loadUserDashboard(LastXDaysDisplayed){
    var endDate = new Date();
    var startDate = new Date();
    startDate.setDate(startDate.getDate() - LastXDaysDisplayed);
    startDate = `${startDate.getFullYear()}-${startDate.getMonth() + 1}-${startDate.getDate()}`
    endDate = `${endDate.getFullYear()}-${endDate.getMonth() + 1}-${endDate.getDate()}`
    fetch('/api/user/get', {
        method: 'POST', //GET forbid the use of body :(
        headers: {'Content-Type': 'application/json',},
        body: JSON.stringify({"name" : splitPath[4], "startDate" : startDate, "endDate" : endDate}),
        credentials: 'include'
    }).then(user => {
        if (user.ok){
            user.json().then((user) => {
                fetch('/api/user/get', {
                    method: 'POST', //GET forbid the use of body :(
                    headers: {'Content-Type': 'application/json',},
                    body: JSON.stringify({"name" : document.getElementById("usernameBtn").innerText, "startDate" : startDate, "endDate" : endDate}),
                    credentials: 'include'
                }).then(client => {
                    if (client.ok){
                        client.json().then((client) => {
                            document.getElementById("loaderBg").style.setProperty("display", "none");
                            drawWinLossGraph(user.matches, user.username, LastXDaysDisplayed, client.matches, client.username);
                        })
                    }
                    else
                        document.getElementById("loaderBg").style.setProperty("display", "none");
                })
                var countWin = 0, countLost = 0, countMatch = 0;
                matchObj = user.matches[Object.keys(user.matches)[Object.keys(user.matches).length - 1]] // get matches object of highest date

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
                            }
                        }
                    }
                }

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
		    history.pushState("", "", `https://${hostname.host}/home`);
    })
}

{
	inputSearchUser.style.setProperty("display", "none");
	dropDownUserContainer.style.setProperty("display", "flex");
	homeBtn.style.setProperty("display", "block");
    loadUserDashboard(defaultLastXDaysDisplayed)
}
