Template.payments.onCreated(function(){
    Meteor.subscribe("payment_types");
})
Template.payments.viewmodel({
    headerVariable:{title:"Payments",subtitle:"List of all Payments",hasBack:false},
    onRendered: function(){
      //==========================================================
      // Initialize show entries select without materialize
      setTimeout(function () {
        $(".dataTables_length label select").toggleClass("browser-default");
        $(".dataTables_length label select").css("width","auto");
        $(".dataTables_length label select").css("display","inline-block");
      }, 100);
      //==========================================================
    },
    payments: function(){
        return TabularTables.Payments;
    },
    paymentsSelector: function () {
    	var params = jQuery.extend(true, {}, Router.current().params.query);
        var paymentsModels = {
            "payment_type": PaymentTypes,
            "claim": Claims,
            "payor": Payors
        }
    	filters = {};
      if (params.hasOwnProperty("from")) {
          filters["date"] = {
              "$gte": new moment(params["from"], "MM/DD/YYYY").startOf("day").utc().toDate()
          };
      }
      if (params.hasOwnProperty("to")) {
          filters["date"] = filters["date"] || {};
          Object.assign(filters["date"], {
              "$lte": new moment(params["to"], "MM/DD/YYYY").endOf("day").utc().toDate()
          });
      }

    	var filter, obj;
      if (params.hasOwnProperty("payor")) {
          filters["payor_name"] =  params["payor"];
      }
      if (params.hasOwnProperty("payment_type")) {
          //console.log(params["payment_type"]);
          var payment_type = PaymentTypes.findOne({name: params["payment_type"]});
          if(payment_type){
            filters["payment_type_id"] =  payment_type._id;
          }


      }
      if (params.hasOwnProperty("claim")) {
          filters["claim_name"] =  params["claim"];
      }
      if (params.hasOwnProperty("patient")) {
          filters["patient_name"] =  params["patient"];
      }

      // console.log(filters);
    	return filters;
    },
    filter: {},
    tableData:"",
    getTableData: function() {
      var self = this;
      var query = this.filter();
      if(this.paymentsSelector() && this.filterText()){
        query = {
          $and: [this.paymentsSelector(),this.filter()]
        }
      } else if(this.paymentsSelector()){
        query = this.paymentsSelector()
      }
      var csv="";
      Meteor.call("exportAllPayments", query, "patient,type,payor_name,claim_name,billAmount,billDate,amount,date", function(error, data) {
          csv = Papa.unparse(data);
          tData="Payments\n"
          filters=""
          var query = Router.current().params.query;
          if (query) {
            for (var property in query) {
                if (query.hasOwnProperty(property)) {
                    filters+= "\n"+property+": "+query[property];
                }
            }
            filters+="\n";
          }
          if(self.filterText())
            filters+="Filtering by:,"+self.filterText()+"\n";
          tData+=filters;
          tData+=csv;
          self.tableData(tData);
      });
    },
    exportAllPayments: function() {
        var self = this;
        var query = this.filter();
        if(this.paymentsSelector() && this.filterText()){
          query = {
            $and: [this.paymentsSelector(),this.filter()]
          }
        } else if(this.paymentsSelector()){
          query = this.paymentsSelector()
        }
        Meteor.call("exportAllPayments", query, "patient,type,payor_name,claim_name,billAmount,billDate,amount,date", function(error, data) {
            var csv = Papa.unparse(data);
            // console.log(data);
            tData="Payments\n"

            filters=""
            var query = Router.current().params.query;
            if (query) {
              for (var property in query) {
                  if (query.hasOwnProperty(property)) {
                      filters+= "\n"+property+": "+query[property];
                  }
              }
              filters+="\n";
            }
            if(self.filterText())
              filters+="Filtering by:,"+self.filterText()+"\n";
            tData+=filters;
            tData+=csv;
            self._downloadCSV(tData);
        });
    },

    _downloadCSV: function(csv) {
      var blob = new Blob([csv]);
      var a = window.document.createElement("a");
      a.href = window.URL.createObjectURL(blob, {
          type: "text/plain"
      });
      a.download = "Payments.csv";
      if(this.filterText())
        a.download = "Payments (filter:"+this.filterText()+").csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    },
    filterText:"",
    events:{
      'click #sendmail'(event){
        this.getTableData();
         $('#modal1').openModal();
      },
      "change #paymentsTable_filter": function(e){
        // console.log();
        var filterValue=e.target.value;
        this.filterText(e.target.value);
        var filter={
          amount: parseInt(filterValue)
        }
        // console.log(Bills.find(filter).fetch());
        this.filter(filter);
      },
      "click .download-payments" () {
          console.log("ButtonClicked");
          this.exportAllPayments();
      },
    }
});
