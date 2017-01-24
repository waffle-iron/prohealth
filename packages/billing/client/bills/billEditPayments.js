import date_regex from "./billCreate.js"
import validateDate from "./billCreate.js"

AutoForm.hooks({
  "updatePaymentsForm": {
    // before: {
    //   update: function(doc) {
    //     // Potentially alter the doc
    //     var oldPaymentVal=Payments.findOne({_id:Router.current().url.substring(Router.current().url.indexOf("#")+1)})
    //     var total = 0;
    //     var bill = Bills.findOne({_id:Router.current().params._id});
    //     var totalAfterPayment = bill.paymentsAmount + doc.$set.amount - oldPaymentVal.amount
    //     if(bill.amount < totalAfterPayment){
    //       $("#updateFormError").show()
    //       console.log("here");
    //       return false;
    //     } else if(doc.$set.date > new Date()){
    //       $("#updateFormDateError").show();
    //       return false;
    //     }
    //     else {
    //       return doc;
    //     }
    //   }
    // },
    onSuccess: function(doc) {
      $('#editPaymetModal').closeModal();
    },
    onError: function(a,error,b){
      console.log("here");
    },
  },
  "insertPaymentsForm": {
    // before: {
    //   insert: function(doc) {
    //     // Potentially alter the doc
    //     // console.log(doc.date > new Date());
    //     var total = 0;
    //     var bill = Bills.findOne({_id:Router.current().params._id});
    //     console.log(doc);
    //     var totalAfterPayment = bill.paymentsAmount + doc.amount
    //     if(bill.amount < totalAfterPayment){
    //       $("#formError").show()
    //       return false;
    //     } else if(doc.date > new Date()){
    //       $("#formDateError").show();
    //       return false;
    //     }
    //     else {
    //       return doc;
    //     }
    //   }
    // },
    onSuccess: function(doc) {
      $("#insertPaymentsForm #newPaymentDate").val(moment().format("MM/DD/YYYY"));
      $("label[for='newPaymentDate']").addClass("active");
    },
  },
});

Template.addPayment.viewmodel({
    bill: function() {
        if (Router.current().params._id)
            return Bills.findOne(Router.current().params._id);
        return null;
    },
    due(){
      return this.bill().amount- this.bill().paymentsAmount;
    },
    checkDue: function(){
      if (this.due() <= 0) {
        return "disabled";
      }
    },
    today:  moment().format("MM/DD/YYYY"),
    onRendered: function(){
      var picker = new Pikaday({ field: document.getElementById('newPaymentDate'), format: 'MM/DD/YYYY'});
    },
    events:{
      "change .insertamount": function(event){
        $("#formError").hide()
      },
      "change #newPaymentDate": function(){
        $("#formDateError").hide();
      },
      "click #write-off"(){
        var bill = this.bill()
        var payment_type = PaymentTypes.findOne({name:"WRITE OFF"});
        var amount = this.due();
        Payments.insert({bill_id: bill._id, payor_id:bill.payor_id, amount: amount, payment_type_id: payment_type._id})
      }
    }
});


Template.editPayment.viewmodel({
    payment: function() {
        return Session.get("payment");
    },
    bill: function() {
        if (Router.current().params._id)
            return Bills.findOne(Router.current().params._id);
        return null;
    },
    formId: function(){
      return "updatePaymentsForm"+this.payment()._id;
    },
    paymentDate: function() {
      var payment = Payments.findOne(Session.get("payment"));
        if (payment)
            return moment(payment.date).format("MM/DD/YYYY");
    },
    paymentTypes: function(){
      var paymentTypes_opts = _.map(PaymentTypes.find().fetch(), function(paymentType){
         return {label: paymentType.name, value: paymentType._id};
       });
      return paymentTypes_opts;
    },
    onRendered: function(){
      setTimeout(function () {
        var date = new Pikaday({ field: document.getElementById('paymentDateField'), format: 'MM/DD/YYYY'});
      }, 1000);
    },
    events: {
      "blur #paymentDateField": function(event){
        validateDate("paymentDateField", $("#paymentDateField").val());
      },
      "change .updateamount": function(event){
        $("#updateFormError").hide()

      },
      "change #paymentDateField": function(){
        $("#updateFormDateError").hide();
      }
    }
});
