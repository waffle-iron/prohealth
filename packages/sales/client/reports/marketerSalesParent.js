MarketerSales = new Mongo.Collection('marketer-sales');
MarketerSalesTotals = new Mongo.Collection('marketer-sales-totals');

var sub = "";

Template.marketerSales.viewmodel({
  headerVariable: function(){
    var title="Marketer Sales Report";
    var subtitle="Patient referrals grouped by marketer";
    var hasBack = false;
    if(Router.current().params.template == "marketerReport" || Router.current().params.template == "marketerStats"){
      hasBack = true;
      if(Router.current().params.marketer){
        title = Router.current().params.marketer;
        subtitle="Sales Report"
      }
    }

    return {title:title,subtitle:subtitle,hasBack:hasBack};
  },
  invalidDates: function(){
    return !moment(this.fromDate(),"MM/DD/YYYY").isValid() || !moment(this.toDate(),"MM/DD/YYYY").isValid()
  },
  salesView: "marketerSalesSheet",
  selectedMarketer:"",
  groupBy: "day",
  business: "all",
  insurance: "all",
  admitState: "all",
  viewAs: "table",
  changeTemplate: function(){
    this.salesView(Router.current().params.template)
  },
  isOneMarketer: function(){
    return Router.current().params.template == "marketerStats"
  },
  fromDate: moment(new Date()).startOf("month").format("MM/DD/YYYY"),
  toDate: moment(new Date()).endOf("month").format("MM/DD/YYYY"),
  autorun(){
    this.changeTemplate();
    this.allDates();
    sub = Meteor.subscribe(
      'marketer-sales',
      moment(this.fromDate(),"MM/DD/YYYY").startOf(this.groupBy()).utc()._d,
      moment(this.toDate(),"MM/DD/YYYY").endOf(this.groupBy()).utc()._d,
      this.groupBy(),
      this.insurance(),
      this.business(),
      this.admitState()
    )

    Meteor.subscribe(
      'marketer-sales-totals',
      moment(this.fromDate(),"MM/DD/YYYY").startOf(this.groupBy()).utc()._d,
      moment(this.toDate(),"MM/DD/YYYY").endOf(this.groupBy()).utc()._d,
      this.groupBy(),
      this.insurance(),
      this.business(),
      this.admitState()
    )
  },
  getUltimateTotal(){
    var sales = MarketerSalesTotals.find().fetch();
    var total = {medicare:0, nonMedicare:0};
    _.each(sales, function(sale){
      total.medicare += sale.medicare
      total.nonMedicare += sale.nonMedicare
    })
    return total;
  },
  onRendered(){
    var fromDate = new Pikaday({ field: $('#fromDate')[0], format: "MM/DD/YYYY" });
    var toDate = new Pikaday({ field: $('#toDate')[0], format: "MM/DD/YYYY" });
    $('select').material_select();
  },
  getMarketer(){
    if(Router.current().params.marketer)
      return Router.current().params.marketer;
    else{
      return "Marketer"
    }
  },
  type(){
    if(Router.current().params.template == "marketerSalesSheet"){
      return "Sales Report";
    }
  },
  isMarketerView(){
    return Router.current().params.template == "marketerReport" || Router.current().params.template == "marketerStats";
  },
  allDates: function(){
    var getDates = [];
    var dtObj = {};
    var currentYear = 0;
    var currDate = moment(this.fromDate(),"MM/DD/YYYY").startOf(this.groupBy());
    var lastDate = moment(this.toDate(),"MM/DD/YYYY").endOf(this.groupBy());
    if(this.groupBy() === "day"){
      getDates.push({
        dt: moment(currDate).format("MM/DD"),
        fullDt: moment(currDate).format("MM/DD/YYYY"),
        yr: moment(currDate).year(),
        total:0,
        medicare: 0,
        nonMedicare: 0
      });
      currentYear = moment(currDate).year();

      while(currDate.add(1,"day").isBefore(lastDate)){
        // console.log(currDate);
        // console.log(lastDate);
        dtObj = {
          dt: moment(currDate).format("MM/DD"),
          fullDt: moment(currDate).format("MM/DD/YYYY"),
          yr: moment(currDate).year(),
          total: 0,
          medicare: 0,
          nonMedicare: 0
        };
        getDates.push(dtObj);
      }
    } else if(this.groupBy() === "week"){
      var currDate = moment(this.fromDate(),"MM/DD/YYYY").startOf("week");
      var lastDate = moment(this.toDate(),"MM/DD/YYYY").endOf("week");

      // CHECK IF FIRST DAY IS SUNDAY THEN WEEK 0 EXISTS
      if(moment(moment(currDate).dayOfYear(1)).weekday()!=0){
        getDates.push({
          dt: moment(currDate).week()-1,
          month: moment(currDate).month()+1,
          yr: moment(currDate).year(),
          total:0,
          medicare: 0,
          nonMedicare: 0,
          start: moment(currDate).format("MM/DD"),
          end: moment(currDate).add(6,"days").format("MM/DD"),
        });
        currentYear = moment(currDate).year();
        while(currDate.add(1,"week").isBefore(lastDate)){
          if(moment(moment(currDate).dayOfYear(1)).weekday()!=0){
            dtObj = {
              dt: moment(currDate).week()-1,
              month: moment(currDate).month()+1,
              yr: moment(currDate).year(),
              total: 0,
              medicare: 0,
              nonMedicare: 0,
              start: moment(currDate).format("MM/DD"),
              end: moment(currDate).add(6,"days").format("MM/DD"),
            };
          } else {
            dtObj = {
              dt: moment(currDate).week(),
              month: moment(currDate).month()+1,
              yr: moment(currDate).year(),
              total: 0,
              medicare: 0,
              nonMedicare: 0,
              start: moment(currDate).format("MM/DD"),
              end: moment(currDate).add(6,"days").format("MM/DD"),
            };
          }
          getDates.push(dtObj);
        }
      } else {
        getDates.push({
          dt: moment(currDate).week(),
          month: moment(currDate).month()+1,
          yr: moment(currDate).year(),
          total:0,
          medicare: 0,
          nonMedicare: 0,
          start: moment(currDate).format("MM/DD"),
          end: moment(currDate).add(6,"days").format("MM/DD"),
        });
        currentYear = moment(currDate).year();
        while(currDate.add(1,"week").isBefore(lastDate)){
          dtObj = {
            dt: moment(currDate).week(),
            month: moment(currDate).month()+1,
            yr: moment(currDate).year(),
            total: 0,
            medicare: 0,
            nonMedicare: 0,
            start: moment(currDate).format("MM/DD"),
            end: moment(currDate).add(6,"days").format("MM/DD"),
          };
          getDates.push(dtObj);
        }
      }

    } else if(this.groupBy() === "month"){
      getDates.push({
        dt: moment(currDate).month()+1,
        yr: moment(currDate).year(),
        total:0,
        medicare: 0,
        nonMedicare: 0
      });
      currentYear = moment(currDate).year();
      while(currDate.add(1,"month").isBefore(lastDate)){
        dtObj = {
          dt: moment(currDate).month()+1,
          yr: moment(currDate).year(),
          total: 0,
          medicare: 0,
          nonMedicare: 0
        };
        getDates.push(dtObj);
      }
    } else if(this.groupBy() === "year"){
      getDates.push({
        dt: moment(currDate).year(),
        total:0,
        medicare: 0,
        nonMedicare: 0
      });
      while(currDate.add(1,"year").isBefore(lastDate)){
        dtObj = {
          dt: moment(currDate).year(),
          total: 0,
          medicare: 0,
          nonMedicare: 0
        };
        getDates.push(dtObj);
      }
    }

    Session.set("allDates",getDates);
  },
  getYears(){
    var getDates = [];
    var currDate = moment(this.fromDate(),"MM/DD/YYYY").startOf("year");
    var lastDate = moment(this.toDate(),"MM/DD/YYYY").endOf("year");
    getDates.push(moment(currDate).year());
    while(currDate.add(1,"year").isBefore(lastDate)){
      getDates.push(moment(currDate).year());
    }
    return getDates;
  },
  marketerSales: function(){
    return MarketerSales.find({}, {
        sort: {
            totalAdmitted: -1
        }
    }).fetch();
  },

  marketerSalesTotals: function(){
    return MarketerSalesTotals.find().fetch();
  },

  oneMarketerSales(marketer){
    return MarketerSales.find({_id: marketer}).fetch();
  },

  events:{
    "click .groupBy"(e){
      $(".groupBy.blue-text").toggleClass("blue-text").toggleClass("black-text");
      $("#"+e.target.id).toggleClass("blue-text").toggleClass("black-text");
      this.groupBy(e.target.getAttribute("data-groupby"));
    },
    "click .viewAs"(e){
      $(".viewAs.blue-text").toggleClass("blue-text").toggleClass("black-text");
      $("#"+e.target.id).toggleClass("blue-text").toggleClass("black-text");
      this.viewAs(e.target.getAttribute("data-viewAs"));
    },
    "blur #toDate"(event){
      // validateDate("to-date", this.toDate());
      if(moment(this.fromDate(),"MM/DD/YYYY").isAfter(moment(this.toDate(),"MM/DD/YYYY"))){
        console.log("error");
        $("#toDate").addClass("invalid");
        $("#fromDate").addClass("invalid");
        $(".date-error").show()
      } else if(!moment(this.toDate(),"MM/DD/YYYY").isValid()){
        $("#toDate").addClass("invalid");
      } else{
        $("#toDate").removeClass("invalid");
        $("#fromDate").removeClass("invalid");
        $(".date-error").hide()
      }
    },
    "blur #fromDate"(event){
      // validateDate("to-date", this.toDate());
      if(moment(this.fromDate(),"MM/DD/YYYY").isAfter(moment(this.toDate(),"MM/DD/YYYY"))){
        console.log("error");
        $("#toDate").addClass("invalid");
        $("#fromDate").addClass("invalid");
        $(".date-error").show()
      } else if(!moment(this.fromDate(),"MM/DD/YYYY").isValid()){
        $("#fromDate").addClass("invalid");
      } else{
        $("#toDate").removeClass("invalid");
        $("#fromDate").removeClass("invalid");
        $(".date-error").hide()
      }

    }
  }
});
