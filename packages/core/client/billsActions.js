Template.billsActions.viewmodel({
    beforeRemoveHelper: function() {
        return function(collection, id) {
            var doc = collection.findOne(id);
            console.log(doc.patient());
            if (confirm('Are you sure you want to delete this bill?\nDate: '+moment(doc.date).format("MM/DD/YYYY")+'\nAmount: '+doc.amount+'\nPayor: '+doc.payor_name+'\nPatient: ' + doc.patient_name + '\nClaim: '+ doc.claim_name)) {
                this.remove();
            }
        };
    },
    today: moment().format("MM/DD/YYYY"),
    paymentTypeId: function() {
      payment_type = PaymentTypes.findOne({
          name: this.claim_name()
      });

      if (payment_type) {
          return payment_type._id
      }
    },
    events:{
      "click #addPayment": function(e){
        Session.set("addPaymeny_billID",this._id())
        $("#newPaymentDate").val(this.today())
        if(this.claim_name){
          $("#payment_type_id").val(this.paymentTypeId())
          $(".payment_type_id input[type='text']").val(this.claim_name())
        }
        $("label[for=newPaymentDate]").addClass("active")
        $('#addPaymetModal').openModal();
      }
    }
});
