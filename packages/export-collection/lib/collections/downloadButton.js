if (Meteor.isServer) {
    Meteor.methods({
        exportAllContacts: function(selector, collectionName, fields) {
            var data = [];
            var collectionItems = Mongo.Collection.get(collectionName.toLowerCase()).find(selector).fetch();
            var arr = fields.split(",");
            _.each(collectionItems, function(item) {
                var row = [];
                for (i = 0; i < arr.length; i++) {
                    row.push(item[arr[i]]);
                }
                data.push(row);

            });
            return { fields: fields.split(","), data: data };
        }
    });
}
