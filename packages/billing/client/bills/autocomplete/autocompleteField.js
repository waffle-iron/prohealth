AutoForm.addInputType("autocomplete", {
  template: "afAutocomplete",
  valueOut: function(){
    // console.log(this);
    // return ""
  }
});
Template.afAutocomplete.viewmodel({
  onRendered(){
    console.log(this.atts());
  },
  placeholder: function(){
    if(this.atts()["field"] == "name")
      return "Enter Patient's name";
    else if(this.atts()["field"] == "mrn")
      return "Enter MedicalRecordNumber";
  },
  isNameField: function(){
    return this.atts()["field"] == "name"
  },
  label: function(){
    if(this.atts()["field"] == "name")
      return "Patient name";
    else if(this.atts()["field"] == "mrn")
      return "Patient MRN";
  },
  schKey:function(){
    return this.atts()["data-schema-key"]
  },
  name:function(){
    return this.atts()["name"]
  },
  fieldId(){
    if(this.atts()["field"]=="name")
      return "patient";
    else {
      return "patientMrn";
    }
  },
  events:{
    "autocompleteselect input": function(event, template, doc) {
      if(this.atts()["field"]=="name"){
        var pat = Patients.findOne({"patient":$("#patient").val().replace("@","").trim()});
        $("#patientMrn").val(pat.mrn)
        var payor = Payors.findOne({name: pat.primaryInsurance});
        console.log(pat.primaryInsurance);
        if(payor){
          console.log("here");
          $("#payor-select").val(payor._id)
          $(".payor input[type=text]").val($("#payor-select option[value='"+payor._id+"']").html())
        }
      }
      else if(this.atts()["field"]=="mrn"){
        var pat = Patients.findOne({"mrn":$("#patientMrn").val()});
        $("#patient").val(pat.patient)
        var payor = Payors.findOne({name: pat.primaryInsurance});
        console.log(pat.primaryInsurance);
        if(payor){
          console.log("here");
          $("#payor-select").val(payor._id)
          $(".payor input[type=text]").val($("#payor-select option[value='"+payor._id+"']").html())
        }
      }
    }
  },
  settings: function() {
    if(this.atts()["field"]=="name"){
      return {
        position: "bottom",
        limit: 5,
        rules: [
          {
            token: '',
            collection: Patients,
            field: "patient",
            template: Template.patientName
          },
        ]
      };
    } else if(this.atts()["field"]=="mrn"){
      return {
        position: "bottom",
        limit: 5,
        rules: [
          {
            token: '',
            collection: Patients,
            field: "mrn",
            template: Template.patientMrn
          },
        ]
      };
    }
  }
});
