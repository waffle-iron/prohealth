

Template.rateDelete.events({
    'click .delete': function(){
      CompensationRates.remove(Router.current().params._id);
    }
});

Template.rateDelete.viewmodel({
  rate: function(){
      return CompensationRates.findOne({ "_id": Router.current().params._id });
  },
  agent: function(){
      return Agents.findOne({ "_id": this.rate().agent });
  }
});
