let date_regex = /((0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01])\d\d)|((0[1-9]|1[012])[- \/.](0[1-9]|[12][0-9]|3[01])[- \/.]\d\d)|((0[1-9]|1[012])[- \/.](0[1-9]|[12][0-9]|3[01])[- \/.](19|20)\d\d)|((0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01])(19|20)\d\d)/;
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

VisitsAggregates= new Mongo.Collection('agent-visit-aggregates');
Template.agentVisitsSheet.viewmodel({
  headerVariable:{title:"Visits\/agent sheet",subtitle:"Table of all visits per agent.",hasBack:false},
  startDate: '',
  endDate: '',
  formType:'',
  formState:'logged',
  query: function(){
    var query = {};

    if(this.startDate() && this.endDate())
      query["formDate"] = {
        $gte: moment(this.startDate(), "MM/DD/YYYY" ).startOf("day").toDate(),
        $lte: moment(this.endDate(),"MM/DD/YYYY" ).endOf("day").toDate()
    };
    if(this.formType()){
      if(this.formType() == "all"){
        if(query.hasOwnProperty("form")){
          delete query.form;
        }
      }
      else{
        query["form"] = this.formType();
      }
    }
    if(this.formState()){
      if(this.formState() == "all"){
        if(query.hasOwnProperty("billingState")){
          delete query.billingState;
        }
      } else if(this.formState() == "other"){
        query["billingState"] = {$nin: ["logged","rejected","approved"]};
      } else {
        query["billingState"] = this.formState();
      }
    }
    // console.log(query);

    return query;
  },
  complexOrMileage: function(form){
    if(form=="Complex"||form=="Mileage"||form=="Out of area")
      return true;
    return false;
  },
  compensationTypes: function(){
    return CompensationTypes.find().fetch()
  },
  allSupervisedAgents: function() {
    var agents = [];
    _.each(Session.get("supAgents"), function(agent){
      // console.log(agent.name);
      aggr = VisitsAggregates.findOne({_id:agent.name})
      if(aggr){
        agents.push(aggr);
      }
      else{
        var agent = {
          _id:agent.name,
          cost:0,
          nonRegular:0,
          nonRegularCost:0,
          regular:0,
          regularCost:0,
          total:0,
        }
        agents.push(agent);
      }
    });
    // console.log(agents);
    return agents;
  },
  onCreated: function(){
    // Template.instance().subscribe('agents', {});
    // console.log(Meteor.user().profile.name.replace(/\((.*?)\)/,"").trim());
    // if(Meteor.user()){
    //   var admin = Meteor.user().profile.name.replace(/\((.*?)\)/,"").trim();
    //   Meteor.call("getSupervisedAgentNames",admin, function(error,result){
    //      Session.set("supAgents",result);
    //   });
    // }
  },
  autorun: function(){
    Meteor.subscribe('compensation_types');
    Meteor.subscribe('agent-visit-aggregates', this.query());

    // if(Meteor.user()){
    //   var admin = Meteor.user().profile.name.replace(/\((.*?)\)/,"").trim();
    //   Meteor.call("getSupervisedAgentNames",admin, function(error,result){
    //      Session.set("supAgents",result);
    //   });
    //
    //   var agentsWithVisits = [];
    //   var agentsWithNoVisits = [];
    //   _.each(Session.get("supAgents"),function(agent){
    //     if(agent.hasVisits)
    //       agentsWithVisits.push(agent.name);
    //     else
    //       agentsWithNoVisits.push(agent.name)
    //   });
    //   this.agentsWithNoVisits(agentsWithNoVisits);
    //
    //
    //   // console.log(VisitsAggregates.find().fetch());
    // }
  },
  onRendered(){
    $('select').material_select();

    var startDate = new Pikaday({ field: $('#start-date')[0], format: "MM/DD/YYYY" });
    var endDate = new Pikaday({ field: $('#end-date')[0], format: "MM/DD/YYYY" });

    if(moment(this.startDate(),"MM/DD/YYYY").isAfter(moment(this.endDate(),"MM/DD/YYYY"))){
      console.log("error");
      $("#end-date").addClass("invalid");
      $("#start-date").addClass("invalid");
      $(".date-error").show()
    } else{
      $("#end-date").removeClass("invalid");
      $("#start-date").removeClass("invalid");
      $(".date-error").hide()
    }
  },
  agentsWithNoVisits:[],
  agents: function(){
    console.log(VisitsAggregates.find().fetch());
    return VisitsAggregates.find().fetch();
  },
  totalAgents: function(){
    if(Session.get("supAgents"))
      return Session.get("supAgents").length;
    else {
      return 0
    }
  },
  getSums: function(){
    var visits = VisitsAggregates.find().fetch();
    var tVisits = 0;
    var trVisits = 0;
    var tiVisits = 0;
    var tCost = 0;
    var trCost = 0;
    var tiCost = 0;
    visits.forEach(function(visit){
      tVisits+= visit.total;
      trVisits+= visit.regular;
      tiVisits+= visit.nonRegular;
      tCost+= visit.cost;
      trCost+= visit.regularCost;
      tiCost+= visit.nonRegularCost;
    })

    return {
      totalVisits: tVisits,
      totalRegular: trVisits,
      totalReimbursed:tiVisits,
      totalCost: tCost,
      totalRegularCost: trCost,
      totalReimbursedCost: tiCost
    }
  },
  formatCurrency: function(amount) {
    return accounting.formatMoney(amount);
  },
  getLink(agent,visitType){
    var link = "/visits?user="+agent+"&visitType="+visitType;
    if(this.startDate() && this.endDate()){
      link+="&start-date="+this.startDate()+"&end-date="+this.endDate();
    }
    if(this.formState()){
      link+="&billingState="+this.formState();
    }
    if(this.formType()){
      link+="&form="+this.formType();
    }
    return link;
  },
  getSumLink(visitType){
    var link = "/visits?user=supervisedAgents&visitType="+visitType;
    if(this.startDate() && this.endDate()){
      link+="&start-date="+this.startDate()+"&end-date="+this.endDate();
    }
    if(this.formState()){
      link+="&billingState="+this.formState();
    }
    if(this.formType()){
      link+="&form="+this.formType();
    }
    return link;
  },
  events:{
    "blur #start-date"(event){
      validateDate("start-date", this.startDate());
      if(moment(this.startDate(),"MM/DD/YYYY").isAfter(moment(this.endDate(),"MM/DD/YYYY"))){
        console.log("error");
        $("#start-date").addClass("invalid");
        $("#end-date").addClass("invalid");
        $(".date-error").show()
      } else{
        $("#start-date").removeClass("invalid");
        $("#end-date").removeClass("invalid");
        $(".date-error").hide()
      }
    },
    "blur #end-date"(event){
      validateDate("end-date", this.endDate());
      if(moment(this.startDate(),"MM/DD/YYYY").isAfter(moment(this.endDate(),"MM/DD/YYYY"))){
        console.log("error");
        $("#end-date").addClass("invalid");
        $("#start-date").addClass("invalid");
        $(".date-error").show()
      } else{
        $("#end-date").removeClass("invalid");
        $("#start-date").removeClass("invalid");
        $(".date-error").hide()
      }
    }
  }
});
