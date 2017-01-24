Template.marketerStats.viewmodel({

  marketerSales(){
    let marketer = this.parent().oneMarketerSales(Router.current().params.marketer)[0];
    // console.log(marketer);
    return marketer? marketer : false;
  },
  getXaxis:[],
  getData(from, to, type){
    let days = moment(to).diff(moment(from) ,'days') + 1;
    let year = moment(from).year();
    let month = moment(from).month();
    let day = moment(from).date();
    let seriesData = []; //the data that will go in highcharts series section
    if(this.marketerSales()){
      if(this.parent().groupBy() == "day"){
        let admits = this.marketerSales().admits;
        let pointer = 0; //an incrementable variable to hold the current position in the admits array
        let refDate, currentDate;
        // console.log(admits[pointer].referalDate);
        for(let i = 1; i <= days; i++){
          if(pointer < admits.length && moment(admits[pointer].referalDate).format("L") == moment(from).add((i-1), 'days').format("L")){
            if(type == "medicare"){
              //the data to go in the highcharts series is on the form [(utc date), data]
              seriesData.push([Date.UTC(year, month, (day + (i-1)) ), admits[pointer].medicare]);
            }
            else {
              seriesData.push([Date.UTC(year, month, (day + (i-1)) ), admits[pointer].nonMedicare]);
            }
            pointer++;
          }
        }
      } else{
        let admits = this.marketerSales().admits;
        var xAxis = [];
        var admitsCounter = 0;
        var admitDates = Session.get("allDates");
        // console.log(admits);
        var groupBy = this.parent().groupBy();
        if(groupBy == "week" || groupBy == "month"){
          for(let i = 0; i < admitDates.length; i++){
            var date = admitDates[i];
            xAxis.push(date.dt+"/"+date.yr);
            if(admitsCounter < admits.length){
              var admit = admits[admitsCounter];
              console.log(admit);
              console.log(admitsCounter);
              if(admit[groupBy] == date.dt && admit.year == date.yr){
                if(type == "medicare"){
                  seriesData.push([admit[groupBy]+"/"+admit.year, admits[admitsCounter].medicare]);
                } else {
                  seriesData.push([admit[groupBy]+"/"+admit.year, admits[admitsCounter].nonMedicare]);
                }
                admitsCounter++;
              }
              else{
                seriesData.push([date.dt+"/"+date.yr, 0]);
              }
            }
          }
        }
        else if(groupBy == "year"){
          for(let i = 0; i < admitDates.length; i++){
            var date = admitDates[i];
            xAxis.push(date.dt);
            if(admitsCounter < admits.length){
              var admit = admits[admitsCounter];
              console.log(admit);
              console.log(admitsCounter);
              if(admit.referalDate == date.dt){
                if(type == "medicare"){
                  seriesData.push([admit.referalDate, admits[admitsCounter].medicare]);
                } else {
                  seriesData.push([admit.referalDate, admits[admitsCounter].nonMedicare]);
                }
                admitsCounter++;
              }
              else{
                seriesData.push([date.dt, 0]);
              }
            }
          }
        }
        console.log(seriesData);
        Session.set("xData",xAxis);
      }
    }
    else{
      return false; //if there is no marketer found
    }
    return seriesData; //return the data array to the highcharts series section
  },

  chartOpts(){
    let that = this; // to be used inside the highcharts object
    var xObject = {};
    if(this.parent().groupBy() == "day"){
      xObject = {
        type: 'datetime',
        title: {
          text: 'Period'
        },
        startOnTick:true,
        endOnTick:true,
        minTickInterval: 86400000,
        dateTimeLabelFormats: {
          day: '%e / %m'
        },
      };
    }
    else{
      xObject = {
        categories: Session.get("xData"),
      };
    }
    return {
      chart: {
        type: 'column',
        zoomType: 'x'
      },
      title: {
        text: 'Marketer Statistics'
      },
      xAxis: xObject,
      yAxis: {
        type: 'linear',
        title: {
          text: 'Number of Visits'
        },
        min: 0,
        allowDecimals: false,
      },
      tooltip: {
        pointFormat: '{series.name}: {point.y}<br/>Total: {point.stackTotal}'
      },
      plotOptions: {
        column: {
          stacking: 'normal',
          pointWidth:20,
          dataLabels: {
            enabled: true,
          }
        },
        series: {
          cursor: 'pointer',
          point: {
            events: {
              click(){
                //this is the query to get the current marketer patients
                //corresponding to the column clicked whether it is medicare or
                //private
                //-- this.x returns the current x axis value, the name
                //in this.series.name returns the current name of the clicked
                //column (Medicare or Private)
                let query = "";
                var groupBy = that.parent().groupBy();
                if(groupBy == "day"){
                  query = "/patients?chartStatus=Admitted" +
                            "&referalDate=" + moment(this.x).format("L") +
                            "&primaryInsurance=" + this.series.name +
                            "&marketer=" + that.marketerSales()._id;
                }
                else if(groupBy == "week" || groupBy == "month"){
                  var dateFormat = groupBy == "month" ? "MM/YYYY" : "w/YYYY"
                  var date = "";
                  if(groupBy == "month")
                    date = Session.get("xData")[this.x]
                  else{
                    var dt = Session.get("xData")[this.x];
                    var wk = dt.substring(0, dt.indexOf("/"));
                    date = (parseInt(wk)+1) + dt.substring(dt.indexOf("/"));

                  }
                  var from = moment(date,dateFormat).startOf(groupBy).format("L");
                  var to = moment(date,dateFormat).endOf(groupBy).format("L");

                  query = "/patients?chartStatus=Admitted"+
                  "&start-date="+ from +
                  "&end-date="+ to +
                  "&primaryInsurance="+ this.series.name +
                  "&marketer=" + that.marketerSales()._id;
                }
                else if(groupBy == "year"){
                  console.log(this.x);
                  var from = moment(this.x,"YYYY").startOf("year").format("L");
                  var to = moment(this.x,"YYYY").endOf("year").format("L");

                  query = "/patients?chartStatus=Admitted"+
                  "&start-date="+ from +
                  "&end-date="+ to +
                  "&primaryInsurance="+ this.series.name +
                  "&marketer=" + that.marketerSales()._id;
                }
                Router.go(query);
              }
            }
          }
        }
      },
      series: [
        {
          name: 'Medicare',
          data: this.getData(new Date(this.parent().fromDate()), new Date(this.parent().toDate()), "medicare")
        },
        {
          name: 'Private',
          data: this.getData(new Date(this.parent().fromDate()), new Date(this.parent().toDate()), "private")
        }
      ]
    };
  },
});
