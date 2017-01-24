import './timesheet.html';

// client side collection for visits aggregates subscribtion
const VisitsAggregates = new Mongo.Collection('visits-aggregates');

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

AutoForm.hooks({
  createVisitForm: {
    onSuccess(type, result){
      $('#modal-new-visit').closeModal();
    },
    onError(type, error){
      // alert("Error");

    }
  }
});
subscriptionReady = false;
// set subscribtion
Template.timesheet.setSubscribtion = () => {
    let instance = Template.instance();
    // let usern = Meteor.user().profile.name;
    let query = {};
    var billingState = Router.current().params.query.billingState;
    if (billingState){
      query["billingState"] = billingState;
    }
    let field = instance.filters.get('field');

    //==========================================
    // SAVE FILTER IN SESSION
    if (field) {
        Session.set("aggrField", field);
    }
    if (Session.get("aggrField")) {
        field = Session.get("aggrField");
    }
    //END SAVE FILTER
    //========================================
    Meteor.subscribe("allRates");
    Meteor.subscribe("userProfiles")
    let statuses = ["Completed", "Sent To Office", "Corrected"];
    subscriptionReady = Meteor.subscribe('visits-aggregates', query, field, true, statuses, {
        onReady: function() {
            Meteor.setTimeout(function() {
                // console.log("here");
            }, 1000);
        },
        onError: function() {
            console.log("onError");
        }

    });
    if(Meteor.user()){
      Meteor.subscribe("agentByName", Meteor.user().profile.name.replace(/\((.*?)\)/,"").trim());
    }
};

Template.timesheet.onCreated(function summariesOnCreated() {
    $("form label").addClass("active");

    this.filters = new ReactiveDict();
    //======================================
    // FETCH FILTER IF EXISTS IN SESSION
    if (Session.get("aggrField")) {
        if (Session.get("aggrField") != "$user" && Session.get("aggrField") != "$agency" && Session.get("aggrField") != "$insurance" &&
            Session.get("aggrField") != "$marketer" && Session.get("aggrField") != "$primaryInsurance") {
            this.filters.set('field', Session.get("aggrField"));
            Meteor.setTimeout(function() {
                $("#change-field").val(Session.get("aggrField"));
            }, 100);
        } else {
            this.filters.set('field', "$formDate");
        }
    } else {
        this.filters.set('field', "$formDate");
    }
    this.autorun(Template.timesheet.setSubscribtion);
});

Template.timesheet.viewmodel({
  headerVariable: function(){
    return {title:"Timesheet",subtitle:"List of all "+Router.current().params.query.billingState+" items",hasBack:false}
  },
  loadingStatus: false,
  requestingStatus:false,
  idToPath(id){
    return id.replace("/","");
  },
  getFormDate(aggr){
    if(aggr.visits)
    return aggr.visits[0].formDate;
  },
    today(){
      return  this.date(new Date());
    },
    onRendered(){
      // $('.modal-trigger').leanModal();
      var formDate = new Pikaday({ field: $('#formDate')[0], format: "MM/DD/YYYY" });
    },

    userName(){
        var user = Meteor.users.findOne(Meteor.userId);
        if(user)
          return user.profile.name;
    },
    formOptions(){
        return [{"Office Hours": "Office Hours"}, {"On Call": "On Call"}];
    },
    billingStateIs(state) {
        return Router.current().params.query.billingState == state;
    },
    billingState(){
      return Router.current().params.query.billingState;
    },
    query(group) {
        var query = {};

        var billingState = Router.current().params.query.billingState;
        if(billingState)
          query["billingState"] = billingState;
        if(this.field()=="formDate"){
          console.log("Date: ", this.field());
          query[this.field()] = { $gte: moment(group._id, "MM/DD/YYYY").startOf("day").toDate(), $lte: moment(group._id, "MM/DD/YYYY").endOf("day").toDate()};
          console.log("Date: ", query);
        } else{
          query[this.field()] = group._id;
        }
        return query;
    },
    firstSummary(id){
      if(Router.current().params._id)
        return id === Router.current().params._id;
      else
        return id === VisitsAggregates.find().fetch().sort((a, b) => b._id.localeCompare(a._id))[0]._id
    },
    summaries() {
      return VisitsAggregates.find().fetch().sort((a, b) => b._id.localeCompare(a._id));
    },
    totalVisits(){
      var total = 0;
      _.each(VisitsAggregates.find().fetch(),function(group){
        total+=group.total;
      });
      return total;
    },
    totalGroupCost(){
        var cost = 0;
        _.each(VisitsAggregates.find().fetch(),function(group){
          cost+=group.cost;
          // console.log(group.cost);
        });
        return cost;
    },

    allSummaries(){
      return VisitsAggregates.find().fetch().sort((a, b) => b._id.localeCompare(a._id))
    },
    field() {
        let field = Template.instance().filters.get('field');
        return field.substr(1);
    },
    date(date) {
        return moment(date).format("MM/DD/YYYY");
    },
    totalCost(cost){
      return accounting.formatMoney(cost);
    },
    events: {
      'click #create-visit'(){
        $("#createVisitForm").submit();
      },
      'change #update-date input' (event, instance) {
          let name = event.target.id;
          let date_str = event.target.value;
          let date = moment(date_str + " Z", "MM/DD/YYYY Z").utc()._d;
          instance.filters.set(name, date);
      },
      'change #change-field' (event, instance) {
        instance.filters.set('field', event.target.value);
        var query = 'billingState='+this.billingState()
        Router.go('/timesheet/?'+query);
      },
      "click .btn-request-all"(event) {
          var field = this.field();
          // console.log(event.currentTarget);
          var value = $(event.currentTarget).data("id");
          Meteor.call("visits.request", field, value, "requested");
      },
      "click .btn-request-timesheet"(event) {
        this.requestingStatus(true)
        _this = this;
          Meteor.call("timesheet.request", "requested", function(error, result){
            if(result){
              $(".update-cost").prop('disabled', false)
              _this.requestingStatus(false);
              Materialize.toast('Requested successfully!', 2000);
            }
          });
      },
      "blur #formDate"(event){
        // console.log(event.target.value);
        validateDate("formDate",event.target.value)
      },
      "click .showTimesheet"(event){
        event.preventDefault();
        var query = 'billingState='+this.billingState()
        var id = "";
        id = (event.target.id).replace("/","%2F").replace("/","%2F");
        Router.go('/timesheet/'+id+'?'+query);
      },
      "click .update-cost"(event){
        $(".update-cost").prop('disabled', true)
        this.loadingStatus(true)
        _this = this;
        var visits = Visits.find().fetch();
        var name = Meteor.user().profile.name;
        // console.log(agent);
        Meteor.call("updateVisitsCost", name, function(error, result){
          if(result){
            $(".update-cost").prop('disabled', false)
            _this.loadingStatus(false)
            Materialize.toast('Updated successfully!', 2000)
          }
        });
      },
      "click .open-modal"(){
        $('#modal-new-visit').openModal();
        if(!$(".timeIn label").hasClass("active"))
          $(".timeIn label").toggleClass("active")
        if(!$(".timeOut label").hasClass("active"))
          $(".timeOut label").toggleClass("active")
      },
      "click .timeInOut"(e){
        if(!$("."+e.target.name+" label").hasClass("active"))
          $("."+e.target.name+" label").toggleClass("active")
        // console.log(e.target.name);
      }
   }
});
