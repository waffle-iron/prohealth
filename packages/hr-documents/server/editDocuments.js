Meteor.methods({
  updateSimilarDocs: function(agent, docType, expires) {
      Documents.update({
          "agent": agent,
          "document_type_id":docType
      }, {
          $set: {
              "expires": expires
          }
      },{multi:true});
  }
});
