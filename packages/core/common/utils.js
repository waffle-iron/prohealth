RegExp.escape = function(s) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};
let Utils = {};
Utils.collection_options = function(Collection, field) {
    return Collection.find().map(function(model) {

        return {
            id: model["_id"],
            name: model[field]
        }
    })
}
Utils.collection_options_strings = function(Collection, field) {

    return Collection.find().map(function(model) {
        return {
            label: model[field],
            value: model[field]
        }
    })
}

Utils.hasManyFrom = function(Collection, name_field) {
    return {
        type: [String],
        optional: true,
        autoform: {
            type: "select-checkbox",
            options: function() {
                return Utils.collection_options_strings(Collection, name_field);
            }
        }
    }
}



export default Utils;
