Template.editRates.viewmodel({
  headerVariable:{title:"Edit Rates",subtitle:"Edit reimbursement rates for all agents",hasBack:false},
  onCreated: function(){
    Template.instance().subscribe("reimb");
  },
  rates: function(){
    return CompensationRates.find().fetch();
  },
  formId: function(){
    return "update"+this.name
  },
  events:{
    "submit #reimRates"(event){
      event.preventDefault();
      this.rates().forEach(function(rate){
        if(event.target[rate.name()].value>=0){
          CompensationRates.update({_id: rate._id}, {$set:{amount: event.target[rate.name()].value}});
        }
      });
      sAlert.success("updated successfully")
    }
  }
});
