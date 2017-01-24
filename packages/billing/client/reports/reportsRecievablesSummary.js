Template.reportsRecievablesSummary.viewmodel({
  fromDate: '',
  toDate: '',
  filterType: 'claim',
  paymentState: 'no_payment',
  aggrData: [],
  isReady: false,
  isLoading: false,

  onCreated: function(){
    if(Session.get("billsFromDate")){
      this.fromDate(Session.get("billsFromDate"));
    }else{
      this.fromDate("1970-01-01");
    }
    //--
    if(Session.get("billsToDate")){
      this.toDate(Session.get("billsToDate"));
    }else{
      this.toDate(moment().endOf('week').format("YYYY-MM-DD"));
    }
    //--
    if(Session.get("recFilterType")){
      this.filterType(Session.get("recFilterType"));
    }
    //--
    if(Session.get("paymentState")){
      this.paymentState(Session.get("paymentState"));
    }
  },
  stillLoading(){
    return this.isLoading() || this.aggrData().length > 0;
  },
  autorun: function(){
    if(this.fromDate()){
      console.log(this.fromDate());
      Session.set("billsFromDate", this.fromDate());
    }
    if(Session.get("billsFromDate")){
      this.fromDate(Session.get("billsFromDate"));
    }
    //--
    if(this.toDate()){
      Session.set("billsToDate", this.toDate());
    }
    if(Session.get("billsToDate")){
      this.toDate(Session.get("billsToDate"));
    }
    //--
    if(this.filterType()!='claim'){
      Session.set("recFilterType", this.filterType());
    }
    if(Session.get("recFilterType")){
      this.filterType(Session.get("recFilterType"));
    }
    //--
    if(this.paymentState()!='no_payment'){
      Session.set("paymentState", this.paymentState());
    }
    if(Session.get("paymentState")){
      this.paymentState(Session.get("paymentState"));
    }

    var that = this;
    this.isLoading(true);
    Meteor.call("recievablesAggregation", this.filterType(), this.fromDate(), this.toDate(), this.paymentState(), this.intervals(), function(err,res){
      that.aggrData(res);
      that.isReady(true);
      that.isLoading(false);
    });
  },
  intervals: function(){
    return {
      "0_10": {"from": 10, "to": -1},
      "11_20": {"from": 20, "to": 10},
      "21_30": {"from": 30, "to": 20},
      "31_60": {"from": 60, "to": 30},
      "60_0": {"to": 60}
    };
  },
  datesParams: function(interval){
    var dates = "";
    if(interval){
      var startDate = moment(this.fromDate() || moment(0));
      var endDate = moment(this.toDate() || moment());
      var f = moment(endDate),t = moment(endDate);
      t.date(t.date() - this.intervals()[interval]["to"]);
      if(this.intervals()[interval].hasOwnProperty("from")){
        f.date(f.date() - this.intervals()[interval]["from"]);
        dates += "&from="+f.format("YYYY-M-D") + "&to=" + t.format("YYYY-M-D");
      }else{
        dates += "&to=" + t.format("YYYY-M-D");
      }
    }else{
      if(this.fromDate()){
        dates += "&from="+this.fromDate();
      }
      if(this.toDate()){
        dates += "&to="+this.toDate();
      }
    }
    return dates;
  },
  tableData: function () {
    if(!this.aggrData())
      return;
    var tableDatum = [];
    var row;
    var totalRow = {first: "Total",total:0, count: 0};
    var categories = Object.keys(this.intervals());
    for(first in this.aggrData().total){
      row = {};
      row.first = first;
      row.urlParams = this.firstType().toLowerCase() + "=" + first;
      row.second = "";
      totalRow.total += this.aggrData().total[first].total - this.aggrData().total[first].paidTotal;
      totalRow.count += this.aggrData().total[first].count;
      row.total = accounting.formatMoney(this.aggrData().total[first].total - this.aggrData().total[first].paidTotal);
      row.count = this.aggrData().total[first].count;
      for (var i = 0; i < categories.length; i++) {
        totalRow[categories[i]+"_total"] = totalRow[categories[i]+"_total"] || 0;
        totalRow[categories[i]+"_count"] = totalRow[categories[i]+"_count"] || 0;
        totalRow["params_"+categories[i]] = "";
        if(this.aggrData().hasOwnProperty(categories[i]) && this.aggrData()[categories[i]].hasOwnProperty(first)){
          totalRow[categories[i]+"_total"] += this.aggrData()[categories[i]][first].total;
          totalRow[categories[i]+"_count"] += this.aggrData()[categories[i]][first].count;
          row[categories[i]+"_total"] = accounting.formatMoney(this.aggrData()[categories[i]][first].total);
          row[categories[i]+"_count"] = this.aggrData()[categories[i]][first].count;
          row["params_"+categories[i]] = row.urlParams + this.datesParams(categories[i]);
        }else{
          row[categories[i]+"_total"] = accounting.formatMoney(0);
          row[categories[i]+"_count"] = 0;
          row["params_"+categories[i]] = "";
        }
      }
      row.urlParams += this.datesParams();
      tableDatum.push(row);
      for(second in this.aggrData().total[first].second){
        row = {};
        row.first = "";
        row.urlParams = this.firstType().toLowerCase() + "=" + first +
                        "&" + this.secondType().toLowerCase() + "=" + second;
        row.second = second;
        row.total = accounting.formatMoney(this.aggrData().total[first].second[second].total - this.aggrData().total[first].second[second].paidTotal);
        row.count = this.aggrData().total[first].second[second].count;
        for (var i = 0; i < categories.length; i++) {
          if(this.aggrData().hasOwnProperty(categories[i]) && this.aggrData()[categories[i]].hasOwnProperty(first) && this.aggrData()[categories[i]][first].second.hasOwnProperty(second)){
            row[categories[i]+"_total"] = accounting.formatMoney(this.aggrData()[categories[i]][first].second[second].total - this.aggrData()[categories[i]][first].second[second].paidTotal);
            row[categories[i]+"_count"] = this.aggrData()[categories[i]][first].second[second].count;
            row["params_"+categories[i]] = row.urlParams + this.datesParams(categories[i]);
          }else{
            row[categories[i]+"_total"] = accounting.formatMoney(0);
            row[categories[i]+"_count"] = 0;
            row["params_"+categories[i]] = "";
          }
        }
        row.urlParams += this.datesParams();
        tableDatum.push(row);
      }
    }
    totalRow.total = accounting.formatMoney(totalRow.total)
    for (var i = 0; i < categories.length; i++) {
      totalRow[categories[i]+"_total"] = accounting.formatMoney(totalRow[categories[i]+"_total"]);
    }
    tableDatum.push(totalRow);
    return tableDatum;
  },
  firstType: function () {
    if(this.filterType() == "claim")
      return "Claim";
    else
      return "Payor";
  },
  secondType: function () {
    if(this.filterType() != "claim")
      return "Claim";
    else
      return "Payor";
  },

  onRendered: function(){
    $("select").material_select();
  },
  downloadCSV: function () {
    var data, filename, link;
    var csv = this.convertArrayOfObjectsToCSV(this.tableData());
    if (csv == null) return;
    filename = 'Receivables-Summary.csv';
    if (!csv.match(/^data:text\/csv/i)){
       csv = 'data:text/csv;charset=utf-8,' + csv;
     }

    data = encodeURI(csv);
    link = document.createElement('a');
    link.setAttribute('href', data);
    link.setAttribute('download', filename);
    link.click();
  },
  convertArrayOfObjectsToCSV: function(data) {
    var result='';
    var categories = Object.keys(this.intervals());
    var row;
    var total=0, firstTotal=0, secondTotal=0, thirdTotal=0, fourthTotal=0, fifthTotal=0;
    if (data == null || !data.length) {
      return null;
    }
    var line='';
    line +='Receivables Summary, From, To, Payment, Group By\n';
    result+=line;
    line='';
    line+=','+ this.fromDate()+ ',' + this.toDate()+','+ this.paymentState() +','+this.filterType()+'\n';
    result+=line;
    result+=' , , , \n';
    result+=' , , Total, 0-10 days, 11-20 days, 21-30 days, 31-60 days, 61+ days\n';
    for (var i = 0; i < data.length-1; i++) {
      line='';
      line+=data[i].first+','+ data[i].second+','+'$'+accounting.unformat(data[i].total)+',';
      row = data[i];
      for (var j = 0; j < categories.length; j++) {
        if(j<categories.length-1)
          line+='$'+accounting.unformat(row[categories[j]+"_total"])+',';
        else
          line+='$'+accounting.unformat(row[categories[j]+"_total"])+'\n';
      }
      result+=line;
      if(data[i].second==''){
        total+=accounting.unformat(data[i].total);
        firstTotal+=accounting.unformat(row[categories[0]+"_total"]);
        secondTotal+=accounting.unformat(row[categories[1]+"_total"]);
        thirdTotal+=accounting.unformat(row[categories[2]+"_total"]);
        fourthTotal+=accounting.unformat(row[categories[3]+"_total"]);
        fifthTotal+=accounting.unformat(row[categories[4]+"_total"]);
      }
    }
    line = '';
    line+='Total, , '+'$'+ total+',' +'$'+ firstTotal+',' +'$'+ secondTotal+',' +'$'+ thirdTotal+',' +'$'+ fourthTotal+',' +'$'+ fifthTotal+'\n';
    result+=line;

    return result;
  }
});
