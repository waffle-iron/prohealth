Template.emergencyList.viewmodel({
  headerVariable: {title:"Emergency List",subtitle:"List of all users for emergency",hasBack:false},
  onCreated: function() {
      this.templateInstance.subscribe("emergencyList");
  },
  agents: function() {
      return Agents.find(Session.get("agentsFilter")).fetch();
  },
  emergencyList: function() {
      return Agents.tabularTable;
  },
  autorun(){
    var subscription = this.templateInstance.subscribe("agents", Session.get("agentsFilter"));
  },
  tableData:"",
  getTableData: function() {
    var self = this;
    var query = {};
    var filters="";
    if(Session.get("agentsFilter")){
      query= Session.get("agentsFilter");
      for (var property in query) {
          if (query.hasOwnProperty(property)) {
            if(property=="job_id"){
              filters+= ",Job: "+Jobs.findOne(query[property]).name;
            }
            else
              filters+= ","+property+": "+query[property];
          }
      }
      filters+="\n";
    }
    var csv="";
    Meteor.call("exportAllAgents", query, "name,job,phone,mobile,email", function(error, data) {
        csv = Papa.unparse(data);
        tData="Agents\n"
        if (Session.get("agentsFilter")) {
            tData+="Filters:"+ filters +"\n";
        }
        tData+=csv;
        self.tableData(tData);
    });
  },
  exportAllAgents: function() {
      var self = this;
      var query = {};
      var filters="";
      if(Session.get("agentsFilter")){
        query= Session.get("agentsFilter");
        for (var property in query) {
            if (query.hasOwnProperty(property)) {
              if(property=="job_id"){
                filters+= ",Job: "+Jobs.findOne(query[property]).name;
              }
              else
                filters+= ","+property+": "+query[property];
            }
        }
        filters+="\n";
      }
      Meteor.call("exportAllAgents", query, "name,job,phone,mobile,email", function(error, data) {
          var csv = Papa.unparse(data);
          tData="Aills\n"
          if (Session.get("agentsFilter")) {
            tData+="Filters:"+ filters;
          }
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
    a.download = "Agents.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  },
  events: {
    "click .download-agents" () {
        this.exportAllAgents();
    },
    'click #sendmail'(event){
      this.getTableData();
       $('#modal1').openModal();
    },
  }
});

Template.emergencyListTable.viewmodel({
  agents: function() {
      return Agents.find(Session.get("agentsFilter")).fetch();
  },
});
