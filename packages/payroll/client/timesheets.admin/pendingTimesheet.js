import './pendingTimesheet.html';


// set subsribtion
Template.pendingTimesheet.setSubscribtion = () => {
  if(Meteor.user()){
    var admin = Meteor.user().profile.name.replace(/\((.*?)\)/,"").trim();
    Meteor.call("getSupervisedAgentNames",admin, function(error,result){
       Session.set("supAgents",result);
    });

    let instance = Template.instance();
    // let usern = Meteor.user().profile.name;

    let query = {};
    var billingState = Router.current().params.query.billingState;
    if(billingState)
      query["billingState"] = billingState;

    //supervised agents
    var agents = Session.get("supAgents")
    if(agents){
      agents = _.map(agents,function(agent){
        return agent.name;
      });
      if(agents.length>0)
        query["user"] = {$in: agents}
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
    instance.subscribe("pendingVisits", {
        onReady: function() {
            Meteor.setTimeout(function() {
                $('.collapsible').collapsible({
                    accordion: false // A setting that changes the collapsible behavior to expandable instead of the default accordion style
                });
            }, 1000);


        },
        onError: function() {
            console.log("onError");
        }
    });
    instance.subscribe("userProfiles")
    instance.subscribe('visits-admin-aggregates', query, field, {
        onReady: function() {
            Meteor.setTimeout(function() {
                $('.collapsible').collapsible({
                    accordion: false // A setting that changes the collapsible behavior to expandable instead of the default accordion style
                });
            }, 1000);


        },
        onError: function() {
            console.log("onError");
        }

    });
  }
}

Template.pendingTimesheet.onCreated(function summariesOnCreated() {
    this.filters = new ReactiveDict();
    //======================================
    // FETCH FILTER IF EXISTS IN SESSION
    if (Session.get("aggrField")) {
        if (Session.get("aggrField") != "$agency" && Session.get("aggrField") != "$insurance" &&
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
    //END FILTER
    //===========================================

    var admin = Meteor.user().profile.name.replace(/\((.*?)\)/,"").trim();
    Meteor.call("getSupervisedAgentNames",admin, function(error,result){
       Session.set("supAgents",result);
    });

    this.autorun(Template.pendingTimesheet.setSubscribtion);
});

Template.pendingTimesheet.viewmodel({
    headerVariable: function(){
      return {title:"Employees Timesheets",subtitle:"List of all pending items.",hasBack:false}
    },
    VisitsAggregates: new Mongo.Collection('visits-admin-aggregates'),
    billingStateIs(state) {
        return Router.current().params.query.billingState == state;
    },
    billingState(){
      return Router.current().params.query.billingState;
    },
    query(group) {
        var query = {};
        query[this.field()] = group._id;
        var billingState = Router.current().params.query.billingState;
        if(billingState)
          query["billingState"] = billingState;
        return query;
    },
    firstSummary(id){
      if(Router.current().params._id)
        return id === Router.current().params._id;
      else
        return id === this.VisitsAggregates().find().fetch().sort((a, b) => b._id.localeCompare(a._id))[0]._id
    },
    summaries() {
      console.log(this.VisitsAggregates().find().fetch().sort((a, b) => Math.sign(b.total - a.total)));
        return this.VisitsAggregates().find().fetch().sort((a, b) => Math.sign(b.total - a.total));
    },
    totalVisits(){
      var total = 0;
      _.each(this.VisitsAggregates().find().fetch(),function(group){
        total+=group.total;
      });
      return total;
    },
    totalCost(cost){
      return accounting.formatMoney(cost);
    },
    totalGroupCost(){
        var cost = 0;
        _.each(this.VisitsAggregates().find().fetch(),function(group){
          cost+=group.cost;
          console.log(group.cost);
        });
        return cost;
    },
    field() {
        let field = Template.instance().filters.get('field');
        return field.substr(1);
    },
    date(date) {
        return moment(date).format("MM/DD/YYYY");
    },
    events: {
      'change #update-date input'(event, instance) {
          let name = event.target.id;
          let date_str = event.target.value;
          let date = moment(date_str + " Z", "MM/DD/YYYY Z").utc()._d;
          instance.filters.set(name, date);
      },
      'change #change-field'(event, instance) {
          instance.filters.set('field', event.target.value);
          var query = 'billingState='+this.billingState()
          Router.go('/pendingTimesheet/?'+query);
      },
      "click .btn-approve-all"(event) {
          var field = this.field();
          var value = $(event.currentTarget).data("id");
          console.log(field, value);
          Meteor.call("visits.update.state", field, value, "approved");
    },
      "click .btn-reject-all"(event) {
          var field = this.field();
          var value = $(event.currentTarget).data("id");
          Meteor.call("visits.update.state", field, value, "rejected");
      },

      "click .showTimesheet"(event){
        event.preventDefault();
        var query = 'billingState='+this.billingState()
        var id = "";
        id = (event.target.id).replace("/","%2F").replace("/","%2F");
        Router.go('/pendingTimesheet/'+id+'?'+query);
      }
    }
});

Template.pendingTimesheet.events({

});
