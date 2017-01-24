
Template.migrate.viewmodel({
  events:{


    // "click .file_bag": function(e) {
    //     $(".file_bag").val("")
    //     S3.collection.remove({});
    // },

    "click .upload-bills": function() {
        // $(".upload").prop('disabled', true);
        var files = $(".file_bag-bills")[0].files
        console.log("uploading bills, ", files);
        S3.upload({
            files: files,
            path: "subfolder"
        }, function(e, r) {
            console.log(r);

          var text = null;
           $.ajax({
               async: false,
               type: 'GET',
               url: r.url,
               success: function(data) {
                   text = data
               }
           })

            Meteor.call("seedBills", text);
        });
    },

    "click .upload-payments": function() {
        // $(".upload").prop('disabled', true);
        var files = $(".file_bag-payments")[0].files
        console.log("uploading payments, ", files);
        S3.upload({
            files: files,
            path: "subfolder"
        }, function(e, r) {
            console.log(r);
            var text = null;
             $.ajax({
                 async: false,
                 type: 'GET',
                 url: r.url,
                 success: function(data) {
                     text = data
                 }
             })
            Meteor.call("seedPayments", text);
        });
    },

  }
});
