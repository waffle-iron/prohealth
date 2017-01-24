Template.missingDocuments.viewmodel({
  headerVariable: {title:"Missing Documents",subtitle:"All missing documents grouped by user",hasBack:false},
    agents: function() {
        //console.log("agents:"+Agents.find({ missing_documents_ids: { $exists: true, $not: { $size: 0 } } }).fetch());
        return Agents.find({ missing_documents_ids: { $exists: true, $not: { $size: 0 } } }).fetch();
    },
    missingDocuments: function() {
        return Agents.find({ missing_documents_ids: { $exists: true, $not: { $size: 0 } } }).fetch().length;
    },
    filterHasEntries: function(){
      return Session.get("filterHasEntries");
    },
    autorun(){
      console.log();
      let currentFilter = Session.get("agentsFilter")
      currentFilter.missing_documents_ids = { $exists: true,
                                              $not: {
                                              $size: 0
                                            }
                                          };
      this.templateInstance.subscribe("agents", currentFilter);
    }
});

Template.missingDocumentsList.viewmodel({
  agents: function() {
      return Agents.find({ missing_documents_ids: { $exists: true, $not: { $size: 0 } } }).fetch();
  },
});
