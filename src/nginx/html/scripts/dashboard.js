var splitPath = window.location.href.split('/');
var pointAppearanceDelay = 25; // default is 50 (higher the delay, slower the points will appeare on graph)
var chartAverage, chartAbs;
const defaultLastXDaysDisplayed = 7;
let width, height, gradient;
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

function decreamentDateByXDays(date, x){

}

function drawWinLossGraph(matches, username, LastXDaysDisplayed, clientMatches, clientUsername){
    var endDate = new Date();
    var startDate = new Date();
    startDate.setDate(startDate.getDate() - LastXDaysDisplayed);
    nbMatch = Object.keys(matches).length;
    const mapAverage = [], mapAbs = [], clientMapAverage = [], clientMapAbs = [];
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
        }
        catch{
        }
        average = (countWin / countMatch) * 100;
        absResult = (countWin - (countMatch - countWin));
        mapAverage.push({'date' : `${startDate.getFullYear()}-${startDate.getMonth() + 1}-${startDate.getDate()}`, 'average' : average});
        mapAbs.push({'date' : `${startDate.getFullYear()}-${startDate.getMonth() + 1}-${startDate.getDate()}`, 'result' : absResult});
        clientAverage = (clientCountWin / clientCountMatch) * 100;
        clientAbsResult = (clientCountWin - (clientCountMatch - clientCountWin));
        clientMapAverage.push({'date' : `${startDate.getFullYear()}-${startDate.getMonth() + 1}-${startDate.getDate()}`, 'average' : clientAverage});
        clientMapAbs.push({'date' : `${startDate.getFullYear()}-${startDate.getMonth() + 1}-${startDate.getDate()}`, 'result' : clientAbsResult});
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

    chartAverage = new Chart(document.getElementById("winLossGraph"), {
        type: 'line',
        data: {
            labels: mapAverage.map(row => row.date),
            datasets: [
                {
                    label: username,
                    data: mapAverage.map(row => row.average),
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
                    pointRadius: 2,
                    pointStyle: 'circle',
                    borderJoinStyle: 'round'
                },
                {
                    label: "you",
                    data: clientMapAverage.map(row => row.average),
                    fill: false,
                    tension: 0,
                    borderColor: "grey",
                    borderWidth: 2,
                    pointBackgroundColor: "grey",
                    pointBorderWidth: 0,
                    pointhitRadius: 4,
                    pointRadius: 2,
                    pointStyle: 'circle',
                    borderJoinStyle: 'round'
                }
            ]
        },
        options:{
            animation,

            plugins: {
                title: {
                    color: window.getComputedStyle(document.documentElement).getPropertyValue("--main-text-rgb"),
                    text: 'Average by date',
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


    chartAbs = new Chart(document.getElementById("winLossAbsGraph"), {
        type: 'line',
        data: {
            labels: mapAbs.map(row => row.date),
            datasets: [
                {
                    label: username,
                    data: mapAbs.map(row => row.result),
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
                    pointRadius: 2,
                    pointStyle: 'circle'
                },
                {
                    label: 'You',
                    data: clientMapAbs.map(row => row.result),
                    fill: false,
                    tension: 0,
                    borderColor: "grey",
                    borderWidth: 2,
                    pointBackgroundColor: "grey",
                    pointBorderWidth: 0,
                    pointhitRadius: 4,
                    pointRadius: 2,
                    pointStyle: 'circle'
                }
            ]
        },
        options:{
            animation,

            plugins: {
                title: {
                    color: window.getComputedStyle(document.documentElement).getPropertyValue("--main-text-rgb"),
                    text: 'Number of victory over number of defeat by date',
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

function loadUserDashboard(){
    fetch('/api/user/get', {
        method: 'POST', //GET forbid the use of body :(
        headers: {'Content-Type': 'application/json',},
        body: JSON.stringify({"name" : splitPath[4]}),
        credentials: 'include'
    }).then(user => {
        user.json().then((user) => {
            fetch('/api/user/get', {
                method: 'POST', //GET forbid the use of body :(
                headers: {'Content-Type': 'application/json',},
                body: JSON.stringify({"name" : document.getElementById("usernameBtn").innerHTML}),
                credentials: 'include'
            }).then(client => {
                client.json().then((client) => {
                    drawWinLossGraph(user.matches, user.username, defaultLastXDaysDisplayed, client.matches, client.username);
                })
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
                            if (matchObj.player_one == user.username){
                                countWin += matchObj.player_one_pts > matchObj.player_two_pts;
                                countLost += matchObj.player_one_pts < matchObj.player_two_pts;
                            }
                            else{
                                countWin += matchObj.player_one_pts < matchObj.player_two_pts;
                                countLost += matchObj.player_one_pts > matchObj.player_two_pts;
                            }
                            countMatch += 1;
                        }
                    }
                }
            }
                        
            document.getElementById("ratioContainer").innerHTML += `${Math.floor((countWin / countMatch) * 1000) / 10}%`
            document.getElementById("nbWinContainer").innerHTML += `${countWin}`
            document.getElementById("nbLossContainer").innerHTML += `${countLost}`
            document.getElementById("nbMatchContainer").innerHTML += `${countMatch}`
        })
    })
}

loadUserDashboard()