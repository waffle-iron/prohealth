import expDocs from './pubExpiredDocuments';

if(Meteor.isClient){
    Template.agentExpiringDocuments.viewmodel({
      document_type: function(_id){
        return DocumentTypes.findOne(_id).name;
      },
      display_date: function(date){
        return moment(date).format("LL");
      },
      expiring_documents: function() {
        // console.log(this.agent());
        // console.log(expDocs.findOne(this.agent()._id));
        if(expDocs.findOne(this.parent()._id()))
          var docs = expDocs.findOne(this.parent()._id()).docs;
          var docTypes = _.uniq(docs, function(doc) { return doc.document_type_id });
          return docTypes;
      }
    });
}
