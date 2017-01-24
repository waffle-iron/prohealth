Template.editjob.viewmodel({
  onRendered: function(){
    $('select').material_select();
  },
  headerVariable: {title:"Jobs",subtitle:"Edit existing job",hasBack:true}
});

AutoForm.hooks({
  updateJobForm: {
    onSuccess: function(formType, result) {
      Router.go('/jobs');
    },
  }

});
