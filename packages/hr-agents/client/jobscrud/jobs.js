import './jobs.html';

let job_id;

Template.jobs.viewmodel({
  headerVariable:{title:"Jobs",subtitle:"List of all available jobs",hasBack:false},
  onRendered(){
    setTimeout(function () {
      $(".dataTables_length label select").toggleClass("browser-default");
      $(".dataTables_length label select").css("width","auto");
      $(".dataTables_length label select").css("display","inline-block");
    }, 100);
  },

  table: function(){
    return TabularTables.Jobs;
  },

  events: {
    'click #add'(event){
      Router.go('/jobs/new');
    }
  }
});

Template.editbutton.events({
  'click #edit'(event){
    Router.go('/jobs/'+this._id+'/edit');
  },
});

Template.delbutton.events({
  'click #del'(event){
    job_id = this._id;
    $('#confirmDeletionModal').openModal();
  },

  'click #confirm'(event){
    Meteor.call("delete_job", job_id, function(err, res){
      if(!err){
        Materialize.toast('Deleted Successfully!', 2000, 'rounded green lighten-2');
        Router.go('/jobs');
      }
      else{
        Materialize.toast('There is a problem deleting this record!!', 3000, 'rounded red lighten-2');
        Router.go('/jobs');
      }
    });
  }
});
