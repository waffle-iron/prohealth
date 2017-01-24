Template.billPayments.viewmodel({
  onCreated(){
    Meteor.subscribe("bill.payments", Router.current().params._id);
  },
  bill: function(){
    if (Router.current().params._id)
    return Bills.findOne({"_id": Router.current().params._id})
  },
  beforeRemoveHelper: function() {
      return function(collection, id) {
          var payment = collection.findOne(id);
          if (confirm('Are you sure you want to delete this payment?')) {
              this.remove();
          }
      };
  },
  payments: function(){
    return Payments.find({ "bill_id": Router.current().params._id });
  },
  paymentDate: function(payment) {
    return moment(payment.date).format("MM/DD/YYYY");
  },
  events:{
    "click #btnEditPayment": function(e){
      Session.set("payment",Payments.findOne(e.currentTarget.getAttribute('data-payment')))
      $('#editPaymetModal').openModal();
    }
  }
});
