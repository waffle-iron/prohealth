var date_regex = /((0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01])\d\d)|((0[1-9]|1[012])[- \/.](0[1-9]|[12][0-9]|3[01])[- \/.]\d\d)|((0[1-9]|1[012])[- \/.](0[1-9]|[12][0-9]|3[01])[- \/.](19|20)\d\d)|((0[1-9]|1[012])(0[1-9]|[12][0-9]|3[01])(19|20)\d\d)/;
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
export {date_regex, validateDate};

AutoForm.hooks({
  createBillForm: {
    onSuccess: function(doc) {
      console.log("here");
      Router.go("bills");
    },
    onError: function(formType,error){
      console.log(error);
    },
    formToDoc: function(doc) {
      // console.log(doc);
      // $( ".select-wrapper:has(> #claim_id) ul li.active span").html()
		if($("#claim_id li.active").text().startsWith("HOSPICE")){
			var date = moment()
			var days = parseInt($("#days").val()) || 0;
			var months= parseInt($("#months").val()) || 0;
			var years = parseInt($("#years").val()) || 0;
			date = date.day(date.day() + days).month(date.month() + months).year(date.year() + years);
			$("#claim_start_date").val(moment().startOf("month").format("MM/DD/YYYY"));
			$("#claim_end_date").val(date.format("MM/DD/YYYY"));
		}
		return doc;
	},
  // before: {
  //   insert: function(doc) {
  //     if(doc.claim_start_date && doc.claim_end_date){
  //       if(moment(doc.claim_start_date,"MM/DD/YYYY").isAfter(moment(doc.claim_end_date,"MM/DD/YYYY"))
  //          || moment(doc.claim_start_date,"MM/DD/YYYY").isSame(moment(doc.claim_end_date,"MM/DD/YYYY"))){
  //         $(".date-error").show();
  //         return false;// (synchronous, cancel)
  //       }
  //       else{
  //         $(".date-error").hide();
  //         return doc;
  //       }
  //     }
  //     $(".date-error").hide();
  //     return doc;
  //   },
  // },
  },
});

Template.billCreate.onRendered(function(){
    $("label").addClass("active");
});

Template.billCreate.viewmodel({
  headerVariable: {title:"New Bill",subtitle:"Create a new bill",hasBack:true},
  today:  moment().format("MM/DD/YYYY"),
  agency_id: "",
  getMedicareID(){
    var payor = Payors.findOne({name: "Medicare"});
    return payor._id;
  },
  agency: function(){
    console.log(Agencies.findOne(this.agency_id()));
    return Agencies.findOne(this.agency_id());
  },
  agencies: function(){
    var agencies_opts = _.map(Agencies.find().fetch(), function(agency){
       return {label: agency.name, value: agency._id};
     });
    return agencies_opts;
  },
  payors: function(){
    var payors_opts = _.map(Payors.find().fetch(), function(payor){
       return {label: payor.name, value: payor._id};
     });
    return payors_opts;
  },
	selectizeOps: {
		onType: function (str) {
			$("#patients").trigger("update", str);
		}
	},
  onRendered: function() {
    Meteor.subscribe("allPatients");
    Materialize.updateTextFields();
    var billDate = new Pikaday({field: document.getElementById('billDate'), format: 'MM/DD/YYYY'});
    var claimStartDate = new Pikaday({field: document.getElementById('claimStartDate'), format: 'MM/DD/YYYY'});
    var claimEndDate = new Pikaday({field: document.getElementById('claimEndDate'), format: 'MM/DD/YYYY'});
    this.agency_id("");
  },
  onCreated: function() {
    Meteor.subscribe("allPatients");

  },
  events:{
    "change #patients"(event){
      var patName = $("#patients option")[0].value;
      if(Patients.findOne({patient: patName}).agencyId){
        this.agency_id(Patients.findOne({patient: patName}).agencyId);
        // $("#patients option")[0];
        // console.log(this.agency_id());
      }
    }
  }
});

Template.billCreate.events({
	"update #patients"(event, temp, str){

		Meteor.call("getPatientLimited", str, 10, function (err, res) {
			if(err){
				console.log(err);
			}
			var selectize = $("#patients")[0].selectize;
			selectize.clearOptions();
			res.forEach(function (item) {
				selectize.addOption({value: item.patient, text: item.patient});
			});
		});
	},
	"change #patients"(event){
		$("#patient_name").val($("#patients").val());
	},
  "blur #billDate"(event){
      validateDate("billDate",$("#billDate").val());
  },
  "blur #claimStartDate"(event){
    validateDate("claimStartDate",$("#claimStartDate").val());
  },
  "blur #claimEndDate"(event){
    validateDate("claimEndDate",$("#claimEndDate").val());
  },
	// "change #claim_id"(event){
	// 	if($("#claim_id").text().startsWith("HOSPICE")){
	// 		$(".claim-dates").hide();
	// 		$(".hospise-date").show();
	// 	}else{
	// 		$(".claim-dates").show();
	// 		$(".hospise-date").hide();
	// 	}
	// },
})
