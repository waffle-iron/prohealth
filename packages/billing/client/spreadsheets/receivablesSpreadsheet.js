var date_regex = /((0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01])\d\d)|((0[1-9]|1[012])[- \/.](0[1-9]|[12][0-9]|3[01])[- \/.]\d\d)|((0[1-9]|1[012])[- \/.](0[1-9]|[12][0-9]|3[01])[- \/.](19|20)\d\d)|((0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01])(19|20)\d\d)/;
var validateDate = function(id, value){
  if(!date_regex.test(value) && value){
    if(!$("#"+id).hasClass("invalid"))
      $("#"+id).toggleClass("invalid");
  }
  else{
    if($("#"+id).hasClass("invalid"))
      $("#"+id).toggleClass("invalid");
  }
};
//var RecievablesSpreadsheet = new Mongo.Collection('recievables-spreadsheet');

Template.recievablesSpreadsheet.viewmodel({
  headerVariable:{title:"Recievables Summary",subtitle:"Filtered by date",hasBack:false},
  // Dates initialization
  fromDate: moment("1970-01-01").format("MM/DD/YYYY"),
  toDate: moment().utc().startOf('day').format("MM/DD/YYYY"),
  RecievablesSpreadsheet: new Mongo.Collection('recievables-spreadsheet'),
  intervals: [
    { sym: '_00', start: 10, end: 00 },
    { sym: '_11', start: 20, end: 11 },
    { sym: '_21', start: 30, end: 21 },
    { sym: '_31', start: 60, end: 31 },
    { sym: '_61', start: null, end: 61 },
  ],
  // Filters initialization
  payment: '$eq',
  filter: '$payor_name|$claim_name',
  // Loading initialization
  stillLoading: true,
  // Template and subscription initialization
  onCreated: function(template) {

  },
  onRendered: function(){
    $("select").material_select();
    Materialize.updateTextFields();
    var fromDate = new Pikaday({ field: $('#from-date')[0], format: "MM/DD/YYYY" });
    var toDate = new Pikaday({ field: $('#to-date')[0], format: "MM/DD/YYYY" });
    if(moment(this.fromDate(),"MM/DD/YYYY").isAfter(moment(this.toDate(),"MM/DD/YYYY"))){
      console.log("error");
      $("#from").addClass("invalid");
      $("#to").addClass("invalid");
      $(".date-error").show()
    } else{
      $("#from").removeClass("invalid");
      $("#to").removeClass("invalid");
      $(".date-error").hide()
    }
  },
  invalidDates: function(){
    return !moment(this.fromDate(),"MM/DD/YYYY").isValid() || !moment(this.toDate(),"MM/DD/YYYY").isValid()
  },
  autorun: function() {
    let vm = this;
    let fromDate = moment(this.fromDate() + " Z", "MM/DD/YYYY Z").utc()._d;
    let toDate = moment(this.toDate() + " Z", "MM/DD/YYYY Z").utc()._d;
    let filter1 = this.filter().split('|')[0];
    let filter2 = this.filter().split('|')[1];

    Meteor.subscribe('recievables-spreadsheet', fromDate, toDate, this.payment(), filter1, filter2, {
      onStop:  function(error) {
        if (!error) {
          vm.stillLoading(true);
        }
      },
      onReady: function() {
        vm.stillLoading(false);
      }
    });
  },
  // Table helpers
  recievablesSpreadsheet: function() {
    return this.RecievablesSpreadsheet().findOne() ||
    { totalc: 0, totala: 0, _00c: 0, _00a: 0, _11c: 0, _11a: 0, _21c: 0, _21a: 0, _31c: 0, _31a: 0, _61c: 0, _61a: 0, totalAggregates: [] };
  },
  filter1: function() {
    return this.filter().split('|')[0].split('_')[0].substr(1);
  },
  filter2: function() {
    return this.filter().split('|')[1].split('_')[0].substr(1);
  },
  formatCurrency: function(amount) {
    return accounting.formatMoney(amount);
  },
  generateDates: function(symbol) {
    let fromDate = moment(this.fromDate() + " Z", "MM/DD/YYYY Z").utc();
    let toDate = moment(this.toDate() + " Z", "MM/DD/YYYY Z").utc();
    let interval = symbol && this.intervals().find(Obj => Obj.sym === symbol);
    // Because date.subtract() modify the original object
    let start = interval && interval.start && moment.max(moment(toDate).subtract(interval.start, 'days'), fromDate).format("MM/DD/YYYY") || null;
    let end = interval && interval.end && moment.max(moment(toDate).subtract(interval.end, 'days'), fromDate).format("MM/DD/YYYY") || null;
    return { start, end };
  },
  generatelink: function(field1, field2, symbol) {
    // Use encodeURIComponent() and encodeURI() to avoid any special characters in URL, ex: '&', ' '
    let dates = this.generateDates(symbol);
    let fromDate = 'from=' + encodeURIComponent(dates.start || this.fromDate());
    let toDate = 'to=' + encodeURIComponent(dates.end || this.toDate());
    let payment = 'payment=' + {$eq: 'none', $gt: 'partial'}[this.payment()];
    let filter1 = field1 && `${this.filter1()}=` + encodeURIComponent(field1) || '';
    let filter2 = field2 && `${this.filter2()}=` + encodeURIComponent(field2) || '';
    let URL = '/bills?' + [fromDate, toDate, payment, filter1, filter2].filter(Obj => !!Obj == true).join('&');
    return encodeURI(URL);
  },
  // Download csv
  tableData: function () {
      if(!this.recievablesSpreadsheet())
        return;

      var rows = "";
      rows+= "Receivables Summary\n"
      rows+= "From:,"+this.fromDate()+"\n"
      rows+= "To:,"+this.toDate()+"\n"
      rows+= "Filter Type:,"+$("#filter-type option:selected").text()+"\n"
      rows+= "Payment State:,"+$("#payment option:selected").text()+"\n"
      rows+="\n"

      var getColData = function(rowVar){
        rows += rowVar.totala+",$";
        rows += rowVar._00a+",$";
        rows += rowVar._11a+",$";
        rows += rowVar._21a+",$";
        rows += rowVar._31a+",$";
        rows += rowVar._61a+"\n";
      };
      var tableHead = this.filter1()+','+this.filter2()+',Total,0-10 days,11-20 days,21-30 days,31-60 days,61+ days\n';

      rows += tableHead;
      // OTHER ROWS
      _.each(this.recievablesSpreadsheet().totalAggregates,function(totalAggregate){
        rows += totalAggregate._id+", ,$";
        getColData(totalAggregate);

        _.each(totalAggregate.field2Aggregates,function(secAggregate){
          rows += " ,"+secAggregate._id+",$";
          getColData(secAggregate);
        });
      });
      //LAST ROW
      var lastRow =  this.recievablesSpreadsheet();
      rows += "Total, ,$";
      getColData(lastRow);
      return rows;
  },
  downloadCSV: function () {
    var data, filename, link;
    var csv = this.tableData();
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
  events: {
    'click #sendmail'(event){
       $('#modal1').openModal();
    },
    "blur #from-date"(event){
      validateDate("from-date", this.fromDate());
      if(moment(this.fromDate(),"MM/DD/YYYY").isAfter(moment(this.toDate(),"MM/DD/YYYY"))){
        console.log("error");
        $("#from-date").addClass("invalid");
        $("#to-date").addClass("invalid");
        $(".date-error").show()
      } else{
        $("#from-date").removeClass("invalid");
        $("#to-date").removeClass("invalid");
        $(".date-error").hide()
      }
    },
    "blur #to-date"(event){
      validateDate("to-date", this.toDate());
      if(moment(this.fromDate(),"MM/DD/YYYY").isAfter(moment(this.toDate(),"MM/DD/YYYY"))){
        console.log("error");
        $("#to-date").addClass("invalid");
        $("#from-date").addClass("invalid");
        $(".date-error").show()
      } else{
        $("#to-date").removeClass("invalid");
        $("#from-date").removeClass("invalid");
        $(".date-error").hide()
      }
    }
  }
});
