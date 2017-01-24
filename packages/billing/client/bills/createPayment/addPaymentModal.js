AutoForm.hooks({
    // "insertPaymentForm": {
    //     onSuccess: function(doc) {
    //         $('#addPaymetModal').closeModal();
    //         $("#formError").hide()
    //         Session.set("addPaymeny_billID","")
    //     },
    //     onError: function(type, err) {
    //         if (!this.insertDoc.payment_type_id) {
    //             $("#formError").show()
    //         }
    //     },
    // }
});
Template.addPaymentModal.viewmodel({
    bill: function() {
        if (Session.get("addPaymeny_billID"))
            return Bills.findOne(Session.get("addPaymeny_billID"));
        return null;
    },
    due() {
        if (this.bill())
            return this.bill().amount - this.bill().paymentsAmount;
    },
    paymentTypeId: function() {

        if (this.bill()) {

            payment_type = PaymentTypes.findOne({
                name: this.bill().claim_name
            });

            if (payment_type) {
                return payment_type._id
            }
        }
    },
    checkDue: function() {
        if (this.bill()) {
            if (this.due() <= 0) {
                return "disabled";
            }
        }
    },
    paymentTypes: function() {
        var paymentTypes_opts = _.map(PaymentTypes.find().fetch(), function(paymentType) {
            return {
                label: paymentType.name,
                value: paymentType._id
            };
        });
        return paymentTypes_opts;
    },
    today: moment().format("MM/DD/YYYY"),
    onRendered: function() {
        console.log("rendered")
        var picker = new Pikaday({
            field: document.getElementById('newPaymentDate'),
            format: 'MM/DD/YYYY'
        });
         $('select').material_select();
    },
    events: {
        "click #closeModal": function() {
            $("#formError").hide()
            $("#amountError").hide()
            Session.set("addPaymeny_billID","")
        },
        "change .insertamount": function(event) {
            $("#formError").hide();
        },
        "change #newPaymentDate": function() {
            $("#formDateError").hide();
        },
        "click #write-off" () {
            var bill = this.bill();
            var payment_type = PaymentTypes.findOne({
                name: "WRITE OFF"
            });
            var amount = this.due();
            Payments.insert({
                bill_id: bill._id,
                payor_id: bill.payor_id,
                amount: amount,
                payment_type_id: payment_type._id
            });
            $("#addPaymetModal").closeModal();
        },
        "submit #insertPaymentForm"(event){
          event.preventDefault();
          // console.log(event.target.payment_type_id.value);
          if(event.target.payment_type_id.value && event.target.amount.value && event.target.amount.value !=0){
            if(event.target.payment_type_id.value){
              $("#formError").hide()
            }
            if(event.target.amount.value && event.target.amount.value !=0){
              $("#amountError").hide()
            }
            var payment = {
              bill_id: this.bill()._id,
              payor_id: this.bill().payor_id,
              amount: event.target.amount.value,
              payment_type_id: event.target.payment_type_id.value,
              note: event.target.note.value
            }
            if(event.target.date.value)
              payment["date"]=event.target.date.value;
            var success = Payments.insert(payment);
            if(success){
              $('#addPaymetModal').closeModal();
              $("#formError").hide()
              $("#amountError").hide()
            }
          }
          if(!event.target.payment_type_id.value){
            $("#formError").show()
          }
          if(!event.target.amount.value || event.target.amount.value==0){
            $("#amountError").show()
          }
        }
    }
});
