if (Meteor.isClient) {
    Template.agentMissingDocuments.viewmodel({
        missing_documents: function() {
            return DocumentTypes.find({ _id: { $in: this.agent().missing_documents_ids } });
        }
    });
}
