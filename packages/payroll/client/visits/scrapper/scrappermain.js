import './scrappermain.html';
import { ReactiveVar } from 'meteor/reactive-var';
let m = new ReactiveVar(false);
let t = new ReactiveVar();
let type = new ReactiveVar(true);
let spinner = new ReactiveVar(false);

Template.visitsscrapper.viewmodel({
  headerVariable:{title:"Visits",subtitle:"Visits validator",hasBack:false},
  getStatus(){
    return type.get();
  },

  events: {
    'click #single'(){
      type.set(true);
    },
    'click #range'(){
      type.set(false);
    }
  }
});

Template.singleVisit.viewmodel({
  result(){
    if(m.get()){
      $("#visitresult").show('slow');
    }
    return m.get();
  },
  spinner(){
    return spinner.get();
  },
  getval(){
    if(u.get()){
      return u.get();
    }
  },
  events: {
    'submit #activity'(event){
      event.preventDefault();

      let activityID = event.currentTarget[0].value || null;
      if(!activityID){
        alert("enter activity id");
      }
      else {
        $("#visitresult").hide('slow');
        $("#kkk").hide('slow');
        $("#searchButton").prop('disabled', true);
        spinner.set(true);
        Meteor.call("checkVisit", activityID, function(error, result){
          if(!error){
            for(let key in result){
              if(key == "valid" && !result[key]){
                result[key] = false;
              }
              else if(key == "validContent" && !result[key]){
                result[key] = "Not Valid";
              }
              else if(!result[key]){
                result[key] = "None";
              }
            }

            m.set(result);
            spinner.set(false);
            $("#visitresult").show('slow');
            $("#kkk").show('slow');
            $("#searchButton").prop('disabled', false);
            $('#kkk').contents().find('html').html(result.content);
          }
          else{
            m.set(false);
            alert(error);
          }
        });
      }
    },
  }
});

Template.range.viewmodel({
  onRendered(){
    $('select').material_select();
  },

  result(){
    if(t.get()){
      $("#visitresult").show('slow');
    }
    return t.get();
  },

  spinner(){
    return spinner.get();
  },

  events: {
    'submit #checkvisits'(event){
      event.preventDefault();
      let startDate = event.currentTarget[0].value.replace(/-/g, '/') || null;
      let endDate = event.currentTarget[1].value.replace(/-/g, '/') || null;
      let maxResults = event.currentTarget[2].value || null;
      let formStatus = event.currentTarget[3].value || null;
      console.log(formStatus);
      if(!startDate || !endDate || !maxResults || !formStatus){
        alert("Enter search criterea");
      }
      else {
        $("#visitresult").hide('slow');
        $("#searchButton").prop('disabled', true);
        spinner.set(true);
        Meteor.call('checkAllVisits', moment(startDate).format('MM/DD/YYYY'), moment(endDate).format('MM/DD/YYYY'), maxResults, formStatus, function(err, res){
          if(!err){
            $("#searchButton").prop('disabled', false);
            $("#visitresult").show('slow');
            spinner.set(false);
            t.set(res);
          }
          else {
            alert(err);
          }
        });
      }
    },
  }
});
