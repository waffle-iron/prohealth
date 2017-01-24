OneMarketerSales = new Mongo.Collection('oneMarketerSales');
sub = "";
Template.marketerReport.viewmodel({
  marketerName: "",
  fromDate: function(){
    return this.parent().fromDate()
  },
  toDate: function(){
    return this.parent().toDate()
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
  isGroupByDay(){
    return this.parent().groupBy() == "day"
  },
  isGroupByWeek(){
    return this.parent().groupBy() == "week"
  },
  isGroupByMonth(){
    return this.parent().groupBy() == "month"
  },
  isGroupByYear(){
    return this.parent().groupBy() == "year"
  },
  getDate(date){
    if(this.isGroupByDay() || this.isGroupByYear()){
      return date.dt;
    }
    else if(this.isGroupByWeek()){
      return date.week+"/"+date.year;
    }
    else if(this.isGroupByMonth()){
      console.log(date);
      return date.month+"/"+date.year;
    }
  },

  autorun(){
    sub = this.templateInstance.subscribe('oneMarketerSales',
    Router.current().params.marketer,
    moment(this.parent().fromDate(),"MM/DD/YYYY").startOf(this.parent().groupBy()).utc()._d,
    moment(this.parent().toDate(),"MM/DD/YYYY").endOf(this.parent().groupBy()).utc()._d,
    this.parent().groupBy(),
    this.parent().insurance(),
    this.parent().business(),
    this.parent().admitState());
    this.marketerName(Router.current().params.marketer);
    console.log(this.parent().admitState());
  },
  subReady(){
    // if(sub){
      console.log(sub);
      return sub.ready();
    // }
    // else return true
  },
  getMarketerData(){
    let all = OneMarketerSales.find().fetch();
    let  total = 0;
    _.each(all, function(m){
      total += m.totalAdmitted;
    });
    return {total: total, name: this.marketerName()};
  },

  getLink(date, insurance){
    if(this.isGroupByDay()){
      let referalDate = "&referalDate=" + moment(date.fullDt).startOf('day').format("L");
      let insuranceType = "&primaryInsurance=" + insurance;
      let base = "/patients";
      let marketer = "?marketer=" + this.marketerName();
      let query='';
      if(date != '0'){
        query += referalDate;
      }
      if(insurance != '0'){
        query += insuranceType;
      }
      if(this.parent().business()!="all"){
        query += "&type="+this.parent().business();
      }
      if(this.parent().admitState()!="all")
        query += "&chartStatus="+this.parent().admitState();
      // console.log(query);
      return base + marketer + query;
    }else{
      if(this.parent().groupBy() == "month"){
        var from = moment(date.month+"/"+date.year,"MM/YYYY").startOf("month").format("L");
        var to = moment(date.month+"/"+date.year,"MM/YYYY").endOf("month").format("L");
        var route = "/patients?start-date="+from+"&end-date="+to+"&primaryInsurance="+insurance+"&marketer=" + this.marketerName();
        if(this.parent().business()!="all")
          route += "&type="+this.parent().business();
        if(this.parent().admitState()!="all")
          route+="&chartStatus="+this.parent().admitState();
        return route;
      }
      else if(this.parent().groupBy() == "week"){
        var from = moment((date.week+1)+"/"+date.year,"w/YYYY").startOf("week").format("L");
        var to = moment((date.week+1)+"/"+date.year,"w/YYYY").endOf("week").format("L");
        var route = "/patients?start-date="+from+"&end-date="+to+"&primaryInsurance="+insurance+"&marketer=" + this.marketerName();
        if(this.parent().business()!="all")
          route += "&type="+this.parent().business();
        if(this.parent().admitState()!="all")
          route+="&chartStatus="+this.parent().admitState();
        return route;
      }
      else if(this.parent().groupBy() == "year"){
        var from = moment(date,"YYYY").startOf("year").format("L");
        var to = moment(date,"YYYY").endOf("year").format("L");
        var route = "/patients?start-date="+from+"&end-date="+to+"&primaryInsurance="+insurance+"&marketer=" + this.marketerName();
        if(this.parent().business()!="all")
          route += "&type="+this.parent().business();
        if(this.parent().admitState()!="all")
          route+="&chartStatus="+this.parent().admitState();
        return route;
      }

    }
  },
  getTotalLink(insurance){
    var groupBy = this.parent().groupBy();
    var from = moment(this.parent().fromDate(),"MM/DD/YYYY").startOf(groupBy).format("L");
    var to = moment(this.parent().toDate(),"MM/DD/YYYY").endOf(groupBy).format("L");
    var route = "/patients?start-date="+from+"&end-date="+to+"&primaryInsurance="+insurance+"&marketer=" + this.marketerName();
    if(this.parent().business()!="all")
      route += "&type="+this.parent().business();
    if(this.parent().admitState()!="all")
      route+="&chartStatus="+this.parent().admitState();
    return route;
  },
  getMarketerTotalLink(){
    var groupBy = this.parent().groupBy();
    var from = moment(this.parent().fromDate(),"MM/DD/YYYY").startOf(groupBy).format("L");
    var to = moment(this.parent().toDate(),"MM/DD/YYYY").endOf(groupBy).format("L");
    var route = "/patients?start-date="+from+"&end-date="+to+"&marketer=" + this.marketerName();
    if(this.parent().business()!="all")
      route += "&type="+this.parent().business();
    if(this.parent().admitState()!="all")
      route+="&chartStatus="+this.parent().admitState();
    return route;
  },
  getData(){
    return OneMarketerSales.find().fetch();
  },
  getMedicareData(){
    let medicare = OneMarketerSales.find({_id: {$in: ["Medicare Home Health", "Hospice Medicare"]}}).fetch();
    let total=0;
    _.each(medicare, function(m){
      total += m.totalAdmitted;
    });

    return {
      totalAdmits: total,
      medicare: medicare
    };
  },

  getTotal(date, data){
    let totalMedicare = 0;
    let totalPrivate = 0;
    let groupBy = this.parent().groupBy();
    _.each(data, function(d){
      for(let i = 0; i < d.admits.length; i++){
        admit = d.admits[i];
        if(groupBy == "day"){
          if(moment(date.fullDt, "MM/DD/YYYY").startOf('day').isSame(moment(admit.date).startOf('day')) ){
            totalMedicare += d.admits[i].totalMedicare;
            totalPrivate += d.admits[i].totalPrivate;
          }
        }
        else if(groupBy == "week"){
          if(date.week == admit.week && date.year == admit.year){
            totalMedicare += d.admits[i].totalMedicare;
            totalPrivate += d.admits[i].totalPrivate;
          }
        }
        else if(groupBy == "month"){
          if(date.month == admit.month && date.year == admit.year){
            totalMedicare += d.admits[i].totalMedicare;
            totalPrivate += d.admits[i].totalPrivate;
          }
        }
        else if(groupBy == "year"){
          if(date == admit.date){
            totalMedicare += d.admits[i].totalMedicare;
            totalPrivate += d.admits[i].totalPrivate;
          }
        }
      }
    });
    if(totalMedicare || totalPrivate){
      return {totalMedicare: totalMedicare, totalPrivate: totalPrivate};
    }
    return false;
  },

  getAllTotal(date, pData, mData){
    let pTotal = this.getTotal(date, pData).totalPrivate;
    let mTotal = this.getTotal(date, mData).totalMedicare;
    if(!pTotal){
      pTotal = 0;
    }
    if(!mTotal){
      mTotal = 0;
    }
    return pTotal + mTotal;
  },

  checkDates(date, insuranceAdmits){
    let groupBy = this.parent().groupBy();
    if(groupBy == "day"){
      for(let i = 0; i < insuranceAdmits.length; i++){
        if(moment(date.fullDt, "MM/DD/YYYY").startOf('day').isSame(moment(insuranceAdmits[i].date).startOf('day')) ){
          return {total: insuranceAdmits[i].total, totalMedicare: insuranceAdmits[i].totalMedicare, totalPrivate: insuranceAdmits[i].totalPrivate};
        }
      }
    } else if(groupBy == "week"){
      for(let i = 0; i < insuranceAdmits.length; i++){
        var admit = insuranceAdmits[i];
        if(date.week == admit.week && date.year == admit.year){
          return {total: admit.total, totalMedicare: admit.totalMedicare, totalPrivate: admit.totalPrivate};
        }
      }
    } else if(groupBy == "month"){
      for(let i = 0; i < insuranceAdmits.length; i++){
        var admit = insuranceAdmits[i];
        if(date.month == admit.month && date.year == admit.year){
          return {total: admit.total, totalMedicare: admit.totalMedicare, totalPrivate: admit.totalPrivate};
        }
      }
    } else if(groupBy == "year"){
      for(let i = 0; i < insuranceAdmits.length; i++){
        var admit = insuranceAdmits[i];
        if(date == admit.date){
          return {total: admit.total, totalMedicare: admit.totalMedicare, totalPrivate: admit.totalPrivate};
        }
      }
    }
    return false;
  },
  totalOf(x,y){
    return x+y;
  },
  getPrivateData(){
    let private = OneMarketerSales.find({_id: {$nin: ["Medicare Home Health", "Hospice Medicare"]}}).fetch();
    let total=0;
    _.each(private, function(p){
      total += p.totalAdmitted;
    });

    return {
      totalAdmits: total,
      private: private
    };
  },

  getDateRange(){
    let dates = [];
    let groupBy = this.parent().groupBy();
    if(groupBy == "day"){
      let days = moment(this.toDate(), "MM/DD/YYYY").diff(moment(this.fromDate(), "MM/DD/YYYY") ,'days') + 1;
      // console.log(days);
      for(let i = 0; i < days; i++){
        dates.push({dt:moment(this.fromDate(), "MM/DD/YYYY").add(i, 'days').format("MM/DD"),
                    fullDt: moment(this.fromDate(), "MM/DD/YYYY").add(i, 'days').format("MM/DD/YYYY")});
      }
    } else if(groupBy == "week"){
      var currDate = moment(this.fromDate(),"MM/DD/YYYY").startOf(groupBy);
      var lastDate = moment(this.toDate(),"MM/DD/YYYY").endOf(groupBy);
      dates.push({
        week: moment(currDate).week()-1,
        year: moment(currDate).year(),
        start: moment(currDate).format("MM/DD"),
        end: moment(currDate).add(6,"days").format("MM/DD"),
      });
      while(currDate.add(1,"week").isBefore(lastDate)){
        dtObj = {
          week: moment(currDate).week()-1,
          year: moment(currDate).year(),
          start: moment(currDate).format("MM/DD"),
          end: moment(currDate).add(6,"days").format("MM/DD"),
        };
        dates.push(dtObj);
      }
    } else if(groupBy == "month"){
      var currDate = moment(this.fromDate(),"MM/DD/YYYY").startOf(groupBy);
      var lastDate = moment(this.toDate(),"MM/DD/YYYY").endOf(groupBy);
      dates.push({
        month: moment(currDate).month()+1,
        year: moment(currDate).year()
      });
      while(currDate.add(1,"month").isBefore(lastDate)){
        dtObj = {
          month: moment(currDate).month()+1,
          year: moment(currDate).year()
        };
        dates.push(dtObj);
      }
    } else if(groupBy == "year"){
      var currDate = moment(this.fromDate(),"MM/DD/YYYY").startOf(groupBy);
      var lastDate = moment(this.toDate(),"MM/DD/YYYY").endOf(groupBy);
      dates.push(moment(currDate).year());
      while(currDate.add(1,"year").isBefore(lastDate)){
        dtObj = moment(currDate).year();
        dates.push(dtObj);
      }
    }
    // console.log(dates);
    return dates;
  },
  // Download csv
  tableData: function () {
      // if(!this.marketerSales())
        // return;
      // console.log(this.marketerSales());
      var rows = "";
      rows+= '"'+this.marketerName()+'" - Sales Report,Grouped By:'+this.parent().groupBy()+'\n'
      rows+= "From:,"+this.parent().fromDate()+"\n"
      rows+= "To:,"+this.parent().toDate()+"\n"
      rows+= "Filters:,Business:"+this.parent().business()+",Insurance:"+this.parent().insurance()+"\n"
      rows+="\n"

      var _this = this;

      var tableHead = 'Insurance Type,Insurance Name,Total';
      _.each(this.getDateRange(), function(date){
        tableHead+=","
        if(_this.isGroupByYear())
          tableHead+=date.date
        else
          tableHead+=_this.getDate(date)

      });
      tableHead+="\n"
      // //
      rows += tableHead;
      if(this.isGroupByWeek()){
        tableHead = ',,,';
        _.each(_this.getDateRange(), function(date){
          tableHead+=date.start+"-"+date.end+","
        });
        tableHead+="\n"
        // //
        rows += tableHead;
      }
      if(_this.showMedicare()){
        rows += "Medicare,,";
        rows += _this.getMedicareData().totalAdmits;
        _.each(_this.getDateRange(),function(date){
          if(_this.getTotal(date,_this.getMedicareData().medicare))
          rows+=","+_this.getTotal(date,_this.getMedicareData().medicare).totalMedicare;
          else {
            rows+=",0"
          }
        });
        rows += "\n";
        _.each(_this.getMedicareData().medicare,function(insurance){
          rows += ","+insurance._id;
          rows += ","+insurance.totalAdmitted;
          _.each(_this.getDateRange(),function(date){
            if(_this.checkDates(date,insurance.admits))
            rows+=","+_this.checkDates(date,insurance.admits).total;
            else {
              rows+=",0"
            }
          });
          rows += "\n";
        });
        rows += "\n";
      }
      if(_this.showPrivate()){
        rows += "Private,,";
        rows += _this.getPrivateData().totalAdmits;
        _.each(_this.getDateRange(),function(date){
          if(_this.getTotal(date,_this.getPrivateData().private))
          rows+=","+_this.getTotal(date,_this.getPrivateData().private).totalPrivate;
          else {
            rows+=",0"
          }
        });
        rows += "\n";
        _.each(_this.getPrivateData().private,function(insurance){
          rows += ","+insurance._id;
          rows += ","+insurance.totalAdmitted;
          _.each(_this.getDateRange(),function(date){
            if(_this.checkDates(date,insurance.admits))
            rows+=","+_this.checkDates(date,insurance.admits).total;
            else {
              rows+=",0"
            }
          });
          rows += "\n";
        });
      }
      rows += "\n";
      rows += "Total,,";
      rows += this.getMedicareData().totalAdmits+this.getPrivateData().totalAdmits;

      _.each(_this.getDateRange(),function(date){
        if(_this.getAllTotal(date,_this.getPrivateData().private,_this.getMedicareData().medicare))
        rows+=","+_this.getAllTotal(date,_this.getPrivateData().private,_this.getMedicareData().medicare);
        else {
          rows+=",0"
        }
      });
      return rows;
  },
  downloadCSV: function () {
    // var data, filename, link;
    var csv = this.tableData();
    if (csv == null) return;
    filename = '"'+this.marketerName()+'" Marketer-Sales-report.csv';
    if (!csv.match(/^data:text\/csv/i)){
       csv = 'data:text/csv;charset=utf-8,' + csv;
     }

    data = encodeURI(csv);
    link = document.createElement('a');
    link.setAttribute('href', data);
    link.setAttribute('download', filename);
    link.click();
  },
  header: function(){
    return this.parent().headerVariable().title+" Sales Report";
  },
  events:{
    'click #sendmail'(event){
       $('#modal1').openModal();
    },
  }
});
