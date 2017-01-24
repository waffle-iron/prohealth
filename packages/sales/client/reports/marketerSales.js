Template.marketerSalesSheet.viewmodel({
  groupBy: function(){
    return this.parent().groupBy();
  },
  header: function(){
    return this.parent().headerVariable().title;
  },
  showMedicare(){
    if(this.parent().insurance() == "Medicare" || this.parent().insurance() == "all")
      return true;
    return false;
  },
  showPrivate(){
    if(this.parent().insurance() == "Private" || this.parent().insurance() == "all")
      return true;
    return false;
  },
  showAll(){
    if(this.parent().insurance() == "all")
      return true;
    return false;
  },
  unitsPerYear(year){
    return Session.get("unitsPerYear")[year];
  },
  years(){
    return this.parent().getYears();
    // console.log(this.parent().toDate());
  },
  getLink(that,insurance,id){
    if(this.parent().groupBy() == "day"){
      var route = "/patients?referalDate=" + moment(that.date).format("L") +"&primaryInsurance="+insurance+"&marketer=" + id;
      if(this.parent().business()!="all")
        route+="&type="+this.parent().business();
      if(this.parent().admitState()!="all"){
        route+="&chartStatus="+this.parent().admitState();
      }
      return route;
    }
    else{
      if(this.parent().groupBy() == "month"){
        var from = moment(that.dt+"/"+that.yr,"MM/YYYY").startOf("month").format("L");
        var to = moment(that.dt+"/"+that.yr,"MM/YYYY").endOf("month").format("L");
        var route = "/patients?start-date="+from+"&end-date="+to+"&primaryInsurance="+insurance+"&marketer=" + id;
        if(this.parent().business()!="all")
          route+="&type="+this.parent().business();
        if(this.parent().admitState()!="all")
          route+="&chartStatus="+this.parent().admitState();

        return route;
      }else if(this.parent().groupBy() == "week"){

        var from = moment((that.dt+1)+"/"+that.yr,"w/YYYY").startOf("week").format("L");
        var to = moment((that.dt+1)+"/"+that.yr,"w/YYYY").endOf("week").format("L");
        if(moment(moment(that.start+"/"+that.yr,"MM/DD/YYYY").dayOfYear(1)).weekday()==0){
          var from = moment((that.dt)+"/"+that.yr,"w/YYYY").startOf("week").format("L");
          var to = moment((that.dt)+"/"+that.yr,"w/YYYY").endOf("week").format("L");
        }

        var route = "/patients?start-date="+from+"&end-date="+to+"&primaryInsurance="+insurance+"&marketer=" + id;
        if(this.parent().business()!="all")
          route+="&type="+this.parent().business();

        if(this.parent().admitState()!="all")
          route+="&chartStatus="+this.parent().admitState();

        return route;
      }else if(this.parent().groupBy() == "year"){
        var from = moment(that.dt,"YYYY").startOf("year").format("L");
        var to = moment(that.dt,"YYYY").endOf("year").format("L");
        var route = "/patients?start-date="+from+"&end-date="+to+"&primaryInsurance="+insurance+"&marketer=" + id
        if(this.parent().business()!="all")
          route+="&type="+this.parent().business();
        if(this.parent().admitState()!="all")
          route+="&chartStatus="+this.parent().admitState();
        return route;
      }
    }
  },
  getTotalsLink(that,insurance){
    if(this.parent().groupBy() == "day"){
      var route = "/patients?referalDate=" + moment(that.date).format("L") +"&primaryInsurance="+insurance;
      if(this.parent().business()!="all")
        route+="&type="+this.parent().business();
      if(this.parent().admitState()!="all")
        route+="&chartStatus="+this.parent().admitState();
      return route;
    }
    else{
      if(this.parent().groupBy() == "month"){
        var from = moment(that.dt+"/"+that.yr,"MM/YYYY").startOf("month").format("L");
        var to = moment(that.dt+"/"+that.yr,"MM/YYYY").endOf("month").format("L");
        var route = "/patients?start-date="+from+"&end-date="+to+"&primaryInsurance="+insurance;
        if(this.parent().business()!="all")
          route+="&type="+this.parent().business();
        if(this.parent().admitState()!="all")
          route+="&chartStatus="+this.parent().admitState();
        return route;
      }else if(this.parent().groupBy() == "week"){

        var from = moment((that.dt+1)+"/"+that.yr,"w/YYYY").startOf("week").format("L");
        var to = moment((that.dt+1)+"/"+that.yr,"w/YYYY").endOf("week").format("L");
        if(moment(moment(that.start+"/"+that.yr,"MM/DD/YYYY").dayOfYear(1)).weekday()==0){
          var from = moment((that.dt)+"/"+that.yr,"w/YYYY").startOf("week").format("L");
          var to = moment((that.dt)+"/"+that.yr,"w/YYYY").endOf("week").format("L");
        }

        var route = "/patients?start-date="+from+"&end-date="+to+"&primaryInsurance="+insurance;
        if(this.parent().business()!="all")
          route+="&type="+this.parent().business();
        if(this.parent().admitState()!="all")
          route+="&chartStatus="+this.parent().admitState();
        return route;
      }else if(this.parent().groupBy() == "year"){
        var from = moment(that.dt,"YYYY").startOf("year").format("L");
        var to = moment(that.dt,"YYYY").endOf("year").format("L");
        var route = "/patients?start-date="+from+"&end-date="+to+"&primaryInsurance="+insurance;
        if(this.parent().business()!="all")
          route+="&type="+this.parent().business();
        if(this.parent().admitState()!="all")
          route+="&chartStatus="+this.parent().admitState();
        return route;
      }
    }
  },
  getTotalLink(insurance,id){
    var groupBy = this.parent().groupBy();
    var from = moment(this.parent().fromDate(),"MM/DD/YYYY").startOf(groupBy).format("L");
    var to = moment(this.parent().toDate(),"MM/DD/YYYY").endOf(groupBy).format("L");
    var route = "/patients?start-date="+from+"&end-date="+to+"&primaryInsurance="+insurance+"&marketer=" + id;
    if(this.parent().business()!="all")
      route+="&type="+this.parent().business();
    if(this.parent().admitState()!="all")
      route+="&chartStatus="+this.parent().admitState();
    return route;
  },
  getUTotalLink(insurance){
    var groupBy = this.parent().groupBy();
    var from = moment(this.parent().fromDate(),"MM/DD/YYYY").startOf(groupBy).format("L");
    var to = moment(this.parent().toDate(),"MM/DD/YYYY").endOf(groupBy).format("L");
    var route = "/patients?start-date="+from+"&end-date="+to+"&primaryInsurance="+insurance;
    if(this.parent().business()!="all")
      route+="&type="+this.parent().business();
    if(this.parent().admitState()!="all")
      route+="&chartStatus="+this.parent().admitState();
    return route;
  },
  groupByMonth: function(){
    return this.parent().groupBy() === "month"
  },
  groupByWeek: function(){
    return this.parent().groupBy() === "week"
  },
  marketerSales: function(){
    console.log(this.parent().marketerSales());
    return this.parent().marketerSales();
  },
  updateAdmits(admits){
      var admitsCounter = 0;
      var admitDates = Session.get("allDates");
      // console.log(admits);
      var groupBy = this.parent().groupBy();
      if(groupBy === "day" && admitDates){
        for(let i = 0; i < admitDates.length; i++){
          var date = admitDates[i];
          // console.log(date);
          if(admitsCounter < admits.length){
            var admit = admits[admitsCounter];
            // console.log("admit",moment(new Date(admit.referalDate)).startOf("day")._d);
            // console.log("date",moment(date.dt,"MM/DD").startOf("day")._d); // is already utc
            // console.log("date",date); // is already utc
            // console.log(moment(new Date(admit.referalDate)).startOf("day").isSame(moment(date.fullDt,"MM/DD/YYYY").startOf("day")._d));
            if(moment(new Date(admit.referalDate)).startOf("day").isSame(moment(date.fullDt,"MM/DD/YYYY").startOf("day"))){
              var dateObj = admitDates[i];
              dateObj.total = admit.total;
              dateObj.date = admit.referalDate;
              dateObj.medicare = admit.medicare;
              dateObj.nonMedicare = admit.nonMedicare;
              admitDates[i] = dateObj;
              admitsCounter++;
            }
          } else{
            // console.log("break");
            break;
          }
        }
      }
    else if(groupBy === "month"){
      for(let i = 0; i < admitDates.length; i++){
        var date = admitDates[i];
        if(admitsCounter < admits.length){
          var admit = admits[admitsCounter];
          if(admit.month == date.dt && admit.year == date.yr){
            var dateObj = admitDates[i];
            dateObj.total = admit.total;
            dateObj.date = admit.month;
            dateObj.medicare = admit.medicare;
            dateObj.nonMedicare = admit.nonMedicare;
            admitDates[i] = dateObj;
            admitsCounter++;
          }
        }else{
          break;
        }
      }
    }
    else if(groupBy === "week"){
      for(let i = 0; i < admitDates.length; i++){
        var date = admitDates[i];
        if(admitsCounter < admits.length){
          var admit = admits[admitsCounter];
          if(admit.week == date.dt && admit.year == date.yr){
            var dateObj = admitDates[i];
            dateObj.total = admit.total;
            dateObj.date = admit.week;
            dateObj.medicare = admit.medicare;
            dateObj.nonMedicare = admit.nonMedicare;
            admitDates[i] = dateObj;
            admitsCounter++;
          }
        }else{
          break;
        }
      }
    }
    else if(groupBy == "year"){
      for(let i = 0; i < admitDates.length; i++){
        var date = admitDates[i];
        if(admitsCounter < admits.length){
          var admit = admits[admitsCounter];
          if(admit.referalDate == date.dt){
            var dateObj = admitDates[i];
            dateObj.total = admit.total;
            dateObj.date = admit.referalDate;
            dateObj.medicare = admit.medicare;
            dateObj.nonMedicare = admit.nonMedicare;
            admitDates[i] = dateObj;
            admitsCounter++;
          }
        }
      }
    }
    return admitDates;
  },
  dates:function(){
    return Session.get("allDates");
  },
  totals: function(){
    return this.parent().marketerSalesTotals();
  },
  ultimateTotal: function(){
    return this.parent().getUltimateTotal();
  },
  // Download csv
  tableData: function () {
      if(!this.marketerSales())
        return;
      // console.log(this.marketerSales());
      var rows = "";

      rows+= "Marketer Sales Report,Grouped By:"+this.parent().groupBy()+"\n"
      rows+= "From:,"+this.parent().fromDate()+"\n"
      rows+= "To:,"+this.parent().toDate()+"\n"
      rows+= "Filters:,Business:"+this.parent().business()+",Insurance:"+this.parent().insurance()+"\n"
      rows+="\n"

      var tableHead = 'Marketer,Total,';
      _.each(this.dates(), function(date){
        tableHead+=date.dt
        if(date.yr)
         tableHead+="/"+date.yr
        tableHead+=","

      });
      tableHead+="\n"
      // //
      rows += tableHead;
      if(this.groupByWeek()){
        tableHead = ',,';
        _.each(this.dates(), function(date){
          tableHead+=date.start+"-"+date.end+","
        });
        tableHead+="\n"
        // //
        rows += tableHead;
      }

      var _this = this;
      _.each(this.marketerSales(),function(marketer){
        var marketerName=marketer._id.replace(",","");
        rows += marketerName;
        rows += ",";
        if(_this.showMedicare()){
          rows += marketer.totalMedicare
        }
        if(_this.showAll()){
          rows += "/";
        }
        if(_this.showPrivate()){
          rows += marketer.totalNonMedicare;
        }
        _.each(_this.updateAdmits(marketer.admits),function(admit){
          rows += ",";
          if(_this.showMedicare()){
            rows += admit.medicare
          }
          if(_this.showAll()){
            rows += "/";
          }
          if(_this.showPrivate()){
            rows += admit.nonMedicare;
          }
        });
        rows += "\n";

      });
      // //LAST ROW
      rows += "Total,";
      if(this.showMedicare()){
        rows += this.ultimateTotal().medicare
      }
      if(this.showAll()){
        rows += "/";
      }
      if(this.showPrivate()){
        rows += this.ultimateTotal().nonMedicare;
      }
      // rows += "Total,"+this.ultimateTotal().medicare+"/"+this.ultimateTotal().nonMedicare;
      _.each(this.updateAdmits(this.totals()),function(admit){
        rows += ",";
        if(_this.showMedicare()){
          rows += admit.medicare
        }
        if(_this.showAll()){
          rows += "/";
        }
        if(_this.showPrivate()){
          rows += admit.nonMedicare;
        }
      });
      rows += "\n";
      return rows;
  },
  downloadCSV: function () {
    // var data, filename, link;
    var csv = this.tableData();
    if (csv == null) return;
    filename = 'Marketer-Sales-report.csv';
    if (!csv.match(/^data:text\/csv/i)){
       csv = 'data:text/csv;charset=utf-8,' + csv;
     }

    data = encodeURI(csv);
    link = document.createElement('a');
    link.setAttribute('href', data);
    link.setAttribute('download', filename);
    link.click();
  },

  filtersArr: function(){
    return [{name:"From",id:"fromDate"}, {name:"To",id:"toDate"},{name:"Insurance",id:"insurance"},{name:"Business",id:"business"}];
  },
  events:{
    "click .changeTemplate"(e){
      this.parent().salesView("marketerStats");
      this.parent().selectedMarketer(e.target.id);
    },
    'click #sendmail'(event){
       $('#modal1').openModal();
    },
  }
});
