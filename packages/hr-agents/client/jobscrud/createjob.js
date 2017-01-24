AutoForm.hooks({
  insertJobForm: {
    onSuccess: function(formType, result) {
      Router.go('/jobs');
    },
  }
});

Template.createjob.viewmodel({
  headerVariable: {title:"Jobs",subtitle:"Create new job",hasBack:true},
});
