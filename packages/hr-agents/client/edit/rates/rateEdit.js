

Template.rateEdit.events({

});

Template.rateEdit.viewmodel({
    onCreated(){
      Meteor.subscribe("rate", Router.current().params._id);
    },
    rate: function(){
        return CompensationRates.findOne({ "_id": Router.current().params._id });
    },
    agent: function(){
        var rate = CompensationRates.findOne({ "_id": Router.current().params._id })
        return Agents.findOne({ "_id": rate.agent });
    },

    events: {
      'click .delete': function(){
        Meteor.call("rateDelete", Router.current().params._id);
        history.back();
      },
    }

});
