import './duplicates.html';


// set query object
Template.visitsDuplicates.setQuery = () => {
  let instance = Template.instance();
  if(instance.filters.get('start-date')){
    console.log(instance.filters.get('start-date'));
    Session.set("billsFromDate", moment(instance.filters.get('start-date')).format("YYYY-MM-DD"));
  }
  if(Session.get("billsFromDate")){
      var st = moment(Session.get("billsFromDate"));
      instance.filters.set('start-date', st._d);
  }
  //--
  if(instance.filters.get('end-date')){
    Session.set("billsToDate", moment(instance.filters.get('end-date')).format("YYYY-MM-DD"));
  }
  if(Session.get("billsToDate")){
      var endDt = moment(Session.get("billsToDate"));
      instance.filters.set('end-date', endDt._d);
  }

  let start = instance.filters.get('start-date');
  let end = instance.filters.get('end-date');
  let query = { formDate: { $gte : start, $lte: end } };
  let group_by = { patient: "$patient", medicalRecord: "$medicalRecord", agency: "$agency", insurance: "$insurance", form: "$form", formDate: "$formDate", user: "$user" };
  Meteor.call('visits.aggregate', query, group_by, (error, result) => {
    result = result.filter(v => v.total > 1).map(v => v._id);
    query = result.length > 0 ? { $or: result } : { _id: null };
    instance.filters.set('query', query);
  });
}

Template.visitsDuplicates.onRendered(function (){
  var startDate = new Pikaday({ field: $('#start-date')[0], format: "MM/DD/YYYY" });
  var endDate = new Pikaday({ field: $('#end-date')[0], format: "MM/DD/YYYY" });
});

Template.visitsDuplicates.onCreated(function duplicatesOnCreated() {
  this.filters = new ReactiveDict();
  if (Session.get("billsFromDate")) {
      var st = moment(Session.get("billsFromDate"));
      this.filters.set('start-date', st._d);
  }
  if (Session.get("billsToDate")) {
      var endDt = moment(Session.get("billsToDate"));
      this.filters.set('end-date', endDt._d);
  }
  this.filters.set('query', { _id: null });
  this.autorun(Template.visitsDuplicates.setQuery);
});

Template.visitsDuplicates.helpers({
  query() {
    return Template.instance().filters.get('query');
  },
  startDate() {
    let date = Template.instance().filters.get('start-date');
    return moment(date).format("MM/DD/YYYY");
  },
  endDate() {
    let date = Template.instance().filters.get('end-date');
    return moment(date).format("MM/DD/YYYY");
  },
  visits(){
    return Visits.tabularTable;
  }
});

Template.visitsDuplicates.events({
  'change #update-date input' (event, instance) {
    let name = event.target.id;
    let date_str = event.target.value;
    let date = moment(date_str + " Z", "MM/DD/YYYY Z").utc()._d;
    instance.filters.set(name, date);
  },
});
