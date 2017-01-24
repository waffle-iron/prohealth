Template.sortableDocs.viewmodel({
    expiryField: '',
    showUncategorized: function() {
        if (Router.current().params.type_id === "nodoctype")
            return true;
    },
    onCreated: function() {

    },
    onRendered: function() {
        Meteor.setTimeout(function() {
            var types = DocumentTypes.find().fetch();
            var noDocType = {
                _id: "nodoctype",
                name: "Uncategorized"
            };
            types.push(noDocType);
            Materialize.updateTextFields();
        }, 1000);
        $('select').material_select();
    },
    autorun() {
        // setTimeout(function () {
        //   $('select').material_select();
        //
        // }, 1000);
    },
});
