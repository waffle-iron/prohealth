import './spreadsheet.html';

// client side collections for patients spreadsheet aggregates subscribtion
const PatientsSpreadsheet = new Mongo.Collection('patients-spreadsheet-m');
const PatientsSpreadsheetNotm = new Mongo.Collection('patients-spreadsheet-notm');
// selector fields
const fields_dict = {"$marketer": "Marketer", "$agency": "Agency", "$primaryInsurance": "Primary Insurance"};
// Today's date

Template.patientsSpreadsheetGrouped.viewmodel({
  headerVariable: function(){
    return {title:Router.current().params.query.type+" Insurance Sales",subtitle:"Grouped by marketer, insurance & agency",hasBack:false}
  },
  filtersArr: [{name:"Date",id:"date"}],
  field1: "$primaryInsurance",
  field2: "$marketer",
  date: moment().format("MM/DD/YYYY"),
  paid: "all",
  sub1Ready: false,
  sub2Ready: false,

  autorun(){
    this.sub1Ready(false);
    this.sub2Ready(false);
    let insurances = null;
    if(this.paid()=="paid")
      insurances = ["Medicare Home Health", "Hospice Medicare"];

    let that = this;
    Meteor.subscribe(
      'patients-spreadsheet-notm',
      Router.current().params.query["type"] || "Hospice",
      this.date(),
      this.field2(),
      {
        onReady(){
          that.sub1Ready(true);
        },
        onError(){
          that.sub1Ready(false);
        }
      }
    );
    Meteor.subscribe(
      'patients-spreadsheet-m',
      Router.current().params.query["type"] || "Hospice",
      this.date(),
      this.field2(),
      {
        onReady(){
          that.sub2Ready(true);
        },
        onError(){
          that.sub2Ready(false);
        }
      }
    );
    // console.log(PatientsSpreadsheet.find().fetch());
  },
  onRendered(){
    var date = new Pikaday({ field: $('#date')[0], format: "MM/DD/YYYY" });
  },
  field1s(){
    return this.field1().substr(1);
  },
  field2s(){
    return this.field2().substr(1);
  },
  patientsSpreadsheetMedicare() {

    return PatientsSpreadsheet.find().fetch();
  },
  patientsSpreadsheet() {
    // console.log(PatientsSpreadsheetNotm.find().fetch());
    return PatientsSpreadsheetNotm.find().fetch();
  },
  getStatus(){
    if(this.sub1Ready() && this.sub2Ready()){
      return true;
    }
    else {
      return false;
    }
  },
  TotalCountMedicare(unit) {
    return PatientsSpreadsheet.find().fetch().reduce((prev, curr) => prev + curr[unit], 0);
  },
  TotalCount(unit) {
    return PatientsSpreadsheetNotm.find().fetch().reduce((prev, curr) => prev + curr[unit], 0);
  },
  findTotal(colName){
    return this.TotalCountMedicare(colName) + this.TotalCount(colName);
  },
  type(){
    return Router.current().params.query["type"] || "Hospice";
  },

  today() { return this.date(); },
  weekStart(){ return moment(this.date(), "MM/DD/YYYY").startOf('week').format("MM/DD/YYYY"); },
  weekEnd(){ return moment(this.date(), "MM/DD/YYYY").endOf('week').format("MM/DD/YYYY"); },
  monthStart(){ return moment(this.date(), "MM/DD/YYYY").startOf('month').format("MM/DD/YYYY"); },
  monthEnd(){ return moment(this.date(), "MM/DD/YYYY").endOf('month').format("MM/DD/YYYY"); },

  selector1(){
    let that = this;
    let select = Object.keys(fields_dict);
     select.splice(select.indexOf(that.field2()),1);
    return select.map(e => {
      if (e == that.field2()) { return false; }
      let option = {value: e, innerHTML: fields_dict[e]};

      if (e == that.field1()) { option.selected = 'selected'; }
      return option;
    });
  },
  selector2(){
    let that = this;
    let select = Object.keys(fields_dict);
    select.splice(select.indexOf(that.field1()),1);
    return select.map(e => {
      let option = {value: e, innerHTML: fields_dict[e]};
      if (e == that.field2()) { option.selected = 'selected'; }
      return option;
    });
  },
  // Download csv
  tableData: function () {
      if(!this.patientsSpreadsheet() && !this.patientsSpreadsheetMedicare())
        return;

      var rows = "";

      rows+= this.type()+" Insurance Sales Report\n"
      rows+= "Selected Date:,"+this.date()+"\n"
      rows+="\n"

      var getColData = function(rowVar){
        rows += rowVar.dayLeads+",";
        rows += rowVar.dayReferrals+",";
        rows += rowVar.weekLeads+",";
        rows += rowVar.weekReferrals+",";
        rows += rowVar.monthLeads+",";
        rows += rowVar.monthReferrals+",";
        rows += rowVar.monthNonAdmit+",";
        rows += rowVar.monthAdmitted+"\n";
      };
      var tableHead1 = "First Group,Second Group,Date,,Date Week,,Date Month,,,\n";
      var tableHead2 = this.field1s()+','+this.field2s()+',Leads,Referrals,Leads,Referrals,Leads,Referrals,Non-Admit,Admit\n';
      //
      rows += tableHead1;
      rows += tableHead2;
      // // OTHER ROWS
      rows += "Medicare\n";
      _.each(this.patientsSpreadsheetMedicare(),function(totalAggregate){
        // getColData(totalAggregate);
      //
        // _.each(totalAggregate.field2Aggregates,function(secAggregate){
          if(totalAggregate._id.includes(",")){
            rows += " ,"+totalAggregate._id.replace(",","")+",";
          }
          else
            rows += " ,"+totalAggregate._id+",";
          getColData(totalAggregate);
        // });
      });
      //LAST ROW
      var lastRow =  this.patientsSpreadsheet();
      rows += "Total, ,";
      rows += this.TotalCountMedicare("dayLeads")+",";
      rows += this.TotalCountMedicare("dayReferrals")+",";
      rows += this.TotalCountMedicare("weekLeads")+",";
      rows += this.TotalCountMedicare("weekReferrals")+",";
      rows += this.TotalCountMedicare("monthLeads")+",";
      rows += this.TotalCountMedicare("monthReferrals")+",";
      rows += this.TotalCountMedicare("monthNonAdmit")+",";
      rows += this.TotalCountMedicare("monthAdmitted")+"\n";

      rows += "Private\n";
      _.each(this.patientsSpreadsheet(),function(totalAggregate){
        // getColData(totalAggregate);
      //
        // _.each(totalAggregate.field2Aggregates,function(secAggregate){
          if(totalAggregate._id.includes(",")){
            rows += " ,"+totalAggregate._id.replace(",","")+",";
          }
          else
            rows += " ,"+totalAggregate._id+",";
          getColData(totalAggregate);
        // });
      });
      //LAST ROW
      lastRow =  this.patientsSpreadsheet();
      rows += "Total, ,";
      rows += this.TotalCount("dayLeads")+",";
      rows += this.TotalCount("dayReferrals")+",";
      rows += this.TotalCount("weekLeads")+",";
      rows += this.TotalCount("weekReferrals")+",";
      rows += this.TotalCount("monthLeads")+",";
      rows += this.TotalCount("monthReferrals")+",";
      rows += this.TotalCount("monthNonAdmit")+",";
      rows += this.TotalCount("monthAdmitted")+"\n";
      //LAST ROW
      rows += "Total(All), ,";
      rows += this.findTotal("dayLeads")+",";
      rows += this.findTotal("dayReferrals")+",";
      rows += this.findTotal("weekLeads")+",";
      rows += this.findTotal("weekReferrals")+",";
      rows += this.findTotal("monthLeads")+",";
      rows += this.findTotal("monthReferrals")+",";
      rows += this.findTotal("monthNonAdmit")+",";
      rows += this.findTotal("monthAdmitted")+"\n";
      return rows;
  },
  downloadCSV: function () {
    // var data, filename, link;
    var csv = this.tableData();
    if (csv == null) return;
    filename = this.type()+'-Insurance-Sales-report.csv';
    if (!csv.match(/^data:text\/csv/i)){
       csv = 'data:text/csv;charset=utf-8,' + csv;
     }

    data = encodeURI(csv);
    link = document.createElement('a');
    link.setAttribute('href', data);
    link.setAttribute('download', filename);
    link.click();
  },
  events:{
    'click #update-date button'(event, instance) {
      Meteor.call('patients.update', moment(this.date(),"MM/DD/YYYY").startOf("month").format("MM/DD/YYYY"), moment(this.date(), "MM/DD/YYYY").endOf("month").format("MM/DD/YYYY"), 10000);
    },
    'change #date'(event, instance) {
      this.date(event.target.value);
    },
    'change #paid'(event, instance) {
      this.paid(event.target.value);
    },
    'click #sendmail'(event){
       $('#modal1').openModal();
    },
  }
})
