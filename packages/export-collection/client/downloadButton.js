if (Meteor.isClient) {


    Template.downloadButton.viewmodel({
        class: '',
        selector: '',
        collection: '',
        fields: '',


        exportAllContacts: function() {
            var self = this;
            Meteor.call("exportAllContacts", self.selector(), self.collection(), self.fields(), function(error, data) {
                var csv = Papa.unparse(data);
                console.log(data);
                self._downloadCSV(csv);
            });
        },


        _downloadCSV: function(csv) {
            var blob = new Blob([csv]);
            var a = window.document.createElement("a");
            a.href = window.URL.createObjectURL(blob, { type: "text/plain" });
            a.download = "contacts.csv";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        },

        events: {
            "click #export": function() {
                console.log("ButtonClicked");
                this.exportAllContacts();
            }
        },

    });

}
